// FUNCTION TO ALERT USER WHEN ITS NOT AUTHORIZED
const redirectToLogin = () => {
  alert("Unauthorized Access !!! Please sign in or sign up !!!");
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
    window.history.back();
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
    window.history.back();
    return false;
  }

  return true;
};

// CHECK AND PROTECT ROUTES
if (window.location.pathname === "/admin.html") {
  protectAdminRoute();
} else if (window.location.pathname === "/chatbot.html") {
  protectUserRoute();
}
