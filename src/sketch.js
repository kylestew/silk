import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { LUTPass } from "three/examples/jsm/postprocessing/LUTPass.js";
import { LUTCubeLoader } from "three/examples/jsm/loaders/LUTCubeLoader";

import vertexShader from "./shaders/shader.vert";
import fragmentShader from "./shaders/shader.frag";
import lutUrl from "/assets/luts/Everyday_Pro_Color.cube?url";

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

    // TODO: allow swapping mat cap texture
    const matCapTex = new THREE.TextureLoader().load(
      // "assets/matcap/161B1F_C7E0EC_90A5B3_7B8C9B.png"
      // "assets/matcap/167E76_36D6D2_23B2AC_27C1BE.png"
      // "assets/matcap/245642_3D8168_3D6858_417364.png"
      // "assets/matcap/3E2335_D36A1B_8E4A2E_2842A5.png"
      // "assets/matcap/3F3A2F_91D0A5_7D876A_94977B.png"
      "assets/matcap/8A6565_2E214D_D48A5F_ADA59C.png"
      // "assets/matcap/555555_C8C8C8_8B8B8B_A4A4A4.png"
    );

    const geometry = new THREE.PlaneGeometry(1, 1.777);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: {
          type: "f",
          value: 0,
        },
        u_amplitude: {
          type: "f",
          value: 1.0,
        },
        u_frequency: {
          type: "f",
          value: 3.0,
        },
        u_matCapTex: {
          type: "t",
          value: matCapTex,
        },
      },
    });
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
    this.material.uniforms.u_time.value = time / 4.0;
    this.controls.update();
  }

  render(time, deltaTime, state) {
    this._update(time, deltaTime, state);
    // this.renderer.render(this.scene, this.camera);
    this.composer.render(this.scene, this.camera);
  }
}

export default Sketch;
