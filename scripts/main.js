import * as THREE from "https://cdn.skypack.dev/three@0.122.0/build/three.module.js";
import { scene, loadModels } from './scene.js';
import loadAsteroid1 from '../models/Asteroid1/index.js';
import { OrbitControls } from "https://cdn.skypack.dev/three@0.122.0/examples/jsm/controls/OrbitControls.js";
import { FirstPersonControls } from "https://cdn.jsdelivr.net/npm/three@0.122/examples/jsm/controls/FirstPersonControls.js";

var cameraMode = null;
let ship, saturn, station;
let asteroidModel; // Declare asteroidModel globally

// Declare variables for the Bezier curves globally so they can be accessed by createAsteroids
let curve1, curve2, curve3, curve4, curve5, curve6, curve7;

window.addEventListener('DOMContentLoaded', () => {
  var menu = document.getElementById('menu');
  var sceneElement = document.getElementById('scene');
  var behindShip = document.getElementById('behindShip');
  var inShip = document.getElementById('inShip');
  var side = document.getElementById('side');
  var switchView = document.getElementById('switchView');

  // Create Speed Control Buttons
  // These buttons contribute to the iteractive feel of our story
  // By being able to control the ship, the user feels more connected to the story
  var speedUpButton = document.createElement('button');
  speedUpButton.id = 'speedUp';
  speedUpButton.innerHTML = 'Speed Up';
  speedUpButton.className = 'control-button';
  speedUpButton.style.display = 'none';
  document.body.appendChild(speedUpButton);

  var slowDownButton = document.createElement('button');
  slowDownButton.id = 'slowDown';
  slowDownButton.innerHTML = 'Slow Down';
  slowDownButton.className = 'control-button';
  slowDownButton.style.display = 'none';
  document.body.appendChild(slowDownButton);

  var resetSpeedButton = document.createElement('button');
  resetSpeedButton.id = 'resetSpeed';
  resetSpeedButton.innerHTML = 'Reset Speed';
  resetSpeedButton.className = 'control-button';
  resetSpeedButton.style.display = 'none';
  document.body.appendChild(resetSpeedButton);

  side.addEventListener('click', () => {
    cameraMode = 'side';
    startScene();
  });

  inShip.addEventListener('click', () => {
    cameraMode = 'inShip';
    startScene();
  });

  behindShip.addEventListener('click', () => {
    cameraMode = 'behindShip';
    startScene();
  });

  function startScene() {
    menu.style.display = 'none';
    sceneElement.style.display = 'block';
    switchView.style.display = 'block';
    // Show Speed Control Buttons
    speedUpButton.style.display = 'block';
    slowDownButton.style.display = 'block';
    resetSpeedButton.style.display = 'block';

    // Load models and initialize the scene
    Promise.all([loadModels(), loadAsteroid1()]).then(([_, loadedAsteroidModel]) => {
      asteroidModel = loadedAsteroidModel;
      initScene();
    }).catch((error) => {
      console.error('An error occurred while loading models:', error);
    });
  }
  
  // Adding a switch view button allows the user to experience the story from different angles
  switchView.addEventListener('click', () => {
    location.reload(true);
    // Hide Speed Control Buttons
    speedUpButton.style.display = 'none';
    slowDownButton.style.display = 'none';
    resetSpeedButton.style.display = 'none';
  });
});

function initScene() {
  // Create the renderer using ThreeJS library
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Access ship, saturn, and station from the scene
  ship = scene.getObjectByName("ship");
  saturn = scene.getObjectByName("saturn");
  station = scene.getObjectByName("station");

  // Verify that ship, saturn, and station are defined
  if (!ship || !saturn || !station) {
    console.error('Ship, Saturn, or Station model is not loaded properly.');
    return;
  }

  // Compute the bounding box of the station to get its dimensions
  const stationBox = new THREE.Box3().setFromObject(station);
  const stationTopY = stationBox.max.y;

  // Define the circle center and radius
  const circleCenter = new THREE.Vector3(-1000, stationTopY + 50, 0);
  const circleRadius = 50;

  // Calculate the starting point of the circling path
  const startAngle = 0; // Start angle for circling path
  const startX = circleCenter.x + circleRadius * Math.cos(startAngle);
  const startY = circleCenter.y;
  const startZ = circleCenter.z + circleRadius * Math.sin(startAngle);

  const circlingStartPoint = new THREE.Vector3(startX, startY, startZ);

  // ********************Start Bezier Curve**********************************
  // Create cubic Bezier Curves
  curve1 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-8, 0, 0), // starting point
    new THREE.Vector3(-50, 30, 50), // control point
    new THREE.Vector3(-120, -40, -50), // control point
    new THREE.Vector3(-150, 0, 0) // ending point
  );
  curve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-150, 0, 0), // starting point
    new THREE.Vector3(-200, 50, 100), // control point
    new THREE.Vector3(-250, -50, -100), // control point
    new THREE.Vector3(-300, 0, 0) // ending point
  );
  curve3 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-300, 0, 0), // starting point
    new THREE.Vector3(-350, 40, 50), // control point
    new THREE.Vector3(-375, -40, -50), // control point
    new THREE.Vector3(-400, 0, 0) // ending point
  );
  curve4 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-400, 0, 0), // starting point
    new THREE.Vector3(-450, 50, 80), // control point
    new THREE.Vector3(-500, -50, -80), // control point
    new THREE.Vector3(-550, 0, 0) // ending point
  );
  curve5 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-550, 0, 0), // starting point
    new THREE.Vector3(-600, 60, 100), // control point
    new THREE.Vector3(-650, -60, -100), // control point
    new THREE.Vector3(-700, 0, 0) // ending point
  );
  curve6 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-700, 0, 0), // starting point
    new THREE.Vector3(-750, 40, 70), // control point
    new THREE.Vector3(-800, -40, -70), // control point
    new THREE.Vector3(-850, 0, 0) // ending point
  );
  // Adjust curve7 to end at the circling start point
  curve7 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-850, 0, 0), // starting point
    new THREE.Vector3(-900, 40, 50), // control point
    new THREE.Vector3(-950, 40, -50), // control point
    circlingStartPoint // ending point adjusted
  );

  // Get the points from the curves
  const points1 = curve1.getPoints(100);
  const points2 = curve2.getPoints(100);
  const points3 = curve3.getPoints(100);
  const points4 = curve4.getPoints(100);
  const points5 = curve5.getPoints(100);
  const points6 = curve6.getPoints(100);
  const points7 = curve7.getPoints(100);

  // Concatenate the points to create the Bezier path
  const bezierPoints = points1.concat(points2, points3, points4, points5, points6, points7);
  // ********************End Bezier Curve**********************************

  // Now that everything is loaded and the curves are defined, create the asteroids
  createAsteroids(50, asteroidModel);

  // ****************Begin Music************************
  // define these as let to be used inside the scope of the onclick function
  let listener, sound;
  let soundFlip = 0;
  // Here the click event is bound on the whole renderer
  renderer.domElement.addEventListener('click', function() {
    // Check if listener exists
    if (typeof listener === "undefined") {
      // Create an AudioListener and add it to the camera
      listener = new THREE.AudioListener();
      camera.add(listener);
      // Create a global audio source
      sound = new THREE.Audio(listener);
      // Load a sound and set it as the Audio object's buffer
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load('./sounds/chase.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
      });
    } else { // For any subsequent click, play or pause the music
      if (soundFlip === 0) {
        sound.pause();
        soundFlip = 1;
      } else {
        sound.play();
        soundFlip = 0;
      }
    }
  });
  // *******************************End music***************

  let controls;
  let clock; // Only for "side" view
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  // Move camera forward so we can look at the objects
  if (cameraMode === 'behindShip' || cameraMode === 'inShip') {
    controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(17, 14, -1);
    controls.target.copy(ship.position);
    controls.minDistance = 10; // Minimum zoom distance
    controls.maxDistance = 50; // Maximum zoom distance
    controls.enableDamping = true; // Smooth camera movement
    controls.dampingFactor = 0.05;
  }

  if (cameraMode === 'side') {
    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.lookSpeed = 0.1;
    controls.movementSpeed = 10;
    clock = new THREE.Clock(true);
    camera.position.set(-556, -11, 110);
  }

  if (cameraMode === 'inShip') {
    controls.minDistance = 0; // Minimum zoom distance
    controls.maxDistance = 20; // Maximum zoom distance
    ship.visible = false;
  }

  // ********************Start Ship animation following Bezier curve and circling the Station*******
  // Rendering and animating Ship
  let count = 0; // Counter used to control the position of the Ship
  let start;
  let speedMultiplier = 1; // Default speed multiplier

  // Speed Control Buttons Event Listeners
  var speedUpButton = document.getElementById('speedUp');
  var slowDownButton = document.getElementById('slowDown');
  var resetSpeedButton = document.getElementById('resetSpeed');

  speedUpButton.addEventListener('click', () => {
    speedMultiplier = Math.min(2.0, speedMultiplier + 0.1); // Prevent speedMultiplier from going above 2.0
  });

  slowDownButton.addEventListener('click', () => {
    speedMultiplier = Math.max(0.5, speedMultiplier - 0.1); // Prevent speedMultiplier from going below 0.5
  });

  resetSpeedButton.addEventListener('click', () => {
    speedMultiplier = 1;
  });

  // 
  /*
    Create circling path around the station starting from circlingStartPoint
    The spaceship now approaches the station, performs a realistic circling maneuver, and lands smoothly, adding depth to the narrative.
  The smooth rotations and speed adjustments create a more natural and visually pleasing experience.
  */
  const circlePoints = [];
  const numCirclePoints = 200; // Number of points along the circle

  for (let i = 0; i <= numCirclePoints; i++) {
    const angle = startAngle + (i / numCirclePoints) * 2 * Math.PI; // Angle from startAngle to startAngle + 2π
    const x = circleCenter.x + circleRadius * Math.cos(angle);
    const y = circleCenter.y;
    const z = circleCenter.z + circleRadius * Math.sin(angle);
    circlePoints.push(new THREE.Vector3(x, y, z));
  }

  // Create descent path from circling altitude down to the station top
  const descentPoints = [];
  const descentSteps = 100;
  for (let i = 0; i <= descentSteps; i++) {
    const t = i / descentSteps;
    const angle = startAngle + 2 * Math.PI * t * 2; // Continue circling during descent
    const x = circleCenter.x + circleRadius * Math.cos(angle);
    const y = circleCenter.y - t * 50; // Descend from circlingY down to stationTopY
    const z = circleCenter.z + circleRadius * Math.sin(angle);
    descentPoints.push(new THREE.Vector3(x, y, z));
  }

  // Create landing path to the station's top center
  const landingPoints = [];
  const landingSteps = 50;
  for (let i = 0; i <= landingSteps; i++) {
    const t = i / landingSteps;
    const x = circleCenter.x + (1 - t) * circleRadius * Math.cos(0);
    const y = stationTopY; // At stationTopY
    const z = circleCenter.z + (1 - t) * circleRadius * Math.sin(0);
    landingPoints.push(new THREE.Vector3(x, y, z));
  }

  // Concatenate the points to create the full path
  const bezierPointsLength = bezierPoints.length;
  const circlePointsLength = circlePoints.length;
  const descentPointsLength = descentPoints.length;
  const landingPointsLength = landingPoints.length;

  const fullPathPoints = bezierPoints.concat(circlePoints, descentPoints, landingPoints);
  const totalPointsLength = fullPathPoints.length;

  // Function to adjust speed based on the current segment
  function getSpeedMultiplier(count) {
    if (count < bezierPointsLength) {
      return speedMultiplier; // Normal speed during Bezier curves
    } else if (count < bezierPointsLength + circlePointsLength) {
      return speedMultiplier * 0.9; // Slightly slower during circling
    } else if (count < bezierPointsLength + circlePointsLength + descentPointsLength) {
      return speedMultiplier * 0.7; // Slow down more during descent
    } else {
      return speedMultiplier * 0.6; // Slowest during final landing
    }
  }

  // Set the ship's initial position and orientation
  
  //
  ship.position.copy(fullPathPoints[0]);

  if (fullPathPoints.length > 1) {
    const nextPoint = fullPathPoints[1];
    const direction = new THREE.Vector3().subVectors(nextPoint, ship.position).normalize();

    const initialQuaternion = new THREE.Quaternion();
    initialQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction);

    ship.quaternion.copy(initialQuaternion);
    // ship.rotateY(Math.PI); // Adjust if needed
  }

  // Ship animation function
  function step(timestamp) {
    if (start === undefined) {
      start = timestamp;
    }
    const elapsed = timestamp - start;

    // Adjust speedMultiplier based on current segment
    let currentSpeedMultiplier = getSpeedMultiplier(count);

    // Adjust the delay based on currentSpeedMultiplier
    if (elapsed > (50 / currentSpeedMultiplier)) {
      start = timestamp;
      // Update the position of the ship
      ship.position.copy(fullPathPoints[count]);

      
      /*
      The ship now smoothly follows the path while facing forward, enhancing the realism of the animation.
      Provides a more immersive experience for the viewer.
      */
      if (count < fullPathPoints.length - 1) {
        const nextPoint = fullPathPoints[count + 1];
        const currentPoint = fullPathPoints[count];
        const direction = new THREE.Vector3().subVectors(nextPoint, currentPoint).normalize();

        // Calculate the target quaternion
        const targetQuaternion = new THREE.Quaternion();
        targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction); // Use (0, 0, -1)

        // Slerp towards the target quaternion
        ship.quaternion.slerp(targetQuaternion, 0.025); // Adjust the interpolation factor as needed
      }

      // Update the counter
      if (count < fullPathPoints.length - 1) {
        count++;
      }
    }
    if (count < fullPathPoints.length - 1) {
      window.requestAnimationFrame(step);
    }
  }
  window.requestAnimationFrame(step);
  // *****************End Ship animation following Bezier curve and Circling the Station*******

  function render() {
    requestAnimationFrame(render);

    if (cameraMode === 'behindShip' || cameraMode === 'inShip') {
      controls.target.copy(ship.position);
      controls.update();
    } else if (cameraMode === 'side') {
      controls.update(clock.getDelta());
    }

    saturn.rotation.y += 0.02;

    // Asteroid Rotation Using Rotation Matrices
    scene.traverse((object) => {
      if (object.name === "asteroid") {
        // Retrieve rotation speed and angles
        const rotationSpeed = object.userData.rotationSpeed;
        const rotationAngle = object.userData.rotationAngle;

        // Update rotation angles
        rotationAngle.x += rotationSpeed.x;
        rotationAngle.y += rotationSpeed.y;
        rotationAngle.z += rotationSpeed.z;
/*
        Quicker way to do rotation matrices
        // Create rotation matrix
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationFromEuler(new THREE.Euler(rotationAngle.x, rotationAngle.y, rotationAngle.z));
        
        // Below is manual rotation matrix for each axis like we learned in class
*/
        const rotationMatrixX = new THREE.Matrix4();
        rotationMatrixX.set(
            1, 0, 0, 0,
            0, Math.cos(rotationAngle.x), -Math.sin(rotationAngle.x), 0,
            0, Math.sin(rotationAngle.x), Math.cos(rotationAngle.x), 0,
            0, 0, 0, 1
        );

        const rotationMatrixY = new THREE.Matrix4();
        rotationMatrixY.set(
            Math.cos(rotationAngle.y), 0, Math.sin(rotationAngle.y), 0,
            0, 1, 0, 0,
            -Math.sin(rotationAngle.y), 0, Math.cos(rotationAngle.y), 0,
            0, 0, 0, 1
        );

        const rotationMatrixZ = new THREE.Matrix4();
        rotationMatrixZ.set(
            Math.cos(rotationAngle.z), -Math.sin(rotationAngle.z), 0, 0,
            Math.sin(rotationAngle.z), Math.cos(rotationAngle.z), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        // Combine rotation matrices 
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.multiplyMatrices(rotationMatrixY, rotationMatrixX); 
        rotationMatrix.multiply(rotationMatrixZ); 
        
        // Create scale matrix
        const scaleMatrix = new THREE.Matrix4();
        scaleMatrix.makeScale(
              object.userData.initialScale.x,
              object.userData.initialScale.y,
              object.userData.initialScale.z
        );
       
        // Create translation matrix
        const translationMatrix = new THREE.Matrix4();
        translationMatrix.makeTranslation(
          object.userData.initialPosition.x,
          object.userData.initialPosition.y,
          object.userData.initialPosition.z
        );

        // Combine translation, scale, and rotation matrices
        const transformationMatrix = new THREE.Matrix4();
        transformationMatrix.multiplyMatrices(translationMatrix, rotationMatrix);
        transformationMatrix.multiply(scaleMatrix);
        
        // Apply the transformation matrix to the asteroid
        object.matrix.copy(transformationMatrix);
        
      }
    });

    renderer.render(scene, camera);
  }

  render(); // Start the rendering loop

  // Optional: Log camera position for debugging
  function cameraPosition(event) {
    if (event.key === 'p') {
      console.log(camera.position);
    }
  }
  document.addEventListener('keydown', cameraPosition);
}

// ******************* Begin Asteroid Creation *************

// Function to get random offset for asteroid positioning
function getRandomOffset(minDistance, maxDistance) {
  var theta = Math.random() * Math.PI * 2;
  var phi = Math.random() * Math.PI * 2;
  var distance = minDistance + Math.random() * (maxDistance - minDistance);

  return new THREE.Vector3(
    distance * Math.sin(phi) * Math.cos(theta),
    distance * Math.sin(phi) * Math.sin(theta),
    distance * Math.cos(phi)
  );
}

// Asteroid Creation with Rotation Data
function createAsteroids(numAsteroids, asteroidModel) {
  const allCurves = [curve1, curve2, curve3, curve4, curve5, curve6, curve7];

  for (let i = 0; i < numAsteroids; i++) {
    var selectedCurve = allCurves[Math.floor(Math.random() * allCurves.length)];
    var t = Math.random();
    const basePoint = selectedCurve.getPoint(t);
    const offset = getRandomOffset(20, 70);
    const asteroidPosition = basePoint.add(offset);

    var asteroid = asteroidModel.clone();
    asteroid.name = "asteroid"; // Identify as asteroid for rotation

    // Random scale
    const scale =  0.5 + Math.random() * 5; // Adjusted scale to prevent huge asteroids
    asteroid.userData.initialScale = new THREE.Vector3(scale, scale, scale); // Store the scale
    
    // Store initial position
    asteroid.userData.initialPosition = asteroidPosition.clone();

    // Initialize rotation angle
    asteroid.userData.rotationAngle = {
      x: 0,
      y: 0,
      z: 0
    };

    // Assign random rotation speed
    asteroid.userData.rotationSpeed = {
      x: Math.random() * 0.02,
      y: Math.random() * 0.02,
      z: Math.random() * 0.02
    };

    // Disable auto-update of matrices
    asteroid.matrixAutoUpdate = false;

    // Set position (optional, but helps with initial placement)
    asteroid.position.copy(asteroidPosition);

    scene.add(asteroid);
  }
}
//****************** End asteroid creation and rotation **************
