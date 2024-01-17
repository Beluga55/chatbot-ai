// FUNCTION TO CHANGE THE TEXT WHILE CLICKING THE BODY
function changeDefaultText() {
  const copyDescription = document.querySelectorAll(".copy__description");
  copyDescription.forEach((description) => {
    description.textContent = "Click the icon to copy";
  });
  document.body.removeEventListener("click", changeDefaultText);
}

function copyResponses(event) {
  if (
    event.target.classList.contains("bx") &&
    event.target.classList.contains("bx-copy")
  ) {
    const parentDiv = event.target.parentElement.parentElement;
    const lastElement = event.target.previousElementSibling;

    const targetP = parentDiv.querySelector(`p[id]`);
    const uniqueId = targetP.id;

    const message = document.getElementById(uniqueId).textContent;
    navigator.clipboard
      .writeText(message)
      .then(() => {
        lastElement.textContent = "Copied!";
      })
      .catch((error) => {
        console.error("Could not copy text: ", error);
      });

    document.body.addEventListener("click", changeDefaultText);
  }
}

export default copyResponses;