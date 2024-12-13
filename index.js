import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

// Scene setup
const scene = new THREE.Scene();
const w = window.innerWidth;
const h = window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// earth group
const earthGroup = new THREE.Group();
earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
scene.add(earthGroup);

// scene.controls()
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// star field
const stars = new getStarfield({ numStars: 2000 });
scene.add(stars);

// loader
const loader = new THREE.TextureLoader();

// earthMesh creation
const geometry = new THREE.IcosahedronGeometry(1, 12);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});

// directional Light
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightMat = new THREE.MeshBasicMaterial({
  map: loader.load("/textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightMesh = new THREE.Mesh(geometry, lightMat);
earthGroup.add(lightMesh);

const cloudMat = new THREE.MeshStandardMaterial({
  map: loader.load("/textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load("/textures/05_earthcloudmaptrans.jpg"),
});
const cloudMesh = new THREE.Mesh(geometry, cloudMat);
cloudMesh.scale.setScalar(1.003);
earthGroup.add(cloudMesh);

const glowMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, glowMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Orbit Controls
  controls.update();

  // Rotation logic
  earthMesh.rotation.y += 0.002;
  lightMesh.rotation.y += 0.002;
  cloudMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.002;

  renderer.render(scene, camera);
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
