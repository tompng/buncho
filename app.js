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
        // { x: 0.7, y: 0.45 },
        { x: 0.67, y: 0.4 },
        // { x: 0.7, y: 0.35 },
        { x: 0.7, y: 0.3 },
        { x: 0.9, y: 0.38 },
      ]
    }
  }
  curve(ctx, points) {
    const dfunc = array => {
      const out = array.map(v => { return { v, d: 0 } })
      for (let n = 0; n < 4; n++) {
        out.forEach((p, i) => {
          const ia = i === 0 ? i : i - 1
          const ib = i === out.length - 1 ? out.length - 1 : i + 1
          const k = ia === i || ib === i ? 2 : 4
          out[i].d = (3 * (out[ib].v - out[ia].v) - out[ia].d - out[ib].d) / k
        })
      }
      return out
    }
    const xs = dfunc(points.map(p => p.x))
    const ys = dfunc(points.map(p => p.y))
    ctx.moveTo(xs[0].v, ys[0].v)
    for (let i  = 0; i < points.length - 1; i++) {
      const s = 1 / 3
      ctx.bezierCurveTo(
        xs[i].v + s * xs[i].d, ys[i].v + s * ys[i].d,
        xs[i + 1].v - s * xs[i + 1].d, ys[i + 1].v - s * ys[i + 1].d,
        xs[i + 1].v, ys[i + 1].v
      )
    }
  }
  render(ctx) {
    ctx.lineWidth = 0.02
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const shape = this.normalShape()
    ctx.beginPath()
    this.curve(ctx, shape.up)
    this.curve(ctx, shape.down)
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
    this.curve(ctx, shape.beak)
    ctx.closePath()
    ctx.fillStyle = '#f88'
    ctx.strokeStyle = '#a88'
    ctx.fill()
    ctx.stroke()
  }
}
