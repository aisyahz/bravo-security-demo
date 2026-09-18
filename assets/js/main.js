/* =================================================================
   BRAVO SECURITY — DEMO SCRIPT
   Vanilla JS only. Handles:
     1. Mobile hamburger nav
     2. Header background on scroll
     3. Active nav link highlighting
     4. Lightweight section reveal on scroll
     5. Contact form (DEMO: mailto fallback, no backend)
     6. Footer year
   ================================================================= */
(function () {
  "use strict";

  var header   = document.getElementById("siteHeader");
  var toggle   = document.getElementById("navToggle");
  var menu     = document.getElementById("navMenu");
  var links    = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = links
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  /* ---------- 1. Mobile nav toggle ---------- */
  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close menu after tapping a link (mobile)
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
  }

  /* ---------- 2. Header background on scroll ---------- */
  function onScroll() {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
    highlightActive();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 3. Active nav link ---------- */
  function highlightActive() {
    var pos = window.scrollY + (window.innerHeight * 0.35);
    var currentId = "";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) currentId = sec.id;
    });
    links.forEach(function (l) {
      l.classList.toggle("active", l.getAttribute("href") === "#" + currentId);
    });
  }

  /* ---------- 4. Reveal on scroll (lightweight) ---------- */
  var revealEls = document.querySelectorAll(".section, .stats");
  if ("IntersectionObserver" in window) {
    revealEls.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. Contact form (DEMO: mailto fallback) ---------- */
  // CLIENT TODO: When ready, wire this form to a backend or service
  // (e.g. Formspree). For now it validates and opens the email client.
  var form   = document.getElementById("quoteForm");
  var status = document.getElementById("formStatus");
  // CLIENT TODO: Confirm the destination email address.
  var TO_EMAIL = "info@bravosecuritynetwork.com.my";

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form__status";

      var name    = form.name.value.trim();
      var email   = form.email.value.trim();
      var phone   = form.phone.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = "Please fill in your name, email and message.";
        status.classList.add("err");
        return;
      }
      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!validEmail) {
        status.textContent = "Please enter a valid email address.";
        status.classList.add("err");
        return;
      }

      var subject = encodeURIComponent("Quote Request from " + name);
      var body = encodeURIComponent(
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Phone: " + (phone || "-") + "\n\n" +
        "Message:\n" + message
      );
      window.location.href = "mailto:" + TO_EMAIL + "?subject=" + subject + "&body=" + body;

      status.textContent = "Opening your email app to send the message...";
      status.classList.add("ok");
      form.reset();
    });
  }

  /* ---------- 6. Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initial paint
  onScroll();
})();
