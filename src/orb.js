import * as THREE from 'three'
let glsl = require('glslify')

class Orb {
  constructor() {
    this.object3D = new THREE.Object3D()

    this.buildMesh()
    this.init()
    this.createBox()
  }

  buildMesh() {
    let geometry = new THREE.IcosahedronGeometry(250, 0)
    let material = new THREE.MeshLambertMaterial({
      color: 16777215,
      wireframe: true
    })
    let mesh = new THREE.Mesh(geometry, material)

    this.object3D.add(mesh)

    let sGeometry = new THREE.IcosahedronGeometry(160, 2)
    this.material = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      uniforms: { time: { type: 'f', value: 1.0 } },
      vertexShader: glsl.file('./shaders/orb.vs'),
      fragmentShader: glsl.file('./shaders/orb.fs')
    })

    let obj = new THREE.Mesh(sGeometry, this.material)

    obj.position.y = 0
    this.object3D.add(obj)
  }

  init() {
    let params = new THREE.SpriteMaterial({
      map: THREE.ImageUtils.loadTexture('/assets/sun.png'),
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.5
    })

    this.obj = new THREE.Sprite(params)
    this.obj.scale.set(500, 500)
    this.object3D.add(this.obj)
  }

  update(delta) {
    this.obj.material.color.setHSL(
      0.5 + Math.sin(delta * 2.5e-5) * 0.5 + 0.05,
      0.7,
      0.5
    )
    this.material.uniforms.time.value = 0.0025 * (Date.now() - delta)
    this.object3D.rotation.x += 0.02
  }

  createBox() {
    let obj = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: THREE.ImageUtils.loadTexture('/assets/lensflare4.jpg'),
        blending: THREE.AdditiveBlending,
        transparent: true
      })
    )

    obj.scale.set(850, 850)
    this.object3D.add(obj)
  }
}

export default Orb
