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
}, false);

window.addEventListener('load', function () {
  console.log("Fiered load after " + performance.now() + " ms");

  document.getElementById('switch-light-night').addEventListener('click', switchLightNight);
  document.getElementById('menu__button').addEventListener('click', menuBurger);
}, false);

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