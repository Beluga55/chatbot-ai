const loginForm = document.querySelector(".login__form");
const loginSubmitButton = document.querySelector(".login__form .buttons");

const validateLoginForm = () => {
  // GET THE FORM VALUES
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  // VALIDATE EMAIL
  if (username === "") {
    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("login-username").placeholder =
      "Username is required";
    document.getElementById("login-username").style.borderColor = "red";

    return false;
  } else {
    // CHANGE GREEN COLOR BORDER
    document.getElementById("login-username").style.borderColor = "lime";
  }

  // VALIDATE PASSWORD
  if (password.trim() === "") {
    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("login-password").placeholder =
      "Password is required";
    document.getElementById("login-password").style.borderColor = "red";

    return false;
  } else {
    // CHANGE GREEN COLOR BORDER
    document.getElementById("login-password").style.borderColor = "lime";
  }

  return true;
};

loginSubmitButton.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!validateLoginForm()) return;

  // GET THE FORM VALUES
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  // SEND THE FORM VALUES TO THE SERVER
  const response = await fetch("http://localhost:5001/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  // Initialize a new Notyf instance
  var notyf = new Notyf({
    duration: 3000,
    position: {
      x: "right",
      y: "top",
    },
    dismissible: true,
    icon: true,
  });

  // GET THE RESPONSE FROM THE SERVER
  try {
    if (response.ok) {
      const data = await response.json();

      // CLEAR THE LOGIN FORM
      loginForm.reset();

      // SAVE THE TOKEN IN LOCAL STORAGE
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);

      // REDIRECT TO THE DASHBOARD
      window.location.href = "dashboard.html";
    } else {
      const error = await response.json();

      notyf.error({
        message: error.message,
      });
    }
  } catch (error) {
    console.error(error);
  }
});
