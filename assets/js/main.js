const topbar = document.querySelector(".topbar");
const navLinks = Array.from(document.querySelectorAll(".navbar .nav-link"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function syncHeader() {
  if (!topbar) return;
  topbar.classList.toggle("is-scrolled", window.scrollY > 18);
}

function syncActiveNav() {
  if (!sections.length) return;
  const current = sections.reduce((active, section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 150) return section;
    return active;
  }, sections[0]);

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${current.id}`;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function initNavClose() {
  const collapseEl = document.getElementById("mainNav");
  if (!collapseEl || !window.bootstrap) return;
  const collapse = new bootstrap.Collapse(collapseEl, { toggle: false });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 991.98px)").matches) {
        collapse.hide();
      }
    });
  });
}

function initConsultForm() {
  const form = document.getElementById("consultForm");
  const status = document.getElementById("formStatus");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.classList.remove("is-error");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      status.textContent = "Vui lòng điền các trường bắt buộc trước khi gửi.";
      status.classList.add("is-error");
      return;
    }

    const name = form.elements.name.value.trim();
    status.textContent = `Cảm ơn ${name}. Thông tin tư vấn đã được ghi nhận trên giao diện mẫu.`;
    form.reset();
    form.classList.remove("was-validated");
  });
}

function initScrollReveal() {
  const revealTargets = [
    ...document.querySelectorAll("main > section, .glass-solid, .glass-surface, .glass-panel, .partner-card")
  ];
  if (!revealTargets.length) return;

  revealTargets.forEach((target, index) => {
    const isSection = target.matches("main > section");
    target.classList.add(isSection ? "reveal-section" : "reveal-card");
    if (!isSection) {
      target.classList.add(`reveal-delay-${Math.min(index % 6, 5)}`);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px"
  });

  revealTargets.forEach((target) => {
    const rect = target.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      target.classList.add("is-visible");
      return;
    }
    observer.observe(target);
  });
}

function animateCounter(counter) {
  if (counter.dataset.counted === "true") return;
  counter.dataset.counted = "true";
  const target = Number(counter.dataset.target || "0");
  const suffix = counter.dataset.suffix || "";
  const duration = 1500;
  const start = performance.now();
  counter.classList.add("is-counting");

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    counter.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    counter.textContent = `${target}${suffix}`;
  }

  requestAnimationFrame(tick);
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.45
  });

  counters.forEach((counter) => counterObserver.observe(counter));
}

function initHoverGlow() {
  const glowCards = document.querySelectorAll(".glass-panel, .glass-solid, .glass-surface");
  if (!glowCards.length) return;

  glowCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty("--hover-x", `${x}px`);
      card.style.setProperty("--hover-y", `${y}px`);
    });
  });
}

window.addEventListener("scroll", () => {
  syncHeader();
  syncActiveNav();
}, { passive: true });

window.addEventListener("resize", syncActiveNav, { passive: true });

syncHeader();
syncActiveNav();
initNavClose();
initConsultForm();
initScrollReveal();
initCounters();
initHoverGlow();
