// REMOVE ALL THE  FROM THE <a> TAGS
const removeHTMLFromLinks = () => {
  const links = document.querySelectorAll("a");

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (href.endsWith("")) {
      link.href = href.replace("", "");
    }

    // SET THE NEW HREF ARRTIBUTE
    link.setAttribute("href", link.href);
  });
};

export default removeHTMLFromLinks;
