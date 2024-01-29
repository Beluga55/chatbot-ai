async function checkPlan() {
  const username = localStorage.getItem("username");

  const response = await fetch("https://chatbot-rreu.onrender.com/checkPlan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  try {
    if (response.ok) {
      const data = await response.json();
      const modelToggleButton = document.querySelector(
        ".nav__models-desktop-buttons"
      );

      if (data.plan === "Free Plan") {
        modelToggleButton.style.display = "none";
      } else if (data.plan === "Best deals" || data.plan === "Premium plan") {
        modelToggleButton.style.display = "flex";
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export default checkPlan;
