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
import requests

# Replace with your own OMDb API key
OMDB_API_KEY = '4da95259'  

def search_nature_movies(query):
    url = "http://www.omdbapi.com/"
    params = {
        'apikey': OMDB_API_KEY,
        's': query,
        'type': 'movie'
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data.get('Response') == 'True':
        movies = data.get('Search', [])
        results = []
        for movie in movies[:5]:  # Limit to 5 results
            results.append({
                'title': movie.get('Title'),
                'year': movie.get('Year'),
                'imdbID': movie.get('imdbID')
            })
        return results
    else:
        return []

def nature_chatbot():
    print("🌱 Welcome to Nature MovieBot using OMDb API!")
    print("Ask me for nature-themed movies like forests, oceans, wildlife, etc.")
    print("Type 'exit' to quit.\n")

    nature_keywords = ['forest', 'ocean', 'wildlife', 'mountain', 'nature', 'planet', 'desert', 'animals', 'earth', 'jungle']

    while True:
        user_input = input("You: ").strip().lower()

        if user_input in ['exit', 'quit', 'bye']:
            print("Bot: Goodbye! 🌿 Stay close to nature.")
            break

        # Try to detect nature-related words
        if any(word in user_input for word in nature_keywords):
            print("Bot: Searching for nature-themed movies...")
            results = search_nature_movies(user_input)

            if results:
                print("🌍 Here are some nature-related movies you might like:")
                for movie in results:
                    print(f"🎬 {movie['title']} ({movie['year']}) - https://www.imdb.com/title/{movie['imdbID']}")
            else:
                print("Bot: Hmm, I couldn't find any matching nature movies.")
        else:
            print("Bot: Please ask about nature topics like oceans, forests, or wildlife.")

# Run it
if _name_ == "_main_":
    nature_chatbot()
}

