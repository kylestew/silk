import { loadEnvironmentMap, loadLUT } from "./lib/loader";
import HDR_OPTIONS from "./lib/hdrs";

const randomInArray = (items) => {
  return items[Math.floor(Math.random() * items.length)];
};

const state = {
  hdrKey: randomInArray(HDR_OPTIONS.keys),
  envMap: undefined,

  metalness: 0,
  roughness: 0.3,
  transmission: 0.5,
  ior: 1.6,
  reflectivity: 0.6,
  thickness: 1.0,
  envMapIntensity: 2.0,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  normalScale: 0.5,
  clearcoatNormalScale: 0.3,
  normalRepeat: 3,

  enableFXAA: true,
  enableBloom: true,
  bloomThreshold: 0.85,
  bloomStrength: 0.35,
  bloomRadius: 0.05,
  lut: undefined,
};

function loadHDR(key) {
  let url = HDR_OPTIONS.urlForKey(key);
  loadEnvironmentMap(url, (hdr) => {
    state.envMap = hdr;
    state.updateFn();
  });
}

/*
 * Pass an update function to be called when state changes
 */
function createState(updateFn) {
  state.updateFn = updateFn;

  // this is a good place for async loaders
  setTimeout(() => {
    loadHDR(state.hdrKey);

    loadLUT((lut) => {
      state.lut = lut;
      state.updateFn();
    });
  }, 0);

  return state;
}

export { loadHDR };

export default createState;
