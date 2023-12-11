const validateEmailBtn = document.getElementById("verify-email-address");
const validateEmailForm = document.querySelector(".reset__password-form");

function validateEmail(email) {
  // Regular expression for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateEmailValue() {
  const errorTxt = document.querySelector(".error__text");
  errorTxt.style.display = "none";

  var email = document.getElementById("reset-password-email").value;

  if (email.trim() === "") {
    errorTxt.style.display = "block";
    errorTxt.style.color = "red";
    errorTxt.innerText = "Email cannot be empty!";
    return false;
  } else if (!validateEmail(email)) {
    errorTxt.style.display = "block";
    errorTxt.style.color = "red";
    errorTxt.innerText = "Invalid Email Format!";
    return false;
  }
  return true;
}

async function submitEmail(event) {
  event.preventDefault();

  if (!validateEmailValue()) {
    event.preventDefault();
    return;
  }

  var email = document.getElementById("reset-password-email").value;

  const response = await fetch(
    "https://chatbot-rreu.onrender.com/validateEmail",
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
      const result = await response.json();

      // Output the link to the frontend
      const successTxt = document.querySelector(".error__text");
      successTxt.style.display = "block";
      successTxt.style.color = "lime";
      successTxt.innerText = `${result.message}`;
    } else {
      const error = await response.json();
      const successTxt = document.querySelector(".error__text");
      successTxt.style.display = "block";
      successTxt.style.color = "red";
      successTxt.innerText = `${error.message}`;
    }
  } catch (error) {
    console.error("An error occurred while processing the request:", error);
  }
}

validateEmailBtn.addEventListener("click", function (e) {
  submitEmail(e);
});
