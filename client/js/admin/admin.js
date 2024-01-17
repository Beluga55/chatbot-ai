import { retrieveInformation, listItems } from "./retrieveInformation";
import { triggerSubmitForm } from "./createAndEditUser";
import deleteUser from "./deleteUser";
import deleteChatHistory from "./deleteChatHistory";

listItems.forEach((item) => {
  item.addEventListener("click", retrieveInformation);
});

document.addEventListener("click", triggerSubmitForm);
document.addEventListener("click", deleteUser);
document.addEventListener("click", deleteChatHistory);
