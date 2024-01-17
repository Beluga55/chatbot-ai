// RETRIEVE ALL THE TITLES FROM DATABASE
async function retrieveTitle() {
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/getAllTitles",
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

  if (response.ok) {
    const data = await response.json();

    // UPDATE THE DOM WITH THE FETCHED TITLES
    const navTitleContent = document.querySelector(".nav__title-content");

    if (data.titlesAndRandomIDs && data.titlesAndRandomIDs.length > 0) {
      // Clear existing content in navTitleContent before appending
      navTitleContent.innerHTML = "";

      // Create a paragraph for each title and randomID and append it to navTitleContent
      data.titlesAndRandomIDs.forEach((titleAndRandomID) => {
        const paragraph = document.createElement("p");
        const span = document.createElement("span");
        paragraph.classList.add("title");
        span.textContent = `${titleAndRandomID.titles}` || "Default Title";

        // Set a unique id for each paragraph based on the index
        paragraph.id = `${titleAndRandomID.randomID}`;

        const tripleDot = document.createElement("i");
        tripleDot.classList.add("bx");
        tripleDot.classList.add("bx-trash-alt");

        navTitleContent.appendChild(paragraph);
        paragraph.appendChild(span);
        paragraph.appendChild(tripleDot);
      });
    }
  }
}

export default retrieveTitle;
