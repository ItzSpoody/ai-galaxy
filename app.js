
// AI GALAXY - JAVASCRIPT

// MOBILE NAVIGATION
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("show");
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("show");
        });
    });
}

// DARK / LIGHT THEME
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    const savedTheme = localStorage.getItem("aiGalaxyTheme");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        themeToggle.textContent = "☾";
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");

        const isLight = document.body.classList.contains("light-theme");

        themeToggle.textContent = isLight ? "☾" : "☼";

        localStorage.setItem(
            "aiGalaxyTheme",
            isLight ? "light" : "dark"
        );
    });
}

// FOOTER YEAR
const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}

// HOMEPAGE SEARCH
const homeSearch = document.getElementById("homeSearch");
const searchBtn = document.getElementById("searchBtn");
const toolCards = document.querySelectorAll(".tool-card");
const noResults = document.getElementById("noResults");

function searchTools() {
    if (!homeSearch || !toolCards.length) return;

    const query = homeSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    toolCards.forEach(card => {
        const searchableText = card.dataset.name || card.textContent;
        const matches = searchableText.toLowerCase().includes(query);

        card.style.display = matches ? "" : "none";

        if (matches) visibleCount++;
    });

    if (noResults) {
        noResults.hidden = visibleCount !== 0;
    }
}

if (searchBtn && homeSearch) {
    searchBtn.addEventListener("click", searchTools);

    homeSearch.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            searchTools();
        }
    });
}

console.log("AI Galaxy initialized successfully!");
