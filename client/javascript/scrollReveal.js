const sr = ScrollReveal();

const topReveal = {
  origin: "top",
  distance: "80px",
  duration: 2000,
  reset: false,
};

const leftReveal = {
  origin: "left",
  distance: "80px",
  duration: 2000,
  reset: false,
};

const rightReveal = {
  origin: "right",
  distance: "80px",
  duration: 2000,
  reset: false,
};

const topIntervalReveal = {
  origin: "top",
  distance: "80px",
  duration: 2000,
  interval: 300,
  reset: false,
};

const leftIntervalReveal = {
  origin: "left",
  distance: "80px",
  duration: 2000,
  interval: 300,
  reset: false,
};

sr.reveal(".hero__container", topReveal);
sr.reveal(".benefits h2", topReveal);
sr.reveal(".benefits__content-card", topIntervalReveal);
sr.reveal(".cta__container", leftReveal);
sr.reveal(".signup__image, .login__image", rightReveal);
sr.reveal(".signup__form input, .login__form input", leftIntervalReveal);
sr.reveal(".signup__container h1, .login__container h1, .login__container p, .signup__form p, .signup__form button, .login__form-cta, .login__form button", leftReveal);