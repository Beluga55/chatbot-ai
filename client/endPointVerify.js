import protectRoute from "./authMiddleware";

// Check if the user is logged in (token is present)
if (protectRoute()) {
  const role = localStorage.getItem("role");

  // Use the middleware to protect the route
  if (role === "admin") {
    protectRoute(true);
  } else {
    protectRoute();
  }
}
