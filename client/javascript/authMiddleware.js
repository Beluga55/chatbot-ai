// PROTECTION ROUTES FOR AUTHENTICATED USERS
const notAuthenticated = () => {
  alert("Unauthorized access, please login first");
  window.location.href = "login.html";
};

const checkAuthToken = () => {
  return !!localStorage.getItem("token");
};

const checkRole = () => {
  const role = localStorage.getItem("role");
  return role;
};

// USER HTML ROUTES
const protectSettings = () => {
  if (!checkAuthToken() || !checkRole()) {
    notAuthenticated();
    return false;
  }

  return true;
};

// VERIFY EMAIL ROUTES
const protectVerifyEmail = () => {
  // SEARCH FOR THE QUERY PARAMETER
  const searchParams = new URLSearchParams(window.location.search);
  let encodedEmail = searchParams.get("email");

  if (!encodedEmail) {
    return false;
  }

  return true;
}

// CHECK AND PROTECT ROUTES
if (window.location.pathname === "/user.html" || window.location.pathname === "/dashboard.html") {
  protectSettings();
}

if (window.location.pathname === "/verifyEmail.html") {
  if(!protectVerifyEmail()) {
    alert("Unauthorized access to this page");
    window.location.href = "login.html";
  }
}