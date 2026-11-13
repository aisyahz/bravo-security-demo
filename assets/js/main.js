/* Bravo Security Network website interactions. */
(function () {
  "use strict";
  function validPhone(value) {
    const digits = value.replace(/\D/g, "").replace(/^00/, "");
    return /^\+?[0-9(). -]{7,40}$/.test(value) && digits.length >= 7 && digits.length <= 15;
  }
  document.documentElement.classList.add('js-ready');

  var header = document.getElementById("siteHeader");
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  function closeMenu() {
    if (!toggle || !menu) return;
    menu.classList.remove("open");
    menu.inert = window.matchMedia("(max-width: 1023px)").matches;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  if (toggle && menu) {
    var mobileNav = window.matchMedia("(max-width: 1023px)");
    function syncMenu() { closeMenu(); menu.inert = mobileNav.matches; }
    mobileNav.addEventListener("change", syncMenu);
    syncMenu();
    menu.addEventListener("focusout", function () {
      setTimeout(function () {
        if (mobileNav.matches && !menu.contains(document.activeElement) && document.activeElement !== toggle) closeMenu();
      }, 0);
    });
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      menu.inert = !isOpen;
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
        toggle.focus();
      }
    });
    document.addEventListener("pointerdown", function (event) {
      if (menu.classList.contains("open") &&
          !menu.contains(event.target) &&
          !toggle.contains(event.target)) {
        closeMenu();
      }
    });
  }

  function updateHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
  }
  if (header && "IntersectionObserver" in window) {
    var sentinel = document.createElement("div");
    sentinel.className = "header-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      header.classList.toggle("scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealItems = document.querySelectorAll(
    ".operation-card, .service-card, .card, .feature, .vision-card, .stat, .industry-item, " +
    ".about__body > *, .section__head, .about__visual, .overview-card, " +
    ".overview-portfolio__heading, .overview-portfolio__card"
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    document.documentElement.classList.add("motion-ready");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01 });
    revealItems.forEach(function (item) {
      item.classList.add("reveal");
      observer.observe(item);
    });
  }

  var coverageDescriptions = {
    peninsular: "Peninsular Malaysia is shown as a coverage area. This marker identifies a region, not a branch or office.",
    sarawak: "Sarawak is shown as a coverage area. This marker identifies a region, not a branch or office.",
    sabah: "Sabah is shown as a coverage area. This marker identifies a region, not a branch or office."
  };
  var coveragePanel = document.getElementById("coverage-map-panel");
  if (coveragePanel) {
    document.querySelectorAll("[data-coverage-region]").forEach(function (button) {
      button.addEventListener("click", function () {
        var region = button.getAttribute("data-coverage-region");
        if (!coverageDescriptions[region]) return;
        coveragePanel.textContent = coverageDescriptions[region];
        document.querySelectorAll("[data-coverage-region]").forEach(function (control) {
          control.setAttribute("aria-pressed", control.getAttribute("data-coverage-region") === region ? "true" : "false");
        });
      });
    });
  }

  document.querySelectorAll(".optional-image").forEach(function (image) {
    var frame = image.parentElement;
    if (!frame) return;
    frame.classList.add("image-frame");
    function setMissing() {
      frame.classList.add("image-missing");
      image.setAttribute("aria-hidden", "true");
    }
    function setLoaded() {
      frame.classList.add("image-loaded");
      frame.classList.remove("image-missing");
      image.removeAttribute("aria-hidden");
    }
    image.addEventListener("error", setMissing, { once: true });
    image.addEventListener("load", setLoaded, { once: true });
    if (image.complete) {
      if (image.naturalWidth > 0) setLoaded();
      else setMissing();
    }
  });

  var floatingWhatsApp = document.querySelector(".wa-float");
  if (floatingWhatsApp && "IntersectionObserver" in window) {
    var overlappingSections = new Set();
    var whatsappObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) overlappingSections.add(entry.target);
        else overlappingSections.delete(entry.target);
      });
      floatingWhatsApp.classList.toggle("is-obscured", overlappingSections.size > 0);
    }, { threshold: 0 });
    document.querySelectorAll(".contact__form, .contact__actions, .hero__actions, .trust-strip, .cta-panel, .footer").forEach(function (section) {
      whatsappObserver.observe(section);
    });
  }

  // Native dialog provides modal keyboard containment and Escape handling.
  var gallery = Array.from(document.querySelectorAll('.operation-art img'));
  if (gallery.length && typeof HTMLDialogElement !== 'undefined') {
    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Operations image viewer');
    dialog.innerHTML = '<div class="lightbox__toolbar"><button type="button" data-close aria-label="Close image viewer">' + svg('x') + '</button></div><figure><img alt="" /><figcaption aria-live="polite"></figcaption></figure><div class="lightbox__controls"><button type="button" data-prev aria-label="Previous image">' + svg('chevron-left') + '</button><span class="lightbox__count"></span><button type="button" data-next aria-label="Next image">' + svg('chevron-right') + '</button></div>';
    document.body.appendChild(dialog);
    var activeImage = 0;
    var opener;
    function showImage(index) {
      activeImage = (index + gallery.length) % gallery.length;
      var source = gallery[activeImage];
      var photo = dialog.querySelector('img');
      photo.src = source.currentSrc || source.src;
      photo.alt = source.alt;
      var card = source.closest('.operation-card');
      dialog.querySelector('figcaption').textContent = card.querySelector('h3').textContent + ' — ' + card.querySelector('.illustration-label').textContent;
      dialog.querySelector('.lightbox__count').textContent = (activeImage + 1) + ' / ' + gallery.length;
    }
    gallery.forEach(function (photo, index) {
      var button = document.createElement('button');
      button.className = 'gallery-open';
      button.type = 'button';
      button.setAttribute('aria-label', 'Enlarge: ' + photo.alt);
      button.innerHTML = svg('zoom-in');
      photo.parentElement.appendChild(button);
      button.addEventListener('click', function () {
        opener = button;
        showImage(index);
        dialog.showModal();
        document.body.classList.add('lightbox-open');
        dialog.querySelector('[data-close]').focus();
      });
    });
    dialog.querySelector('[data-close]').onclick = function () { dialog.close(); };
    dialog.querySelector('[data-prev]').onclick = function () { showImage(activeImage - 1); };
    dialog.querySelector('[data-next]').onclick = function () { showImage(activeImage + 1); };
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(activeImage - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showImage(activeImage + 1); }
    });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () {
      document.body.classList.remove('lightbox-open');
      if (opener) opener.focus();
    });
  }
  function svg(name) {
    return '<svg class="lucide" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/icons/lucide.svg#' + name + '"></use></svg>';
  }

  // Progressive enhancement: PHP remains the only source of submission success.
  var form = document.querySelector('.contact__form');
  if (form && window.fetch && window.FormData) {
    var fields = Array.from(form.querySelectorAll('.field input, .field select, .field textarea'));
    fields.forEach(function (field) {
      var hint = document.createElement('span');
      hint.className = 'field__error';
      hint.id = field.id + '-error';
      field.setAttribute('aria-describedby', hint.id);
      field.after(hint);
      field.addEventListener('blur', function () { validate(field); });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') validate(field);
      });
      field.addEventListener('change', function () { validate(field); });
    });
    function validate(field) {
      field.setCustomValidity('');
      if (field.id === 'phone' && !validPhone(field.value.trim())) field.setCustomValidity('Enter a valid phone number.');
      if (field.id === 'customer_name' && !field.value.trim()) field.setCustomValidity('Enter your company or customer name.');
      var valid = field.validity.valid;
      field.setAttribute('aria-invalid', String(!valid));
      document.getElementById(field.id + '-error').textContent = valid ? '' : field.validationMessage;
      return valid;
    }
    form.noValidate = true;
    var submit = form.querySelector('[type="submit"]');
    var submitLabel = submit.innerHTML;
    var feedback = document.createElement('div');
    feedback.className = 'form__feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('tabindex', '-1');
    feedback.hidden = true;
    form.querySelector('.form__note').after(feedback);
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (submit.disabled) return;
      var valid = fields.map(validate).every(Boolean);
      if (!valid) { fields.find(function (field) { return !field.validity.valid; }).focus(); return; }
      form.querySelectorAll('.form__feedback').forEach(function (item) { item.hidden = true; });
      feedback.hidden = false;
      feedback.className = 'form__feedback';
      feedback.textContent = 'Sending your enquiry…';
      submit.disabled = true;
      submit.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 20000);
      try {
        var response = await fetch(form.action, { method: 'POST', body: new FormData(form), credentials: 'same-origin', signal: controller.signal });
        var result = new DOMParser().parseFromString(await response.text(), 'text/html');
        var confirmed = result.querySelector('.form__feedback--success');
        var error = result.querySelector('.form__feedback--error');
        var token = result.querySelector('[name="csrf_token"]');
        if (token) form.querySelector('[name="csrf_token"]').value = token.value;
        if (response.ok && confirmed) {
          feedback.className = 'form__feedback form__feedback--success';
          feedback.textContent = confirmed.textContent;
          fields.forEach(function (field) { field.value = ''; field.removeAttribute('aria-invalid'); });
        } else {
          feedback.className = 'form__feedback form__feedback--error';
          feedback.textContent = error ? error.textContent : 'Your enquiry could not be confirmed. Please try again or contact us by email or WhatsApp.';
        }
      } catch (error) {
        feedback.className = 'form__feedback form__feedback--error';
        feedback.textContent = 'We could not confirm your submission. Your details are still here. Check your connection or contact us by email or WhatsApp before retrying.';
      } finally {
        clearTimeout(timeout);
        submit.disabled = false;
        submit.innerHTML = submitLabel;
        form.removeAttribute('aria-busy');
        feedback.focus();
      }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  updateHeader();
})();
