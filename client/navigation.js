const navMenu = document.querySelector(".nav__menu");
const closeButton = document.querySelector(".bx-x");
const openButton = document.querySelector(".bx-menu-alt-right");
const signoutBtn = document.getElementById("signout");
const loginBtn = document.getElementById("login");

function openNavigationMenu() {
  navMenu.classList.add("show");
}

function closeNavigationMenu() {
  navMenu.classList.remove("show");
}

function redirectToMainPage() {
  window.location.href = "index.html";
}

function redirectToLoginPage() {
  window.location.href = "login.html"
}

if (openButton) {
  openButton.addEventListener("click", () => {
    openNavigationMenu();
  });
}

if (closeButton) {
  closeButton.addEventListener("click", () => {
    closeNavigationMenu();
  });
}

if (signoutBtn) {
  signoutBtn.addEventListener("click", redirectToMainPage);
}

if(loginBtn) {
  loginBtn.addEventListener("click", redirectToLoginPage);
}

/*=============== CHANGE BACKGROUND HEADER ===============*/
function scrollHeader() {
  const header = document.getElementById("header");

  if (this.scrollY >= 50) {
    header.classList.add("scroll-header");
  } else {
    header.classList.remove("scroll-header");
  }
}

window.addEventListener("scroll", scrollHeader);