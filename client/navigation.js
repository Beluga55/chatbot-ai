const navMenu = document.querySelector(".nav__menu");
const closeButton = document.querySelector(".bx-left-arrow-alt");
const openButton = document.querySelector(".bx-menu-alt-right");
const signoutBtn = document.querySelectorAll(".signout");
const loginBtn = document.querySelectorAll(".login__btn");
const header = document.getElementById("header");
const getStarted = document.getElementById("getStarted");
const signupBtn = document.querySelector(".signup__button");

const openNavigationMenu = () => {
  navMenu.classList.add("show");
};

const closeNavigationMenu = () => {
  navMenu.classList.remove("show");
};

const redirectToMainPage = () => {
  window.location.href = "index.html";
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

if (signupBtn) {
  signupBtn.addEventListener("click", redirectToSignupPage);
}

// TESTING
if (getStarted) {
  getStarted.addEventListener("click", () => {
    window.location.href = "chatbot.html";
  });
}

/*=============== CHANGE BACKGROUND HEADER ===============*/
const scrollHeader = () => {
  header.classList.toggle("scroll-header", window.scrollY >= 50);
};

window.addEventListener("scroll", scrollHeader);
