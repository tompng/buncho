CanvasRenderingContext2D.prototype.curve = function(points, closed) {
  const dfunc = array => {
    const out = array.map(v => { return { v, d: 0 } })
    for (let n = 0; n < 4; n++) {
      out.forEach((p, i) => {
        let ia = i - 1
        let ib = i + 1
        if (ia === -1) ia = closed ? array.length - 1 : i
        if (ib === array.length) ib = closed ? 0 : i
        const k = ia === i || ib === i ? 2 : 4
        out[i].d = (3 * (out[ib].v - out[ia].v) - out[ia].d - out[ib].d) / k
      })
    }
    return out
  }
  const xs = dfunc(points.map(p => p.x))
  const ys = dfunc(points.map(p => p.y))
  this.moveTo(xs[0].v, ys[0].v)
  const len = closed ? points.length : points.length - 1
  for (let i  = 0; i < len; i++) {
    const s = 1 / 3
    const j = (i + 1) % points.length
    this.bezierCurveTo(
      xs[i].v + s * xs[i].d, ys[i].v + s * ys[i].d,
      xs[j].v - s * xs[j].d, ys[j].v - s * ys[j].d,
      xs[j].v, ys[j].v
    )
  }
}

class BunchoShape {
  constructor() {
    this.legH = 0.6
  }
  normalShape() {
    return {
      eye: { x: 0.5, y: 0.4 },
      up: [{ x: 0.7, y: 0.5 },{x: 0.6, y: 0.58},{x: 0.35, y: 0.6},{x:0, y:0.45},{x:-0.4, y:0.3},{x:-0.9, y:0.2}],
      down: [{x:-0.9, y:0.2},{ x: -0.4, y: -0.3 },{x: 0.1, y: -0.4},{x: 0.4, y: -0.2},{x:0.7, y:0.3}],
      beak: [
        { x: 0.9, y: 0.38 },
        { x: 0.7, y: 0.5 },
        { x: 0.67, y: 0.4 },
        { x: 0.7, y: 0.3 },
        { x: 0.9, y: 0.38 },
      ],
    }
  }
  drillShape() {
    return {
      eye: { x: 0.6, y: 0.1 },
      up: [{ x: 0.8, y: 0.2 },{ x: 0.6, y: 0.28 }, { x: 0.35, y: 0.3 },{ x: 0, y: 0.35 }, { x: -0.4, y: 0.3 }, { x: -0.9, y: 0.2}],
      down: [{x:-0.9, y:0.2},{ x: -0.4, y: -0.3 }, { x: 0.1, y: -0.4 },{ x: 0.5, y: -0.25 }, {x:0.8, y:0.0 }],
      beak: [
        { x: 1, y: 0.08 },
        { x: 0.8, y: 0.2 },
        { x: 0.77, y: 0.1 },
        { x: 0.8, y: 0.0 },
        { x: 1, y: 0.08 },
      ],
      beakOpen: [
        [
          { x: 1.02, y: 0.14 },
          { x: 0.98, y: 0.18 },
          { x: 0.8, y: 0.2 },
          { x: 0.77, y: 0.08 },
          { x: 0.85, y: 0.11 },
          { x: 1.02, y: 0.14 },
        ],
        [
          { x: 1, y: 0.0 },
          { x: 0.8, y: 0.08 },
          { x: 0.8, y: 0.0 },
          { x: 1, y: 0.0 },
        ]
      ]
    }
  }
  render(ctx, option) {
    ctx.lineWidth = 0.02
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.save()
    if (option.dir < 0) {
      ctx.scale(-1, 1)
      option = { ...option, leg: { ...option.leg, x: -option.leg.x } }
    }
    const shape = option.drill ? this.drillShape() : this.normalShape()
    const legStart = { x: 0, y: -0.3 }
    const leg1 = { x: 0, y: -0.3 }
    const legEndBase = { x: 0.1, y: -0.7 }
    const lpdx = option.leg.x - legEndBase.x
    const lpdy = option.leg.y - legEndBase.y
    const lr = Math.sqrt(lpdx ** 2 + lpdy ** 2)
    const legEnd = { ...option.leg }
    const lrMax = 0.3
    if (lr > lrMax) {
      legEnd.x = legEndBase.x + lrMax * lpdx / lr
      legEnd.y = legEndBase.y + lrMax * lpdy / lr
    }
    const ldx = legEnd.x - legStart.x
    const ldy = legEnd.y - legStart.y
    this.renderLegs(ctx, [
      legStart,
      {
        x: -0.3 - ldy / 4,
        y: -0.5 + ldx / 4
      },
      legEnd
    ], option.leg.theta || 0)
    ctx.rotate(option.rotate || 0)
    ctx.beginPath()
    ctx.curve(shape.up)
    ctx.curve(shape.down)
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.fill()
    ctx.stroke()
    if (option.drill && option.drill.rotate) {
      ctx.globalAlpha = 0.5
      for (let i = 0; i < 2; i++) {
        const t = 0.1 * (2 * (option.drill.rotate + i) / 2 - 1)
        ctx.beginPath()
        ctx.arc(shape.eye.x + 4 * t * t, shape.eye.y + t, 0.08, 0, 2 * Math.PI)
        ctx.fillStyle = 'black'
        ctx.strokeStyle = '#f88'
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.fillStyle = 'white'
        ctx.fill()
      }
      ctx.globalAlpha = 1
    } else {
      ctx.beginPath()
      ctx.arc(shape.eye.x, shape.eye.y, 0.08, 0, 2 * Math.PI)
      ctx.fillStyle = 'black'
      ctx.strokeStyle = '#f88'
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(shape.eye.x + 0.02, shape.eye.y + 0.02, 0.02, 0, 2 * Math.PI)
      ctx.fillStyle = 'white'
      ctx.fill()
    }
    ctx.beginPath()
    if (shape.beakOpen && option.drill && option.drill.open){
      shape.beakOpen.forEach(b => ctx.curve(b))
    } else if (option.drill && option.drill.rotate){
      const rnd = 0.05 * option.drill.rotate
      ctx.curve(shape.beak.map((p, i) => {
        return { x: p.x, y: p.y + (i === 0 || i === shape.beak.length - 1 ? rnd : 0) }
      }))
    } else {
      ctx.curve(shape.beak)
    }
    ctx.closePath()
    ctx.fillStyle = '#f88'
    ctx.strokeStyle = 'black'
    ctx.fill()
    ctx.stroke()
    if (option.drill && option.drill.rotate) {
      const rnd = 0.05 * option.drill.rotate
      ctx.beginPath()
      ctx.curve([{ x: 0.85, y: 0.18 + rnd }, { x: 0.82, y: 0.15 + rnd }, { x: 0.82, y: 0.03 + rnd }, { x: 0.85, y: -0.02 + rnd }])
      ctx.curve([{ x: 0.95, y: 0.14 + rnd }, { x: 0.92, y: 0.14 + rnd }, { x: 0.92, y: 0.02 + rnd }, { x: 0.95, y: 0.01 + rnd }])
      ctx.strokeStyle = 'black'
      ctx.stroke()
    }
    ctx.restore()
    if (!option.wings) return
    option.wings.forEach(w => {
      ctx.beginPath()
      ctx.curve([
        { x: 0.2, y: 0.2 + w / 4},{x: 0.1, y: 0.3 + w},{ x: -0.3, y: 0.1 + w / 4 }
      ])
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.stroke()
    })
  }
  renderLegs(ctx, legBase, theta) {
    function renderLeg(leg) {
      ctx.beginPath()
      ctx.moveTo(leg[0].x, leg[0].y)
      ctx.lineTo(leg[1].x, leg[1].y)
      ctx.lineTo(leg[2].x, leg[2].y)
      const x = leg[2].x
      const y = leg[2].y
      const cos = Math.cos(theta)
      const sin = Math.sin(theta)
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(theta)
      ctx.curve([
        { x: -0.15, y: -0.04 },
        { x: 0, y: 0 },
        { x: 0.15, y: -0.04 },
      ])
      ctx.lineWidth *= 3
      ctx.strokeStyle = 'black'
      ctx.stroke()
      ctx.lineWidth /= 3
      ctx.strokeStyle = '#f88'
      ctx.stroke()
      ctx.restore()
    }
    renderLeg(legBase.map((p, i) => { return { x: p.x + 0.02 - 0.1 * i , y: p.y + 0.02 * i }}))
    renderLeg(legBase)
  }
}


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
      drill: null
    }
  }
  idle() {
    this.floor = { x: this.position.x, y: this.position.y - this.legH }
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
            leg: { x: this.floor.x - this.position.x - hx, y: this.floor.y - this.position.y - h },
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
    if (Math.random() < 0.5) {
      this.attack.drill = { rotate: Math.random() }
    } else {
      this.attack.drill = { open: true }
    }
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
  update(KeyMap, KeyPressedMap) {
    this.state.phase++
    this.updateAttack()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    if (this.position.y < this.legH) {
      this.position.y = this.legH
      this.floor = { x: this.position.x, y: this.position.y - 0.2 }
      this.velocity = { x: 0, y: 0 }
      this.idle()
      return
    }
    if (this.state.type !== 'idle') {
      if (this.state.type == 'fly') {
        this.velocity.y = Math.max(this.velocity.y - 0.01, -0.1)
      } else {
        this.velocity.y = Math.max(this.velocity.y - 0.04, -1)
      }
      this.velocity.x *= 0.96
    }
    if (this.position.x > 4) this.position.x = -4
    if (this.position.x < -4) this.position.x = +4
    if (this.state.type === 'idle') {
      if (KeyMap.UP) {
        this.jump(0.2 * this.dir, 0.3)
      } else if (KeyMap.RIGHT) {
        this.jump(0.2, 0.2)
      } else if (KeyMap.LEFT) {
        this.jump(-0.2, 0.2)
      }
    } else if (this.state.type === 'jump' && this.state.phase > 12 && KeyMap.UP) {
      this.fly()
      this.velocity.y = 0.1
    } else if (this.state.type === 'fly') {
      if (KeyMap.UP) {
        this.velocity.y = Math.min(this.velocity.y + 0.06, 0.04)
      }
      if (KeyMap.RIGHT) {
        this.velocity.x = Math.min(this.velocity.x + 0.02, 0.2)
      }
      if (KeyMap.LEFT) {
        this.velocity.x = Math.max(this.velocity.x - 0.02, -0.2)
      }
    }
    if (KeyMap.SPACE || KeyMap.DOWN) {
      this.startAttack()
    }
    if (this.velocity.x < 0) this.dir = -1
    if (this.velocity.x > 0) this.dir = +1
  }
  render(ctx) {
    this.state.render(ctx)
  }
}
