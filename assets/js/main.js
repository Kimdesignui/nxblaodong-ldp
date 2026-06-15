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

  const captchaQuestion = document.getElementById("captchaQuestion");
  const captchaInput = document.getElementById("captchaInput");
  const consentCheckbox = document.getElementById("privacyConsent");

  let captchaAnswer = 0;

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    captchaAnswer = a + b;
    if (captchaQuestion) {
      captchaQuestion.textContent = `${a} + ${b} = ?`;
    }
    if (captchaInput) {
      captchaInput.value = "";
    }
  }

  generateCaptcha();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.classList.remove("is-error");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      status.textContent = "Vui lòng điền các trường bắt buộc trước khi gửi.";
      status.classList.add("is-error");
      return;
    }

    if (consentCheckbox && !consentCheckbox.checked) {
      status.textContent = "Vui lòng đồng ý xử lý thông tin cá nhân trước khi gửi.";
      status.classList.add("is-error");
      return;
    }

    if (captchaInput && parseInt(captchaInput.value, 10) !== captchaAnswer) {
      status.textContent = "Câu trả lời bảo mật không đúng. Vui lòng thử lại.";
      status.classList.add("is-error");
      generateCaptcha();
      captchaInput.focus();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonContent = submitButton.innerHTML;
    const contactEmail = form.elements.email.value.trim();
    const payload = {
      "Họ và tên": form.elements.name.value.trim(),
      Email: contactEmail,
      "Bạn là": form.elements.partnerType.value.trim(),
      "Nội dung cần tư vấn": form.elements.message.value.trim(),
      _replyto: contactEmail,
      _subject: "Đăng ký tư vấn liên kết xuất bản mới",
      _template: "table",
      _captcha: "false",
      _honey: form.elements._honey.value
    };

    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Đang gửi...';
    status.textContent = "Đang gửi thông tin tư vấn...";

    try {
      const response = await fetch("https://formsubmit.co/ajax/e0203dc02b33dfb0fce3ca5cca36ef8b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);

      status.textContent = "Thông tin đã được gửi thành công. Chúng tôi sẽ phản hồi qua email của bạn.";
      form.reset();
      form.classList.remove("was-validated");
      generateCaptcha();
    } catch (error) {
      status.textContent = "Chưa thể gửi thông tin. Vui lòng thử lại sau hoặc liên hệ info@nxblaodong.com.vn.";
      status.classList.add("is-error");
      generateCaptcha();
      console.error(error);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonContent;
    }
  });
}

function initMessengerChat() {
  const trigger = document.querySelector("[data-messenger-chat]");
  if (!trigger) return;

  trigger.addEventListener("click", (event) => {
    const isDesktop = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
    if (!isDesktop) return;

    event.preventDefault();
    const width = 480;
    const height = 720;
    const left = Math.max(0, window.screenX + window.outerWidth - width - 28);
    const top = Math.max(0, window.screenY + window.outerHeight - height - 70);
    const url = trigger.dataset.desktopUrl || trigger.href;
    const popup = window.open(
      url,
      "nxbLaoDongMessenger",
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      window.open(url, "_blank", "noopener");
      return;
    }

    popup.focus();
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
initMessengerChat();
initScrollReveal();
initHoverGlow();
