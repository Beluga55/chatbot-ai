const navMenu = document.querySelector(".nav__menu");
const closeButton = document.querySelector(".bx-left-arrow-alt");
const openButton = document.querySelector(".bx-menu-alt-right");
const signoutBtn = document.querySelectorAll(".signout");
const loginBtn = document.querySelectorAll(".login__btn");
const header = document.getElementById("header");
const signupBtn = document.querySelectorAll(".signup__button");
const username = document.querySelectorAll(".nav-username");

const openNavigationMenu = () => {
  navMenu.classList.add("show");
};

const closeNavigationMenu = () => {
  navMenu.classList.remove("show");
};

const redirectToMainPage = () => {
  window.location.href = "index.html";
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("randomID");
};

const redirectToLoginPage = () => {
  window.location.href = "login.html";
};

const redirectToSignupPage = () => {
  window.location.href = "signup.html";
};

if (openButton) {
  openButton.addEventListener("click", openNavigationMenu);
}

if (closeButton) {
  closeButton.addEventListener("click", closeNavigationMenu);
}

if (signoutBtn.length > 0) {
  signoutBtn.forEach((element) => {
    element.addEventListener("click", redirectToMainPage);
  });
}

if (loginBtn.length > 0) {
  loginBtn.forEach((e) => {
    e.addEventListener("click", redirectToLoginPage);
  });
}

if (signupBtn.length > 0) {
  signupBtn.forEach((e) => {
    e.addEventListener("click", redirectToSignupPage);
  });
}

if (username.length > 0) {
  const dataUsername = localStorage.getItem("username");
  username.forEach((e) => {
    e.textContent = dataUsername;
  });
}

/*=============== CHANGE BACKGROUND HEADER ===============*/
const scrollHeader = () => {
  header.classList.toggle("scroll-header", window.scrollY >= 50);
};

window.addEventListener("scroll", scrollHeader);
