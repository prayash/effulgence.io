import * as THREE from 'three'
import createControls from 'orbit-controls'
import {
  EffectComposer,
  GlitchPass,
  RenderPass,
  ShaderPass,
  GodRaysPass,
  KernelSize
} from 'postprocessing'
import assign from 'object-assign'
import GodRay from './shaders'
let glsl = require('glslify')

export default function app(opt = {}) {
  let { scene, width, height } = setupScene()
  let camera = setupCamera()
  let renderer = setupRenderer({
    antialias: true,
    alpha: true
  })

  let composer = setupPostProcessing()

  // let composer = setupPostProcessing()

  let canvas = renderer.domElement
  document.querySelector('.icosahedron').appendChild(canvas)

  let target = new THREE.Vector3()

  setupLights()

  // 3D Orbit Controls
  let controls = createControls(
    assign(
      {
        canvas,
        distanceBounds: [1, 10],
        distance: 2.5,
        phi: 70 * Math.PI / 180
      },
      opt
    )
  )

  // Update renderer size
  window.addEventListener('resize', resize)

  // Setup initial size & aspect ratio
  resize()

  return {
    canvas,
    camera,
    composer,
    controls,
    renderer,
    scene,
    updateControls
  }

  function updateControls() {
    let width = window.innerWidth
    let height = window.innerHeight
    let aspect = width / height

    controls.update()
    // target.fromArray(controls.direction).add(camera.position)
    camera.lookAt(target)

    // Update camera matrices
    camera.aspect = aspect
    camera.updateProjectionMatrix()
  }

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
    updateControls()
  }

  function setupScene() {
    let scene = new THREE.Scene()
    let { innerWidth: width, innerHeight: height } = window

    return {
      scene,
      width,
      height
    }
  }

  function setupCamera() {
    // Perspective camera
    let near = 0.1
    let far = 2000
    let fieldOfView = 75
    let camera = new THREE.PerspectiveCamera(
      fieldOfView,
      window.innerWidth / window.innerHeight,
      near,
      far
    )
    camera.position.z = 777

    return camera
  }

  function setupRenderer(opt) {
    let renderer = new THREE.WebGLRenderer(assign({}, opt))

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 1.0)
    renderer.setSize(width, height)

    return renderer
  }

  function setupPostProcessing() {
    let composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    let glitch = new GlitchPass()
    glitch.renderToScreen = true
    composer.addPass(glitch)

    let godrays = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: {
            type: 't',
            value: null
          },
          fX: {
            type: 'f',
            value: 0.5
          },
          fY: {
            type: 'f',
            value: 0.5
          },
          fExposure: {
            type: 'f',
            value: 0.9
          },
          fDecay: {
            type: 'f',
            value: 0.93
          },
          fDensity: {
            type: 'f',
            value: 0.96
          },
          fWeight: {
            type: 'f',
            value: 0.8
          },
          fClamp: {
            type: 'f',
            value: 1
          }
        },
        vertexShader: glsl.file('./shaders/base.vs'),
        fragmentShader: glsl.file('./shaders/godray.fs')
      })
    )

    godrays.renderToScreen = false
    godrays.needsSwap = true
    composer.addPass(godrays)

    return composer
  }

  function setupLights() {
    let light = new THREE.AmbientLight(0xff0000, 0.3)
    scene.add(light)

    light = new THREE.PointLight(0xff0000, 0.5)
    light.position.set(-200, 200, -350)
    scene.add(light)

    light = new THREE.PointLight(0xff0000, 0.4)
    light.position.set(250, 100, 150)
    scene.add(light)

    light = new THREE.PointLight(0xff0000, 0.4)
    light.position.set(25, -300, 150)
    scene.add(light)
  }
}
