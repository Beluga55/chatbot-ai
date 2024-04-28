import { Notyf } from "notyf";

const forgotPasswordForm = document.getElementById("forgot-password-form");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");

const validateEmail = (email) => {
  // Regular expression for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateInputValue = (event) => {
  event.preventDefault();
  // Get the email input value
  const email = document.getElementById("user-email").value;

  // Check if the email input is empty
  if (email === "") {
    // GENERATE A NEW NOTFY INSTANCE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // DISPLAY THE NOTIFICATION
    notyf.error("Please enter your email address");
    return false;
  }

  // Check if the email match the regex value
  if (!validateEmail(email)) {
    // GENERATE A NEW NOTFY INSTANCE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // DISPLAY THE NOTIFICATION
    notyf.error("Please enter a valid email address");
    return false;
  }
  return true;
};

forgotPasswordBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  if (!validateInputValue(event)) {
    return;
  }

  const email = document.getElementById("user-email").value;

  // SEND THE REQUEST TO THE SERVER
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/forgotPassword",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  try {
    if (response.ok) {
      const data = await response.json();

      // GENERATE A NEW NOTFY INSTANCE
      var notyf = new Notyf({
        duration: 3000,
        position: {
          x: "right",
          y: "top",
        },
        dismissible: true,
        icon: true,
      });

      // DISPLAY THE NOTIFICATION
      notyf.success(data.message);
    } else {
      const data = await response.json();

      // GENERATE A NEW NOTFY INSTANCE
      var notyf = new Notyf({
        duration: 3000,
        position: {
          x: "right",
          y: "top",
        },
        dismissible: true,
        icon: true,
      });

      // DISPLAY THE NOTIFICATION
      notyf.error(data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
