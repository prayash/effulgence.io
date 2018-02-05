let glsl = require('glslify')

export class Additive {
  constructor() {
    this.uniforms = {
      tDiffuse: {
        type: 't',
        value: null
      },
      tAdd: {
        type: 't',
        value: null
      },
      fCoeff: {
        type: 'f',
        value: 1
      }
    }

    this.vertexShader = glsl.file('./shaders/base.vs')
    this.fragmentShader = glsl.file('./shaders/additive.fs')
  }
}

export class GodRay {
  constructor() {
    this.uniforms = {
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
    }

    this.vertexShader = glsl.file('./shaders/base.vs')
    this.fragmentShader = glsl.file('./shaders/godray.fs')
  }
}
