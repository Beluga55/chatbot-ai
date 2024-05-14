// import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle'

// import styles bundle
import 'swiper/css/bundle'

// MAKE A RETURN STATEMENT WITH HTML IN A FUNCTION
const swiperDOM = () => {
  return `
    <div class="swiper swiperAbout">
      <div class="swiper-wrapper">
        <div class="swiper-slide">
          ${testimonialsContent()}
        </div>
      </div>
      <div class="swiper-pagination"></div>
    </div>
  `
}

// TESTIMONIALS CONTENT TO THE SUB FUNCTION
const testimonialsContent = () => {
  return `
   <div class="testimonials__card">
     <!-- PARAGRAPH AND IMAGES -->
     <p class="testimonials__card-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores beatae blanditiis doloremque eaque, eligendi est eveniet excepturi inventore iste libero molestiae non pariatur, perspiciatis praesentium quas quisquam quos suscipit voluptas?</p>
       <div class="testimonials__card-user">
         <div>
           <img class="testimonials-pfp" src="../assets/empty-user.png" alt="profile picture">
             <div>
               <span id="testimonials__username">Example</span>  
               <span id="testimonials__joined-date">Joined 2024</span>          
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
  centeredSlides: true,
  // autoplay: { delay: 2500, disableOnInteraction: false },
  pagination: { el: '.swiper-pagination', clickable: true },
  loop: true,
  grabCursor: true,
  slidesPerView: 'auto',
})

// GET THE TESTIMONIALS CONTENT FROM BACKEND
const response = await fetch('http://localhost:5001/users/getFeedback', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})

if (response.ok) {
  const data = await response.json()
  data.files.forEach((fileBuffer, index) => {
    const blob = new Blob([new Uint8Array(fileBuffer.data)], { type: 'image/jpeg' })
    const url = URL.createObjectURL(blob)
    const img = document.querySelector('testimonials-pfp') // SOON WILL BE LOTS OF PICTURE TO LOOP (querySelectorAll)
    img.src = url
  })
} else {
  const data = await response.json()
  console.log(data)
}