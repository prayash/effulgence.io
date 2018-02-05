import * as THREE from 'three'
import animate from 'raf-loop'
import app from './app'
import Core from './core'
import Orb from './orb'
import Lights from './lights'

const { composer, renderer, camera, canvas, scene, updateControls } = app()

// let core = new Core({
//   camera,
//   container: document.querySelector('.icosahedron'),
//   wireframe: false
// })

// scene.add(core.object3D)

// core.display(500)

// const coreFrame = new Core({
//   camera,
//   container: document.querySelector('.icosahedron'),
//   radius: 100,
//   opacity: 0.15,
//   wireframe: true
// })

let orb = new Orb()
scene.add(orb.object3D)

let lights = new Lights()
scene.add(lights.object3D)

let time = 0
animate(dt => {
  time += dt / 1000

  // core.render()
  // coreFrame.render()

  // renderer.render(scene, camera)
  composer.render()

  camera.lookAt(scene.position)

  orb.update(dt)
  lights.update(dt)

  // core.render(dt)
}).start()
