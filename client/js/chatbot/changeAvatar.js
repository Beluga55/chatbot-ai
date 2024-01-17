function openUploadMenu() {
  const triggerMenu = document.querySelector(".preview__image");
  triggerMenu.classList.add("show");
}

function closeUploadMenu() {
  const triggerMenu = document.querySelector(".preview__image");
  const chosenImage = document.getElementById("preview-image");
  const formUploadImage = document.getElementById("form-upload-image");
  triggerMenu.classList.remove("show");
  chosenImage.style.display = "none";
  formUploadImage.reset();
}

function handleImageInputChange(inputElement) {
  const chosenImage = document.getElementById("preview-image");
  const selectedImage = inputElement.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    chosenImage.src = event.target.result;
    chosenImage.style.display = "block";
    uploadImage.style.marginTop = "1rem";
  };
  reader.readAsDataURL(selectedImage);
}

export { openUploadMenu, closeUploadMenu, handleImageInputChange };
export const triggerUploadMenu = document.getElementById(
  "upload-profile-picture"
);
export const closePreview = document.getElementById("close-preview");
export const uploadImage = document.getElementById("upload-image");
