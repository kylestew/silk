import * as dat from "dat.gui";

function createGUI(state) {
  const gui = new dat.GUI();

  var optionsFolder = gui.addFolder("Options");
  // optionsFolder.open();

  optionsFolder
    .addColor(state, "backgroundColor")
    .name("Background")
    .onChange(state.updateFn);

  optionsFolder
    .add(state, "cubeSize", 0.1, 3.0, 0.1)
    .name("Cube Size")
    .onChange(state.updateFn);
}

export default createGUI;
