async function deleteUser(e) {
  if (e.target.classList.contains("delete__button")) {
    const objectID = e.target.parentNode.parentNode.children[0].innerText;

    // ARE YOU SURE YOU WANT TO DELETE THIS USER?
    const confirmation = confirm("Are you sure you want to delete this user?");
    if (!confirmation) return;

    // SEND A REQUEST TO BACKEND TO DELETE THE USER
    const response = await fetch(
      "https://chatbot-rreu.onrender.com/adminDeleteUser",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objectID,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data.message === "User deleted") {
        alert("User deleted");
        // REMOVE THE ROW FROM THE TABLE
        e.target.parentNode.parentNode.remove();
      } else {
        alert("Failed to delete user");
      }
    } else {
      alert("Failed to delete user");
    }
  }
}

export default deleteUser;
