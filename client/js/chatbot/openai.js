import chatStripe from "./chatStripe";
import generateUniqueId from "./generateUniqueId";

let loadInterval;

function loader(element) {
  element.innerHTML = "";

  loadInterval = setInterval(() => {
    element.innerHTML += ".";

    if (element.textContent === "....") {
      element.innerHTML = ".";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  const interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

async function handleSubmit() {
  event.preventDefault();

  const chatContainer = document.getElementById("chat_container");

  // Declare the status variable outside the if-else block
  let status;

  // Check if the element has any classes
  if (chatContainer.classList.length > 0) {
    // If chatContainer has classes, set status to true
    status = true;
  } else {
    // If chatContainer has no classes, set status to false
    status = false;
    chatContainer.innerHTML = "";
  }

  const getRandomID = chatContainer.getAttribute("class");
  const data = new FormData(form);
  const userPrompt = data.get("prompt");

  // User's chatstripe
  chatContainer.innerHTML += chatStripe(false, userPrompt);

  form.reset();

  // Bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  const response = await fetch("https://chatbot-rreu.onrender.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: userPrompt,
      username: localStorage.getItem("username"),
      status: status,
      randomID: getRandomID,
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const botResponse = data.bot.trim();

    // Append a span inside with innerHTML
    const navTitleContent = document.querySelector(".nav__title-content");

    if (data.status === false) {
      const paragraph = document.createElement("p");
      const span = document.createElement("span");
      const tripleDot = document.createElement("i");
      paragraph.classList.add("title");
      tripleDot.classList.add("bx");
      tripleDot.classList.add("bx-trash-alt");
      paragraph.id = `${data.randomID}`;
      chatContainer.classList.add(`${data.randomID}`);
      span.textContent = data.generatedTitle || "Default Title";
      navTitleContent.appendChild(paragraph);
      paragraph.appendChild(span);
      paragraph.appendChild(tripleDot);
    }

    typeText(messageDiv, botResponse);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

function iconSubmit() {
  const textarea = document.getElementById("promptTextarea");
  handleSubmit();
  textarea.style.height = "auto";
}

function submitOnEnter(e) {
  const textarea = document.getElementById("promptTextarea");
  if (e.keyCode === 13 && !e.shiftKey) {
    handleSubmit(e);
    textarea.style.height = "auto";
  }
}

export { handleSubmit, iconSubmit, submitOnEnter };
export const form = document.getElementById("chatbot-form");
export const submitIcon = document.querySelector(".bx-chevrons-up");
