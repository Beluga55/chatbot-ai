import { notyf } from "./notyfInstance.js";
import myImage from "../assets/empty-user.png";

const navMenu = document.querySelector(".nav__list");
const navHamburger = document.querySelector(".bx-menu-alt-right");
const settingsProfile = document.querySelectorAll(".settings__profile");

const toggleNav = () => {
  if (navMenu.classList.contains("active")) {
    navMenu.classList.remove("active");
  } else {
    navMenu.classList.add("active");

    // LOOP THROUGH THE SETTINGS PROFILES
    settingsProfile.forEach((profile) => {
      profile.style.zIndex = "-1";
    });
  }
};

const closeNav = (event) => {
  if (event.target !== navHamburger && event.target !== navMenu) {
    navMenu.classList.remove("active");

    // LOOP THROUGH THE SETTINGS PROFILES
    settingsProfile.forEach((profile) => {
      profile.style.zIndex = "0";
    });
  }
};

navHamburger.addEventListener("click", toggleNav);
document.addEventListener("click", closeNav);

/*=============== CHANGE BACKGROUND HEADER ===============*/
const header = document.querySelector("header");

const scrollHeader = () => {
  header.classList.toggle("scroll-header", window.scrollY >= 30);
};

window.addEventListener("scroll", scrollHeader);

/*=============== LOGIN STATE ===============*/
const navLogin = document.querySelector(".nav__login");

const loginState = async () => {
  const token = localStorage.getItem("token");

  // SEND TO THE BACKEND TO VERIFY THE TOKEN
  if (token) {
    const response = await fetch(
      "https://chatbot-rreu.onrender.com/users/verifyToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const username = localStorage.getItem("username");

      // IF THE TOKEN IS VALID, REMOVE THE HOME NAV
      const navHome = document.querySelector(
        ".nav__links .nav__link:first-child"
      );

      if (navHome && window.location.pathname !== "/dashboard") {
        navHome.remove();
      }

      // ADD THE DASHBOARD NAV
      const navDashboard = document.createElement("div");
      navDashboard.classList.add("nav__link");
      navDashboard.innerHTML = `<i class='bx bxs-dashboard'></i><a href="dashboard">Dashboard</a>`;

      // GET THE NAV LINKS CONTAINER
      const navLinks = document.querySelector(".nav__links");

      if (navLinks && window.location.pathname !== "/dashboard") {
        navLinks.appendChild(navDashboard);
      }

      navLogin.innerHTML = `<img src="${myImage}" /><p class="nav__username">${username}</p>`;
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    }
  }
};

document.addEventListener("DOMContentLoaded", loginState);

export const retrieveProfilePicture = async () => {
  const username = localStorage.getItem("username");

  if (!username) return;

  const imageResponse = await fetch(
    "http://localhost:5001/users/retrieveProfilePicture",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ username }),
    }
  );

  if (imageResponse.ok) {
    const imageBlob = await imageResponse.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    // Display the image
    const navProfile = document.querySelector(".nav__login img");
    const settingsProfile = document.querySelector(
      ".settings__profile-picture-preview"
    );

    if (navProfile) {
      navProfile.src = imageUrl;
    }

    if (settingsProfile) {
      settingsProfile.src = imageUrl;
    }

    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          const profileImage = document.querySelectorAll(".profile__image img");
          profileImage.forEach((image) => {
            image.src = imageUrl;
          });
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document, { childList: true, subtree: true });
  }
};

document.addEventListener("DOMContentLoaded", retrieveProfilePicture);

// SHOW THE NOTIFICATION ACCOUNT DELETED
const checkAccountDeleted = () => {
  const accountDeleted = localStorage.getItem("accountDeleted");

  if (accountDeleted) {
    // Initialize a new Notyf instance

    // Show a success notification
    notyf.success("Account deleted successfully");

    // Remove the flag from localStorage
    localStorage.removeItem("accountDeleted");
  }
};

document.addEventListener("DOMContentLoaded", checkAccountDeleted);

// SHOW THE NOTYF NOTIFICATION AFTER VERIFYING THE EMAIL
const showNotyfNotification = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const showNotyf = urlParams.get("showNotyf");

  if (showNotyf) {
    // Initialize a new Notyf instance

    notyf.success("Email verified successfully");

    // Remove the 'showNotyf' parameter from the URL
    urlParams.delete("showNotyf");
    history.replaceState({}, "", `${location.pathname}?${urlParams}`);
  }
};

// CHECK THE linkClicked FLAG
const checkLinkClicked = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const linkClicked = urlParams.get("linkClicked");

  if (linkClicked) {
    // Removed the linkClicked session storage
    sessionStorage.removeItem("linkClicked");

    urlParams.delete("linkClicked");
    history.replaceState({}, "", `${location.pathname}?${urlParams}`);
  }
};

document.addEventListener("DOMContentLoaded", showNotyfNotification);
document.addEventListener("DOMContentLoaded", checkLinkClicked);

// REMOVE THE  EXTENSION FROM THE URL
window.addEventListener("load", function () {
  if (window.location.href.endsWith(".html")) {
    window.location.replace(window.location.href.slice(0, -5));
  }
});
