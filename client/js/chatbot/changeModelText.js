function changeModelText() {
  const navToggleText = document.getElementById("nav__toggle-text");

  if (navToggle.checked) {
    navToggleText.textContent = "GPT 4";
  } else {
    navToggleText.textContent = "GPT 3.5";
  }
}

export { changeModelText };
export const navToggle = document.getElementById("toggle-switch");