class KeyMap {
  constructor() {
    this.current = {}
    this.pressed = {}
  }
  attach(target) {
    target.onkeydown = e => {
      const name = this.keyCodeToName(e.keyCode)
      if (!name) return
      if (!this.current[name]) this.pressed[name] = true
      this.current[name] = true
    }
    target.onkeyup = e => {
      const name = this.keyCodeToName(e.keyCode)
      if (name) this.current[name] = false
    }
  }
  clear() {
    for (const key in this.pressed) this.pressed[key] = false
  }
  keyCodeToName(keyCode) {
    switch (keyCode) {
      case 37:
      case 65:
        return 'LEFT'
      case 38:
      case 87:
        return 'UP'
      case 39:
      case 68:
        return 'RIGHT'
      case 40:
      case 83:
        return 'DOWN'
        break
      case 32:
        return 'SPACE'
    }
  }
}
