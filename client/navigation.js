const navMenu = document.querySelector(".nav__menu");
const closeButton = document.querySelector(".bx-x");
const openButton = document.querySelector(".bx-menu-alt-right");

function openNavigationMenu() {
  navMenu.classList.add("show");
}

function closeNavigationMenu() {
  navMenu.classList.remove("show");
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
