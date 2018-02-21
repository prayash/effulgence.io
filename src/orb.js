import * as THREE from 'three'
const glsl = require('glslify')

class Orb extends THREE.Object3D {
  constructor(context) {
    super(context)

    this.createSun()
    this.createOrb()
    this.createFlare()
    this.addNodes()
  }

  createOrb() {
    this.wireframe = new THREE.Mesh(
      new THREE.IcosahedronGeometry(250, 0),
      new THREE.MeshLambertMaterial({
        color: 16777215,
        wireframe: true
      })
    )

    this.add(this.wireframe)

    this.orbMaterial = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      uniforms: { time: { type: 'f', value: 1.0 } },
      vertexShader: glsl.file('./shaders/orb.vs'),
      fragmentShader: glsl.file('./shaders/orb.fs')
    })

    let orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(128, 2),
      this.orbMaterial
    )

    orb.position.y = 25
    this.add(orb)
  }

  createSun() {
    this.sun = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: THREE.ImageUtils.loadTexture('assets/sun.png'),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.5
      })
    )

    this.sun.scale.set(500, 500)
    this.add(this.sun)
  }

  createFlare() {
    let obj = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: THREE.ImageUtils.loadTexture('/assets/lensflare4.jpg'),
        blending: THREE.AdditiveBlending,
        transparent: true
      })
    )

    obj.scale.set(850, 850)
    this.add(obj)
  }

  addNodes() {
    let nodeGeomtry = new THREE.SphereGeometry(10, 20, 20)
    let nodeMaterial = new THREE.MeshLambertMaterial({
      color: 16250871,
      wireframe: false
    })

    let segments = this.wireframe.geometry.vertices
    for (var i in segments) {
      let { x, y, z } = segments[i]
      let nodeMesh = new THREE.Mesh(nodeGeomtry, nodeMaterial)

      nodeMesh.position.set(x, y, z)
      this.add(nodeMesh)
    }
  }

  update(dt) {
    this.sun.material.color.setHSL(
      0.5 + Math.sin(dt * 2.5e-5) * 0.5 + 0.05,
      0.7,
      0.5
    )

    this.orbMaterial.uniforms.time.value += dt / 1000
    this.rotation.x += 0.02
  }
}

export default Orb
