import { retrieveProfilePicture } from "./navbar.js";
import { Notyf } from "notyf";
import validateEmail from "./validateEmail.js";

// LOGOUT FUNCTIONALITY
const logoutButton = document.querySelector(".settings__title .buttons");

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");

  window.location.href = "index";
};

logoutButton.addEventListener("click", logout);

// TRIGGER THE ACCOUNT AND RENDER
const settingsContent = document.querySelector(".settings__content");

// FUNCTION TO SET THE INNERHTML OF THE SETTINGS CONTENT
const setAccountSettingsContent = () => {
  settingsContent.innerHTML = `
    <div class="settings__content-account">
      <div class="settings__content-account-username">
        <h2>Change Username</h2>
        <hr>
        <form id="settings-change-username-form" class="settings__content-account-form">
          <input type="text" id="new-username" placeholder="New username" />
          <button id="change-username" class="buttons" type="submit">Change username</button>
        </form>
      </div>
      <div class="settings__content-account-profile">
        <h2>Upload Profile Picture</h2>
        <hr>

        <form id="settings__profile-picture-form" class="settings__content-account-form">
          <img class="settings__profile-picture-preview" src="../assets/empty-user.png" />
          <input type="file" id="file" name="image" accept="image/*" />
          <label for="file" class="custom-file-upload">Choose File</label>
          <button class="buttons" type="submit">Upload</button>
        </form>
      </div>
      <div class="settings__content-account-delete">
        <h2>Delete Account</h2>
        <hr>
        <p>Once you delete your account, there is no going back. Please be certain.</p>
        <button class="buttons" type="submit">Delete Account</button>
      </div>

      <div class="delete__account-overlay">
        <div>
          <h2>Delete Confirmation</h2>
            <p>
              Are you sure you want to delete your account? This action is irreversible.
            </p>
          <div class="delete__confirmation-button">
            <button class="buttons">Delete</button>
            <button class="buttons">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // FUNCTION TO HAVE PREVIEW OF THE PROFILE PICTURE
  const settingsForm = document.querySelector(
    "#settings__profile-picture-form"
  );
  const previewImage = document.querySelector(
    ".settings__profile-picture-preview"
  );

  settingsForm.addEventListener("change", (event) => {
    if (event.target.matches('input[type="file"]')) {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = () => {
          previewImage.src = reader.result;
        };

        reader.readAsDataURL(file);
      } else {
        previewImage.src = "../assets/empty-user.png";
      }
    }
  });
};

// SET THE PASSWORD AND AUTHENTICATION FUNCTION
const setAccountPasswordContent = () => {
  settingsContent.innerHTML = `
    <div class="settings__content-password-email">
      <h2>Change Email</h2>
      <hr>
      <form class="settings__content-password-email-form">
        <input type="email" placeholder="New email" />
        <p class="verify-notice">You need to verify your email before you can change your current email</p>
        <p>Your current email is <span></span>. <a class="verify-notice" href="/users/verify">Verify Now</a></p>
        <button class="buttons" type="submit">Change email</button>
      </form>
    </div>
    <div class="settings__content-password">
      <h2>Change Password</h2>
      <hr>
      <form class="settings__content-password-form">
        <input type="password" placeholder="Current password" />
        <input type="password" placeholder="New password" />
        <input type="password" placeholder="Confirm new password" />

        <p>Make sure it's at least 8 characters including a uppercase letter.</p>
        <button class="buttons" type="submit">Change password</button>
      </form>
    </div>
  `;
};

document.addEventListener("DOMContentLoaded", setAccountSettingsContent);

// WHEN THE USER CLICKS IN THE PASSWORD AND AUTHENTICATION SETTINGS
const settingsProfiles = document.querySelectorAll(".settings__profile");

settingsProfiles.forEach((profile) => {
  profile.addEventListener("click", (event) => {
    // REMOVE ALL THE ACTIVE CLASSES
    settingsProfiles.forEach((profile) => {
      profile.classList.remove("active");
    });

    // ADD THE ACTIVE CLASS TO THE CLICKED PROFILE
    event.currentTarget.classList.add("active");

    const icon = event.currentTarget.querySelector(".bx");
    if (icon.classList.contains("bx-cog")) {
      setAccountSettingsContent();
      retrieveProfilePicture();
    } else if (icon.classList.contains("bx-lock")) {
      setAccountPasswordContent();
      retrieveCurrentEmail();
    } else {
      settingsContent.innerHTML = ``;
    }
  });
});

// CHANGE USERNAME FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settings-change-username-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (event.target.id === "settings-change-username-form") {
      const oldUsername = localStorage.getItem("username");
      const newUsername = document.getElementById("new-username").value;

      // SEND A REQUEST TO THE SERVER
      const response = await fetch(
        "https://chatbot-rreu.onrender.com/users/updateUsername",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ oldUsername, newUsername }),
        }
      );

      // Initialize a new Notyf instance
      var notyf = new Notyf({
        duration: 3000,
        position: {
          x: "right",
          y: "top",
        },
        dismissible: true,
        icon: true,
      });

      // GET THE RESPONSE
      if (response.ok) {
        await response.json();

        // CLEAR THE FORM FIELD
        form.reset();

        // UPDATE THE LOCAL STORAGE
        localStorage.setItem("username", newUsername);

        // CLEAR THE BORDER COLOR (ACCESS TO THE ROOT STYLES)
        const rootStyles = getComputedStyle(document.documentElement);
        const textColor = rootStyles.getPropertyValue("--text-200").trim();

        document.getElementById("new-username").style.borderColor = textColor;

        // Show a success notification
        notyf.success("Username updated successfully");
      } else {
        const data = await response.json();

        // Show an error notification
        notyf.error(data.message);
      }
    }
  });
});

// UPLOAD PROFILE PICTURE FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settings__profile-picture-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = form.querySelector('input[type="file"]').files[0];

    if (!file) {
      // Initialize a new Notyf instance
      var notyf = new Notyf({
        duration: 3000,
        position: {
          x: "right",
          y: "top",
        },
        dismissible: true,
        icon: true,
      });

      // Show an error notification
      notyf.error("Please select a file");
      return;
    }

    const formData = new FormData(form);
    const username = localStorage.getItem("username");
    formData.append("username", username);

    // SEND A REQUEST TO THE SERVER
    const response = await fetch(
      "https://chatbot-rreu.onrender.com/users/uploadProfile",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    // Initialize a new Notyf instance
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dimissible: true,
      icon: true,
    });

    // GET THE RESPONSE
    if (response.ok) {
      const data = await response.json();

      // CLEAR THE FORM FIELD
      form.reset();

      const file = document.querySelector(".custom-file-upload");

      file.textContent = "Choose File";

      // Show a success notification
      notyf.success("Profile picture updated successfully");

      // CREATE A BLOB URL FROM THE IMAGE RESPONSE
      pollForImages(data.file, 1000, 10)
        .then(async (imageResponse) => {
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);

          // Display the image
          const profileImage = document.querySelector(".nav__login img");
          profileImage.src = imageUrl;
          profileImage.style.borderRadius = "50%";
        })
        .catch((error) => {
          console.error("Error retrieving image:", error);
        });
    } else {
      const data = await response.json();

      // Show an error notification
      notyf.error(data.message);
    }
  });
});

// POLL FOR IMAGES
const pollForImages = async (file, interval, maxAttempt) => {
  for (let i = 0; i < maxAttempt; i++) {
    // RETRIEVE THE IMAGE FROM THE BACKEND
    const response = await fetch(
      `https://chatbot-rreu.onrender.com/users/getImage/${file}`
    );

    if (response.ok) {
      return response;
    }

    // Image not found, wait for the interval then try again
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Image not found after maximum attempts");
};

// DELETE ACCOUNT FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
  const deleteAccountButton = document.querySelector(
    ".settings__content-account-delete .buttons"
  );

  const deleteCancelButton = document.querySelector(
    ".delete__confirmation-button .buttons:last-child"
  );

  const deleteConfirmButton = document.querySelector(
    ".delete__confirmation-button .buttons:first-child"
  );

  deleteAccountButton.addEventListener("click", showDeleteAccountOverlay);
  deleteCancelButton.addEventListener("click", hideDeleteAccountOverlay);
  deleteConfirmButton.addEventListener("click", deleteAccount);
});

const showDeleteAccountOverlay = () => {
  const deleteAccountOverlay = document.querySelector(
    ".delete__account-overlay"
  );
  deleteAccountOverlay.classList.add("active");
};

const hideDeleteAccountOverlay = () => {
  const deleteAccountOverlay = document.querySelector(
    ".delete__account-overlay"
  );
  deleteAccountOverlay.classList.remove("active");
};

// SEND A REQUEST TO DELETE THE ACCOUNT (FUNCTION)
const deleteAccount = async () => {
  const username = localStorage.getItem("username");

  // SEND A REQUEST TO THE SERVER
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/deleteAccount",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ username }),
    }
  );

  // GET THE RESPONSE
  if (response.ok) {
    await response.json();

    // REMOVE THE LOCAL STORAGE
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    // Set a flag in the local storage to show a success message
    localStorage.setItem("accountDeleted", "true");

    // REDIRECT TO THE INDEX PAGE
    window.location.href = "index";
  } else {
    const data = await response.json();

    // Initialize a new Notyf instance
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // Show an error notification
    notyf.error(data.message);
  }
};

// RETRIEVE THE CURRENT EMAIL OF THE USER
const retrieveCurrentEmail = async () => {
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/getEmailAndStatus",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ username: localStorage.getItem("username") }),
    }
  );

  if (response.ok) {
    const data = await response.json();
    const email = data.email;

    const emailSpan = document.querySelector(
      ".settings__content-password-email-form p span"
    );

    const verifyNotice = document.querySelectorAll(".verify-notice");

    if (emailSpan) {
      emailSpan.textContent = email;
    }

    if (verifyNotice.length > 0) {
      verifyNotice.forEach((notice) => {
        notice.style.display = data.isVerified ? "none" : "initial";
      });
    }
  } else {
    const data = await response.json();

    // Initialize a new Notyf instance
    var notyf = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "top",
      },
      dismissible: true,
      icon: true,
    });

    // Show an error notification
    notyf.error(data.message);
  }
};

// VERIFY EMAIL FUNCTIONALITY
// Create a MutationObserver instance
const observer = new MutationObserver(async (mutationsList, observer) => {
  // Look through all mutations that just occured
  for (let mutation of mutationsList) {
    // If the addedNodes property has one or more nodes
    if (mutation.addedNodes.length) {
      const verifyEmailLink = document.querySelector(
        ".settings__content-password-email-form a"
      );
      const username = localStorage.getItem("username");

      if (verifyEmailLink && !verifyEmailLink.listenerAttached) {
        verifyEmailLink.addEventListener("click", async (event) => {
          event.preventDefault();

          const response = await fetch(
            "https://chatbot-rreu.onrender.com/users/verifyEmail",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ username }),
            }
          );

          const data = await response.json();
          // Initialize a new Notyf instance
          var notyf = new Notyf({
            duration: 3000,
            position: {
              x: "right",
              y: "top",
            },
            dismissible: true,
            icon: true,
          });

          // Show a notification based on the response status
          response.ok ? notyf.success(data.message) : notyf.error(data.message);
        });

        // Indicate that the event listener has been attached
        verifyEmailLink.listenerAttached = true;
      }
    }
  }
});

// Start observing the document with the configured parameters
observer.observe(document, {
  childList: true,
  subtree: true,
});

// CHANGE EMAIL FUNCTIONALITY
// Create a MutationObserver instance
const observerChangeEmail = new MutationObserver(
  async (mutationsList, observer) => {
    // Look through all mutations that just occured
    for (let mutation of mutationsList) {
      // If the addedNodes property has one or more nodes
      if (mutation.addedNodes.length) {
        const changeEmailForm = document.querySelector(
          ".settings__content-password-email-form"
        );

        const changeEmailButton = document.querySelector(
          ".settings__content-password-email-form .buttons"
        );

        if (changeEmailButton) {
          changeEmailButton.addEventListener("click", (event) => {
            event.preventDefault();

            const newEmail = changeEmailForm.querySelector(
              "input[type='email']"
            ).value;

            // CHECK IF THE EMAIL IS THE SAME AS THE CURRENT EMAIL
            const currentEmail = document.querySelector(
              ".settings__content-password-email-form p span"
            ).textContent;

            // CHECK THE EMAIL IS EMPTY
            if (newEmail === "") {
              // Initialize a new Notyf instance
              var notyf = new Notyf({
                duration: 3000,
                position: {
                  x: "right",
                  y: "top",
                },
                dismissible: true,
                icon: true,
              });

              // Show an error notification
              notyf.error("Email cannot be empty");
              return;
            }

            if (newEmail === currentEmail) {
              // Initialize a new Notyf instance
              var notyf = new Notyf({
                duration: 3000,
                position: {
                  x: "right",
                  y: "top",
                },
                dismissible: true,
                icon: true,
              });

              // Show an error notification
              notyf.error("The new email is the same as the current email");
              return;
            }

            // VALIDATE THE EMAIL
            if (!validateEmail(newEmail)) {
              // Initialize a new Notyf instance
              var notyf = new Notyf({
                duration: 3000,
                position: {
                  x: "right",
                  y: "top",
                },
                dismissible: true,
                icon: true,
              });

              // Show an error notification
              notyf.error("Invalid email format");
              return;
            }

            let encodedEmail = btoa(newEmail);
            let username = btoa(localStorage.getItem("username"));
            // REDIRECT TO VERIFY EMAIL PAGE
            window.location.href =
              "verifyEmail?email=" + encodedEmail + "&username=" + username;
          });

          // Indicate that the event listener has been attached
          changeEmailButton.listenerAttached = true;
        }
      }
    }
  }
);

// Start observing the document with the configured parameters
observerChangeEmail.observe(document, { childList: true, subtree: true });

// CHANGE PASSWORD FUNCTIONALITY
// Create a MutationObserver instance
const observerChangePassword = new MutationObserver(
  async (mutationsList, observer) => {
    // Look through all mutations that just occured
    for (let mutation of mutationsList) {
      // If the addedNodes property has one or more nodes
      if (mutation.addedNodes.length) {
        const changePasswordForm = document.querySelector(
          ".settings__content-password-form"
        );

        const changePasswordButton = document.querySelector(
          ".settings__content-password-form .buttons"
        );
        const username = localStorage.getItem("username");

        if (changePasswordButton) {
          // Once we have found the element and attached the event listener, we can stop observing
          observerChangePassword.disconnect();

          changePasswordButton.addEventListener("click", async (event) => {
            event.preventDefault();

            const currentPassword = changePasswordForm.querySelector(
              "input[type='password']:nth-child(1)"
            ).value;
            const newPassword = changePasswordForm.querySelector(
              "input[type='password']:nth-child(2)"
            ).value;
            const confirmNewPassword = changePasswordForm.querySelector(
              "input[type='password']:nth-child(3)"
            ).value;

            const response = await fetch(
              "https://chatbot-rreu.onrender.com/users/changePassword",
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  username,
                  currentPassword,
                  newPassword,
                  confirmNewPassword,
                }),
              }
            );

            const data = await response.json();

            // Clear the form fields
            changePasswordForm.reset();

            // Initialize a new Notyf instance
            var notyf = new Notyf({
              duration: 3000,
              position: {
                x: "right",
                y: "top",
              },
              dismissible: true,
              icon: true,
            });

            // Show a notification based on the response status
            response.ok
              ? notyf.success(data.message)
              : notyf.error(data.message);
          });

          // Indicate that the event listener has been attached
          changePasswordButton.listenerAttached = true;
        }
      }
    }
  }
);

// Start observing the document with the configured parameters
observerChangePassword.observe(document, { childList: true, subtree: true });

// REPLACE THE FILE INPUT WITH A NEW ONE
document.body.addEventListener("change", function (e) {
  if (e.target.matches("#file")) {
    const fileName = e.target.files[0].name;
    document.querySelector(".custom-file-upload").textContent = fileName;
  }
});
