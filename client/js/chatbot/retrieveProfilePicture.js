async function retrieveProfilePicture() {
  const imageResponse = await fetch(
    "https://chatbot-rreu.onrender.com/retrieveProfilePicture",
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

  if (imageResponse.ok) {
    const imageBlob = await imageResponse.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    // Display the image
    const profileImage = document.getElementById("image-pfp");
    profileImage.src = imageUrl;
    profileImage.style.borderRadius = "50%";
  }
}

export default retrieveProfilePicture;
