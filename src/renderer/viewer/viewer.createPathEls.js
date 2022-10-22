import { Scene } from "./viewer.scene.js";

function Flowchart(props) {
  // Set up paths array
  // console.log("Initializing paths...");
  let paths = [];
  for (var i = 0; i < Choicelab.files.length; i++) {
    var file = Choicelab.files[i];
    paths.push({
      path: file,
      scenes: [],
    });
  }

  // iterate, organize scenes by path
  const scenes = [];
  function getPathIndex(name) {
    for (var i = 0; i < paths.length; i++) {
      if (paths[i].path === name) {
        return i;
      }
    }
  }
  // console.log("Loading scenes into path...");
  for (var i = 1; i < Choicelab.scenes.length; i++) {
    var sceneProps = Choicelab.scenes[i];
    // console.log("Loading this scene:", sceneProps);
    var key = `scene-${i}`;
    var fileName = sceneProps.file.name;
    var path = paths[getPathIndex(fileName)];
    // Get previous + next scene props
    let scenePropsPrevious, scenePropsNext, gotoPrevious, gotoNext;
    if (i > 1) {
      scenePropsPrevious = Choicelab.scenes[i - 1];
      gotoPrevious = scenePropsPrevious.goto;
    }
    if (i !== Choicelab.scenes.length - 1) {
      scenePropsNext = Choicelab.scenes[i + 1];
      gotoNext = scenePropsNext.goto;
    }
    path.scenes.push(
      <Scene
        key={key}
        gotoPrevious={gotoPrevious}
        gotoNext={gotoNext}
        goto={sceneProps.goto}
        rules={sceneProps.rules}
        actions={sceneProps.actions}
        comments={sceneProps.comments}
      />
    );
  }

  var pathsEl = [];
  // console.log("Setting up paths...");
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    var key = `path-${path.path}`;
    pathsEl.push(
      <ul className="path" id={key} data-path={path.path} key={key}>
        {path.scenes}
      </ul>
    );
  }
  // console.log("Creating flowchart with paths...");
  const element = (
    <div id="scene-inventory">
      <ul id="paths">{pathsEl}</ul>
    </div>
  );
  return element;
}

export { Flowchart };
