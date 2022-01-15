import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { LUTPass } from "three/examples/jsm/postprocessing/LUTPass.js";
import { LUTCubeLoader } from "three/examples/jsm/loaders/LUTCubeLoader";

import lutUrl from "/assets/luts/Everyday_Pro_Color.cube?url";

import noiseShaderChunk from "./shaders/utils/simplex-noise-3d.glsl?raw";

class Sketch {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
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

    let scene = new THREE.Scene();
    // scene.background = new THREE.Color(backgroundColor);

    // const geometry = new THREE.PlaneGeometry(1, 1.777);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshNormalMaterial();
    material.onBeforeCompile = (shader) => {
      shader.uniforms.u_time = { value: 0 };

      // override normal map and generate noise texture in frag shader
      shader.vertexShader = "#define USE_UV\n" + shader.vertexShader;

      shader.fragmentShader = [
        "#define USE_UV",
        noiseShaderChunk,
        "uniform float u_time;",
        shader.fragmentShader,
      ].join("\n");

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_maps>",
        [
          "normal = vec3(snoise(vec3(vUv, u_time)), 0, 0);",
          // "float xDistortion = snoise(vec4(vPosition * u_frequency, u_time)) * u_amplitude;",
          // "float yDistortion = snoise(vec4(vPosition * u_frequency, u_time * 2.)) * u_amplitude;",
          // "float zDistortion = snoise(vec4(vPosition * u_frequency, u_time * 0.5)) * u_amplitude;",
          // "vec3 normal = normalize(vec3(xDistortion * 0.5 + 0.0, yDistortion * 0.5 + 0.0, zDistortion * 0.5 + 0.0));"
        ].join("\n")
      );

      material.userData.shader = shader;
    };
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    this.material = material;
    this.scene = scene;

    const renderPass = new RenderPass(scene, this.camera);
    const composer = new EffectComposer(this.renderer);
    composer.addPass(renderPass);
    composer.addPass(new ShaderPass(GammaCorrectionShader));

    new LUTCubeLoader().load(lutUrl, (lut) => {
      let lutPass = new LUTPass();
      lutPass.lut = lut.texture3D;
      lutPass.intensity = 1.2;
      lutPass.enabled = true;
      composer.addPass(lutPass);
    });

    this.composer = composer;
  }

  resize({ width, height, dpr }) {
    this.size = [width, height];
    this.renderer.setPixelRatio = dpr;
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.camera.aspect = width / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  updateState({ backgroundColor, cubeSize }) {
    // apply UI params to current scene without rebuilding
  }

  _update(time, deltaTime, {}) {
    const shader = this.material.userData.shader;
    if (shader) {
      shader.uniforms.u_time.value = time / 4.0;
    }

    this.controls.update();
  }

  render(time, deltaTime, state) {
    this._update(time, deltaTime, state);
    this.renderer.render(this.scene, this.camera);
    // this.composer.render(this.scene, this.camera);
  }
}

export default Sketch;
