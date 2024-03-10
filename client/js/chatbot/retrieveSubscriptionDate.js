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
      } else if (data.roundedDays !== 0) {
        // APPEND TO THE PARAGRAPHS
        subscriptionDate.textContent = `Expires: ${data.roundedDays} days left`;
      } else {
        subscriptionDate.innerHTML = `${data.expiryMessage} , <a href="pricing.html">Renew Now</a>`;
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}

export default retrieveSubscriptionDate;
