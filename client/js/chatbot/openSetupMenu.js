function setupUserMenu() {
  const userMenu = document.querySelector(".nav__user-selection");

  userMenu.classList.add("show");

  // Add event listener to the document body
  document.body.addEventListener("click", closeMenu);

  function closeMenu(event) {
    // Check if the click was outside the user menu and its trigger
    if (
      !userMenu.contains(event.target) &&
      !userSelection.contains(event.target)
    ) {
      userMenu.classList.remove("show");
      // Remove the event listner when the menu is closed
      document.body.removeEventListener("click", closeMenu);
    }
  }
}

export default setupUserMenu;
export const userSelection = document.querySelector(".nav__user-content");
