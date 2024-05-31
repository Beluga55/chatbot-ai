const faqTitle = document.querySelectorAll('.faq__title')
let lastActiveParagraph = null

faqTitle.forEach(title => {
  title.addEventListener('click', () => {
    const parentDiv = title.parentElement
    const paragraph = parentDiv.querySelector('p')

    if (lastActiveParagraph) {
      lastActiveParagraph.classList.remove('active')
    }

    paragraph.classList.add('active')
    lastActiveParagraph = paragraph
  })
})