async function plansButtons() {
  const clickedButton = this;
  const clickedButtonId = clickedButton.id;
  const premiumPlan = document.getElementById("premium-plan").textContent;
  const bestDeals = document.getElementById("best-deals").textContent;
  const username = localStorage.getItem("username");

  if (clickedButtonId === "pricing__free-button") {
    // CHECK WHETHER THE USERS HAVE LOGIN OR NOT
    // IF NOT, REDIRECT THEM TO LOGIN PAGE
    // IF YES, REDIRECT THEM TO THE SELECT SERVICE PAGE

    if (username) {
      window.location.href = "selectService.html";
    } else {
      window.location.href = "login.html";
    }
  } else if (clickedButtonId === "pricing__monthly-button") {
    if (username) {
      const response = await fetch(
        "https://chatbot-rreu.onrender.com/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: premiumPlan,
            username: username,
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
    } else {
      // Store the intended action
      localStorage.setItem("intendedAction", premiumPlan);
      window.location.href = "login.html";
    }
  } else if (clickedButtonId === "pricing__yearly-button") {
    if (username) {
      const response = await fetch(
        "https://chatbot-rreu.onrender.com/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: bestDeals,
            username: username,
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
    } else {
      // Store the intended action
      localStorage.setItem("intendedAction", bestDeals);
      window.location.href = "login.html";
    }
  }
}

export { plansButtons };
export const buttons = document.querySelectorAll(".pricing__buttons");
