import * as THREE from 'three'

class Lights extends THREE.Object3D {
  constructor(context) {
    super(context)

    this.items = []
    this.rgbaParent = new THREE.Color()
    this.rgbaLayer = new THREE.Color(0x0000ff)

    let range = 750
    let codeSegments = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, range),
      new THREE.Vector3(range, 0, 0),
      new THREE.Vector3(-range, 0, 0),
      new THREE.Vector3(0, 0, -range),
      new THREE.Vector3(0, range, 0),
      new THREE.Vector3(0, -range, 0)
    ]

    codeSegments.forEach(segment => {
      let obj = new THREE.PointLight({
        color: 0x0000ff,
        intensity: 1.5,
        distance: 2e3
      })

      obj.position.set(segment.x, segment.y, segment.z)
      this.add(obj)
      this.items.push(obj)
    })
  }

  update(delta) {
    this.rgbaParent.setHSL(0.5 + Math.sin(delta * 2.5e-5) * 0.5, 0.1, 0.5)

    this.items.forEach(item => {
      let { color } = item

      color.r = this.rgbaLayer.r * this.rgbaParent.r
      color.g = this.rgbaLayer.g * this.rgbaParent.g
      color.b = this.rgbaLayer.b * this.rgbaParent.b
    })
  }
}

export default Lights
