import { Notyf } from "notyf";

const verifyEmail = async () => {
  let params = new URLSearchParams(window.location.search);
  let encodedEmail = params.get("email");
  let encodedUsername = params.get("username");
  let email = atob(encodedEmail);
  let username = atob(encodedUsername);
  let response = "";

  if (encodedUsername === null) {
    username = null;
  } else {
    // CHANGE THE WINDOW LOCATION HREF WHEN CLICKED THE BUTTON
    const haveAccountLink = document.querySelector(".have-account p a");
    haveAccountLink.href = "user";

    const verifyTips = document.querySelector(".verify__tips p");
    verifyTips.textContent = "You can verify your email later in settings.";
  }

  if (!sessionStorage.getItem("fetchMade")) {
    response = await fetch(
      "https://chatbot-rreu.onrender.com/users/verifySignupEmail",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username }),
      }
    );

    sessionStorage.setItem("fetchMade", "true");
  }

  // GET THE RESPONSE
  if (response.ok) {
    const data = await response.json();

    // DISPLAY A NOTYF SUCCESS MESSAGE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    notyf.success(data.message);
  } else {
    const data = await response.json();

    // DISPLAY A NOTYF ERROR MESSAGE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    notyf.error(data.error);
  }
};

verifyEmail();
