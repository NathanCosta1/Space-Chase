//Add threejs library
import * as THREE from "https://cdn.skypack.dev/three@v0.122.0/build/three.module.js";
// GLTFLoader helps us to read and import gltf files
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.122.0/examples/jsm/loaders/GLTFLoader.js";

//-------------- Modified Phong model starts-------------------
// Create the custom material
// The MeshPhongMaterial does not satisfy our need for Modified Phong model
// Hence. we will need to create the custom Fragment Shader and Vertex Shader for the ModifiedPhong model 
function vertexShader() {
  return `
  // ThreeJS pass modelViewMatrix, projectionMatrix, normalMatrix, position, and normal to the vertex shader
  // https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
  // varying are variables that are passed to the fragment shader
  varying vec3 normalInterp; //normal
  varying vec3 vertPos; //vertex positions
  varying vec2 vUv;
  
  // Uniform are variables that are customize and passed from the ThreeJS codes to the shaders
  uniform float Ka;   // Ambient reflection coefficient
  uniform float Kd;   // Diffuse reflection coefficient
  uniform float Ks;   // Specular reflection coefficient
  uniform float shininessVal; // Shininess
  uniform vec3 lightPos; // Light position
  
  // got rid of amibnet, diffuse, specular color bc we don't
  // want to change original color of ship
  
  void main(){
      // will do the lighting computation in view/camera space
    //so need to apply the model-view matrix to both the vertex position and the light position
    //vertex position:
    vec4 vertPos4 = modelViewMatrix * vec4(position, 1.0);
    vertPos = vertPos4.xyz;
    normalInterp = normalMatrix * normal;
    vUv = uv;
    gl_Position = projectionMatrix * vertPos4;
  }
  `;
}

function fragmentShader() {
  return `
  precision mediump float; //highp(high precision); mediump (medium precision) and lowp (low precision)
  
  varying vec3 normalInterp;
  varying vec3 vertPos;
  varying vec2 vUv;
  
  uniform float Ka;
  uniform float Kd;
  uniform float Ks;
  uniform float shininessVal;
  uniform vec3 lightPos;
  uniform sampler2D map;
  
  void main() {
    vec4 textureColor = texture2D(map, vUv);
    vec3 N = normalize(normalInterp);
    vec3 L = normalize(lightPos - vertPos);
    
    float lambertian = max(dot(N, L), 0.0);
    float specular = 0.0;
    
    if(lambertian > 0.0) {
      vec3 V = normalize(-vertPos);
      vec3 H = normalize(L+V);
      float specAngle = max(dot(N, H), 0.0);
      specular = pow(specAngle, shininessVal);
    }
    
    vec3 lighting = textureColor.rgb * (Ka + Kd * lambertian) + vec3(1.0) * Ks * specular;
    gl_FragColor = vec4(lighting, textureColor.a);
  }
  `;
}

// Now that we have the shaders, we create the material that use these shaders
// In the material, we use uniforms to pass parameters to the shaders
let baseMaterial = new THREE.ShaderMaterial({
  // First, we get the vertex shader that we wrote using the function vertexShader()
  vertexShader: vertexShader(),
  // Then the fragment shader using the function fragmentShader()
  fragmentShader: fragmentShader(),
  // uniforms are the variable that we pass to the shaders 
  uniforms: {
    Ka: { value: 0.3 }, // Ambient reflection coefficient
    Kd: { value: 0.7 }, // Diffuse reflection coefficient
    Ks: { value: 1.0 }, // Specular reflection coefficient
    shininessVal: { value: 200.0 },
    lightPos: { value: new THREE.Vector3(0, 10, 0) },
    map: { value: null }
  }
});

function loadShip() {
  return new Promise((resolve, reject) => {
    // Instantiate a loader
    const loader = new GLTFLoader();

    // Load a glTF resource
    loader.load(
      // resource URL
      './models/Ship/scene.gltf',
      // called when the resource is loaded
      function (gltf) {
        let obj = gltf.scene;
        obj.traverse((child) => {
          if (child.isMesh) {
            let meshMaterial = baseMaterial.clone();
            if (child.material.map) {
              meshMaterial.uniforms.map.value = child.material.map;
            }
            child.material = meshMaterial; // Apply the custom material to the mesh
          }
        });

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

// Export the loadShip function
export default loadShip;