CanvasRenderingContext2D.prototype.curve = function(points, closed, noMove) {
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
  if (!noMove) this.moveTo(xs[0].v, ys[0].v)
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
    ctx.curve(shape.down, false, true)
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.closePath()
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
      ctx.arc(shape.eye.x + option.dir * 0.02, shape.eye.y + 0.02, 0.02, 0, 2 * Math.PI)
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
    if (option.wings) {
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
    ctx.restore()
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
    renderLeg(legBase.map((p, i) => { return { x: p.x - 0.04 * i, y: p.y + 0.02 + 0.02 * i }}))
    renderLeg(legBase)
  }
}


const HandCoords = (() => {
  const base = [
    [{x:305,y:213},{x:305,y:204},{x:299,y:185},{x:301,y:178},{x:309,y:179},{x:313,y:193}],
    [{x:313,y:193},{x:319,y:176},{x:322,y:162},{x:329,y:156},{x:333,y:166},{x:328,y:186}],
    [{x:328,y:186},{x:335,y:168},{x:341,y:157},{x:348,y:160},{x:345,y:173},{x:339,y:188}],
    [{x:339,y:188},{x:347,y:172},{x:354,y:164},{x:359,y:168},{x:357,y:179},{x:348,y:193}],
    [{x:348,y:193},{x:359,y:180},{x:367,y:179},{x:364,y:188},{x:355,y:200},{x:345,y:210},{x:339,y:223}]
  ]
  const a = base[0][0]
  const last = base[base.length - 1]
  const b = last[last.length - 1]
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dr = Math.sqrt(dx ** 2 + dy ** 2)
  const th = Math.atan2(dy, dx) + Math.PI
  const cos = Math.cos(th)
  const sin = Math.sin(th)
  return base.map(l => {
    return l.map(p => {
      const x = (p.x - (a.x + b.x) / 2) * 2 / dr
      const y = (p.y - (a.y + b.y) / 2) * 2 / dr
      return {
        x: cos * x + sin * y,
        y: cos * y - sin * x
      }
    })
  })
})()
