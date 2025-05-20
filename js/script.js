let loading = false;
let isMobile;
let currentPage;
let projects;
let flushTabProject = true;

document.addEventListener("readystatechange", function () {
  console.log("Fiered '" + document.readyState + "' after " + performance.now() + " ms");
});

document.addEventListener("DOMContentLoaded", async function () {
    console.log("Fiered DOMContentLoaded after " + performance.now() + " ms");

    isMobile = window.matchMedia("(max-width: 768px)").matches ? true : false;

    try {
      const response = await fetch("/projects.json");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const results = await response.json();
      projects = results.projects;
      loadAllProjects();
      
    } catch (error) {
      console.error(error.message);
      setTimeout(() => {
        location.reload(true);
      }, 1000);
    }

    loadingScreen();
    
}, false);

window.addEventListener("load", function () {
    console.log("Fiered load after " + performance.now() + " ms");
    loading = true;
    initEventListeners();
}, false );

function handleLinks() {
  let links = document.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const href = link.getAttribute("href");
      switch (href) {
        case "/":
          currentPage = "home";
          document.getElementById("tab__intro").classList.add("active");
          document.getElementById("tab__about").classList.remove("active");
          document.getElementById("tab__projects").classList.remove("active");
          document.getElementById("for__tab__intro").classList.add("active");
          document.getElementById("for__tab__about").classList.remove("active");
          document.getElementById("for__tab__projects").classList.remove("active");
          break;

        case "/about":
          currentPage = "about";
          document.getElementById("tab__intro").classList.remove("active");
          document.getElementById("tab__about").classList.add("active");
          document.getElementById("tab__projects").classList.remove("active");
          document.getElementById("for__tab__intro").classList.remove("active");
          document.getElementById("for__tab__about").classList.add("active");
          document.getElementById("for__tab__projects").classList.remove("active");
          break;

        case "/projects":
          currentPage = "projects";
          document.getElementById("tab__intro").classList.remove("active");
          document.getElementById("tab__about").classList.remove("active");
          document.getElementById("tab__projects").classList.add("active");
          document.getElementById("for__tab__intro").classList.remove("active");
          document.getElementById("for__tab__about").classList.remove("active");
          document.getElementById("for__tab__projects").classList.add("active");
          break;

        case "/bio":
          currentPage = "projects";
          document.querySelectorAll("a[href='/bio']").forEach((el) => {
            el.classList.add("active");
          });
          document.querySelectorAll("a[href='/interests']").forEach((el) => {
            el.classList.remove("active");
          });
          document.querySelectorAll("a[href='/schools']").forEach((el) => {
            el.classList.remove("active");
          });
          document.querySelectorAll("a[href='/experiences']").forEach((el) => {
            el.classList.remove("active");
          });
          document.getElementById("fold-pro").classList.remove("active");

          document.getElementById("view__bio").classList.add("active");
          document.getElementById("view__interests").classList.remove("active");
          document.getElementById("view__schools").classList.remove("active");
          document.getElementById("view__experiences").classList.remove("active");
          break;

        case "/interests":
          currentPage = "projects";
          document.querySelectorAll("a[href='/bio']").forEach((el) => {
            el.classList.remove("active");
          });
          document.querySelectorAll("a[href='/interests']").forEach((el) => {
            el.classList.add("active");
          });
          document.querySelectorAll("a[href='/schools']").forEach((el) => {
            el.classList.remove("active");
          });
          document.querySelectorAll("a[href='/experiences']").forEach((el) => {
            el.classList.remove("active");
          });
          document.getElementById("fold-pro").classList.remove("active");

          document.getElementById("view__bio").classList.remove("active");
          document.getElementById("view__interests").classList.add("active");
          document.getElementById("view__schools").classList.remove("active");
          document.getElementById("view__experiences").classList.remove("active");
          break;

        case "/schools":
          currentPage = "projects";
          document.querySelectorAll("a[href='/bio']").forEach((el) => {
            el.classList.remove("active");
          });
          document.querySelectorAll("a[href='/interests']").forEach((el) => {
            el.classList.remove("active");
          });
          document.querySelectorAll("a[href='/schools']").forEach((el) => {
            el.classList.add("active");
          });
          document.querySelectorAll("a[href='/experiences']").forEach((el) => {
            el.classList.remove("active");
          });
          document.getElementById("fold-pro").classList.add("active");

          document.getElementById("view__bio").classList.remove("active");
          document.getElementById("view__interests").classList.remove("active");
          document.getElementById("view__schools").classList.add("active");
          document.getElementById("view__experiences").classList.remove("active");
          break;

        case "/experiences":
          currentPage = "projects";
          document.querySelectorAll("a[href='/bio']").forEach((el) => {
            el.classList.remove("active");
          });
          document.querySelectorAll("a[href='/interests']").forEach((el) => {
            el.classList.remove("active");
          });
          document.querySelectorAll("a[href='/schools']").forEach((el) => {
            el.classList.remove("active");
          });
          document.querySelectorAll("a[href='/experiences']").forEach((el) => {
            el.classList.add("active");
          });
          document.getElementById("fold-pro").classList.add("active");

          document.getElementById("view__bio").classList.remove("active");
          document.getElementById("view__interests").classList.remove("active");
          document.getElementById("view__schools").classList.remove("active");
          document.getElementById("view__experiences").classList.add("active");
          break;

        default:
          if (href != null && href != undefined){
            if (href.startsWith("mailto:") || href.startsWith("tel:")) {
              window.location.href = href;
            } else {
              window.open(href, "_blank");
            }
          }
          break;
      }
    });
  });
}

function loadingScreen() {
  let loadingScreen = document.getElementById("loading-screen");

  let loopLoading = setInterval(() => {
    if (!loading) {
    } else {
      setTimeout(() => {
        loadingScreen.style.opacity = 0;
      }, 500);
      setTimeout(() => {
        loadingScreen.remove();
      }, 1000);
      clearInterval(loopLoading);
    }
  });
}

function onWindowResize() {
  isMobile = window.matchMedia("(max-width: 768px)").matches ? true : false;
}

function initEventListeners() {
  handleLinks();

  document.getElementById('button-command-line').addEventListener('click', () => {
    document.getElementById('window-command-line').showModal();
  });
  document.getElementById('close-window-command-line').addEventListener('click', () => {
    document.getElementById('window-command-line').close();
  });
  document.getElementById('window-command-line').addEventListener('click', () => {
    document.getElementById('input-command-line').focus();
  });
  document.getElementById('input-command-line').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleCommandLineInput(event.target.value)
      event.target.value = '';
      document.getElementById('input-command-line').focus();
      document.getElementById('window-command-line').scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  });
  // document.getElementById('button-view-about').addEventListener('click', () => {});
  document.getElementById('button-play-game').addEventListener('click', () => {
    alert(`Vous pensez à l'avenir vous ;) Restez attentif à la suite`);
  });

  document.querySelectorAll("button.single-project__link").forEach((link) => {
    link.addEventListener("click", () => {
      displayProject(link.dataset.idProject);
    });
  });

  
  document.getElementById('button-view-projects').addEventListener('click', () => {
    document.querySelectorAll(`#tab__projects .navigation-side nav ul li ul li span`).forEach((tab) => {
      tab.classList.remove("active");
    });
    document.querySelector("#tab__projects .content .view__details").classList.remove("active");
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('.tab-links button.close-project');
    
    if (target) {
      flushTabProject = false;
      let idProject = target.parentElement.querySelector('span').dataset.idProject;
      
      if (target.parentElement.classList.contains('active') && document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`).length > 0) {
        flushTabProject = true;
        if (document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`)[0].classList.contains('active')) {
          if (document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`).length == 1) {
            document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`)[0].remove();
            document.querySelectorAll(`#tab__projects .navigation-side nav ul li ul li span`).forEach((tab) => {
              tab.classList.remove("active");
            });
            document.querySelector("#tab__projects .content .view__listing").classList.add("active");
            document.querySelector("#tab__projects .content .view__details").classList.remove("active");
          } else {
            document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`)[1].click();
          }
        } else {
          document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`)[0].click();
        }
      }

      if (document.querySelector(`#tab__projects .content .view__details .tab-links ul li:has(span[data-id-project="${idProject}"])`)) {
        document.querySelector(`#tab__projects .content .view__details .tab-links ul li:has(span[data-id-project="${idProject}"])`).remove();
      }

      if (document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`).length == 0) {
        document.querySelector("#tab__projects .content .view__details").classList.remove("active");
      }
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('.tab-links li');

    if (target) {
      let idProject = target.querySelector('span').dataset.idProject;
      
      if (flushTabProject) {
        document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`).forEach((tab) => {
          tab.classList.remove("active");
        });
        document.querySelectorAll(`#tab__projects .navigation-side nav ul li ul li span`).forEach((tab) => {
          tab.classList.remove("active");
        });
        document.querySelector(`#tab__projects .content .view__details .tab-links ul li:has(span[data-id-project="${idProject}"])`).classList.add("active");
        document.querySelector(`#tab__projects .navigation-side nav ul li ul li span:has(button[data-id-project="${idProject}"])`).classList.add("active");
        
        loadProjectInfos(idProject);
      }
      flushTabProject = true;
    }
  });
}

function loadAllProjects() {
  const containerListProjects = document.getElementById('container-list-all-projects');
  const containerGridProjects = document.getElementById('container-grid-all-projects');

  if (projects && projects.length > 0) {
    projects.forEach((project, index) => {
      let colorFold = index % 4 == 0 ? '-green' : index % 4 == 1 ? '-blue' : index % 4 == 2 ? '' : index % 4 == 3 ? '-red' : '';
      containerListProjects.innerHTML += `
        <li>
          <span class="icon-fold icon-fold${colorFold}">
            <button data-id-project="${index}" class="single-project__link">_${project.name.toLowerCase().replace(" ", "_")}</button>
          </span>
        </li>
      `;
      containerGridProjects.innerHTML += `
        <div class="single-project">
          <div class="single-project__head">
            <span class="number-project">Projet ${index+1}</span>
            //
            <span class="name-project">_${project.name.toLowerCase().replace(" ", "-")}</span>
          </div>
          <div class="single-project__poster">
            <img src="${project.banner}" alt="Bannière du projet ${project.name}" />
          </div>
          <div class="single-project__description">
            ${project.subtitle}
            <button data-id-project="${index}" class="single-project__link">Voir le projet</button>
          </div>
        </div>
      `;
    });
  }
}

function displayProject(idProject = -1) {
  if (idProject == -1 || projects[idProject] == null) {
    alert("Projet introuvable");
  } else {
    document.querySelector("#tab__projects .content .view__details").classList.add("active");
    
    if (document.querySelector(`#tab__projects .content .view__details .tab-links ul:has(li span[data-id-project="${idProject}"])`)) {
      // console.log("Project déjà présent");

      document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`).forEach((tab) => {
        tab.classList.remove("active");
      });
      document.querySelectorAll(`#tab__projects .navigation-side nav ul li ul li span`).forEach((tab) => {
        tab.classList.remove("active");
      });
      document.querySelector(`#tab__projects .content .view__details .tab-links ul li:has(span[data-id-project="${idProject}"])`).classList.add("active");
      document.querySelector(`#tab__projects .navigation-side nav ul li ul li span:has(button[data-id-project="${idProject}"])`).classList.add("active");
    } else {
      // console.log("Project pas encore présent");

      document.querySelectorAll(`#tab__projects .content .view__details .tab-links ul li`).forEach((tab) => {
        tab.classList.remove("active");
      });
      document.querySelectorAll(`#tab__projects .navigation-side nav ul li ul li span`).forEach((tab) => {
        tab.classList.remove("active");
      });
      document.querySelector("#tab__projects .content .view__details .tab-links ul").innerHTML += `
        <li class="active">
          <button class="close-project">&times;</button>
          <span data-id-project="${idProject}">_${projects[idProject].name.toLowerCase().replace(" ", "-")}</span>
        </li>
      `;
      document.querySelector(`#tab__projects .content .view__details .tab-links ul li:has(span[data-id-project="${idProject}"])`).classList.add("active");
      document.querySelector(`#tab__projects .navigation-side nav ul li ul li span:has(button[data-id-project="${idProject}"])`).classList.add("active");
    }
    loadProjectInfos(idProject);
  }
}

function loadProjectInfos(id) {
  let projet = projects[id];

  document.querySelector('#tab__projects .view__details .project-content .project-content__details .content-text').innerHTML = `
    <p>&nbsp;</p>
    <p><span class="green">Projet n°${parseInt(id)+1} // _${projet.name.toLowerCase().replace(' ', '-')}</span></p>
    <p>${projet.description.replace('\n', '</p><p>').replace('\r', '</p><p>&nbsp;</p><p>')}</p>
    <p>&nbsp;</p>
    <p><span class="orange">[Outils/languages utilisés]</span></p>
  `;
  projet.tools.forEach((tool) => {
    document.querySelector('#tab__projects .view__details .project-content .project-content__details .content-text').innerHTML += `
      <p><span class="single-tool"><img src="/assets/images/tools/${tool.toLowerCase()}.svg" class="single-tool__icon" alt="${tool} Icon"><span class="single-tool__label">${tool}</span></span></p>
    `;
  });

  let linkHTML = `<div class="links-projet">`;
  if (projet.links[0] != "") {
    linkHTML += `
      <a class="link link-design" href="${projet.links[0]}" target="_blank" rel="noopener noreferrer">Voir la maquette</a>
    `;
  }
  if (projet.links[1] != "") {
    linkHTML += `
      <a class="link link-github" href="${projet.links[1]}" target="_blank" rel="noopener noreferrer">Voir le Github</a>
    `;
  }
  if (projet.links[2] != "") {
    linkHTML += `
      <a class="link link-website" href="${projet.links[2]}" target="_blank" rel="noopener noreferrer">Voir le projet</a>
    `;
  }
  linkHTML += `</div>`;
  document.querySelector('#tab__projects .view__details .project-content .project-content__details .content-text').innerHTML += linkHTML;

  document.querySelector('#tab__projects .view__details .project-content .project-content__gallery .comment').innerHTML = `Projet n°${parseInt(id)+1} // _${projet.name.toLowerCase().replace(' ', '-')}`;
  document.querySelector('#tab__projects .view__details .project-content .project-content__gallery .entete-infos .profil .name-update .update').innerHTML = `Créé en ${projet.date}`;
  document.querySelector('#tab__projects .view__details .project-content .project-content__gallery .bloc-gallery').innerHTML = "";
  projet.galleryImage.forEach((img, index) => {
    document.querySelector('#tab__projects .view__details .project-content .project-content__gallery .bloc-gallery').innerHTML += `
      <a href="${img}" target="_blank" rel="noopener noreferrer"><img src="${img}" alt="Gallerie du projet ${projet.name} - ${index+1}" /></a>
    `;
  });
}

function handleCommandLineInput(command) {
  const historyCommandLine = document.getElementById('window-command-line__history');
  command = command.trim();

  historyCommandLine.innerHTML += `
    <p class="command">$ ${command}</p>
  `;

  switch (command) {
    case 'help':
      historyCommandLine.innerHTML += `
        <p>Voici la liste des commandes disponibles&nbsp;:</p>
        <p>&nbsp;&nbsp; help - Liste toutes les commandes</p>
        <p>&nbsp;&nbsp; clear - Nettoie l'historique de commande</p>
        <p>&nbsp;&nbsp; developer - Affiche le nom du développeur</p>
        <p>&nbsp;&nbsp; design - Affiche le nom du designer</p>
        <p>&nbsp;&nbsp; technologies - Affiche tous les technologies et languages utilisés</p>
        <p>&nbsp;&nbsp; files - Montre l'architecture du projet</p>
        <p>&nbsp;&nbsp; exit - Ferme le terminal de commande</p>
        <p>&nbsp;&nbsp; surprise - Veux-tu vraiment savoir ce qu'il se cache ?</p>
        <p>&nbsp;&nbsp; go outside - Il est temps d'aller dehors</p>
      `;
      break;

    case 'clear':
      historyCommandLine.innerHTML = ``;
      break;

    case 'developer':
      historyCommandLine.innerHTML += `
        <p>L'intégralité du site a été codé par moi-même, Valentin Vanhaecke 😉</p>
      `;
      break;

    case 'design':
      historyCommandLine.innerHTML += `
        <p>Le design du site vient d'une maquette récupérée sur Behance, designé par <a href="https://www.behance.net/whoisdave" target="_blank" rel="noopener noreferrer">Davide Simone</a> 🖌️</p>
      `;
      break;

    case 'technologies':
      historyCommandLine.innerHTML += `
        <p>Tout le site a été réalisé avec&nbsp;:</p>
        <p>&nbsp;-&nbsp;HTML</p>
        <p>&nbsp;-&nbsp;CSS</p>
        <p>&nbsp;-&nbsp;JavaScript</p>
        <p>&nbsp</p>
        <p class="success">La clé du succès reste la simplicité 😎</p>
      `;
      break;

    case 'files':
      historyCommandLine.innerHTML += `
        <p>Voici l'architecture du projet&nbsp;:</p>
        <p>&nbsp;-&nbsp;assets</p>
        <p>&nbsp;|&nbsp;-&nbsp;3dmodels</p>
        <p>&nbsp;|&nbsp;-&nbsp;images</p>
        <p>&nbsp;-&nbsp;css</p>
        <p>&nbsp;|&nbsp;-&nbsp;style.css</p>
        <p>&nbsp;-&nbsp;js</p>
        <p>&nbsp;|&nbsp;-&nbsp;script.js</p>
        <p>&nbsp;-&nbsp;index.html</p>
        <p>&nbsp;-&nbsp;projects.json</p>
        <p>&nbsp;-&nbsp;next-projects.json</p>
        <p>&nbsp;-&nbsp;README.md</p>
      `;
      break;

    case 'exit':
      historyCommandLine.innerHTML += `
        <p>exit</p>
      `;
      setTimeout(() => {
        document.getElementById('window-command-line').close();
      }, 1000);
      break;

    case 'surprise':
      historyCommandLine.innerHTML += `
        <p>Tu n'aurais pas dû taper cette commande 🤭</p>
      `;
      setTimeout(() => {
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      }, 3000);
      break;

    case 'go outside':
      historyCommandLine.innerHTML += `
        <p class="command">$ ${command}</p>
        <p>Il est temps d'aller dehors prendre l'air 🌳☁️.</p>
        <p>Ton navigateur te ménera ailleurs dans 10 secondes 😏</p>
      `;
      let count = 10;
      let timer = setInterval(() => {
        historyCommandLine.innerHTML += `
          <p>${count}</p>
        `;
        count--;
        if (count == 0) {
          clearInterval(timer);
        }
      }, 1000);
      setTimeout(() => {
        window.location.href = "https://www.youtube.com/embed/EColTNIbOko?autoplay=1";
      }, 11000);
      break;
      
    default:
      // console.log('command invalid');
      historyCommandLine.innerHTML += `
        <p class="error">Error: Le terme "${command}" n'est pas disponible ou n'est pas reconnu comme une commande. Vérifiez l'autographe ou tapez la commande "help" pour obtenir de l'aide.</p>
      `;
      break;
  }

  setTimeout(() => {
    document.getElementById('window-command-line').scrollTop = document.getElementById('window-command-line').scrollHeight;
  }, 0);
}
