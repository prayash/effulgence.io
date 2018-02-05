import * as THREE from 'three'
import './lib/OBJLoader.js'
import { setTimeout } from 'timers'

const OBJ_SCALE = 1.0
const MAX_SIZE = 450

class Core {
  constructor(args) {
    this.object3D = new THREE.Object3D()

    this.radius = args.radius || 120
    this.opacity = args.opacity || 1.0
    this.wireframe = args.wireframe || false
    this.vertices = args.vertices || []

    this.container = args.container
    this.camera = args.camera

    this.rotateStartPoint = new THREE.Vector3(0, 0, 1)
    this.rotateEndPoint = new THREE.Vector3(0, 0, 1)

    this.idleRotationSpeed = 0.1 * Math.pow(window.innerWidth / MAX_SIZE, 2)
    this.interactiveRotationSpeed = 0.75

    this.lastMoveTimestamp = new Date().getTime()
    this.moveReleaseTimeDelta = 50
    this.mouseStartPoint = { x: 0, y: 0 }

    this.delta = {
      x: 80 * Math.pow(window.innerWidth / MAX_SIZE, 4),
      y: 80 * Math.pow(window.innerWidth / MAX_SIZE, 4)
    }

    this.geometry = new THREE.IcosahedronGeometry(this.radius, 0)
    this.material = new THREE.MeshPhongMaterial({
      color: this.wireframe
        ? new THREE.Color('#FFFFFF')
        : // : new THREE.Color('#895cf2'),
          new THREE.Color('#D92B6A'),
      emissive: new THREE.Color('rgb(217, 220, 255)'),
      emissiveIntensity: 0.3,
      specular: new THREE.Color('#D92B6A'),
      shininess: 3,
      wireframe: this.wireframe
    })

    this.mesh = null
    this.lowResMesh = new THREE.Mesh(this.geometry, this.material)

    new THREE.OBJLoader().load('/assets/icosa.min.obj', val => {
      val.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          let g = new THREE.Geometry().fromBufferGeometry(obj.geometry)
          g.computeFaceNormals()
          g.mergeVertices()
          g.computeVertexNormals()
          obj.geometry = new THREE.BufferGeometry().fromGeometry(g)
          obj.material = this.material
        }
      })

      this.mesh = val

      let s = 1.0
      if (args.wireframe) {
        s = 1.2
      }

      this.mesh.scale.set(OBJ_SCALE * s, OBJ_SCALE * s, OBJ_SCALE * s)
      this.lowResMesh.scale.set(OBJ_SCALE * s, OBJ_SCALE * s, OBJ_SCALE * s)

      if (this.wireframe) {
        this.object3D.add(this.lowResMesh)
      } else {
        this.object3D.add(this.mesh)
      }
    })

    this.vertexLabels = [
      'Us',
      'Stray Thoughts',
      'An Arrival',
      'Distance',
      'Transience',
      'Images of Essence',
      'Illumine',
      'A Heaven in a Wild Flower',
      'The Scientist',
      'Transience Pt. 2',
      'Sonder',
      'Music of Effulgence'
    ]

    for (var i = 0; i < this.geometry.vertices.length; i++) {
      if (!this.wireframe) {
        let marker = document.createElement('div')
        marker.classList.add('vertex-marker')
        marker.classList.add('initially-hidden')

        let labelContainer = document.createElement('div')
        labelContainer.classList.add('label-container')

        let label = document.createElement('a')
        label.classList.add('label')
        label.innerHTML = this.vertexLabels[i]

        labelContainer.appendChild(label)
        marker.appendChild(labelContainer)

        this.container.appendChild(marker)
        this.vertices.push({
          marker,
          labelContainer,
          label,
          z: -1
        })
      }

      this.bindEvents()
      this.render()
    }

    return this
  }

  bindEvents() {
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragMove = this.onDragMove.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)

    if ('ontouchend' in document) {
      document.addEventListener('touchstart', this.onDragStart, false)
    } else {
      document.addEventListener('mousedown', this.onDragStart, false)
    }
  }

  onDragStart(e) {
    e.preventDefault()
    if ('ontouchend' in document) {
      document.addEventListener('touchmove', this.onDragMove, false)
      document.addEventListener('touchend', this.onDragEnd, false)
    } else {
      document.addEventListener('mousemove', this.onDragMove, false)
      document.addEventListener('mouseup', this.onDragEnd, false)
    }

    if (e.touches) {
      e = e.touches[0]
    }

    this.mouseDown = true
    this.mouseStartPoint = {
      x: e.clientX,
      y: e.clientY
    }

    this.rotateStartPoint = this.rotateEndPoint = this.projectOnTrackball(0, 0)
  }

  onDragMove(e) {
    if (e.touches) {
      e = e.touches[0]
    }

    let { clientX: x, clientY: y } = e

    this.delta = {
      x: e.clientX - this.mouseStartPoint.x,
      y: e.clientY - this.mouseStartPoint.y
    }
    this.rotate()
    this.mouseStartPoint = { x: e.clientX, y: e.clientY }
    this.lastMoveTimestamp = new Date()
  }

  onDragEnd(e) {
    let now = new Date().getTime()
    if (now - this.lastMoveTimestamp > this.moveReleaseTimeDelta) {
      this.delta.x = e.clientX - this.mouseStartPoint.x
      this.delta.y = e.clientY - this.mouseStartPoint.y
    }

    this.mouseDown = false

    if ('ontouchend' in document) {
      document.removeEventListener('touchmove', this.onDragMove, false)
      document.removeEventListener('touchend', this.onDragEnd, false)
    } else {
      document.removeEventListener('mousemove', this.onDragMove, false)
      document.removeEventListener('mouseup', this.onDragEnd, false)
    }
  }

  projectOnTrackball(x, y) {
    let width = window.innerWidth / 2
    let height = window.innerHeight / 2
    let vec = new THREE.Vector3()

    vec.set(this.clamp(x / width, -1, 1), this.clamp(-y / height, -1, 1), 0)

    if (vec.length() > 1) {
      vec.normalize()
    } else {
      vec.z = Math.sqrt(1 - vec.length() * vec.length())
    }

    return vec
  }

  rotateMatrix(start, end, speed) {
    let axis = new THREE.Vector3()
    let quaternion = new THREE.Quaternion()
    let delta = Math.acos(start.dot(end) / start.length() / end.length())

    axis.crossVectors(start, end).normalize(), (delta *= speed)
    quaternion.setFromAxisAngle(axis, delta)

    return quaternion
  }

  rotate() {
    this.rotateEndPoint = this.projectOnTrackball(this.delta.x, this.delta.y)

    let newQuaternion = this.rotateMatrix(
      this.rotateStartPoint,
      this.rotateEndPoint,
      this.interactiveRotationSpeed
    )

    this.curQuaternion = this.lowResMesh.quaternion
    this.curQuaternion.multiplyQuaternions(newQuaternion, this.curQuaternion)
    this.curQuaternion.normalize()

    if (this.mesh) {
      this.lowResMesh.setRotationFromQuaternion(this.curQuaternion)
      this.mesh.setRotationFromQuaternion(this.curQuaternion)
    }

    this.rotateEndPoint = this.rotateStartPoint
  }

  vertexScreenCoords(index) {
    let vector = this.geometry.vertices[index].clone()

    this.lowResMesh.updateMatrixWorld()
    vector.applyMatrix4(this.lowResMesh.matrixWorld)

    let offset = vector.project(this.camera)
    offset.x = (offset.x + 1) / 2 * this.container.offsetWidth
    offset.y = -(offset.y - 1) / 2 * this.container.offsetHeight

    return offset
  }

  updateLabels() {
    let coords = this.geometry.vertices
      .map(v => this.lowResMesh.localToWorld(v.clone()).z)
      .sort((far, near) => far - near)

    let radius = -1 * this.radius
    let r = this.radius
    let startTime = 0.75
    let now = 1
    let mass = r - radius
    let delta = now - startTime

    for (var a = 0; a < this.geometry.vertices.length; a++) {
      let f = this.vertexScreenCoords(a)

      this.vertices[a].marker.style.transform = `translate(${f.x}px, ${f.y}px)`

      let l = this.lowResMesh.localToWorld(this.geometry.vertices[a].clone())
      // this.vertices[a].worldZ = l.z

      if (l.z < 5) {
        this.vertices[a].marker.classList.remove('visible')
      } else {
        this.vertices[a].marker.classList.add('visible')
      }

      let c = coords.indexOf(l.z)
      if (c > -1 && this.vertices[a].z != c) {
        this.vertices[a].z = c
        this.vertices[a].marker.style.zIndex = c + 1e3
      }

      let scale = (l.z - radius) * delta / mass + startTime
      this.vertices[a].label.style.transform = `scale(${scale})`
    }
  }

  display(speed) {
    setTimeout(() => {
      this.container.classList.add('visible')
      this.updateLabels()

      setTimeout(() => {
        this.vertices.forEach((item, dataAndEvents) => {
          item.marker.style.display = 'flex'

          setTimeout(() => {
            item.marker.classList.remove('initially-hidden')
          }, 30 * dataAndEvents + 100)
        })
      }, 1e3)
    }, speed)
  }

  clamp(e, t, n) {
    return Math.min(Math.max(e, t), n)
  }

  idleRotation() {
    let { delta, idleRotationSpeed, mouseDown } = this

    if (!mouseDown) {
      let t = 0.92
      let n = idleRotationSpeed
      console.log('hi')
    }
  }

  render() {
    this.updateLabels()
    if (!this.mouseDown) {
      let x = 0.92
      let y = this.idleRotationSpeed

      if (this.delta.x < -y || this.delta.x > y) {
        this.delta.x *= x
      } else {
        this.delta.x = y * (this.delta.x < 0 ? -1 : 1)
      }

      if (this.delta.y < -y || this.delta.y > y) {
        this.delta.y *= x
      } else {
        this.delta.y = y * (this.delta.y < 0 ? -1 : 1)
      }

      this.rotate()
    }
  }
}

export default Core
