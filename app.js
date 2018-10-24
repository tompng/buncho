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

class Buncho {
  constructor() {

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
      leg: [{ x: 0, y: -0.3 }, { x: -0.2, y: -0.45 }, { x: 0.2, y: -0.6 },]
    }
  }
  render(ctx) {
    ctx.lineWidth = 0.02
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const shape = this.normalShape()

    this.renderLeg(ctx, shape.leg.map((p, i) => { return { x: p.x + 0.15 - 0.1 * i , y: p.y + 0.02 * i }}))
    this.renderLeg(ctx, shape.leg)
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
  }
  renderLeg(ctx, leg) {
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
}
