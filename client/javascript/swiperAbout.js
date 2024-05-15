// import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle'

// import styles bundle
import 'swiper/css/bundle'

import myImage from '../assets/empty-user.png'

// MAKE A RETURN STATEMENT WITH HTML IN A FUNCTION
const swiperDOM = () => {
  return `
    <div class="swiper swiperAbout">
      <div class="swiper-wrapper">
        <div class="loader-container">
          <span class="loader"></span>
        </div>
      </div>
      <div class="swiper-pagination"></div>
    </div>
  `
}

// TESTIMONIALS CONTENT TO THE SUB FUNCTION
const testimonialsContent = (username, joinedDate, profilePicture, feedbackText) => {
  return `
  <div class="swiper-slide">
    <div class="testimonials__card">
      <!-- PARAGRAPH AND IMAGES -->
      <i class='bx bxs-chat'></i>
      <p class="testimonials__card-text">${feedbackText}</p>
        <div class="testimonials__card-user">
          <div>
            <img class="testimonials-pfp" src="${profilePicture}" alt="profile picture">
              <div>
                <span id="testimonials__username">${username}</span>  
                <span id="testimonials__joined-date">Joined at: ${joinedDate}</span>          
              </div>
          </div>
        </div>
      </div>
  </div>
  `
}

// APPEND INTO THE DOM
const aboutSwiperContainer = document.querySelector('.about__swiper-container')

aboutSwiperContainer.innerHTML = swiperDOM()

// INITIALIZE SWIPER
var swiper = new Swiper('.swiperAbout', {
  spaceBetween: 32,
  autoplay: { delay: 2500, disableOnInteraction: false },
  pagination: { el: '.swiper-pagination', clickable: true },
  grabCursor: true,

  // RESPONSIVE BREAKPOINTS
  breakpoints: {
    320: {
      slidesPerView: 1,
    },
    640: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
})

async function fetchFeedback () {
  const response = await fetch('https://chatbot-rreu.onrender.com/users/getFeedback', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (response.ok) {
    const data = await response.json()

    document.querySelector('.loader').style.display = 'none'

    // Open the cache
    const cache = await caches.open('image-cache')

    data.forEach(async (item, index) => {
      let url
      if (item.profilePicture) {
        // Check if the image is in the cache
        const cachedResponse = await cache.match(item.profilePicture)

        if (cachedResponse) {
          // If the image is in the cache, use it
          url = URL.createObjectURL(await cachedResponse.blob())
        } else {
          // If the image is not in the cache, fetch it and cache it
          const blob = new Blob([new Uint8Array(item.profilePicture.data)], { type: 'image/jpeg' })
          url = URL.createObjectURL(blob)
          await cache.put(item.profilePicture, new Response(blob))
        }
      } else {
        url = myImage
      }

      // FORMAT THE DATE
      const date = new Date(item.createdAt)
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      const formattedDate = date.toLocaleDateString('en-US', options)

      // CREATE A TESTIMONIALS CARD FOR THE ITEM
      const cardItem = testimonialsContent(item.username, formattedDate, url, item.feedback)

      // APPEND THE CARD INTO THE SWIPER
      const swiperWrapper = document.querySelector('.swiper-wrapper')
      swiperWrapper.innerHTML += cardItem
    })
  } else {
    const data = await response.json()
    console.log(data.message)
  }
}

fetchFeedback()