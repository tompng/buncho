class Enemy {
  constructor(position, direction) {
    this.position = position || { x: 0, y: -4 }
    this.direction = direction || { v: 0.02 + 0.01 * Math.random(), t: Math.PI / 2, a: 0.01 + 0.01 * Math.random() }
    this.r = 1
    this.lefts = []
    this.rights = []
    this.wrist = 0.6
    const colors = [
      '#aca',
      '#caa',
      '#aac',
      '#cac',
      '#cca',
      '#acc',
      '#ccc',
    ]
    this.color = colors[Math.floor(Math.random() * colors.length)]
    const cos = Math.cos(this.direction.t)
    const sin = Math.sin(this.direction.t)
    for (let i = 1; i <= 64; i++) {
      const x = this.position.x - cos - cos * this.direction.v * i
      const y = this.position.y - sin - sin * this.direction.v * i
      this.lefts.push({ x: x + sin * this.wrist, y: y - cos * this.wrist })
      this.rights.push({ x: x - sin * this.wrist, y: y + cos * this.wrist })
    }
  }
  test(target) {
    const dx = target.x - this.position.x
    const dy = target.y - this.position.y
    const rsum = target.r + this.r
    return dx ** 2 + dy ** 2 < rsum ** 2
  }
  update(target) {
    const dx = target.x - this.position.x
    const dy = target.y - this.position.y
    const th = Math.atan2(dy, dx)
    let dth = th - this.direction.t
    while (dth > Math.PI) dth -= 2 * Math.PI
    while (dth < -Math.PI) dth += 2 * Math.PI
    this.direction.t += (dth < -0.1 ? -1 : dth > 0.1 ? 1 : 0) * this.direction.a
    const cos = Math.cos(this.direction.t)
    const sin = Math.sin(this.direction.t)
    this.position.x += this.direction.v * cos
    this.position.y += this.direction.v * sin
    const x = this.position.x - cos
    const y = this.position.y - sin
    this.lefts.unshift({ x: x + sin * this.wrist, y: y - cos * this.wrist })
    this.rights.unshift({ x: x - sin * this.wrist, y: y + cos * this.wrist })
    this.lefts.pop()
    this.rights.pop()
  }
  render(ctx) {
    const lefts = []
    const rights = []
    for (let i = 1; i <= 4; i++) {
      const l = this.lefts[i * 16]
      const r = this.rights[i * 16]
      if (l) lefts.push(l)
      if (r) rights.push(r)
    }
    ctx.lineWidth = 0.02
    const cos = Math.cos(this.direction.t)
    const sin = Math.sin(this.direction.t)
    const hand = HandCoords.map(line => {
      const x = this.position.x - cos
      const y = this.position.y - sin
      return line.map(p => {
        return {
          x: x + p.x * sin + p.y * cos,
          y: y + p.y * sin - p.x * cos
        }
      })
    })
    ctx.beginPath()
    ctx.curve(hand[4].concat(rights).concat(lefts.reverse(),hand[0]))
    ctx.curve(hand[1], false, true)
    ctx.curve(hand[2], false, true)
    ctx.curve(hand[3], false, true)
    ctx.fillStyle = this.color
    ctx.strokeStyle = 'black'
    ctx.fill()
    ctx.stroke()
  }
}
