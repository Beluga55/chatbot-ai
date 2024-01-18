// OPEN NAVIGATION MENU
const openNavBtn = document.querySelector(".bx-menu-alt-right");
const closeNavBtn = document.querySelector(".bx-left-arrow-alt");
const navMenu = document.querySelector(".nav__menu");

// FUNCTIONS HANDLE THE NAVIGATION MENU
const openNavigationMenu = () => {
  navMenu.classList.add("show");
};

const closeNavigationMenu = () => {
  navMenu.classList.remove("show");
};

// CHECK AND PASS THE FUNCTIONS TO THE BTNS
if (openNavBtn) {
  openNavBtn.addEventListener("click", openNavigationMenu);
}

if (closeNavBtn) {
  closeNavBtn.addEventListener("click", closeNavigationMenu);
}

// REDIRECT TO THE RESPECTIVE PAGE WHEN CLICKED EACH LI
const navList = document.querySelector(".nav__links ul");

if (navList) {
  const listItems = navList.querySelectorAll("li");

  listItems.forEach((li) => {
    li.addEventListener("click", function (event) {
      navMenu.classList.remove("show");
      const clickedLink = event.currentTarget.querySelector("a");

      if (clickedLink) {
        event.preventDefault();

        const redirectLink = clickedLink.getAttribute("href");

        window.location.href = redirectLink;
      }
    });
  });
}

// ALL BUTTON TO REDIRECT TO LOGIN PAGE
const loginBtn = document.querySelectorAll(".login__btn");

const redirectToLoginPage = () => {
  window.location.href = "login.html";
};

if (loginBtn.length > 0) {
  loginBtn.forEach((btn) => {
    btn.addEventListener("click", redirectToLoginPage);
  });
}

// ALL BUTTON TO REDIRECT TO SIGNUP PAGE
const signupBtn = document.querySelectorAll(".signup__button");

const redirectToSignupPage = () => {
  window.location.href = "signup.html";
};

if (signupBtn.length > 0) {
  signupBtn.forEach((btn) => {
    btn.addEventListener("click", redirectToSignupPage);
  });
}

/*=============== CHANGE BACKGROUND HEADER ===============*/
const scrollHeader = () => {
  header.classList.toggle("scroll-header", window.scrollY >= 30);
};

window.addEventListener("scroll", scrollHeader);

// REDIRECT TO SOCIAL MEDIA PAGE
const github = document.querySelectorAll(".bxl-github");
const meta = document.querySelectorAll(".bxl-meta");
const instagram = document.querySelectorAll(".bxl-instagram");

// FOREACH TO LOOP IT
github.forEach((github) => {
  github.addEventListener("click", function () {
    window.open("https://github.com/Beluga55", "_blank");
  });
});

meta.forEach((meta) => {
  meta.addEventListener("click", function () {
    window.open("https://www.facebook.com/cho.chunwah", "_blank");
  });
});

instagram.forEach((instagram) => {
  instagram.addEventListener("click", function () {
    window.open("https://www.instagram.com/pls_relax_bro/", "_blank");
  });
});

// SIGNOUT FOR ALL BUTTONS
const signoutBtn = document.querySelectorAll(".signout");

const redirectToMainPage = () => {
  window.location.href = "index.html";
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
};

if (signoutBtn.length > 0) {
  signoutBtn.forEach((element) => {
    element.addEventListener("click", redirectToMainPage);
  });
}

// SERVICE SELECTION REDIRECT
const serviceContainers = document.querySelectorAll(".service__content");

function handleClick(serviceName) {
  if (serviceName === "Chatbot AI") {
    window.location.href = "chatbot.html";
  }
}

serviceContainers.forEach(function (selection) {
  selection.addEventListener("click", function () {
    // Get the service name from the clicked container
    const serviceName = selection.querySelector("h2").innerText;
    handleClick(serviceName);
  });
});
