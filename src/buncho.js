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
  hitRange() {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.legH / 2
    }
  }
  attackRange() {
    if (this.attack.cooldown < 10) return
    return {
      x: this.position.x + this.dir,
      y: this.position.y,
      r: 1
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
        const lt = Math.exp(-this.state.phase / 6)
        const leg = {
          x: this.state.leg.x * lt + this.position.x * (1 - lt),
          y: this.state.leg.y * lt + (this.position.y - this.legH) * (1 - lt)
        }
        ctx.translate(this.position.x, this.position.y)
        this.shape.render(
          ctx,
          { dir: this.dir, leg: { x: leg.x - this.position.x, y: leg.y - this.position.y, grad: 0 }, drill: this.attack.drill }
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
    const xdir = (keymap.current.RIGHT ? 1 : 0) - (keymap.current.LEFT ? 1 : 0)
    if (this.state.type === 'idle') {
      if (keymap.current.UP) {
        this.jump(0.1 * this.dir, 0.4)
      } else if (xdir > 0) {
        const th = Math.max(this.floor.theta || 0, 0) + Math.PI / 4
        this.jump(0.2 * Math.cos(th) + 0.1, 0.3 * Math.sin(th))
      } else if (xdir < 0) {
        const th = -Math.min(this.floor.theta || 0, 0) + Math.PI / 4
        this.jump(-0.2 * Math.cos(th) - 0.1, 0.3 * Math.sin(th))
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
    if (this.state.type === 'jump' && this.velocity.y < -0.4) {
      this.fly()
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
      if (this.position.y < testResult.pos.y) {
        this.position = testResult.pos
        this.floor = testResult.floor
        this.velocity = { x: 0, y: 0 }
        this.idle()
      }
    }
  }
  render(ctx) {
    ctx.save()
    this.state.render(ctx)
    ctx.restore()
  }
}
