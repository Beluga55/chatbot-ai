import retrieveTitle from "./retrieveTitle";
import setUsername from "./retrieveUsername";
import retrieveProfilePicture from "./retrieveProfilePicture";
import { newChatBtn } from "./newChat";
import newChat from "./newChat";
import { parentContainer } from "./retrieveChatHistory";
import retrieveChatHistory from "./retrieveChatHistory";
import { userSelection } from "./openSetupMenu";
import setupUserMenu from "./openSetupMenu";
import {
  deleteButton,
  yesBtn,
  noBtn,
  triggerDeleteMenu,
  deleteAllChat,
  closeDeleteMenu,
} from "./deleteAllChat";
import {
  openUploadMenu,
  triggerUploadMenu,
  closePreview,
  closeUploadMenu,
  uploadImage,
  handleImageInputChange,
} from "./changeAvatar";
import uploadProfilePicture from "./uploadProfilePicture";
import { uploadButton } from "./uploadProfilePicture";
import {
  handleSubmit,
  iconSubmit,
  form,
  submitIcon,
  submitOnEnter,
} from "./openai";
import {
  changeTextareaHeightWhenInput,
  changeTextareaHeightWhenKeyDown,
  textarea,
} from "./changeTextareaHeight";
import copyResponses from "./clipboard";
import retrieveSubscriptionDate from "./retrieveSubscriptionDate";
import { changeModelText, navToggle } from "./changeModelText";
import checkPlan from "./checkPlan";

document.addEventListener("DOMContentLoaded", retrieveTitle);
document.addEventListener("DOMContentLoaded", setUsername);
document.addEventListener("DOMContentLoaded", retrieveProfilePicture);
newChatBtn.addEventListener("click", newChat);
parentContainer.addEventListener("click", retrieveChatHistory);
userSelection.addEventListener("click", setupUserMenu);
deleteButton.addEventListener("click", triggerDeleteMenu);
yesBtn.addEventListener("click", deleteAllChat);
noBtn.addEventListener("click", closeDeleteMenu);
triggerUploadMenu.addEventListener("click", openUploadMenu);
closePreview.addEventListener("click", closeUploadMenu);
uploadImage.addEventListener("change", () =>
  handleImageInputChange(uploadImage)
);
uploadButton.addEventListener("click", uploadProfilePicture);
form.addEventListener("submit", handleSubmit);
submitIcon.addEventListener("click", iconSubmit);
form.addEventListener("keyup", (e) => {
  submitOnEnter(e);
});
textarea.addEventListener("input", changeTextareaHeightWhenInput);
textarea.addEventListener("keydown", changeTextareaHeightWhenKeyDown);
document.addEventListener("click", copyResponses);
document.addEventListener("DOMContentLoaded", retrieveSubscriptionDate);
navToggle.addEventListener("change", changeModelText);
document.addEventListener("DOMContentLoaded", changeModelText);
document.addEventListener("DOMContentLoaded", checkPlan);