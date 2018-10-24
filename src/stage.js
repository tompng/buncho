class Stage {
  constructor() {
    this.objects = [
      {x: 1, y: 8, r: 1},
      {x: -1, y: 5, r: 1},
      {x: 6, y: 0, r: 3},
      {x: -7, y: 4, r: 2}
    ]
  }
  render(ctx) {
    ctx.fillStyle = 'red'
    this.objects.forEach(obj => {
      ctx.beginPath()
      ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI)
      ctx.fill()
    })
  }
  test(object, pointFrom) {
    for (const o of this.objects) {
      const dx = object.x - o.x
      const dy = object.y - o.y
      const dly = object.y - object.l - o.y
      const r2 = dx ** 2 + dy ** 2
      const lr2 = dx ** 2 + dly ** 2
      const rsum2 = (object.r + o.r) ** 2
      const dr = Math.sqrt(r2)
      const kick = {
        type: 'kick',
        pos: {
          x: o.x + dx / dr * (object.r * 2 + o.r),
          y: o.y + dy / dr * (object.r * 2 + o.r)
        },
        dir: { x: dx / dr, y: dy / dr }
      }
      if (r2 < rsum2) {
        return kick
      } else if (lr2 < o.r ** 2) {
        const theta = -Math.atan2(dx, dy)
        if (theta < -Math.PI / 5 || theta > Math.PI / 5) {
          return kick
        }
        const floor = {
          x: object.x,
          y: o.y + Math.sqrt(o.r ** 2 - dx ** 2),
          theta
        }
        return {
          type: 'land',
          floor,
          pos: { x: object.x, y: floor.y + object.l }
        }
      }
    }
  }
}
