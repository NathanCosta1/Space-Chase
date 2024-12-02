// GLTFLoader helps us to read and import gltf files
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.122.0/examples/jsm/loaders/GLTFLoader.js";

function loadSun() {
  return new Promise((resolve, reject) => {
    // Instantiate a loader
    const loader = new GLTFLoader();

    // Load a glTF resource
    loader.load(
      // resource URL
      './models/Sun/scene.gltf',
      // called when the resource is loaded
      function (gltf) {
        let obj = gltf.scene;
        // Resolve the Promise with the loaded model
        resolve(obj);
      },
      // called while loading is progressing
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // called when loading has errors
      function (error) {
        console.log('An error happened', error);
        reject(error);
      }
    );
  });
}

// Export the loadSun function
export default loadSun;
