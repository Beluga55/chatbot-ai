function newChat() {
  const chatContainer = document.querySelector("#chat_container");
  const navMenu = document.querySelector(".nav__menu");
  var activeTitles = document.querySelectorAll(".active__title");

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
  navMenu.classList.remove("show");
  activeTitles.forEach(function (title) {
    title.classList.remove("active__title");
  });
}

export default newChat;
export const newChatBtn = document.querySelector(".new__chat");