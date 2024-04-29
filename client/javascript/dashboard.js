import hljs from "highlight.js";
import { Notyf } from "notyf";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

// Function to escape HTML special characters
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Get the parent elements
const parentElements = document.querySelectorAll(
  ".nav__chat-history-title, .dashboard__sidebar-desktop"
);

// CHATBOT FUNCTIONALITY - FUNCTIONS
const submitOnEnter = (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    handleSubmit(event);
  }
};

const chatStripe = (isAi, value, uniqueId) => {
  return `
    <div class="chat__stripe ${isAi ? "ai" : "user"}">
      <div class="chat__wrapper">
        <div class="profile__image">
        ${
          isAi
            ? ""
            : '<img src="../assets/empty-user.png" alt="Profile Image" />'
        }
        </div>
        <div class="chat__content">
          <div id="${uniqueId}" class="chat__content-div">${value}</div>
        </div>
      </div>
    </div>
  `;
};

const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
};

// MAKE A FUNCTION FOR THE PARAGRAPH TITLE ELEMENT
const titleWrapper = (title, id) => {
  return `
    <div class="nav__title-wrapper">
      <div class="nav__title-content">
        <div>
          <i class="bx bx-message"></i>
          <p id="${id}">${title}</p>
        </div>
      </div>
    </div>
  `;
};

// CHAT GREETINGS LAYOUT
const chatGreeting = () => {
  return `
    <div class="chat__container-greeting">
      <div class="chat__greeting">
        <h2 class="poppins-extrabold">How can I help you today?</h2>
        <p>
          Hello! I'm your chat companion, driven by the powerful API
          from Gemini. Ask away or just chat casually — I'm here for a
          simple and enjoyable conversation!
        </p>
      </div>
    </div>
  `;
};

const handleSubmit = async (event) => {
  event.preventDefault();

  // GET THE DASHBOARD CHAT WRAPPER
  const chatWrapper = document.getElementById("dashboard__chat");

  // GET THE FORM
  const form = document.querySelector(".dashboard__form");

  // GET THE FORMDATA
  const getTitleId = chatWrapper.getAttribute("class");
  const data = new FormData(form);
  const userPrompt = data.get("prompt");

  // CHECK IF THE USER PROMPT IS EMPTY
  if (userPrompt === "") {
    // GENERATE A NEW NOTFY INSTANCE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // DISPLAY THE NOTIFICATION
    notyf.error("Please provide a prompt!");
    return;
  }

  // DEFINE THE STATUS WHETHER IS TRUE OR FALSE
  let status;

  // CHECK THE CONTAINER ELEMENT HAS ANY CLASSES
  if (chatWrapper.classList.length > 0) {
    status = true;
  } else {
    status = false;
    chatWrapper.innerHTML = "";
  }

  // RESET THE TEXTAREA VALUE AND CHAT WRAPPER
  chatInput.value = "";

  const uniqueId = generateUniqueId();

  // CREATE A STRING WITH THE chat__stripe-wrapper DIV AND THE CHAT STRIPES
  const chatStripeWrapper = `
  <div class="chat__stripe-wrapper">
    ${chatStripe(false, escapeHtml(userPrompt))}
    ${chatStripe(true, " ", uniqueId)}
  </div>
`;

  // APPEND THE chat__stripe-wrapper DIV AND THE CHAT STRIPES TO THE chatWrapper
  chatWrapper.innerHTML += chatStripeWrapper;

  // BEFORE ADDING REMOVE IT FIRST
  const allChatStripeWrapper = document.querySelectorAll(
    ".chat__stripe-wrapper"
  );

  allChatStripeWrapper.forEach((chatStripeWrapper) => {
    chatStripeWrapper.style.minHeight = "initial";
  });

  // ADD THE MIN HEIGHT TO THE chat__stripe-wrapper
  const chatStripeWrapperDiv = document.querySelector(
    ".chat__stripe-wrapper:last-child"
  );
  chatStripeWrapperDiv.style.minHeight = "717px";

  // Get the user's chat stripe within the last chat__stripe-wrapper
  const userChatStripe =
    chatStripeWrapperDiv.querySelector(".chat__stripe.user");

  // Calculate the scroll position
  let scrollPosition = userChatStripe
    ? userChatStripe.offsetTop - 100
    : chatWrapper.scrollHeight;

  chatWrapper.scrollTop = scrollPosition;

  // GET THE MESSAGE DIV ID
  const messageDiv = document.getElementById(uniqueId);

  messageDiv.innerHTML = "Generating response...";

  // TEXTAREA RESET TO ONE ROWS
  chatInput.rows = 1;

  // FETCH THE AI RESPONSE
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/chatbot",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userPrompt,
        username: localStorage.getItem("username"),
        status,
        titleId: getTitleId,
      }),
    }
  );

  // PARSE THE RESPONSE
  if (response.ok) {
    const data = await response.json();

    // CHANGE THE CURRENT TITLE ON TOP
    const navTitle = document.querySelector(".current__title");

    // IF THE CURRENT TITLE IS CHATBOT AI
    if (navTitle.textContent === "Chatbot AI") {
      navTitle.textContent = data.title;
      navTitle.removeAttribute("href");
    }

    let geminiResponse = data.response.trim();

    // CHECK THE STATUS
    if (data.status === false) {
      const title = data.title.trim();
      const titleElement = titleWrapper(title, data.titleId);

      // APPEND THE TITLE ELEMENT
      const navChatHistoryMobile = document.querySelector(
        ".nav__chat-history-title"
      );
      const navChatHistoryDesktop = document.querySelector(
        ".dashboard__sidebar-desktop"
      );

      navChatHistoryMobile.innerHTML += titleElement;
      navChatHistoryDesktop.innerHTML += titleElement;

      chatWrapper.classList.add(`${data.titleId}`);
    }

    // Placeholder for code blocks
    const placeholders = [];

    // Index for placeholders
    let i = 0;

    // CHECK IF THE RESPONSE CONTAINS A CODE BLOCK
    if (geminiResponse.includes("```")) {
      geminiResponse = geminiResponse.replace(
        /```(\w*)\n([\s\S]*?)```/g,
        (match, p1, p2) => {
          // Create a new div element for the block
          let blockDiv = document.createElement("div");
          blockDiv.className = "coding-block";

          // Create a new span element for the title
          let titleSpan = document.createElement("span");
          titleSpan.className = "code-title";
          // Create a new text node with the language title
          let titleTextNode = document.createTextNode(p1.toUpperCase());

          // Append the title text node to the title span
          titleSpan.appendChild(titleTextNode);

          // Append the title span to the block div
          blockDiv.appendChild(titleSpan);

          // Create a new span element for the code
          let codeSpan = document.createElement("pre");
          let code = document.createElement("code");
          code.className = "hljs";
          // Create a new text node with the code
          let codeTextNode = document.createTextNode(p2);
          // Append the code text node to the code span
          codeSpan.appendChild(code);
          code.appendChild(codeTextNode);

          // Append the code span to the block div
          blockDiv.appendChild(codeSpan);

          // Create a new div element for the caution message
          let cautionDiv = document.createElement("div");
          cautionDiv.className = "caution-block";

          // Create a new p element for the caution message
          let cautionP = document.createElement("p");
          // Create a new text node with the caution message
          let cautionTextNode = document.createTextNode(
            "Use code with caution"
          );
          // Append the caution text node to the caution p element
          cautionP.appendChild(cautionTextNode);

          // Create a new i element for the copy icon
          let copyIcon = document.createElement("i");
          copyIcon.className = "bx bx-copy-alt";

          // Append the caution p element and the copy icon to the caution div
          cautionDiv.appendChild(cautionP);
          cautionDiv.appendChild(copyIcon);

          // Append the caution div to the block div
          blockDiv.appendChild(cautionDiv);

          // Store the block div element in the placeholders array
          placeholders[i] = blockDiv.outerHTML;
          // Return a placeholder for the block div element
          return `PLACEHOLDER${i++}`;
        }
      );

      // Replace the placeholders with the original code blocks
      geminiResponse = geminiResponse.replace(
        /PLACEHOLDER(\d+)/g,
        (match, p1) => {
          let block = placeholders[p1];
          let blockElement = document.createElement("div");
          blockElement.innerHTML = block;
          hljs.highlightElement(blockElement.querySelector(".hljs"));
          return blockElement.innerHTML;
        }
      );

      // Create a new renderer
      let renderer = new marked.Renderer();

      // Override the code block rendering to return the code as is
      renderer.code = function (code, language) {
        return `<pre><code class="hljs">${code}</code></pre>`;
      };

      // Override the paragraph rendering to return the text as is
      renderer.paragraph = function (text) {
        return text;
      };

      // Override the codespan rendering to return the code as is
      renderer.codespan = function (text) {
        return text;
      };

      // Set the options to use the new renderer
      marked.setOptions({
        renderer: renderer,
      });

      // Format the markdown in the response
      geminiResponse = marked(geminiResponse);

      // CHANGE THE AI INNERHTML TO THE RESPONSE
      messageDiv.innerHTML = geminiResponse;

      // Add the animation
      messageDiv.style.animation = "fadeIn 1s ease-in-out";
    } else {
      // CLEAR THE MESSAGE DIV
      messageDiv.innerHTML = "";

      geminiResponse = escapeHtml(geminiResponse);

      // Format the markdown in the response
      geminiResponse = marked(geminiResponse);

      // CHANGE THE AI INNERHTML TO THE RESPONSE
      messageDiv.innerHTML = geminiResponse;

      // Add the animation
      messageDiv.style.animation = "fadeIn 1s ease-in-out";
    }
  } else {
    // PARSE THE RESPONSE
    const data = await response.json();

    // Get the last chat__stripe-wrapper within dashboard__chat
    const lastChatStripeWrapper = chatWrapper.querySelector(
      ".chat__stripe-wrapper:last-child"
    );

    // Remove the last chat__stripe-wrapper
    if (lastChatStripeWrapper) {
      lastChatStripeWrapper.remove();
    }

    // DISPLAY THE NOTIFICATION
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    notyf.error(data.message);
  }
};

// GET THE TEXTAREA INPUT AND THE ICON
const chatInput = document.querySelector(".dashboard__input");
const chatIcon = document.querySelector(".bx-chevrons-up");

// CHATBOT FUNCTIONALITY - EVENT LISTENERS
chatInput.addEventListener("keydown", submitOnEnter);
chatIcon.addEventListener("click", handleSubmit);

// GET ALL THE TITLES FROM THE DATABASE AND RENDER THEM
const getTitles = async () => {
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/getTitles",
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

  // PARSE THE RESPONSE
  if (response.ok) {
    const data = await response.json();

    // GET THE NAV CHAT HISTORY ELEMENTS
    const navChatHistoryMobile = document.querySelector(
      ".nav__chat-history-title"
    );
    const navChatHistoryDesktop = document.querySelector(
      ".dashboard__sidebar-desktop"
    );

    // LOOP THROUGH THE DATA AND PUT THE ID INTO THE TITLE ELEMENT
    data.titles.forEach((title, index) => {
      const id = data.titleId[index];
      const titleElement = titleWrapper(title, id);

      // APPEND THE TITLE ELEMENT
      navChatHistoryMobile.innerHTML += titleElement;
      navChatHistoryDesktop.innerHTML += titleElement;
    });
  }
};

// CALL THE FUNCTION
document.addEventListener("DOMContentLoaded", getTitles);

// DELETE CHAT TOGGLE
const deleteChatId = document.getElementById("delete-chat");

deleteChatId.addEventListener("click", () => {
  const deleteOverlay = document.querySelector(".dashboard__delete-overlay");

  deleteOverlay.classList.toggle("active");

  // REMOVE THE ACTIVE CLASS FROM THE CHAT CONTROL SETTINGS
  const chatControlsOverlay = document.querySelector(".chat__control");
  chatControlsOverlay.classList.remove("active");
});

// CLOSE THE DELETE CHAT OVERLAY
const cancelDeleteButtons = document.querySelector(
  ".dashboard__delete-buttons > button:first-child"
);

cancelDeleteButtons.addEventListener("click", () => {
  const deleteOverlay = document.querySelector(".dashboard__delete-overlay");
  deleteOverlay.classList.remove("active");
});

// GET THE DELETE CHAT BUTTON
const deleteButton = document.querySelector(
  ".dashboard__delete-buttons > button:last-child"
);

// DELETE CHAT FUNCTIONALITY
const deleteChat = async () => {
  // GET THE DASHBOARD CHAT WRAPPER
  const titleId = document
    .getElementById("dashboard__chat")
    .getAttribute("class");

  if (!titleId) {
    // GENERATE A NEW NOTFY INSTANCE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // DISPLAY THE NOTIFICATION
    notyf.error("Please select a chat to delete!");

    // REMOVE THE ACTIVE CLASS
    const deleteOverlay = document.querySelector(".dashboard__delete-overlay");
    deleteOverlay.classList.remove("active");
    return;
  }

  // FETCH THE DELETE CHAT
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/deleteSingleChat",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titleId,
      }),
    }
  );

  // PARSE THE RESPONSE
  if (response.ok) {
    const data = await response.json();
    const deleteOverlay = document.querySelector(".dashboard__delete-overlay");

    // CHANGE THE CURRENT TITLE ON TOP
    const navTitle = document.querySelector(".current__title");
    navTitle.textContent = "Chatbot AI";
    navTitle.setAttribute("href", "index");

    // REMOVE THE TITLE ELEMENT
    const allTitleContent = document.querySelectorAll(".nav__title-wrapper");
    // GET THE DASHBOARD CHAT WRAPPER
    const chatWrapper = document.getElementById("dashboard__chat");

    allTitleContent.forEach((title) => {
      if (title.querySelector("p").id === titleId) {
        title.remove();
        chatWrapper.className = "";
      }
    });

    deleteOverlay.classList.remove("active");

    chatWrapper.innerHTML = chatGreeting();

    // Initisalize the notyf
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // Display the notification
    notyf.success(data.message);
  } else {
    // Initialize the notyf
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // Display the notification
    notyf.error("Something went wrong!");
  }
};

// ADD EVENT LISTENER TO THE DELETE BUTTON
deleteButton.addEventListener("click", deleteChat);

// RETRIEVE THE CHAT HISTORY WHEN CLICKED THE TITLE
const retrieveChatHistory = (parentElements) => {
  parentElements.forEach((parentElement) => {
    parentElement.addEventListener("click", async (event) => {
      const titleContent = event.target.closest(".nav__title-content");

      if (!titleContent) return;

      let title = titleContent.querySelector("p").textContent;

      const titleId = titleContent.querySelector("p").id;

      // FETCH THE CHAT HISTORY
      const response = await fetch(
        "https://chatbot-rreu.onrender.com/users/retrieveChatHistory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titleId,
          }),
        }
      );

      // PARSE THE RESPONSE
      if (response.ok) {
        const data = await response.json();

        // GET THE NAV TITLE
        const navTitle = document.querySelector(".current__title");

        // CHANGE THE CURRENT TITLE ON TOP
        if (navTitle.textContent !== title) {
          navTitle.textContent = title;
          navTitle.removeAttribute("href");
        }

        // GET THE DASHBOARD CHAT WRAPPER
        const chatWrapper = document.getElementById("dashboard__chat");

        // CLEAR THE CHAT WRAPPER CLASSLIST
        chatWrapper.className = "";
        chatWrapper.innerHTML = "";
        chatWrapper.classList.add(titleId);

        // LOOP THROUGH THE PROMPTS AND RESPONSES
        // Placeholder for code blocks
        const placeholders = [];

        data.prompts.forEach((prompt, index) => {
          let response = data.responses[index];
          let i = 0;

          // CHECK IF THE RESPONSE CONTAINS A CODE BLOCK
          if (response.includes("```")) {
            response = response.replace(
              /```(\w*)\n([\s\S]*?)```/g,
              (match, p1, p2) => {
                // Create a new div element for the block
                let blockDiv = document.createElement("div");
                blockDiv.className = "coding-block";

                // Create a new span element for the title
                let titleSpan = document.createElement("span");
                titleSpan.className = "code-title";

                // Create a new text node with the language title
                let titleTextNode = document.createTextNode(p1.toUpperCase());

                // Append the title text node to the title span
                titleSpan.appendChild(titleTextNode);

                // Append the title span to the block div
                blockDiv.appendChild(titleSpan);

                // Create a new span element for the code
                let codeSpan = document.createElement("pre");
                let code = document.createElement("code");
                code.className = "hljs";
                // Create a new text node with the code
                let codeTextNode = document.createTextNode(p2);
                // Append the code text node to the code span
                codeSpan.appendChild(code);
                code.appendChild(codeTextNode);

                // Append the code span to the block div
                blockDiv.appendChild(codeSpan);

                // Create a new div element for the caution message
                let cautionDiv = document.createElement("div");
                cautionDiv.className = "caution-block";

                // Create a new p element for the caution message
                let cautionP = document.createElement("p");
                // Create a new text node with the caution message
                let cautionTextNode = document.createTextNode(
                  "Use code with caution"
                );
                // Append the caution text node to the caution p element
                cautionP.appendChild(cautionTextNode);

                // Create a new i element for the copy icon
                let copyIcon = document.createElement("i");
                copyIcon.className = "bx bx-copy-alt";

                // Append the caution p element and the copy icon to the caution div
                cautionDiv.appendChild(cautionP);
                cautionDiv.appendChild(copyIcon);

                // Append the caution div to the block div
                blockDiv.appendChild(cautionDiv);

                // Store the block div element in the placeholders array
                placeholders[i] = blockDiv.outerHTML;
                // Return a placeholder for the block div element
                return `PLACEHOLDER${i++}`;
              }
            );
          }

          // Replace the placeholders with the original code blocks
          response = response.replace(/PLACEHOLDER(\d+)/g, (match, p1) => {
            let block = placeholders[p1];
            let blockElement = document.createElement("div");
            blockElement.innerHTML = block;
            hljs.highlightElement(blockElement.querySelector(".hljs"));
            return blockElement.innerHTML;
          });

          // Create a new renderer
          let renderer = new marked.Renderer();

          // Override the code block rendering to return the code as is
          renderer.code = function (code, language) {
            return `<pre><code class="hljs">${code}</code></pre>`;
          };

          // Override the paragraph rendering to return the text as is
          renderer.paragraph = function (text) {
            return text;
          };

          // Override the codespan rendering to return the code as is
          renderer.codespan = function (text) {
            return text;
          };

          // Set the options to use the new renderer
          marked.setOptions({
            renderer: renderer,
          });

          // Format the markdown in the response
          response = marked(response);

          // CREATE A STRING WITH THE chat__stripe-wrapper DIV AND THE CHAT STRIPES
          const chatStripeWrapper = `
            <div class="chat__stripe-wrapper">
              ${chatStripe(false, escapeHtml(prompt))}
              ${chatStripe(true, response)}
            </div>
          `;

          // APPEND THE chat__stripe-wrapper DIV AND THE CHAT STRIPES TO THE chatWrapper
          chatWrapper.innerHTML += chatStripeWrapper;
        });

        // ADD THE MIN HEIGHT TO THE chat__stripe-wrapper
        const chatStripeWrapperDiv = document.querySelector(
          ".chat__stripe-wrapper:last-child"
        );

        chatStripeWrapperDiv.style.minHeight = "717px";

        // Get the user's chat stripe within the last chat__stripe-wrapper
        const userChatStripe =
          chatStripeWrapperDiv.querySelector(".chat__stripe.user");

        // Calculate the scroll position
        let scrollPosition = userChatStripe
          ? userChatStripe.offsetTop - 100
          : chatWrapper.scrollHeight;

        // Scroll to the calculated position
        chatWrapper.scrollTop = scrollPosition;
      }
    });
  });
};

retrieveChatHistory(parentElements);

// NEW CHAT FUNCTIONALITY
const newChat = document.querySelectorAll(
  ".nav__sidebar-desktop .buttons, .nav__chat-history-content .buttons"
);

// MAKE A FUNCTION THAT CLEAR THE CHAT WRAPPER CLASS NAME AND THE INNER HTML
const clearChatWrapper = () => {
  // CLEAR THE CURRENT TITLE ON TOP
  const navTitle = document.querySelector(".current__title");
  navTitle.textContent = "Chatbot AI";
  navTitle.setAttribute("href", "index");
  const chatWrapper = document.getElementById("dashboard__chat");
  chatWrapper.className = "";
  chatWrapper.innerHTML = chatGreeting();
};

newChat.forEach((button) => {
  button.addEventListener("click", clearChatWrapper);
});

// RENAME CHAT FUNCTIONALITY
const renameChatId = document.getElementById("rename-chat");

renameChatId.addEventListener("click", () => {
  const renameOverlay = document.querySelector(".dashboard__rename-overlay");
  renameOverlay.classList.toggle("active");

  // REMOVE THE ACTIVE CLASS FROM THE CHAT CONTROL SETTINGS
  const chatControlsOverlay = document.querySelector(".chat__control");
  chatControlsOverlay.classList.remove("active");
});

// CLOSE THE RENAME CHAT OVERLAY
const cancelButtons = document.querySelector(
  ".dashboard__rename-buttons > button:first-child"
);

cancelButtons.addEventListener("click", () => {
  const renameOverlay = document.querySelector(".dashboard__rename-overlay");
  renameOverlay.classList.remove("active");
});

// GET THE RENAME CHAT BUTTON
const renameButton = document.querySelector(
  ".dashboard__rename-buttons button:last-child"
);

// RENAME CHAT FUNCTIONALITY
const renameChat = async () => {
  // GET THE CLASS FROM THE CHAT CONTAINER
  const titleId = document
    .getElementById("dashboard__chat")
    .getAttribute("class");

  if (!titleId) {
    // GENERATE A NEW NOTFY INSTANCE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // DISPLAY THE NOTIFICATION
    notyf.error("Please select a chat to rename!");

    // REMOVE THE ACTIVE CLASS
    const renameOverlay = document.querySelector(".dashboard__rename-overlay");
    renameOverlay.classList.remove("active");
    return;
  }

  // GET THE NEW TITLE
  const newTitle = document.querySelector(
    ".dashboard__rename-overlay input"
  ).value;

  // CHECK THE NEW TITLE IS EMPTY IF YES RETURN
  if (newTitle === "") {
    // GENERATE A NEW NOTFY INSTANCE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // DISPLAY THE NOTIFICATION
    notyf.error("New Title Can't Be Empty!");
    return;
  }

  // NEW TITLE MUST BE LESS THAN OR EQUAL TO 5 WORDS
  if (newTitle.split(" ").length > 5) {
    // GENERATE A NEW NOTFY INSTANCE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // DISPLAY THE NOTIFICATION
    notyf.error("New Title Can't Be More Than 5 Words!");
    return;
  }

  const currentTitle = document.querySelector(".current__title").textContent;

  // CHECK THE TITLE IS THE SAME AS THE NEW TITLE
  if (currentTitle.trim() === newTitle.trim()) {
    // GENERATE A NEW NOTFY INSTANCE
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // DISPLAY THE NOTIFICATION
    notyf.error("New Title Can't Be The Same As The Old One!");
    return;
  }

  // FETCH THE RENAME CHAT
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/renameChat",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titleId,
        newTitle,
      }),
    }
  );

  // PARSE THE RESPONSE
  if (response.ok) {
    const data = await response.json();

    const renameOverlay = document.querySelector(".dashboard__rename-overlay");

    // CHANGE THE CURRENT TITLE ON TOP
    const navTitle = document.querySelector(".current__title");
    navTitle.textContent = newTitle;

    // FIND THE TITLE ELEMENT WITH THE ID
    const titleElement = document.querySelectorAll(`[id="${titleId}"]`);

    // CHANGE THE TITLE ELEMENT INNERHTML
    titleElement.forEach((element) => {
      element.textContent = newTitle;
    });

    // CLEAR THE INPUT VALUE
    renameOverlay.querySelector("input").value = "";

    // REMOVE THE ACTIVE CLASS
    renameOverlay.classList.remove("active");

    // Initisalize the notyf
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // Display the notification
    notyf.success(data.message);
  } else {
    // Initialize the notyf
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // Display the notification
    notyf.error("Something went wrong!");
  }
};

// ADD EVENT LISTENER TO THE RENAME BUTTON
renameButton.addEventListener("click", renameChat);

// CHAT CONTROLS OVERLAY TOGGLE
const chatControls = document.querySelectorAll(
  ".nav__menu svg, .nav__link svg"
);

chatControls.forEach((control) => {
  control.addEventListener("click", () => {
    const chatControlsOverlay = document.querySelector(".chat__control");
    chatControlsOverlay.classList.toggle("active");
  });
});

// CLOSE THE CHAT CONTROLS OVERLAY
const bxX = document.querySelectorAll(".bx-x");

bxX.forEach((x) => {
  x.addEventListener("click", () => {
    const chatControlsOverlay = document.querySelector(".chat__control");
    chatControlsOverlay.classList.remove("active");
  });
});

// CLEAR CHAT FUNCTIONALITY
const clearChat = document.getElementById("clear-chat");

// FUNCTION TO FETCH THE CLEAR ALL CHAT
const clearChatFunction = async () => {
  // FETCH THE CLEAR CHAT
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/clearChat",
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

  // PARSE THE RESPONSE
  if (response.ok) {
    const data = await response.json();

    // CLEAR THE CURRENT TITLE ON TOP
    const navTitle = document.querySelector(".current__title");
    navTitle.textContent = "Chatbot AI";

    // REMOVE THE CHAT CONTROL OVERLAY
    const chatControlsOverlay = document.querySelector(".chat__control");
    chatControlsOverlay.classList.remove("active");

    // REMOVE ALL CHAT HISTORY ELEMENTS
    const allTitleContent = document.querySelectorAll(".nav__title-wrapper");

    allTitleContent.forEach((title) => {
      title.remove();
    });

    // GET THE DASHBOARD CHAT WRAPPER
    const chatWrapper = document.getElementById("dashboard__chat");

    // CLEAR THE CHAT WRAPPER CLASSLIST
    chatWrapper.className = "";
    chatWrapper.innerHTML = chatGreeting();

    // Initialize the notyf
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // Display the notification
    notyf.success(data.message);
  } else {
    // Initialize the notyf
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // Display the notification
    notyf.error("Something went wrong!");
  }
};

if (clearChat) {
  clearChat.addEventListener("click", clearChatFunction);
}

// TEXTAREA AUTOSIZE FUNCTIONALITY
const textarea = document.querySelector(".dashboard__input");

textarea.addEventListener("keydown", function (event) {
  if (event.shiftKey && event.key === "Enter") {
    // Prevent the form from being submitted
    event.preventDefault();

    // Increase the rows attribute
    textarea.rows++;

    // Get the cursor's position
    const cursorPosition = textarea.selectionStart;

    // Insert a newline character at the cursor's position
    textarea.value =
      textarea.value.substring(0, cursorPosition) +
      "\n" +
      textarea.value.substring(cursorPosition);

    // Move the cursor to the next line
    textarea.selectionStart = cursorPosition + 1;
    textarea.selectionEnd = cursorPosition + 1;
  }
});

// BACKSPACE REMOVE THE ROWS
textarea.addEventListener("keydown", function (event) {
  if (event.key === "Backspace") {
    // Get the cursor's position
    const cursorPosition = textarea.selectionStart;

    // Check if the character being removed is a newline character
    if (textarea.value[cursorPosition - 1] === "\n") {
      // Decrease the rows attribute
      textarea.rows--;
    }
  }
});

// IF THE TEXTAREA HAVE MULTIPLE LINES WHEN PASTE INCREASE THE ROWS
textarea.addEventListener("paste", () => {
  setTimeout(() => {
    // Increase the rows attribute
    textarea.rows = textarea.value.split("\n").length;
  }, 0);
});

// IF THE TEXTAREA HAS NOTHING, RESET THE ROWS TO 1
textarea.addEventListener("input", () => {
  if (textarea.value === "") {
    textarea.rows = 1;
  }
});

// WHEN THE USER CLICK CTRL + Z, RESET THE ROWS TO THE LAST ROW
textarea.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "z") {
    // Wait until after the undo action has completed
    setTimeout(() => {
      textarea.rows = textarea.value.split("\n").length;
    }, 0);
  }
});

// COPY CODE FUNCTIONALITY
document.addEventListener("click", () => {
  if (event.target.matches(".bx-copy-alt")) {
    let icon = event.target;

    let codingBlock = event.target.closest(".coding-block");

    let codePreElement = codingBlock.querySelector("pre");

    let text = codePreElement.innerText;

    navigator.clipboard.writeText(text).then(
      () => {
        console.log("Copied to clipboard");
        icon.classList.add("copied");

        // Remove the copied class after 2 seconds
        setTimeout(() => {
          icon.classList.remove("copied");
        }, 1000);
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  }
});
