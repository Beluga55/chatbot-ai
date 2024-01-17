// SET USERNAME IN NAVMENU
function setUsername() {
  const username = document.querySelectorAll(".nav-username");

  if (username.length > 0) {
    const dataUsername = localStorage.getItem("username");
    username.forEach((e) => {
      e.textContent = dataUsername;
    });
  }
}

export default setUsername;