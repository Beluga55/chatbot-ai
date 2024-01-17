function triggerDeleteMenu() {
  const navMenu = document.querySelector(".nav__menu");
  const userMenu = document.querySelector(".nav__user-selection");
  const overflowMenu = document.querySelector(".overflow__delete-menu");

  navMenu.classList.remove("show");
  userMenu.classList.remove("show");
  overflowMenu.classList.add("show");
}

async function deleteAllChat() {
  const navMenu = document.querySelector(".nav__menu");
  const navTitleContent = document.querySelector(".nav__title-content");
  const chatContainer = document.getElementById("chat_container");
  const overflowMenu = document.querySelector(".overflow__delete-menu");
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
      navTitleContent.innerHTML = "";
      chatContainer.innerHTML = `
      <div class="chat__container-greeting">
        <div class="chat__greeting">
          <h2>How can i help you today?</h2>
          <p>
          Hello! I'm your chat companion, driven by the powerful GPT-3.5. Ask away or just chat casually—I'm here for a simple and enjoyable conversation! 
          </p>
        </div>
      </div>`;
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
}

function closeDeleteMenu() {
  const overflowMenu = document.querySelector(".overflow__delete-menu");
  overflowMenu.classList.remove("show");
}

export { triggerDeleteMenu, deleteAllChat, closeDeleteMenu };
export const deleteButton = document.getElementById("delete-all-conversation");
export const yesBtn = document.getElementById("yesBtn");
export const noBtn = document.getElementById("noBtn");
