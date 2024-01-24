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

// LOGIN STATE TO CHANGE THE NAV MENU
const loginBtns = document.querySelectorAll(".login__btn");
const hamburger = document.querySelectorAll(".bx-menu-alt-right");
const appendUsernameText = document.querySelectorAll(".nav__retrived-username");
const navLoginUsername = document.querySelector(".nav__login-username");
const navMenuRight = document.querySelector(".nav__menu-right");
const navDropdownMenu = document.querySelectorAll(".nav__dropdown-menu");
const navTriggerMenu = document.querySelector(".nav__trigger-menu");
const loginAtHeader = document.querySelector("#login");
const navRedirectChatbot = document.querySelectorAll(".nav__redirect-chatbot");
const arrowDown = document.querySelector(".bx-chevron-down");

// GET THE LOGIN STATE AT THE LOCAL STORAGE
const loginState = localStorage.getItem("token");
// RETRIEVE THE USERNAME FROM LOCAL STORAGE
const username = localStorage.getItem("username");

// FUNCTION TO HANDLE THE CLICK EVENT FOR THE NAV LOGIN USERNAME
function handleNavLoginUsernameClick() {
  // Stop the event from propagating up the DOM tree
  event.stopPropagation();

  navDropdownMenu.forEach((menu) => {
    menu.classList.add("show");
  });

  document.addEventListener("click", function (event) {
    const isClickInside = navMenuRight.contains(event.target);

    if (!isClickInside) {
      navDropdownMenu.forEach((menu) => {
        menu.classList.remove("show");
      });
    }
  });
}

navMenuRight.addEventListener("click", handleNavLoginUsernameClick);

if (navLoginUsername) {
  navLoginUsername.addEventListener("click", handleNavLoginUsernameClick);
}

if (navTriggerMenu) {
  navTriggerMenu.addEventListener("click", () => {
    event.stopPropagation();

    navDropdownMenu.forEach((menu) => {
      menu.classList.remove("show");
    });
    openNavigationMenu();
  });
}

if (navRedirectChatbot) {
  navRedirectChatbot.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "chatbot.html";
    });
  });
}

// IF LOGIN STATE IS TRUE, CHANGE THE NAV MENU
if (loginState) {
  loginBtns.forEach((btn) => {
    // REMOVE THE LOGIN BTN
    btn.classList.add("hide");
  });
  hamburger.forEach((btn) => {
    // REMOVE THE HAMBURGER BTN
    btn.remove();
  });
  if (loginAtHeader) {
    loginAtHeader.remove();
  }
} else {
  if (navLoginUsername) {
    navLoginUsername.remove();
  }
  if (arrowDown) {
    arrowDown.remove();
  }

  appendUsernameText.forEach((text) => {
    text.remove();
  });
  navMenuRight.removeEventListener("click", handleNavLoginUsernameClick);
}

// APPEND THE USERNAME TO THE NAV MENU
if (username) {
  document.addEventListener("DOMContentLoaded", function () {
    appendUsernameText.forEach((text) => {
      text.innerHTML = username;
    });
  });
}

// ISADMIN FUNCTIONALITY
const isAdmin = localStorage.getItem("role");

if (isAdmin === "admin" && window.location.pathname !== "admin.html") {
  const adminBtn = document.querySelectorAll("#isAdmin");

  if (adminBtn) {
    adminBtn.forEach((btn) => {
      // SET THE CLASSLIST TO EMPTY
      btn.classList = "";

      btn.textContent = "Admin";

      btn.addEventListener("click", () => {
        window.location.href = "admin.html";
      });
    });
  }
}

// IF THE USER IS ALREADY IN THE CHATBOT.html PAGE, REMOVE THE CHATBOT BTN
if (window.location.pathname === "/chatbot.html") {
  const chatbotBtn = document.querySelectorAll(".nav__redirect-chatbot");

  if (chatbotBtn) {
    chatbotBtn.forEach((btn) => {
      btn.remove();
    });
  }
}