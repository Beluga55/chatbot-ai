async function uploadProfilePicture(event) {
  const formUploadImage = document.getElementById("form-upload-image");
  const triggerMenu = document.querySelector(".preview__image");
  event.preventDefault();

  const formData = new FormData(formUploadImage);
  formData.append("username", localStorage.getItem("username"));

  try {
    const response = await fetch("https://chatbot-rreu.onrender.com/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      triggerMenu.classList.remove("show");

      pollForImage(data.file, 1000, 10)
        .then(async (imageResponse) => {
          // Create a blob URL from the image response
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);

          // Display the image
          const profileImage = document.getElementById("image-pfp");
          profileImage.src = imageUrl;
          profileImage.style.borderRadius = "50%";
        })
        .catch((error) => {
          console.error(error);
        });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}

async function pollForImage(file, interval, maxAttempts) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Retrieve the image from the backend
    const imageResponse = await fetch(
      `https://chatbot-rreu.onrender.com/image/${file}`
    );

    if (imageResponse.ok) {
      return imageResponse;
    }
    // Image not found, wait for the interval then try again
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Image not found after maximum attempts");
}

export default uploadProfilePicture;
export const uploadButton = document.getElementById("upload-button");
