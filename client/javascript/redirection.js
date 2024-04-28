const heroButton = document.querySelectorAll(
  ".hero__button, .cta__content button, .footer__copyright button"
);

const redirectSignup = () => {
  window.location.href = "signup";
};

if (heroButton) {
  heroButton.forEach((button) => {
    button.addEventListener("click", redirectSignup);
  });
}

const loginButton = document.querySelector(".nav__login");
const redirectLoginButtonOverlay = document.querySelector(
  ".signup__overlay .buttons"
);

const redirectLogin = () => {
  window.location.href = "login";
};

const token = localStorage.getItem("token");

if (token) {
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      window.location.href = "user";
    });
  }
} else {
  if (loginButton) {
    loginButton.addEventListener("click", redirectLogin);
  }

  if (loginButton && window.location.pathname === "/login") {
    loginButton.addEventListener("click", redirectSignup);
  }
}

if (redirectLoginButtonOverlay) {
  redirectLoginButtonOverlay.addEventListener("click", redirectLogin);
}
