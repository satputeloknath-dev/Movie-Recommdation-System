const API_KEY = "4da95259"; // Replace with your actual OMDb API key

// Navigation
document.querySelectorAll("nav ul li").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav ul li").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.page).classList.add("active");

    if (btn.dataset.page === "trending") loadTrendingMovies();
    if (btn.dataset.page === "mylist") renderMyList();
    if (btn.dataset.page === "recommendations") loadRecommendations();
  });
});

// Search
document.getElementById("searchInput").addEventListener("keyup", e => {
  if (e.key === "Enter") searchMovies(e.target.value, "homeResults");
});

async function searchMovies(query, containerId) {
  if (!query) return;
  const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
  const data = await res.json();
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (data.Search) {
    data.Search.forEach(m => container.appendChild(createMovieCard(m)));
  } else {
    container.innerHTML = "<p>No results found</p>";
  }
}

// Trending
async function loadTrendingMovies() {
  const trending = ["Avengers", "Batman", "Inception", "Spider-Man", "Interstellar", "Matrix"];
  const container = document.getElementById("trendingList");
  container.innerHTML = "";
  for (let keyword of trending) {
    const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(keyword)}&apikey=${API_KEY}`);
    const data = await res.json();
    if (data.Search) data.Search.forEach(m => container.appendChild(createMovieCard(m)));
  }
}

// Genres
async function loadGenre(genre) {
  const res = await fetch(`https://www.omdbapi.com/?s=${genre}&apikey=${API_KEY}`);
  const data = await res.json();
  const container = document.getElementById("genreList");
  container.innerHTML = "";
  if (data.Search) {
    data.Search.forEach(m => container.appendChild(createMovieCard(m)));
  }
}

// My List
function addToMyList(movie) {
  let list = JSON.parse(localStorage.getItem("myList")) || [];
  if (!list.find(m => m.imdbID === movie.imdbID)) {
    list.push(movie);
    localStorage.setItem("myList", JSON.stringify(list));
    alert("Added to My List!");
  }
}

function renderMyList() {
  let list = JSON.parse(localStorage.getItem("myList")) || [];
  const container = document.getElementById("myListContainer");
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = "<p>No movies in your list.</p>";
  } else {
    list.forEach(m => container.appendChild(createMovieCard(m, false)));
  }
}

// Recommendations
async function loadRecommendations() {
  let list = JSON.parse(localStorage.getItem("myList")) || [];
  const container = document.getElementById("recommendationsContainer");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p>Please add movies to your list first!</p>";
    return;
  }

  for (let movie of list) {
    const res = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`);
    const details = await res.json();
    if (details.Genre) {
      const firstGenre = details.Genre.split(",")[0];
      const searchRes = await fetch(`https://www.omdbapi.com/?s=${firstGenre}&apikey=${API_KEY}`);
      const data = await searchRes.json();
      if (data.Search) {
        data.Search
          .filter(m => !list.find(saved => saved.imdbID === m.imdbID))
          .forEach(m => container.appendChild(createMovieCard(m)));
      }
    }
  }
}

// Movie Card + Modal
function createMovieCard(movie, showAdd = true) {
  const card = document.createElement("div");
  card.classList.add("movie-card");
  card.dataset.id = movie.imdbID;
  card.innerHTML = `
    <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}">
    <h4>${movie.Title}</h4>
    <p>${movie.Year}</p>
  `;
  card.addEventListener("click", () => showMovieModal(movie));
  if (showAdd) {
    const addBtn = document.createElement("button");
    addBtn.textContent = "Add to My List";
    addBtn.addEventListener("click", e => {
      e.stopPropagation();
      addToMyList(movie);
    });
    card.appendChild(addBtn);
  }
  return card;
}

// Modal
function showMovieModal(movie) {
  const modal = document.getElementById("movieModal");
  const content = document.getElementById("movieModalContent");
  content.innerHTML = `
    <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}">
    <h2>${movie.Title}</h2>
    <p>Year: ${movie.Year}</p>
    <button onclick="addToMyList(${JSON.stringify(movie).replace(/"/g, '&quot;')})">Add to My List</button>
  `;
  modal.style.display = "flex";
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("movieModal").style.display = "none";
});

// Nature Mode
document.getElementById("natureBtn").addEventListener("click", () => {
  const hero = document.getElementById("heroSection");
  hero.style.backgroundImage = "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')";
});

// for sliding effect 
let currentIndex = 0;
const slides = document.querySelectorAll(".slide");
const slidesContainer = document.querySelector(".slides");
const dotsContainer = document.getElementById("dotsContainer");

function showSlide(index) {
  currentIndex = index % slides.length;
  const offset = -currentIndex * 100;
  slidesContainer.style.transform = `translateX(${offset}%)`;
  updateDots();
}

function moveSlide(step) {
  showSlide(currentIndex + step);
}

function createDots() {
  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    dot.addEventListener("click", () => showSlide(i));
    dotsContainer.appendChild(dot);
  });
}

function updateDots() {
  const dots = document.querySelectorAll(".dot");
  dots.forEach(dot => dot.classList.remove("active"));
  if (dots[currentIndex]) dots[currentIndex].classList.add("active");
}

// Auto-slide every 2 seconds
setInterval(() => {
  moveSlide(1);
}, 2000);

// Initialize
createDots();
showSlide(currentIndex);

document.getElementById("natureBtn").addEventListener("click", () => {
  const section = document.getElementById("natureSection");
  section.style.display = "block";
  loadNatureMovies();
});

async function loadNatureMovies() {
  const keywords = [
    "Into the Wild",
    "The Revenant",
    "Everest",
    "Wild",
    "127 Hours",
    "Grizzly Man",
    "March of the Penguins",
    "The Secret Garden"
  ];
  const container = document.getElementById("natureList");
  container.innerHTML = "";

  for (let keyword of keywords) {
    const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(keyword)}&apikey=${API_KEY}`);
    const data = await res.json();
    if (data.Search) {
      data.Search.forEach(m => container.appendChild(createMovieCard(m)));
    }
  }
}
<script>
// Chatbot Toggle
const chatbotBtn = document.getElementById("chatbotBtn");
const chatbotWindow = document.getElementById("chatbotWindow");
const closeChat = document.getElementById("closeChat");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

chatbotBtn.addEventListener("click", () => {
  chatbotWindow.style.display = "flex";
  chatbotBtn.style.display = "none";
});

closeChat.addEventListener("click", () => {
  chatbotWindow.style.display = "none";
  chatbotBtn.style.display = "block";
});

// Send Message
sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keyup", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  addMessage(msg, "userMsg");
  chatInput.value = "";
  setTimeout(() => botReply(msg), 600);
}

function addMessage(text, cls) {
  const div = document.createElement("div");
  div.classList.add("message", cls);
  div.innerHTML = text; // allow poster <img>
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simple Bot Logic with OMDb API
async function botReply(userMsg) {
  let reply = "Sorry, I didn’t understand that.";

  if (/hello|hi/i.test(userMsg)) {
    reply = "Hello 👋! Ask me about any movie (e.g., *Inception*).";
  } 
  else if (/bye/i.test(userMsg)) {
    reply = "Goodbye! 👋 Enjoy watching movies.";
  } 
  else {
    // Search in OMDb
    const apiKey = "YOUR_OMDB_API_KEY"; // Replace with your OMDb API key
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(userMsg)}&apikey=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.Response === "True") {
        reply = `
          <b>${data.Title}</b> (${data.Year})<br>
          ⭐ IMDB: ${data.imdbRating}<br>
          🎭 Genre: ${data.Genre}<br>
          📖 ${data.Plot}<br>
          <img src="${data.Poster}" alt="Poster" width="100">
        `;
      } else {
        reply = "I couldn’t find that movie 😔. Try another title!";
      }
    } catch (error) {
      reply = "⚠️ Error fetching movie data. Please try again.";
    }
  }

  addMessage(reply, "botMsg");
}
</script>
