class Buncho {
  constructor() {
    this.shape = new BunchoShape()
    this.legH = this.shape.legH
    this.position = { x: 0, y: this.legH }
    this.velocity = { x: 0, y: 0 }
    this.floor = { x: 0, y: 0 }
    this.idle()
    this.dir = +1
    this.attack = {
      cooldown: 0,
      cnt: 0,
      drill: null
    }
  }
  idle() {
    this.state = {
      type: 'idle',
      phase: 0,
      render: (ctx) => {
        const h = Math.sin(this.state.phase * 0.2) * 0.02
        const hx = Math.sin(this.state.phase * 0.2 - 1) * 0.01
        ctx.translate(this.position.x + hx, this.position.y + h)
        this.shape.render(
          ctx,
          {
            dir: this.dir,
            leg: { x: this.floor.x - this.position.x - hx, y: this.floor.y - this.position.y - h, theta: this.dir * (this.floor.theta || 0) },
            rotate: -hx,
            drill: this.attack.drill
          }
        )
      }
    }
  }
  fly() {
    this.state = {
      type: 'fly',
      render: (ctx) => {
        ctx.translate(this.position.x, this.position.y)
        this.shape.render(
          ctx,
          {
            dir: this.dir,
            leg: { x: -1 * this.dir, y: -0.5, theta: 0.6 },
            wings: [2 * Math.random() - 1, 2 * Math.random() - 1, 2 * Math.random() - 1],
            drill: this.attack.drill
          }
        )
      }
    }
  }
  jump(vx, vy) {
    this.state = {
      type: 'jump',
      leg: this.floor,
      phase: 0,
      render: (ctx) => {
        const lt = Math.exp(-this.state.phase / 8)
        const pt = Math.exp(-this.state.phase / 4)
        const pos = { x: this.position.x, y: this.position.y - 0.5 * 4 * (1 - pt) * pt }
        const leg = {
          x: this.state.leg.x * lt + this.position.x * (1 - lt),
          y: this.state.leg.y * lt + (this.position.y - this.legH) * (1 - lt)
        }
        ctx.translate(pos.x, pos.y)
        this.shape.render(
          ctx,
          { dir: this.dir, leg: { x: leg.x - pos.x, y: leg.y - pos.y, grad: 0 }, drill: this.attack.drill }
        )
      }
    }
    this.floor = null
    this.velocity = { x: vx, y: vy }
  }
  startAttack() {
    if (this.attack.cooldown > 0) return
    if (this.attack.cnt % 2 == 0) {
      this.attack.drill = { rotate: Math.random() }
    } else {
      this.attack.drill = { open: true }
    }
    this.attack.cnt++
    this.attack.cooldown = 30
  }
  updateAttack() {
    this.attack.cooldown--
    if (this.attack.cooldown < 10) {
      this.attack.drill = null
    } else {
      if (this.attack.drill.rotate) {
        this.attack.drill.rotate = Math.random()
      } else {
        this.attack.drill.open = !this.attack.drill.open
      }
    }
  }
  update(keymap, stage) {
    this.state.phase++
    this.updateAttack()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    if (this.state.type !== 'idle') {
      if (this.state.type == 'fly') {
        this.velocity.y = Math.max(this.velocity.y - 0.01, -0.1)
      } else {
        this.velocity.y = Math.max(this.velocity.y - 0.04, -1)
      }
      this.velocity.x *= 0.96
    }
    if (this.state.type === 'idle') {
      if (keymap.current.UP) {
        this.jump(0.2 * this.dir, 0.3)
      } else if (keymap.current.RIGHT) {
        this.jump(0.2, 0.2)
      } else if (keymap.current.LEFT) {
        this.jump(-0.2, 0.2)
      }
    } else if (this.state.type === 'jump' && this.state.phase > 12 && keymap.current.UP) {
      this.fly()
      this.velocity.y = 0.1
    } else if (this.state.type === 'fly') {
      if (keymap.current.UP) {
        this.velocity.y = Math.min(this.velocity.y + 0.06, 0.2)
      }
      if (keymap.current.RIGHT) {
        this.velocity.x = Math.min(this.velocity.x + 0.02, 0.2)
      }
      if (keymap.current.LEFT) {
        this.velocity.x = Math.max(this.velocity.x - 0.02, -0.2)
      }
    }
    if (keymap.current.SPACE || keymap.current.DOWN) {
      this.startAttack()
    }
    if (this.velocity.x < 0) this.dir = -1
    if (this.velocity.x > 0) this.dir = +1
    if (this.state.type === 'idle') return
    const testResult = stage.test({ ...this.position, r: this.legH / 2, l: this.legH })
    if (testResult && testResult.type === 'kick') {
      const dir = testResult.dir
      const v = 0.1
      this.position = { ...testResult.pos }
      this.velocity = { x: dir.x * v, y: dir.y * v}
    } else if (testResult && testResult.type === 'land') {
      this.position = testResult.pos
      this.floor = testResult.floor
      if (this.velocity.y < 0) this.velocity = { x: 0, y: 0 }
      this.idle()
    }
  }
  render(ctx) {
    this.state.render(ctx)
  }
}
