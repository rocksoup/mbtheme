const storageKey = "saunter-theme";

const resolveTheme = mode => {
  if (mode === "dark" || mode === "light") return mode;

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;

  if (prefersDark) return "dark";
  if (prefersLight) return "light";

  const hour = new Date().getHours();
  return hour >= 19 || hour < 6 ? "dark" : "light";
};

const applyTheme = mode => {
  const body = document.body;
  if (!body.classList.contains("saunter")) return;

  if (mode === "dark") {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }
};

const initializeTheme = () => {
  const stored = localStorage.getItem(storageKey) || "system";
  applyTheme(resolveTheme(stored));
};

const setupThemeToggle = () => {
  const toggleRoot = document.querySelector("[data-theme-toggle]");
  if (!toggleRoot) return;

  const trigger = toggleRoot.querySelector(".icon-button");
  const menu = toggleRoot.querySelector(".theme-menu");
  const options = toggleRoot.querySelectorAll(".theme-option");

  const setTheme = mode => {
    if (mode === "system") {
      localStorage.setItem(storageKey, "system");
    } else {
      localStorage.setItem(storageKey, mode);
    }
    applyTheme(resolveTheme(mode));
  };

  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    menu.classList.toggle("open");
  });

  document.addEventListener("click", event => {
    if (!toggleRoot.contains(event.target)) {
      trigger.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      trigger.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
      trigger.focus();
    }
  });

  options.forEach(option => {
    option.addEventListener("click", () => {
      const mode = option.getAttribute("data-theme") || "system";
      setTheme(mode);
      trigger.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
    });
  });

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const stored = localStorage.getItem(storageKey) || "system";
      if (stored === "system") {
        applyTheme(resolveTheme("system"));
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  setupThemeToggle();
  refreshSeattleCam();
  setupSearch();
});

function refreshSeattleCam() {
  const camImg = document.querySelector("[data-seattle-cam]");
  if (!camImg) return;
  const baseSrc = camImg.getAttribute("data-src") || camImg.src;
  const ts = Date.now();
  const url = new URL(baseSrc);
  url.searchParams.set("cachebust", ts);
  camImg.src = url.toString();
}

function setupSearch() {
  const form = document.querySelector(".search-page form");
  const resultsContainer = document.querySelector("[data-search-results]");
  if (!form || !resultsContainer) return;

  const input = form.querySelector("input[name=\"q\"]");
  const query = input.value.trim();
  if (!query) return;

  fetch(`/search.json?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      resultsContainer.innerHTML = "";
      if (!data || data.length === 0) {
        resultsContainer.innerHTML = "<p>No matches found.</p>";
        return;
      }

      const list = document.createElement("div");
      list.className = "search-results-list";

      data.forEach(item => {
        const article = document.createElement("article");
        article.className = "search-result";

        const title = document.createElement("h2");
        const link = document.createElement("a");
        link.href = item.url;
        link.textContent = item.title || item.summary || item.url;
        title.appendChild(link);

        const meta = document.createElement("p");
        meta.className = "search-result-meta";
        meta.textContent = item.date || "";

        const summary = document.createElement("p");
        summary.className = "search-result-summary";
        summary.textContent = item.summary || "";

        article.appendChild(title);
        if (item.date) article.appendChild(meta);
        if (item.summary) article.appendChild(summary);
        list.appendChild(article);
      });

      resultsContainer.appendChild(list);
    })
    .catch(() => {
      resultsContainer.innerHTML = "<p>Unable to load results right now.</p>";
    });
}
