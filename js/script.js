import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let currentPage = "home";

let scene, camera, renderer, clock, controls;
let objects = [];
let hoverObject = null;
let index = 0;
let ambientLight;

document.addEventListener('readystatechange', function () {
  console.log("Fiered '" + document.readyState + "' after " + performance.now() + " ms");
});

document.addEventListener('DOMContentLoaded', async function () {
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
  animate();

  let initialProject = await getProject(1);  
  loadProjectInfos(initialProject);
}, false);

window.addEventListener('load', function () {
  console.log("Fiered load after " + performance.now() + " ms");
  
  initEventListeners();
}, false);

// ------------

function loadProjectInfos(project) {
  let titleProject = document.getElementById('project-infos__title');
  let titleProjectView = document.getElementById('project-view__title');
  let descProject = document.getElementById('project-infos__desc');
  let descProjectView = document.getElementById('project-view__subtitle');
  let textProjectView = document.getElementById('project-view__text');
  let dateProjectView = document.getElementById('project-view__date__value');
  let toolsProjectView = document.getElementById('project-view__tools-wrapper');

  let linkProject = document.querySelector('#project-view__link a');

  titleProject.innerText = project.name;
  titleProjectView.innerText = project.name;

  descProject.innerText = project.subtitle;
  descProjectView.innerText = project.subtitle;

  linkProject.setAttribute('href', project.link);

  textProjectView.innerHTML = project.description;

  dateProjectView.innerText = project.date;

  toolsProjectView.innerHTML = '';
  project.tools.forEach(tool => {
    toolsProjectView.innerHTML += `
    <span class="single-tool">
      <img src="/assets/images/tools/${tool.toLowerCase()}.svg" class="single-tool__icon" alt="${tool} Icon" />
      <span class="single-tool__label">${tool}</span>
    </span>
    `;
  });
}

function viewProject(event){
  event.preventDefault();
  currentPage = "project";
  document.body.classList.add('project-view');
}

async function getProject(idProject) {
  try {
    const response = await fetch('/projects.json');

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const results = await response.json();
    
    return results.projects[idProject-1];

  } catch (error) {
    console.error(error.message);
  }
}

function switchLightNight() {
  const theme = getCookie('theme') === 'night' ? 'light' : 'night';
  setCookie('theme', theme, 7);

  // Détermine les nouvelles couleurs et intensités
  const newBackground = theme === 'night' ? '#17212b' : '#efecf6';
  const newIntensity = theme === 'night' ? 0.3 : 0.8;

  // Transition douce avec GSAP
  gsap.to(ambientLight, { intensity: newIntensity, duration: 0.5, ease: 'power2.out' });
  gsap.to(scene.background, {
    r: new THREE.Color(newBackground).r,
    g: new THREE.Color(newBackground).g,
    b: new THREE.Color(newBackground).b,
    duration: 0.5,
    ease: 'power2.out',
    onUpdate: () => {
      // Met à jour la couleur de l'arrière-plan en temps réel
      renderer.render(scene, camera);
    }
  });

  // Transition visuelle pour le corps (CSS)
  if (theme === 'night') {
    document.body.classList.remove('light-mode');
    document.body.classList.add('night-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('night-mode');
  }
}

function menuBurger() {
  document.getElementById('menu').classList.toggle('open');
}

function handleCloseBurger() {
  document.addEventListener('click', (event) => {
    let menuBurger = document.getElementById("menu");
    let menuBurgerBound = menuBurger.getBoundingClientRect();
    if(menuBurger.classList.contains('open')){
      if (!(
        event.clientX >= menuBurgerBound.x &&
        event.clientX <= menuBurgerBound.x + menuBurgerBound.width &&
        event.clientY >= menuBurgerBound.y &&
        event.clientY <= menuBurgerBound.y + menuBurgerBound.height
      )) {
        menuBurger.classList.remove('open');
      }
    }
  });
}

function handleLinks() {
  let links = document.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      switch (href) {
        case "/":
          currentPage = "home";
          document.body.classList.remove('project-view', 'about-view');
          break;
          
        case "/about":
          currentPage = "about";
          document.body.classList.add('about-view');
          document.body.classList.remove('project-view');
          break;
            
        default:
          if (href.startsWith("mailto:") || href.startsWith("tel:")) {
            window.location.href = href;
          } else if (href.startsWith("http://") || href.startsWith("https://")) {
            window.open(href, '_blank');
          }
          break;
      }
    });
  });
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

  // Configuration de la caméra
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 10);

  // Rendu
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Douceur des mouvements
  controls.dampingFactor = 0.05;

  // Couleur initiale de l'arrière-plan
  scene.background = new THREE.Color(getCookie('theme') === 'night' ? '#17212b' : '#efecf6');

  clock = new THREE.Clock();
  window.addEventListener('resize', onWindowResize);
}

// Gestion de la lumière
function initLights() {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);
}

// Création et positionnement des objets
function initObjects() {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });

  for (let i = 0; i < 6; i++) {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(i * 2 - 4, 0, i * -0.5); // Position en file
    objects.push(cube);
    scene.add(cube);
  }

  hoverObject = objects[0]; // L'objet en focus au début
  animateBounce(hoverObject);
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

  // Mise à jour d'OrbitControls
  controls.update();

  const elapsed = clock.getElapsedTime();
  if (hoverObject) {
    hoverObject.position.y += Math.sin(elapsed) * 0.001; // Effet de lévitation
  }

  renderer.render(scene, camera);
}

// Gestion des événements
function initEventListeners() {
  document.getElementById('navigation-slider__next').addEventListener('click', () => updateSlider(1));
  document.getElementById('navigation-slider__prev').addEventListener('click', () => updateSlider(-1));
  document.getElementById('switch-light-night').addEventListener('click', switchLightNight);
  document.getElementById('menu__button').addEventListener('click', menuBurger);
  document.getElementById('project-infos__link').addEventListener('click', viewProject);

  window.addEventListener('mousemove', onMouseMove);

  handleLinks();
  handleCloseBurger();
}

// Rotation de l'objet en fonction de la souris
function onMouseMove(event) {
  if (!hoverObject) return;

  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = (event.clientY / window.innerHeight) * 2 - 1;

  gsap.to(hoverObject.rotation, {
    x: mouseY * 0.5,
    y: mouseX * 0.5,
    duration: 0.5,
  });
}

// Navigation dans la file d'attente
async function updateSlider(direction) {
  const previousObject = hoverObject;

  // Mise à jour de l'index et de l'objet actuel
  index = (index + direction + objects.length) % objects.length;
  hoverObject = objects[index];

  // Réinitialisation de l'objet précédent
  resetObject(previousObject);

  // Appliquer l'animation de bond à l'objet en focus
  animateBounce(hoverObject);

  let project = await getProject(index+1);  
  loadProjectInfos(project);
  document.getElementById('project-infos__link').setAttribute('href', `#project-${index+1}`);

}

// Réinitialise un objet de manière fluide
function resetObject(object) {
  if (!object) return;

  gsap.to(object.position, { y: 0, duration: 0.5, ease: 'power2.out' }); // Réinitialise la hauteur
  gsap.to(object.rotation, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'power2.out' }); // Réinitialise les rotations
}

// Applique un effet de bond fluide à un objet
function animateBounce(object) {
  if (!object) return;

  // object.position.y = -0.5; // Part d'une position basse
  gsap.to(object.position, { y: 0.5, duration: 0.5, ease: 'power2.out' }); // Remonte avec un effet de bond
}