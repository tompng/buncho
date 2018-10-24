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
    if (closed) console.error(out)
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
  render(ctx, legPosition, rotate) {
    ctx.lineWidth = 0.02
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.save()
    const shape = this.normalShape()
    const legStart = { x: 0, y: -0.3 }
    const leg1 = { x: 0, y: -0.3 }
    const legEndBase = { x: 0.1, y: -0.7 }
    const lpdx = legPosition.x - legEndBase.x
    const lpdy = legPosition.y - legEndBase.y
    const lr = Math.sqrt(lpdx ** 2 + lpdy ** 2)
    const legEnd = { ...legPosition }
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
    ])
    ctx.rotate(rotate || 0)
    ctx.beginPath()
    ctx.curve(shape.up)
    ctx.curve(shape.down)
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.fill()
    ctx.stroke()

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

    ctx.beginPath()
    ctx.curve(shape.beak)
    ctx.closePath()
    ctx.fillStyle = '#f88'
    ctx.strokeStyle = 'black'
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  renderLegs(ctx, leg) {
    function renderLeg(leg) {
      ctx.beginPath()
      ctx.moveTo(leg[0].x, leg[0].y)
      ctx.lineTo(leg[1].x, leg[1].y)
      ctx.lineTo(leg[2].x, leg[2].y)
      const x = leg[2].x
      const y = leg[2].y
      ctx.curve([
        { x: x - 0.1, y: y - 0.1 },
        { x, y },
        { x: x + 0.2, y: y },
      ])
      ctx.lineWidth *= 3
      ctx.strokeStyle = 'black'
      ctx.stroke()
      ctx.lineWidth /= 3
      ctx.strokeStyle = '#f88'
      ctx.stroke()
    }
    renderLeg(leg.map((p, i) => { return { x: p.x + 0.02 - 0.1 * i , y: p.y + 0.02 * i }}))
    renderLeg(leg)
  }
}


class Buncho {
  constructor() {
    this.shape = new BunchoShape()
    this.legH = this.shape.legH
    this.position = { x: 0, y: this.legH }
    this.velocity = { x: 0, y: 0 }
    this.floor = { x: 0, y: 0 }
    this.jump()
  }
  idle() {
    this.floor = { x: this.position.x, y: this.position.y - this.legH }
    this.state = {
      type: 'idle',
      phase: 0,
      render: (ctx) => {
        const h = Math.sin(this.state.phase * 0.04) * 0.02
        const hx = Math.sin(this.state.phase * 0.04 - 1) * 0.01
        ctx.translate(this.position.x + hx, this.position.y + h)
        this.shape.render(
          ctx,
          { x: this.floor.x - this.position.x - hx, y: this.floor.y - this.position.y - h },
          -hx
        )
      }
    }
  }
  jump() {
    this.state = {
      type: 'jump',
      leg: this.floor,
      phase: 0,
      render: (ctx) => {
        const lt = Math.exp(-this.state.phase / 32)
        const pt = Math.exp(-this.state.phase / 16)
        const pos = { x: this.position.x, y: this.position.y - 0.5 * 4 * (1 - pt) * pt }
        const leg = {
          x: this.state.leg.x * lt + this.position.x * (1 - lt),
          y: this.state.leg.y * lt + (this.position.y - this.legH) * (1 - lt)
        }
        ctx.translate(pos.x, pos.y)
        this.shape.render(
          ctx,
          { x: leg.x - pos.x, y: leg.y - pos.y }
        )
      }
    }
    this.floor = null
    this.velocity = { x: 0.02, y: 0.05 }
  }
  update(key) {
    this.state.phase ++
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    if (this.position.y < this.legH) {
      this.position.y = this.legH
      this.floor = { x: this.position.x, y: this.position.y - 0.2 }
      this.velocity = { x: 0, y: 0 }
      this.idle()
    }
    if (this.state.type !== 'idle') {
      this.velocity.y = Math.max(this.velocity.y - 0.001, -10)
    }
    this.velocity
    if (this.position.x > 4) this.position.x = -4
    if (this.state.type === 'idle' && key) {
      this.jump()
    }
  }
  render(ctx) {
    this.state.render(ctx)
  }

}
