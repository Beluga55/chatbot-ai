const navMenu = document.querySelector(".nav__menu");
const closeButton = document.querySelector(".bx-left-arrow-alt");
const openButton = document.querySelector(".bx-menu-alt-right");
const signoutBtn = document.querySelectorAll(".signout");
const loginBtn = document.querySelectorAll(".login__btn");
const header = document.getElementById("header");
const signupBtn = document.querySelectorAll(".signup__button");
const username = document.querySelectorAll(".nav-username");
const serviceContainers = document.querySelectorAll(".service__content");
const textarea = document.getElementById("promptTextarea");
const form = document.querySelector("form");
const navList = document.querySelector(".nav__links ul");

if (navList) {
  const listItems = navList.querySelectorAll("li");

  listItems.forEach((li) => {
    li.addEventListener("click", function (event) {
      const clickedLink = event.currentTarget.querySelector("a");

      if (clickedLink) {
        event.preventDefault();

        const redirectLink = clickedLink.getAttribute("href");

        window.location.href = redirectLink;
      }
    });
  });
}

if (textarea) {
  textarea.addEventListener("input", function () {
    this.style.maxHeight = "auto";
    this.style.height = Math.min(this.scrollHeight, 100) + "px"; // Set a maximum height of 100px
    this.style.overflowY = "auto";

    if (this.value.trim() === "") {
      this.style.overflowY = "hidden";
      this.style.height = "auto";
    }
  });

  textarea.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" || e.key === "Delete") {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 100) + "px";
    }
  });

  form.addEventListener("keyup", (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      textarea.style.height = "auto";
    }
  });
}

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
  localStorage.removeItem("role");
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

// REDIRECT TO CHATBOT OR IMAGE GENERATOR
serviceContainers.forEach(function (container) {
  container.addEventListener("click", function () {
    // Get the service name from the clicked container
    const serviceName = container.querySelector("h2").innerText;
    handleClick(serviceName);
  });
});

// Function to handle the click event
function handleClick(serviceName) {
  if (serviceName === "GPT-3.5-Turbo") {
    window.location.href = "chatbot.html";
  } else if (serviceName === "DALL-E 2") {
    window.location.href = "dalle-2.html";
  }
}
