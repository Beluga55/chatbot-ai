import chatStripe from "./chatStripe";
import generateUniqueId from "./generateUniqueId";

async function retrieveChatHistory(event) {
  const navMenu = document.querySelector(".nav__menu");
  const chatContainer = document.getElementById("chat_container");
  const clickedElement = event.target.closest(".title");

  if (clickedElement) {
    // Extract the ID from the clicked element's id attribute
    const randomID = clickedElement.id;
    navMenu.classList.remove("show");

    // Remove active__title class from all titles
    const allTitles = document.querySelectorAll(".title");
    allTitles.forEach((title) => title.classList.remove("active__title"));

    // Add active__title class to the clicked title
    clickedElement.classList.add("active__title");

    // REMOVE THE SKIP RESPONSE BUTTON IF IT EXISTS
    const skipButton = document.getElementById("skip-response");
    skipButton.style.opacity = "0";
    skipButton.style.visibility = "hidden";

    const response = await fetch(
      "https://chatbot-rreu.onrender.com/retrieveHistory",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          randomID: randomID,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      chatContainer.innerHTML = "";
      // Assuming data.prompts and data.responses have the same length
      for (let i = 0; i < data.prompts.length; i++) {
        // Append user message
        chatContainer.innerHTML += chatStripe(false, data.prompts[i]);

        // Append response message
        const uniqueId = generateUniqueId();
        chatContainer.innerHTML += chatStripe(
          true,
          data.responses[i],
          uniqueId
        );
      }
      chatContainer.classList.value = "";
      chatContainer.classList.add(`${data.randomID}`);
    } else {
      console.error(
        `Server returned ${response.status}: ${await response.text()}`
      );
    }
  }
  // DELETE ONLY ONE CHAT HISTORY
  if (
    event.target.classList.contains("bx") &&
    event.target.classList.contains("bx-trash-alt")
  ) {
    // If the clicked element is the trash icon
    const titleElement = event.target.closest(".title");
    // console.log(titleElement);
    if (titleElement) {
      const titleID = titleElement.id;

      titleElement.remove();

      const response = await fetch(
        "https://chatbot-rreu.onrender.com/delOneConver",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titleID: titleID,
          }),
        }
      );

      if (response.ok) {
        chatContainer.innerHTML = "";
        chatContainer.classList.value = "";
        navMenu.classList.remove("show");
      } else {
        console.error(
          `Server returned ${response.status}: ${await response.text()}`
        );
      }
    }
  }
}

export default retrieveChatHistory;
export const parentContainer = document.querySelector(".nav__title-content");
