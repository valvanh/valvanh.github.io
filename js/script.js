let DOMLoaded = false;
let siteLoaded = false;
let progressLoader = 0;
let loaderPlaceHolders = ['Loading Resources', 'Retrieving Projects', 'Initializing Amazing Experience'];
let loaderPlaceHolderDisplay = document.getElementById('loading__placeholder');
let loader = document.getElementById('loader');
let progressBarLoader = document.getElementById('loading__bar__progress');

let currentPage = 'home';

document.addEventListener('readystatechange', function() {
  console.log("Fiered '" + document.readyState + "' after " + performance.now() + " ms");
});

document.addEventListener('DOMContentLoaded', function() {
  console.log("Fiered DOMContentLoaded after " + performance.now() + " ms");

  DOMLoaded = true;
  let trueLoad = false;
  let countCycle = 0;

  setTimeout(() => {
    trueLoad = true;
  }, 5000);
  setInterval(() => {
    loaderPlaceHolderDisplay.innerText = loaderPlaceHolders[countCycle%3];
    countCycle++;
  }, 1500);
  
  setInterval(() => {
    if(siteLoaded && trueLoad){
      progressBarLoader.style.width = '100%';
      
      displayTime();
      
      setTimeout(() => {
        loader.style.opacity = 0;
      }, 500);
      setTimeout(() => {
        loader.remove()
      }, 1500);
    }else{
      if(Math.random() < 0.5){
        progressLoader += Math.random() * (20 - 5) + 5;
        if (progressLoader > 90) {
          progressLoader = 90;
        }
        progressBarLoader.style.width = `${progressLoader}%`;
      }
    }
  }, 500);
  
}, false);

window.addEventListener('load', function() {
  siteLoaded = true;
  fetchProjects();
  console.log("Fiered load after " + performance.now() + " ms");
}, false);

// document.addEventListener('mousemove', function(event) {
//   console.log(`Mouse : ${event.clientX}x${event.clientY}`);
// });

document.querySelectorAll('a').forEach(element => {
  element.addEventListener('click', (event) => {
    const blacklistUrl = ['mailto:valentinvanh@gmail.com', 'https://www.instagram.com/vanskull_/', 'https://twitter.com/VanSkull_Live'];
    let target = element.getAttribute('href');
    if ((target != '' || target != '#') && blacklistUrl.includes(target) != true) {
      event.preventDefault();
      console.log("Not blacklisted");
      switch (target) {
        case '/':
          currentPage = 'home'
          break;
        case '/about':
          currentPage = 'about'
          break;
        case '/projects':
          currentPage = 'projects'
          break;
      
        default:
          break;
      }
    }
    console.log(currentPage);
    
  });
});

function displayTime() {
  let timeDisplay = document.getElementById('time');
  let timezoneDisplay = document.getElementById('timezone');

  timeDisplay.innerText = formatAMPM(new Date());

  timezoneDisplay.innerText = `UTC${new Date().getTimezoneOffset() < 0 ? '+' : '-'}${new Date().getTimezoneOffset() / 60 * -1}`;
  setInterval(() => {
    timeDisplay.innerText = formatAMPM(new Date());
  }, 1000);
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

async function fetchProjects() {
  try {
    const response = await fetch("/projects.json");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const projects = await response.json();
    console.log(projects);
    projects.projects.forEach(project => {
      const div = document.createElement('div');
      div.classList.add("single-project");
      div.innerHTML = `<img src="${project.backgroundImage}" alt="${project.name}" class="single-project__background">
            <div class="single-project__logo"><img src="${project.logo}" alt="${project.name} Logo" /></div>
            <div class="single-project__title">${project.name}</div>
            <div class="single-project__subtitle">${project.subtitle}</div>
            <div class="single-project__date">${project.date}</div>
            <div class="single-project__description">${project.description}</div>
            <a href="${project.link}" class="single-project__link">See project</a>`;
      document.getElementById('core-planet').appendChild(div);
    });
  } catch (error) {
    console.error(error.message);
  }
}