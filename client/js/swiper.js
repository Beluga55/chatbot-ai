var swiper = new Swiper(".pricing__container-card", {
  spaceBetween: 32,
  slidesPerView: "auto",
  loop: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  // Breakpoints
  breakpoints: {
    // when window width is >= 576px
    576: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});
