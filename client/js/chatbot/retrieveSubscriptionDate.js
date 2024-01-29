async function retrieveSubscriptionDate() {
  // Retrieve the subscription date from the database
  // Return the subscription date
  const username = localStorage.getItem("username");

  const response = await fetch(
    "https://chatbot-rreu.onrender.com/retrieve-subscription-date",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
      }),
    }
  );

  try {
    if (response.ok) {
      const data = await response.json();
      const subscriptionDate = document.querySelector(".nav__expired-date");

      if (data.plan === "Free Plan") {
        subscriptionDate.textContent = `Plan: ${data.plan}`;
      } else {
        // APPEND TO THE PARAGRAPHS
        subscriptionDate.textContent = `Expires: ${data.roundedDays} days left`;
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}

export default retrieveSubscriptionDate;
