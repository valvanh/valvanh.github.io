import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, clock;
let objects = [];
let hoverObject = null;
let index = 0;

document.addEventListener('readystatechange', function () {
  console.log("Fiered '" + document.readyState + "' after " + performance.now() + " ms");
});

document.addEventListener('DOMContentLoaded', function () {
  console.log("Fiered DOMContentLoaded after " + performance.now() + " ms");

  if (getCookie('theme') == "" || getCookie('theme') == "light") {
    setCookie('theme', 'light', 7);
    document.body.classList.add('light-mode');
    document.body.classList.remove('night-mode');
  } else {
    setCookie('theme', 'night', 7);
    document.body.classList.remove('light-mode');
    document.body.classList.add('night-mode');
  }

  initScene();
  initLights();
  initObjects();
  initEventListeners();
  animate();
}, false);

window.addEventListener('load', function () {
  console.log("Fiered load after " + performance.now() + " ms");

  document.getElementById('switch-light-night').addEventListener('click', switchLightNight);
  document.getElementById('menu__button').addEventListener('click', menuBurger);
}, false);

// ------------

function loadProjectInfos(project) {
  let titleProject = document.getElementById('project-infos__title');
  let descProject = document.getElementById('project-infos__desc');
  let linkProject = document.getElementById('project-infos__link');

  titleProject.innerText = project.name;
  descProject.innerText = project.description;
  linkProject.innerText = project.link;
}

function switchLightNight() {
  if (getCookie('theme') != "" && getCookie('theme') == "light") {
    setCookie('theme', 'night', 7);
    document.body.classList.remove('light-mode');
    document.body.classList.add('night-mode');
  } else {
    setCookie('theme', 'light', 7);
    document.body.classList.add('light-mode');
    document.body.classList.remove('night-mode');
  }
}

function menuBurger() {
  document.getElementById('menu').classList.toggle('open');
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// ---------

// Initialisation de la scène
function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  window.addEventListener('resize', onWindowResize);
}

// Gestion de la lumière
function initLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);
}

// Création et positionnement des objets
function initObjects() {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });

  for (let i = 0; i < 5; i++) {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(i * 2 - 4, 0, i * -0.5); // Position en file
    objects.push(cube);
    scene.add(cube);
  }

  hoverObject = objects[0]; // L'objet en focus au début
}

// Mise à jour lors du redimensionnement de la fenêtre
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation continue (lévitation et rendu)
function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  if (hoverObject) {
    hoverObject.position.y = Math.sin(elapsed) * 0.2; // Effet de lévitation
  }

  renderer.render(scene, camera);
}

// Gestion des événements
function initEventListeners() {
  document.getElementById('navigation-slider__next').addEventListener('click', () => updateSlider(1));
  document.getElementById('navigation-slider__prev').addEventListener('click', () => updateSlider(-1));

  window.addEventListener('mousemove', onMouseMove);
}

// Rotation de l'objet en fonction de la souris
function onMouseMove(event) {
  if (!hoverObject) return;

  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  gsap.to(hoverObject.rotation, {
    x: mouseY * 0.5,
    y: mouseX * 0.5,
    duration: 0.5,
  });
}

// Navigation dans la file d'attente
function updateSlider(direction) {
  // Mise à jour de l'index
  index = (index + direction + objects.length) % objects.length;

  // Animation de la file d'attente
  gsap.to(objects, {
    x: (o, i) => i * 2 - 4 - (index * 2), // Nouvelle position X
    duration: 1,
  });

  // Mise à jour de l'objet en focus
  hoverObject = objects[index];
}