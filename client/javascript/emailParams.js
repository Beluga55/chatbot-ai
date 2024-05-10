import { notyf } from "./notyfInstance.js";

const verifyEmail = async () => {
  let params = new URLSearchParams(window.location.search);
  let encodedEmail = params.get("email");
  let encodedUsername = params.get("username");
  let email = atob(encodedEmail);
  let username = atob(encodedUsername);

  if (encodedUsername === null) {
    username = null;
  } else {
    // CHANGE THE WINDOW LOCATION HREF WHEN CLICKED THE BUTTON
    const haveAccountLink = document.querySelector(".have-account p a");
    haveAccountLink.href = "user";

    const verifyTips = document.querySelector(".verify__tips p");
    verifyTips.textContent = "You can verify your email later in settings.";
  }

  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/verifySignupEmail",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username }),
    }
  );

  // GET THE RESPONSE
  if (response && response.ok) {
    const data = await response.json();

    // DISPLAY A NOTYF SUCCESS MESSAGE
    notyf.success(data.message);
  } else if (response) {
    const data = await response.json();

    // DISPLAY A NOTYF ERROR MESSAGE
    notyf.error(data.error);
  }
};

verifyEmail();
