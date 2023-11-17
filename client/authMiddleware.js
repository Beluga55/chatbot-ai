const redirectToLogin = () => {
  alert("Unauthorized Access !!! Please sign in or sign up !!!");
  window.location.href = "login.html";
};

const checkAuthToken = () => !!localStorage.getItem("token");

const checkAdminRole = () => {
  const role = localStorage.getItem("role");
  return role && role.toLowerCase() === "admin";
};

const protectRoute = (requireAdmin = false) => {
  if (!checkAuthToken() || (requireAdmin && !checkAdminRole())) {
    redirectToLogin();
  }
};

export default protectRoute;