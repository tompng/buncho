class Stage {
  constructor() {
    this.objects = [
      {x: 1, y: 8, r: 1, id: 0 },
      {x: -1, y: 5, r: 1, id: 1 },
      {x: 8, y: -7, r: 9, id: 2 },
      {x: -7, y: 4, r: 2, id: 3 },
      {x: 7, y: 11, r: 3, id: 4 },
      {x: -6, y: 14, r: 3, id: 5 },
      {x: 2, y: 15, r: 1, id: 5 },
    ]
    this.xmin = -12
    this.xmax = 12
    this.ymax = 20
    this.colors = [
      '#a8f', '#fa8', '#8fa', '#8af'
    ]
  }
  render(ctx) {
    ctx.fillStyle = '#aca'
    const h = 0.1
    ctx.fillRect(this.xmin, -h, this.xmax - this.xmin, h)
    this.objects.forEach(obj => {
      ctx.beginPath()
      ctx.fillStyle = this.colors[obj.id % this.colors.length]
      ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI)
      ctx.fill()
    })
  }
  test(object, pointFrom) {
    if (object.y < object.l) {
      return {
        type: 'land',
        floor: { x: object.x, y: 0 },
        pos: { x: object.x, y: object.l }
      }
    }
    if (object.x + object.r > this.xmax) {
      return {
        type: 'kick',
        dir: { x: -1, y: 0 },
        pos: { x: this.xmax - object.r, y: object.y }
      }
    }
    if (object.x - object.r < this.xmin) {
      return {
        type: 'kick',
        dir: { x: 1, y: 0 },
        pos: { x: this.xmin + object.r, y: object.y }
      }
    }
    if (object.y + object.r > this.ymax) {
      return {
        type: 'kick',
        dir: { x: 0, y: -1 },
        pos: { x: object.x, y: this.ymax - object.r }
      }
    }
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
