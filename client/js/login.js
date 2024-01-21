const loginButton = document.getElementById("submit__login-button");
const loginForm = document.getElementById("loginForm");

function validateEmail(email) {
  // Regular expression for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateLoginForm() {
  document.getElementById("error__email").style.display = "none";
  document.getElementById("error__password").style.display = "none";

  var email = document.getElementById("loginEmail").value;
  var password = document.getElementById("loginPassword").value;

  // Validate email
  if (email.trim() === "") {
    document.getElementById("error__email").style.display = "block";
    return false;
  } else if (!validateEmail(email)) {
    document.getElementById("error__email").innerText = "Invalid email format";
    document.getElementById("error__email").style.display = "block";
    return false;
  }

  if (password.trim() === "") {
    document.getElementById("error__password").style.display = "block";
    return false;
  }

  // If all validations pass, the form is submitted
  return true;
}

async function submitLogin(event) {
  // Validate The Form
  if (!validateLoginForm()) {
    event.preventDefault();
    return;
  }

  event.preventDefault();

  const intendedAction = localStorage.getItem("intendedAction");

  if (intendedAction) {
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;

    // https://chatbot-rreu.onrender.com

    const response = await fetch("https://chatbot-rreu.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const result = await response.json();

      // Store the token in localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);
      localStorage.setItem("role", result.role);

      loginForm.reset();

      if (result.role === "admin") {
        window.location.href = "admin.html";
      } else {
        const response = await fetch(
          "https://chatbot-rreu.onrender.com/create-checkout-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productName: intendedAction,
              username: localStorage.getItem("username"),
            }),
          }
        );

        try {
          const data = await response.json();
          if (response.ok) {
            window.location.href = data.url;
          } else {
            throw new Error(data.error);
          }
        } catch (error) {
          alert(error.message);
        }

        // Clear the intended action
        localStorage.removeItem("intendedAction");
      }
    } else {
      // Handle login error
      const errorData = await response.json();
      console.error(errorData.error);
      document.getElementById("wrong__email-password").style.display = "block";
    }
  } else {
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;

    // https://chatbot-rreu.onrender.com

    const response = await fetch("https://chatbot-rreu.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const result = await response.json();

      // Store the token in localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);
      localStorage.setItem("role", result.role);

      loginForm.reset();

      if (result.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "selectService.html";
      }
    } else {
      // Handle login error
      const errorData = await response.json();
      console.error(errorData.error);
      document.getElementById("wrong__email-password").style.display = "block";
    }
  }
}

loginButton.addEventListener("click", function (e) {
  submitLogin(e);
});
