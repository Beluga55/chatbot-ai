import bot from "../assets/bot.svg";
import user from "../assets/user.svg";

// FUNCTIONS ON TOP
const form = document.getElementById("chatbot-form");
const submitIcon = document.querySelector(".bx-chevrons-up");
const textarea = document.getElementById("promptTextarea");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.innerHTML = "";

  loadInterval = setInterval(() => {
    element.innerHTML += ".";

    if (element.textContent === "....") {
      element.innerHTML = "";
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

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? "bot" : "user"}"
            />
          </div>
          <div class="message">
            <p id=${uniqueId}>${value}</p>
          </div>
        </div>
      </div>
    `;
}

// LOAD CHAT HISTORY
document.addEventListener("DOMContentLoaded", async function () {
  // Make a request to your server endpoint
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/getAllTitles",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: localStorage.getItem("username"),
      }),
    }
  );

  if (response.ok) {
    const data = await response.json();

    // Update the DOM with the fetched titles
    const navTitleContent = document.querySelector(".nav__title-content");

    if (data.titlesAndRandomIDs && data.titlesAndRandomIDs.length > 0) {
      // Clear existing content in navTitleContent before appending
      navTitleContent.innerHTML = "";

      // Create a paragraph for each title and randomID and append it to navTitleContent
      data.titlesAndRandomIDs.forEach((titleAndRandomID) => {
        const paragraph = document.createElement("p");
        const span = document.createElement("span");
        paragraph.classList.add("title");
        span.textContent = `${titleAndRandomID.titles}` || "Default Title";

        // Set a unique id for each paragraph based on the index
        paragraph.id = `${titleAndRandomID.randomID}`;

        const tripleDot = document.createElement("i");
        tripleDot.classList.add("bx");
        tripleDot.classList.add("bx-trash-alt");

        navTitleContent.appendChild(paragraph);
        paragraph.appendChild(span);
        paragraph.appendChild(tripleDot);
      });
    }
  }
});

// TRIGGERS AND CLOSE THE USER MENU
const userMenu = document.querySelector(".nav__user-selection");
const userSelection = document.querySelector(".nav__user-content");

userSelection.addEventListener("click", () => {
  userMenu.classList.add("show");

  // Add event listener to the document body
  document.body.addEventListener("click", closeMenu);
});

function closeMenu(event) {
  // Check if the click was outside the user menu and its trigger
  if (
    !userMenu.contains(event.target) &&
    !userSelection.contains(event.target)
  ) {
    userMenu.classList.remove("show");
    // Remove the event listner when the menu is closed
    document.body.removeEventListener("click", closeMenu);
  }
}

// DELETE DOCUMENT FROM DATABASE
const deleteButton = document.getElementById("delete-all-conversation");
const overflowMenu = document.querySelector(".overflow__delete-menu");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

deleteButton.addEventListener("click", () => {
  navMenu.classList.remove("show");
  userMenu.classList.remove("show");
  overflowMenu.classList.add("show");
});

yesBtn.addEventListener("click", async function () {
  navMenu.classList.remove("show");
  try {
    const response = await fetch(
      "https://chatbot-rreu.onrender.com/deleteAllData",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: localStorage.getItem("username"),
        }),
      }
    );

    if (response.ok) {
      const navTitleContent = document.querySelector(".nav__title-content");
      navTitleContent.innerHTML = "";
      chatContainer.innerHTML = "";
      chatContainer.classList.value = "";
      overflowMenu.classList.remove("show");
    } else {
      console.error(
        `Server returned ${response.status}: ${await response.text()}`
      );
    }
  } catch (error) {
    console.error(error);
  }
});

noBtn.addEventListener("click", () => {
  overflowMenu.classList.remove("show");
});

// CLICK TITLE TO RETRIEVE RESPONSE FROM DATABASE
const parentContainer = document.querySelector(".nav__title-content");

parentContainer.addEventListener("click", async function (event) {
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
        await response.json();

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
});

// WHEN CLICK THE NEW CHAT BUTTON, IT CLEAR THE CLASS VALUE
const newChatBtn = document.querySelector(".new__chat");
const navMenu = document.querySelector(".nav__menu");

newChatBtn.addEventListener("click", () => {
  chatContainer.innerHTML = "";
  chatContainer.classList.value = "";
  navMenu.classList.remove("show");
  var activeTitles = document.querySelectorAll(".active__title");
  activeTitles.forEach(function (title) {
    title.classList.remove("active__title");
  });
});

const handleSubmit = async () => {
  event.preventDefault();

  // Declare the status variable outside the if-else block
  let status;

  // Check if the element has any classes
  if (chatContainer.classList.length > 0) {
    // If chatContainer has classes, set status to true
    status = true;
  } else {
    // If chatContainer has no classes, set status to false
    status = false;
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

  // https://chatbot-rreu.onrender.com/

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
};

form.addEventListener("submit", handleSubmit);

submitIcon.addEventListener("click", () => {
  handleSubmit();
  textarea.style.height = "auto";
});

form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13 && !e.shiftKey) {
    handleSubmit(e);
  }
});

// TRIGGERS THE POPUP MENU
const triggerUploadMenu = document.getElementById("upload-profile-picture");
const triggerMenu = document.querySelector(".preview__image");
const closePreview = document.getElementById("close-preview");
const uploadButton = document.getElementById("upload-button");
const uploadImage = document.getElementById("upload-image");
const chosenImage = document.getElementById("preview-image");
const formUploadImage = document.getElementById("form-upload-image");

triggerUploadMenu.addEventListener("click", () => {
  triggerMenu.classList.add("show");
});

closePreview.addEventListener("click", () => {
  triggerMenu.classList.remove("show");
  chosenImage.style.display = "none";
  formUploadImage.reset();
});

function handleImageInputChange(inputElement) {
  const selectedImage = inputElement.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    chosenImage.src = event.target.result;
    chosenImage.style.display = "block";
    uploadImage.style.marginTop = "1rem";
  };
  reader.readAsDataURL(selectedImage);
}

// AFTER USERS HAS SELECTED THE IMAGE
uploadImage.addEventListener("change", () => {
  handleImageInputChange(uploadImage);
});

// UPLOAD THE IMAGE TO THE BACKEND TO PROCESS
uploadButton.addEventListener("click", async function (e) {
  e.preventDefault();

  const formData = new FormData(formUploadImage);

  try {
    const response = await fetch("http://localhost:5001/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    // Handle Successful Upload
    console.log(data.message);
  } catch (error) {
    console.error("Error uploading image:", error);
  }
});
