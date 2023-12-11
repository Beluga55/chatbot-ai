const collabBtn = document.getElementById("collaboration-btn");
const targetDiv = document.getElementById("collaboration");
const header = document.getElementById("header").offsetHeight;

collabBtn.addEventListener("click", () => {
  targetDiv.scrollIntoView({
    behavior: "smooth",
  });
});

// Submit Button
const submitButton = document.getElementById("collaboration-submit-btn");

submitButton.addEventListener("click", (e) => {
  submitCollabForm(e);
});

// Validation For Collab
function validateEmail(email) {
  // Regular expression for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateCollabForm() {
  const errorName = document.getElementById("error-name");
  const errorEmail = document.getElementById("error-email");
  const errorContent = document.getElementById("error-content");

  // Set display to 'none' for each element
  errorName.style.display = "none";
  errorEmail.style.display = "none";
  errorContent.style.display = "none";

  var name = document.getElementById("input-name").value;
  var email = document.getElementById("input-email").value;
  var content = document.getElementById("textarea-input").value;

  // Validation for all the inputs
  if (name.trim() === "") {
    errorName.style.display = "block";
    errorName.innerText = "Name cannot be empty!";
    return false;
  }

  if (email.trim() === "") {
    errorEmail.style.display = "block";
    errorEmail.innerText = "Email cannot be empty!";
    return false;
  } else if (!validateEmail(email)) {
    errorEmail.style.display = "block";
    errorEmail.innerText = "Invalid email format!";
    return false;
  }

  if (content.trim() === "") {
    errorContent.style.display = "block";
    errorContent.innerText = "Content cannot be empty!";
    return false;
  }

  return true;
}

// Make a request to backend
async function submitCollabForm(event) {
  event.preventDefault();

  if (!validateCollabForm()) {
    event.preventDefault();
    return;
  }

  // Get the values and send it to backend
  var name = document.getElementById("input-name").value;
  var email = document.getElementById("input-email").value;
  var content = document.getElementById("textarea-input").value;

  // We need a response from backend
  const response = await fetch("http://localhost:5001/collabForm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, content }), // Values to send to email
  });

  try {
    if (response.ok) {
      const result = await response.json();

      // Reset The Form
      const collabForm = document.getElementById("collaboration-form");

      collabForm.reset();

      // Display a overlay (or text) to users
      const successText = document.getElementById("error-content");

      successText.style.display = "block";
      successText.style.color = "lime";
      successText.innerText = `${result.message}`;
    } else {
      const error = await response.json();

      // Display a error to user (if needed)
      const successText = document.getElementById("error-content");

      successText.style.display = "block";
      successText.style.color = "red";
      successText.innerText = `${error.message}`;
    }
  } catch (error) {
    console.error("An error occurred while processing the request:", error);
  }
}
