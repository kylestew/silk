import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { LUTPass } from "three/examples/jsm/postprocessing/LUTPass.js";

import noiseShaderChunk from "./shaders/utils/simplex-noise-3d.glsl?raw";

class Sketch {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
    });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.domElement.id = "render-canvas";
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.01, 100);
    this.camera.position.set(0, 0, 1.5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 20;
    this.controls.enabled = true;
  }

  resize({ width, height, dpr }) {
    this.size = [width, height];
    this.renderer.setPixelRatio = dpr;
    this.renderer.setSize(width, height);
    if (this.composer) this.composer.setSize(width, height);
    this.camera.aspect = width / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  _createPostProcessing({
    enableFXAA,
    enableBloom,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    lut,
  }) {
    const renderPass = new RenderPass(this.scene, this.camera);
    const composer = new EffectComposer(this.renderer);
    composer.addPass(renderPass);

    if (this.size) {
      const [width, height] = this.size;

      if (enableFXAA) {
        let fxaaPass = new ShaderPass(FXAAShader);
        const pixelRatio = this.renderer.getPixelRatio();
        fxaaPass.material.uniforms["resolution"].value.x =
          1 / (width * pixelRatio);
        fxaaPass.material.uniforms["resolution"].value.y =
          1 / (height * pixelRatio);
        composer.addPass(fxaaPass);
      }

      if (enableBloom) {
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(width, height),
          bloomStrength,
          bloomRadius,
          bloomThreshold
        );
        composer.addPass(bloomPass);
      }
    }

    composer.addPass(new ShaderPass(GammaCorrectionShader));

    if (lut) {
      let lutPass = new LUTPass();
      lutPass.lut = lut.texture3D;
      lutPass.intensity = 1.2;
      lutPass.enabled = true;
      composer.addPass(lutPass);
    }

    return composer;
  }
  _createMaterial({
    envMap,
    metalness,
    roughness,
    transmission,
    ior,
    reflectivity,
    thickness,
    envMapIntensity,
    clearcoat,
    clearcoatRoughness,
  }) {
    let material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness,
      roughness,
      transmission,
      ior,
      reflectivity,
      thickness,
      envMap: envMap,
      envMapIntensity,
      clearcoat,
      clearcoatRoughness,
      // clearcoatNormalMap: normalMapTexture,
      // clearcoatNormalScale: new THREE.Vector2(clearcoatNormalScale),
    });

    material.onBeforeCompile = (shader) => {
      shader.uniforms.u_time = { value: 0 };

      // == EXTEND THREE JS SHADER ==
      // override normal map and generate noise texture in frag shader

      // enable UVs even though we haven't set a normal map
      shader.vertexShader = "#define USE_UV\n" + shader.vertexShader;

      // inject noise functions into fragment shader
      // include extra uniforms
      shader.fragmentShader = [
        "#define USE_UV",
        noiseShaderChunk,
        "uniform float u_time;",
        shader.fragmentShader,
      ].join("\n");

      // override normal map shader chunk
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_maps>",
        [
          // orient normal in spherical coordinates
          "float theta = snoise(vec3(vUv, cos(u_time)) * 2.0) * PI / 2.0;",
          "float phi = snoise(vec3(vUv, sin(u_time)) * 2.0) * PI / 2.0;",
          // convert spherical to cartesian normal
          "float xn = cos(theta) * cos(phi);",
          "float yn = sin(theta) * cos(phi);",
          "float zn = sin(theta);",
          "normal = normalize(vec3(xn, yn, zn));",
        ].join("\n")
      );

      material.userData.shader = shader;
    };

    return material;
  }

  updateState(state) {
    let scene = new THREE.Scene();
    scene.background = state.envMap;

    const geometry = new THREE.PlaneGeometry(1, 1.777);
    // const geometry = new THREE.PlaneGeometry(1, 1);
    const material = this._createMaterial(state);
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    this.material = material;
    this.scene = scene;

    // post processing
    this.composer = this._createPostProcessing(state);
  }

  _update(time, deltaTime, {}) {
    if (this.material) {
      const shader = this.material.userData.shader;
      if (shader) {
        shader.uniforms.u_time.value = time / 8.0;
      }
    }

    this.controls.update();
  }

  render(time, deltaTime, state) {
    this._update(time, deltaTime, state);
    if (this.composer) {
      this.composer.render(this.scene, this.camera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

export default Sketch;
