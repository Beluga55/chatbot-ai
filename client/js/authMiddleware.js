// FUNCTION TO ALERT USER WHEN ITS NOT AUTHORIZED
const redirectToLogin = () => {
  alert("Unauthorized Access !!! Please Sign In or Sign Up !!!");
  window.location.href = "login.html";
};

// RETRIEVE THE STATUS OF THE LOCALSTORAGE (DEFAULT SET TO TRUE)
const checkAuthToken = () => !!localStorage.getItem("token");

// RETRIEVE THE ROLE WHETHER IT IS ADMIN OR USER
const checkRole = () => {
  const role = localStorage.getItem("role");
  return role;
};

// PROTECT USER ROUTE
const protectUserRoute = () => {
  if (!checkAuthToken() || !checkRole()) {
    redirectToLogin();
    return false;
  }

  if (checkRole() !== "user") {
    alert("You do not have permission to access this page.");
    window.location.href = "login.html";
    return false;
  }

  return true;
};

// PROTECT ADMIN ROUTE
const protectAdminRoute = () => {
  if (!checkAuthToken() || !checkRole()) {
    redirectToLogin();
    return false;
  }

  if (checkRole() !== "admin") {
    alert("You do not have permission to access this page.");
    window.location.href = "login.html";
    return false;
  }

  return true;
};

// PROTECT RESET PASSWORD ROUTE
const resetPasswordRoute = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userToken = urlParams.get("token");

  if (userToken === "" || userToken === null) {
    alert("You do not have permission to access this page.");
    window.location.href = "index.html";
    return false;
  }

  return true;
};

const protectSuccessRoute = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  if (sessionId === "" || sessionId === null) {
    alert("You do not have permission to access this page.");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

// CHECK AND PROTECT ROUTES
if (window.location.pathname === "/admin.html") {
  protectAdminRoute();
} else if (window.location.pathname === "/chatbot.html") {
  protectUserRoute();
} else if (window.location.pathname === "/resetPassword.html") {
  resetPasswordRoute();
} else if (window.location.pathname === "/success.html") {
  protectSuccessRoute();
}
