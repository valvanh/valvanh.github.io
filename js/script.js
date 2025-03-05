import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let currentPage = "home";

let scene, camera, renderer, clock;
let ambientLight;
let backgroundShader, backgroundSphere, particles, particlesMaterial;
let objects = [];
let hoverObject = null;
let objectAbout = null;
let index = 0;
let gapBetweenModels = 2;
let loading = false;
let isMobile;

document.addEventListener('readystatechange', function () {
  console.log("Fiered '" + document.readyState + "' after " + performance.now() + " ms");
});

document.addEventListener('DOMContentLoaded', async function () {
  console.log("Fiered DOMContentLoaded after " + performance.now() + " ms");

  isMobile = window.matchMedia("(max-width: 768px)").matches ? true : false;

  loadingScreen();
  handleModalBuild();

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
  initBackground();
  initObjects();
  setTimeout(() => {
    animate();
  }, 300);

  let initialProject = await getProject(1);  
  loadProjectInfos(initialProject);
}, false);

window.addEventListener('load', function () {
  console.log("Fiered load after " + performance.now() + " ms");
  loading = true;
  initEventListeners();
}, false);

// ------------

function loadingScreen() {
  let progressSpin = 6;
  let loopAnimSpin = setInterval(() => {
    if (!loading) {
      progressSpin = progressSpin + (Math.random(100) / 10);
      progressSpin = progressSpin > 90 && 90;
    } else {
      progressSpin = 94;
      setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = 0;
      }, 1200);
      setTimeout(() => {
        document.getElementById('loading-screen').remove();
      }, 2000);
      clearInterval(loopAnimSpin);
    }
    document.getElementById('loading-screen__spin').setAttribute('style', `--progressLoadingSpin: ${progressSpin}%;`);
  }, 800);
}
function handleModalBuild() {
  let modalBuild = document.getElementById('modal-build');
  let buttonCloseModal = document.getElementById('close-modal');

  modalBuild.showModal();

  buttonCloseModal.addEventListener('click', () => {
    if(modalBuild.open){
      modalBuild.classList.add('close');
      modalBuild.style.opacity = 0;
      setTimeout(() => {
        modalBuild.close();
        modalBuild.remove();
      }, 500);
    }
  });
}

function loadProjectInfos(project) {
  let titleProject = document.getElementById('project-infos__title');
  let titleProjectView = document.getElementById('project-view__title');
  let descProject = document.getElementById('project-infos__desc');
  let descProjectView = document.getElementById('project-view__subtitle');
  let textProjectView = document.getElementById('project-view__text');
  let dateProjectView = document.getElementById('project-view__date__value');
  let toolsProjectView = document.getElementById('project-view__tools-wrapper');
  let galleryProjectView = document.getElementById('project-view__gallery');

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
  
  galleryProjectView.innerHTML = '';
  project.galleryImage.forEach((image, index) => {
    galleryProjectView.innerHTML += `
    <div class="single-image">
      <img src="${image}" class="single-image__img" alt="Gallery ${project.name} - Image ${index+1}" />
    </div>
    `;
  });
  galleryProjectView.querySelectorAll('.single-image > img').forEach(img => {
    img.addEventListener('click', () => {
      openProjectImage(img);
    });
  })
}

function viewProject(event){
  event.preventDefault();
  currentPage = "project";
  document.body.classList.add('project-view');
  
  if (isMobile) {
    gsap.to(camera.position, {
      x: -4.25,
      y: 0.9,
      z: 4,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(camera.rotation, {
      x: -20 * (Math.PI / 180),
      y: -45 * (Math.PI / 180),
      z: -14 * (Math.PI / 180),
      duration: 0.5,
      ease: 'power2.out',
    });
  } else {
    gsap.to(camera.position, {
      x: -2.5,
      y: 0.5,
      z: 3.75,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(camera.rotation, {
      x: 0 * (Math.PI / 180),
      y: -45 * (Math.PI / 180),
      z: 0 * (Math.PI / 180),
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  objects.forEach((obj) => {
    if (obj !== hoverObject) {
      gsap.to(obj.position, {
        y: -1, // Descendre
        duration: 0.5,
        ease: 'power2.out',
      });
      obj.traverse((child) => {
        if (child.isMesh && child.material){
          gsap.to(child.material, {
            opacity: 0, // Rendre invisible
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
              obj.visible = false; // Désactiver la visibilité après l'animation
            },
          });
        }
      });
    } else {
      obj.visible = true;
      obj.traverse((child) => {
        if (child.isMesh && child.material){
          child.material.opacity = 1;
        }
      });
    }
  });
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
  let newColor1, newColor2
  const theme = getCookie('theme') === 'night' ? 'light' : 'night';
  setCookie('theme', theme, 7);

  const nightMode = theme === 'night';

  if (nightMode) {
    newColor1 = new THREE.Color('#06080b');
    newColor2 = new THREE.Color('#17202a');
  } else {
    newColor1 = new THREE.Color('#afadb5');
    newColor2 = new THREE.Color('#efedf7');
  }
  const newParticleColor = nightMode ? 0xaaaaaa : 0xffffff;

  gsap.to(ambientLight, { intensity: nightMode ? 0.3 : 0.8, duration: 0.5, ease: 'power2.out' });
  gsap.to(backgroundShader.uniforms.uColor1.value, { 
      r: newColor1.r, g: newColor1.g, b: newColor1.b, duration: 0.5, ease: 'power2.out' 
  });
  gsap.to(backgroundShader.uniforms.uColor2.value, { 
      r: newColor2.r, g: newColor2.g, b: newColor2.b, duration: 0.5, ease: 'power2.out' 
  });
  gsap.to(particlesMaterial.color, { 
      r: new THREE.Color(newParticleColor).r,
      g: new THREE.Color(newParticleColor).g,
      b: new THREE.Color(newParticleColor).b,
      duration: 0.5,
      ease: 'power2.out'
  });

  // Transition visuelle pour le corps (CSS)
  if (nightMode) {
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
          
          // Gestion de la caméra
          if (isMobile) {
            gsap.to(camera.position, {
              x: -3.75,
              y: 1.1,
              z: 3.5,
              duration: 0.5,
              ease: 'power2.out',
            });
            gsap.to(camera.rotation, {
              x: -20 * (Math.PI / 180),
              y: -45 * (Math.PI / 180),
              z: -14 * (Math.PI / 180),
              duration: 0.5,
              ease: 'power2.out',
            });
          } else {
            gsap.to(camera.position, {
              x: -3.75,
              y: 0.5,
              z: 2.5,
              duration: 0.5,
              ease: 'power2.out',
            });
            gsap.to(camera.rotation, {
              x: 0 * (Math.PI / 180),
              y: -45 * (Math.PI / 180),
              z: 0 * (Math.PI / 180),
              duration: 0.5,
              ease: 'power2.out',
            });
          }

          objects.forEach((obj) => {
            obj.visible = true;
            if (obj !== hoverObject) {
              gsap.to(obj.position, {
                y: 0, // Monter
                duration: 0.5,
                ease: 'power2.out',
              });
              obj.traverse((child) => {
                if (child.isMesh && child.material){
                  gsap.to(child.material, {
                    opacity: 1, // Rendre visible
                    duration: 0.5,
                    ease: 'power2.out'
                  });
                }
              });
            } else {
              obj.traverse((child) => {
                if (child.isMesh && child.material){
                  gsap.to(child.material, {
                    opacity: 1, // Rendre visible
                    duration: 0.5,
                    ease: 'power2.out'
                  });
                }
              });
            }
          });

          gsap.to(objectAbout.material, {
            opacity: 0, // Rendre invisible
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
              objectAbout.visible = false; // Désactiver la visibilité après l'animation
            },
          });
          break;
          
        case "/about":
          currentPage = "about";
          document.body.classList.add('about-view');
          document.body.classList.remove('project-view');
          
          if (isMobile) {
            gsap.to(camera.position, {
              x: -4.25,
              y: 0.9,
              z: 4,
              duration: 0.5,
              ease: 'power2.out',
            });
            gsap.to(camera.rotation, {
              x: -20 * (Math.PI / 180),
              y: -45 * (Math.PI / 180),
              z: -14 * (Math.PI / 180),
              duration: 0.5,
              ease: 'power2.out',
            });
          } else {
            gsap.to(camera.position, {
              x: -2.5,
              y: 0.5,
              z: 3.75,
              duration: 0.5,
              ease: 'power2.out',
            });
            gsap.to(camera.rotation, {
              x: 0 * (Math.PI / 180),
              y: -45 * (Math.PI / 180),
              z: 0 * (Math.PI / 180),
              duration: 0.5,
              ease: 'power2.out',
            });
          }

          objects.forEach((obj) => {
            obj.traverse((child) => {
              if (child.isMesh && child.material){
                gsap.to(child.material, {
                  opacity: 0, // Rendre invisible
                  duration: 0.5,
                  ease: 'power2.out',
                  onComplete: () => {
                    obj.visible = false; // Désactiver la visibilité après l'animation
                  },
                });
              }
            });
          });

          objectAbout.visible = true;
          gsap.to(objectAbout.material, {
            opacity: 1, // Rendre visible
            duration: 0.5,
            ease: 'power2.out',
          });
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

function openProjectImage(image) {
  const lightbox = document.querySelector('#lightbox-project-img');
  const lightboxImg = document.querySelector('#lightbox-project-img > img');
  lightboxImg.src = image.src;
  lightbox.classList.add('show');
}
function closeProjectImage() {
  document.querySelector('#lightbox-project-img').classList.remove('show');
}

// ---------

// Initialisation de la scène
function initScene() {
  scene = new THREE.Scene();

  // Configuration de la caméra
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  if (isMobile) {
    camera.position.set(-3.75, 1.1, 3.5);
    camera.rotation.x -= 20 * (Math.PI / 180);
    camera.rotation.y -= 45 * (Math.PI / 180);
    camera.rotation.z -= 14 * (Math.PI / 180);
  } else {
    camera.position.set(-3.75, 0.5, 2.5);
    camera.rotation.y -= 45 * (Math.PI / 180);
  }

  // Rendu
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  window.addEventListener('resize', onWindowResize);
}

// Gestion de la lumière
function initLights() {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);
}

// Gestion du background (dégradé + particules)
function initBackground() {
  let gradientColor1, gradientColor2;
  if (getCookie('theme') === 'night') {
    gradientColor1 = new THREE.Color('#06080b');
    gradientColor2 = new THREE.Color('#17202a');
  } else {
    gradientColor1 = new THREE.Color('#afadb5');
    gradientColor2 = new THREE.Color('#efedf7');
  }

  // --- Dégradé animé avec Shader ---
  backgroundShader = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
        uTime: { value: 0 },
        uColor1: { value: gradientColor1 },
        uColor2: { value: gradientColor2 } 
    },
    vertexShader: `
      varying vec3 vPosition;
      void main() {
          vPosition = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec3 vPosition;
      void main() {
          float mixValue = (vPosition.y + 1.0) / 2.0;
          vec3 color = mix(uColor1, uColor2, mixValue);
          gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  backgroundSphere = new THREE.Mesh(new THREE.SphereGeometry(15, 32, 32), backgroundShader);
  scene.add(backgroundSphere);

  // --- Particules animées ---
  const particleCount = 100;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;

      speeds[i] = Math.random() * 0.002 + 0.001;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesMaterial = new THREE.PointsMaterial({ color: getCookie('theme') === 'night' ? 0xaaaaaa : 0xffffff, size: 0.02 });
  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
}

// Création et positionnement des objets
async function initObjects() {
  let allProjects;
  try {
    const response = await fetch('/projects.json');

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const results = await response.json();
    allProjects = results.projects;
    
  } catch (error) {
    console.error(error.message);
    return;
  }

  const loader = new GLTFLoader();
  
  const promises = allProjects.map((project, index) => {
    return new Promise((resolve, reject) => {
      loader.load(project.viewModel, (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if(child.isMesh) {
            if (child.material) {
              child.material.transparent = true;
              child.material.opacity = 1;
            }
          }
        });

        model.position.set(index * gapBetweenModels, 0, 0);
        resolve(model);
      }, undefined, reject);
    });
  });

  try {
    const loadedModels = await Promise.all(promises);

    loadedModels.forEach(model => {
      objects.push(model);
      scene.add(model);
    });
  } catch (error) {
    console.error('Erreur de chargement:', error);
  }

  const geometryAbout = new THREE.BoxGeometry();
  const materialAbout = new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0 });
  objectAbout = new THREE.Mesh(geometryAbout, materialAbout);
  objectAbout.position.set(0, 0, 0); // Position en file
  objectAbout.visible = false;
  scene.add(objectAbout);

  setTimeout(() => {
    hoverObject = objects[0]; // L'objet en focus au début
    animateBounce(hoverObject);
  }, 500);
}

// Mise à jour lors du redimensionnement de la fenêtre
function onWindowResize() {
  isMobile = window.matchMedia("(max-width: 768px)").matches ? true : false;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  if (isMobile) {
    if (currentPage === "home") {
      gsap.to(camera.position, {
        x: -3.75,
        y: 1.1,
        z: 3.5,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(camera.rotation, {
        x: -20 * (Math.PI / 180),
        y: -45 * (Math.PI / 180),
        z: -14 * (Math.PI / 180),
        duration: 0.5,
        ease: 'power2.out',
      });
    } else if (['about', 'project'].includes(currentPage)) {
      gsap.to(camera.position, {
        x: -4.25,
        y: 0.9,
        z: 4,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(camera.rotation, {
        x: -20 * (Math.PI / 180),
        y: -45 * (Math.PI / 180),
        z: -14 * (Math.PI / 180),
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  } else {
    if (currentPage === "home"){
      gsap.to(camera.position, {
        x: -3.75,
        y: 0.5,
        z: 2.5,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(camera.rotation, {
        x: 0 * (Math.PI / 180),
        y: -45 * (Math.PI / 180),
        z: 0 * (Math.PI / 180),
        duration: 0.5,
        ease: 'power2.out',
      });
    }else if(['about', 'project'].includes(currentPage)){
      gsap.to(camera.position, {
        x: -2.5,
        y: 0.5,
        z: 3.75,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(camera.rotation, {
        x: 0 * (Math.PI / 180),
        y: -45 * (Math.PI / 180),
        z: 0 * (Math.PI / 180),
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation continue (lévitation et rendu)
function animate() {
  requestAnimationFrame(animate);

  backgroundShader.uniforms.uTime.value += 0.01; // Animation du shader

  // Animation des particules
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += 0.002; // Monter en Y
      if (positions[i * 3 + 1] > 3) {
          positions[i * 3 + 1] = -3; // Revenir en bas
      }
  }
  particles.geometry.attributes.position.needsUpdate = true;

  const elapsed = clock.getElapsedTime();
  if (hoverObject) {
    hoverObject.position.y += Math.sin(elapsed) * 0.001; // Effet de lévitation
  }
  objectAbout.position.y += Math.sin(elapsed) * 0.001; // Effet de lévitation

  renderer.render(scene, camera);
}

// Gestion des événements
function initEventListeners() {
  document.getElementById('navigation-slider__next').addEventListener('click', () => updateSlider(1));
  document.getElementById('navigation-slider__prev').addEventListener('click', () => updateSlider(-1));
  document.getElementById('switch-light-night').addEventListener('click', switchLightNight);
  document.getElementById('menu__button').addEventListener('click', menuBurger);
  document.getElementById('project-infos__link').addEventListener('click', viewProject);
  document.getElementById('lightbox-project-img').addEventListener('click', closeProjectImage);

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

  gsap.to(objectAbout.rotation, {
    x: mouseY * 0.5,
    y: mouseX * 0.5,
    duration: 0.5,
  });
}

// Navigation dans la file d'attente
async function updateSlider(direction) {
  const previousObject = hoverObject;

  // Slide objects
  for (let i = 0; i < objects.length; i++) {
    if (direction === 1) {
      if (hoverObject === objects[i]) {
        gsap.to(objects[i].position, {
          x: (objects.length - 1) * gapBetweenModels,
          duration: 0.5,
          ease: 'power2.out'
        });
      } else {
        gsap.to(objects[i].position, {
          x: objects[i].position.x - gapBetweenModels,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    } else if (direction === -1) {
      if (i === (index - 1 + objects.length) % objects.length) {
        gsap.to(objects[i].position, {
          x: 0, // Déplace le dernier objet en premier
          duration: 0.5,
          ease: 'power2.out'
        });
      } else {
        gsap.to(objects[i].position, {
          x: objects[i].position.x + gapBetweenModels, // Décale les autres objets vers la droite
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    }
  }

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
  gsap.to(objectAbout.position, { y: 0.5, duration: 0.5, ease: 'power2.out' }); // Remonte avec un effet de bond
}