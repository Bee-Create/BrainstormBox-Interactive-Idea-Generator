const ideas = [
  {
    id: "writing-1",
    title: "Write a story in reverse",
    description:
      "Start with the ending and work backward to discover how the characters arrived there.",
    category: "writing"
  },
  {
    id: "writing-2",
    title: "The forgotten message",
    description:
      "Write a scene where a character discovers a message that was never meant for them.",
    category: "writing"
  },
  {
    id: "web-1",
    title: "Build a personal resource hub",
    description:
      "Create a searchable collection of your favorite tools, references, and learning resources.",
    category: "web"
  },
  {
    id: "web-2",
    title: "Design a themed portfolio",
    description:
      "Build a portfolio around a visual theme that reflects your personality and work.",
    category: "web"
  },
  {
    id: "coding-1",
    title: "Create a random quote generator",
    description:
      "Display a random quote each time a visitor clicks a button.",
    category: "coding"
  },
  {
    id: "coding-2",
    title: "Build a habit tracker",
    description:
      "Create an interactive tracker where users can check off daily activities.",
    category: "coding"
  },
  {
    id: "blogging-1",
    title: "Explain a common beginner mistake",
    description:
      "Write a practical article explaining a coding or writing mistake and how to fix it.",
    category: "blogging"
  },
  {
    id: "blogging-2",
    title: "Create a step-by-step tutorial",
    description:
      "Teach one small skill in a beginner-friendly guide with a working example.",
    category: "blogging"
  }
];

const categorySelect = document.querySelector("#category");
const generateButton = document.querySelector("#generate-btn");
const favoriteButton = document.querySelector("#favorite-btn");

const ideaTitle = document.querySelector("#idea-title");
const ideaDescription = document.querySelector("#idea-description");
const statusMessage = document.querySelector("#status-message");

const ideaForm = document.querySelector("#idea-form");
const customIdeaInput = document.querySelector("#custom-idea");
const customCategorySelect = document.querySelector("#custom-category");

const favoritesList = document.querySelector("#favorites-list");
const favoritesEmpty = document.querySelector("#favorites-empty");

// Restore saved data. Handle missing or invalid JSON safely.
function loadSavedData(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

let favorites = loadSavedData("brainstormFavorites");
let customIdeas = loadSavedData("brainstormCustomIdeas");

let currentIdea = null;

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    statusMessage.textContent =
      "Could not save data in this browser.";
    return false;
  }
}

function getAllIdeas() {
  return [...ideas, ...customIdeas];
}

function generateIdea() {
  const selectedCategory = categorySelect.value;

  const availableIdeas = getAllIdeas().filter((idea) => {
    return (
      selectedCategory === "all" ||
      idea.category === selectedCategory
    );
  });

  if (availableIdeas.length === 0) {
    statusMessage.textContent =
      "No ideas in this category yet. Add one below!";
    return;
  }

  let nextIdea =
    availableIdeas[
      Math.floor(Math.random() * availableIdeas.length)
    ];

  if (availableIdeas.length > 1 && currentIdea) {
    while (nextIdea.id === currentIdea.id) {
      nextIdea =
        availableIdeas[
          Math.floor(Math.random() * availableIdeas.length)
        ];
    }
  }

  currentIdea = nextIdea;

  ideaTitle.textContent = currentIdea.title;
  ideaDescription.textContent = currentIdea.description;

  favoriteButton.disabled = false;
  updateFavoriteButton();

  statusMessage.textContent = "Fresh inspiration, just for you!";
}

function updateFavoriteButton() {
  if (!currentIdea) return;

  const isFavorite = favorites.some(
    (idea) => idea.id === currentIdea.id
  );

  favoriteButton.textContent = isFavorite
    ? "Remove from favorites"
    : "Save to favorites";
}

function toggleFavorite() {
  if (!currentIdea) return;

  const alreadySaved = favorites.some(
    (idea) => idea.id === currentIdea.id
  );

  const updatedFavorites = alreadySaved
    ? favorites.filter((idea) => idea.id !== currentIdea.id)
    : [...favorites, currentIdea];

  if (!saveData("brainstormFavorites", updatedFavorites)) {
    return;
  }

  favorites = updatedFavorites;

  renderFavorites();
  updateFavoriteButton();

  statusMessage.textContent = alreadySaved
    ? "Removed from favorites."
    : "Idea saved to favorites!";
}

function renderFavorites() {
  favoritesList.replaceChildren();

  favoritesEmpty.hidden = favorites.length > 0;

  favorites.forEach((idea) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const description = document.createElement("p");
    const removeButton = document.createElement("button");

    title.textContent = idea.title;
    description.textContent = idea.description;

    removeButton.type = "button";
    removeButton.className = "secondary-btn";
    removeButton.textContent = "Remove";
    removeButton.setAttribute(
      "aria-label",
      `Remove ${idea.title} from favorites`
    );

    removeButton.addEventListener("click", () => {
      const updatedFavorites = favorites.filter(
        (savedIdea) => savedIdea.id !== idea.id
      );

      if (!saveData("brainstormFavorites", updatedFavorites)) {
        return;
      }

      favorites = updatedFavorites;

      renderFavorites();
      updateFavoriteButton();
      statusMessage.textContent = "Favorite removed.";
    });

    item.append(title, description, removeButton);
    favoritesList.append(item);
  });
}

function addCustomIdea(event) {
  event.preventDefault();

  const title = customIdeaInput.value.trim();
  const category = customCategorySelect.value;

  if (!title) {
    statusMessage.textContent =
      "Please enter an idea before submitting.";
    customIdeaInput.focus();
    return;
  }

  const newIdea = {
    id: `custom-${crypto.randomUUID()}`,
    title,
    description: title,
    category
  };

  const updatedIdeas = [...customIdeas, newIdea];

  if (!saveData("brainstormCustomIdeas", updatedIdeas)) {
    return;
  }

  customIdeas = updatedIdeas;

  ideaForm.reset();

  statusMessage.textContent =
    "Your idea has been added to the collection!";
}

generateButton.addEventListener("click", generateIdea);
favoriteButton.addEventListener("click", toggleFavorite);
ideaForm.addEventListener("submit", addCustomIdea);

// Show any favorites saved from a previous visit.
renderFavorites();
