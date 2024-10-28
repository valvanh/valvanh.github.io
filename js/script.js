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
  console.log("Fiered load after " + performance.now() + " ms");
}, false);

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