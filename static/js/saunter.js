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

  // Also handle theme-option-item buttons (for mobile menu)
  const themeOptionItems = document.querySelectorAll(".theme-option-item");
  themeOptionItems.forEach(item => {
    item.addEventListener("click", () => {
      const mode = item.getAttribute("data-theme") || "system";
      setTheme(mode);
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

const setupNavigation = () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector(".primary-nav");
  if (!toggle || !nav) return;

  const closeNav = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  };

  const openNav = () => {
    toggle.setAttribute("aria-expanded", "true");
    nav.classList.add("open");
  };

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeNav();
    } else {
      openNav();
      // Focus first link
      const firstLink = nav.querySelector("a");
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }
    }
  });

  // Close on outside click
  document.addEventListener("click", event => {
    if (!toggle.contains(event.target) && !nav.contains(event.target)) {
      closeNav();
    }
  });

  // Close on Esc key
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeNav();
      toggle.focus();
    }
  });

  // Close on nav link click
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  // Trap focus when menu is open
  nav.addEventListener("keydown", event => {
    if (event.key === "Tab" && toggle.getAttribute("aria-expanded") === "true") {
      const links = Array.from(nav.querySelectorAll("a"));
      const firstLink = links[0];
      const lastLink = links[links.length - 1];

      if (event.shiftKey && document.activeElement === firstLink) {
        event.preventDefault();
        lastLink.focus();
      } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        firstLink.focus();
      }
    }
  });
};

const setupNewsletter = () => {
  const form = document.querySelector("[data-newsletter-form]");
  if (!form) {
    return;
  }

  const newsletter = form.closest(".newsletter");
  if (!newsletter) {
    return;
  }

  const button = form.querySelector("button[type='submit']");
  const originalButtonText = button ? button.textContent : "Subscribe";

  form.addEventListener("submit", () => {
    if (button) {
      button.disabled = true;
      button.textContent = "Submitting...";
      button.style.opacity = "0.7";
      button.style.cursor = "wait";
    }

    // Set a timeout to show confirmation after form submits to iframe
    // We use a slightly longer timeout to make it feel like a real request processing
    setTimeout(() => {
      newsletter.classList.add("submitted");
      newsletter.classList.remove("error");

      // Reset button state in case they navigate back or something (though form is hidden)
      if (button) {
        button.disabled = false;
        button.textContent = originalButtonText;
        button.style.opacity = "";
        button.style.cursor = "";
      }
    }, 1500);
  });

  // Listen for errors (if iframe can't load)
  const iframe = newsletter.querySelector(".newsletter-iframe");
  if (iframe) {
    iframe.addEventListener("error", () => {
      newsletter.classList.add("error");
      newsletter.classList.remove("submitted");

      if (button) {
        button.disabled = false;
        button.textContent = originalButtonText;
        button.style.opacity = "";
        button.style.cursor = "";
      }
    });
  }
};

const setupSearchFocus = () => {
  const searchInput = document.querySelector(".search-form input, input.search-input");
  if (searchInput) {
    // Small timeout to ensure everything is rendered
    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  setupThemeToggle();
  setupNavigation();
  setupNewsletter();
  setupSearchFocus();
  refreshSeattleCam();
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
