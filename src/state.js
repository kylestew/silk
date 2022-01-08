const state = {
  backgroundColor: "#ff00ff",
  cubeSize: 1.0,
};

/*
 * Pass an update function to be called when state changes
 */
function createState(updateFn) {
  state.updateFn = updateFn;

  // this is a good place for async loaders

  return state;
}

export default createState;
