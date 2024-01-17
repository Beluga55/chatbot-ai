import bot from "../../assets/bot.svg";
import user from "../../assets/user.svg";

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
              ${
                isAi
                  ? '<div class="copy__button-wrapper"><p class="copy__description">Click the icon to copy</p><i class="bx bx-copy"></i></div>'
                  : ""
              }
            </div>
          </div>
        </div>
      `;
}

export default chatStripe;
