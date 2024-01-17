function changeTextareaHeightWhenInput() {
  this.style.height = Math.min(this.scrollHeight, 100) + "px"; // Set a maximum height of 100px
  this.style.overflowY = "auto";

  if (this.value.trim() === "") {
    this.style.overflowY = "hidden";
    this.style.height = "auto";
  }
}

function changeTextareaHeightWhenKeyDown(e) {
  if (e.key === "Backspace" || e.key === "Delete") {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 100) + "px";
  }
}

export { changeTextareaHeightWhenInput, changeTextareaHeightWhenKeyDown };
export const textarea = document.getElementById("promptTextarea");
