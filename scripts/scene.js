import * as THREE from "https://cdn.skypack.dev/three@v0.122.0/build/three.module.js";
import loadShip from '../models/Ship/index.js';
import loadStation from '../models/Station/index.js';
import loadSun from '../models/Sun/index.js';
import loadSaturn from '../models/Saturn/index.js';

const scene = new THREE.Scene();

// Loading models into the scene
async function loadModels() {
  try {
    const [shipModel, station, sun, saturn] = await Promise.all([
      loadShip(),
      loadStation(),
      loadSun(),
      loadSaturn(),
    ]);

    // Apply rotation matrix to ship to make it start in the proper orientation
    const rotating = new THREE.Matrix4();
    rotating.set(
      Math.cos(Math.PI / 2), 0, Math.sin(Math.PI / 2), 0,
      0, 1, 0, 0,
      -Math.sin(Math.PI / 2), 0, Math.cos(Math.PI / 2), 0,
      0, 0, 0, 1
    );
    
    // Applying scaling and setting position of the models in our object
    shipModel.applyMatrix4(rotating);
    shipModel.position.set(-8, 0, 0);
    shipModel.scale.set(1.5, 1.5, 1.5);
    shipModel.name = "ship";
    scene.add(shipModel);

    // Station
    /*
    Enabled the spaceship to interact with the station, specifically to circle around it and land on top.
Enhanced the narrative by incorporating the station as a key destination in the animation.
    */
    station.position.set(-1000, 0, 0);
    station.scale.set(20, 20, 20);
    station.name = "station"; // Add this line to name the station
    scene.add(station);

    // Sun
    sun.position.set(-700, 500, -500);
    sun.scale.set(30, 30, 30);
    scene.add(sun);

    // Saturn
    saturn.position.set(-200, 0, -200);
    saturn.scale.set(100, 100, 100);
    saturn.name = "saturn";
    scene.add(saturn);

    // Lights and background
    // Creating directional light to make sure the scene has a baseline level of light even when
    // the sun is not illuminating a certain part of an object
    const directionalLight = new THREE.DirectionalLight(0xffffff, 20);
    directionalLight.position.copy(sun.position);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight.target);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // Loading this background helps to establish the story's cluttered, tense space environment  
    const loader = new THREE.CubeTextureLoader();
    const skybox = loader.load([
      'Skybox/right.png',
      'Skybox/left.png',
      'Skybox/top.png',
      'Skybox/bottom.png',
      'Skybox/front.png',
      'Skybox/back.png'
    ]);
    scene.background = skybox;
  } catch (error) {
    console.error('An error occurred while loading models:', error);
  }
}

export { scene, loadModels };
