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
      const newChatContainer = document.querySelector(".new__chat");

      if (data.plan === "Free Plan") {
        modelToggleButton.style.display = "none";
        newChatContainer.style.marginTop = "2rem";
      } else if (
        (data.plan === "Best deals" || data.plan === "Premium plan") &&
        data.expiryDate === "Expired"
      ) {
        modelToggleButton.style.display = "none";
        newChatContainer.style.marginTop = "2rem";
      } else {
        modelToggleButton.style.display = "flex";
        newChatContainer.style.marginTop = "4rem";
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export default checkPlan;
