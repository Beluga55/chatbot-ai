const redirectToLogin = () => {
  alert("Unauthorized Access !!! Please sign in or sign up !!!")
  window.location.href = "login.html";
};

const checkAuthToken = () => !!localStorage.getItem("token");

const protectRoute = () => {
  if (!checkAuthToken()) {
    redirectToLogin();
  }
};

export default protectRoute;
