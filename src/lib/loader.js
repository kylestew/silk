import * as THREE from "three";

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { LUTCubeLoader } from "three/examples/jsm/loaders/LUTCubeLoader";

import lutUrl from "/assets/luts/Everyday_Pro_Color.cube?url";

function loadEnvironmentMap(url, callback) {
  new RGBELoader().load(url, (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    callback(envMap);
  });
}

function loadLUT(callback) {
  let url = lutUrl;
  new LUTCubeLoader().load(url, (lut) => {
    callback(lut);
  });
}

export { loadEnvironmentMap, loadLUT };
