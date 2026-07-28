document.addEventListener('DOMContentLoaded', function() {
  // ==========================================================================
  // 1. UI Setup (TOC, Scrollspy, Mobile Menu, Animations)
  // ==========================================================================

  const tocList = document.getElementById('toc-list');
  const mainContent = document.getElementById('main-content');
  const sections = mainContent.querySelectorAll('.content-section[id]');

  // Create Table of Contents
  if (tocList && mainContent) {
    sections.forEach(section => {
      const titleEl = section.querySelector('.section-title, .content-title');
      if (titleEl) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#${section.id}" class="toc-link">${titleEl.textContent}</a>`;
        tocList.appendChild(li);
      }
    });
  }

  // Scrollspy for active TOC link
  const sectionOffsets = Array.from(sections).map(sec => ({ id: sec.id, offset: sec.offsetTop }));

  function updateScrollSpy() {
    if (!tocList) return;
    const tocLinks = tocList.querySelectorAll('.toc-link');
    let currentSectionId = '';
    const scrollPosition = window.scrollY;

    sectionOffsets.forEach(sec => {
      if (scrollPosition >= sec.offset - 100) {
        currentSectionId = sec.id;
      }
    });

    tocLinks.forEach(link => {
      link.classList.remove('is-active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('is-active');
      }
    });
  }
  window.addEventListener('scroll', updateScrollSpy);
  updateScrollSpy();

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('overlay');

  function closeMenu() {
    if (sidebar) sidebar.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-active');
  }

  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
      overlay.classList.toggle('is-active');
    });
    overlay.addEventListener('click', closeMenu);
    if (tocList) {
      tocList.addEventListener('click', (e) => {
        if (e.target.classList.contains('toc-link')) {
          closeMenu();
        }
      });
    }
  }

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // ==========================================================================
  // 2. Form Logic
  // ==========================================================================

  const form = document.getElementById('questionnaire-form');
  const LOCAL_STORAGE_KEY = 'onboarding-form-progress';
  if (!form) return;

  const submitButton = document.getElementById('submit-btn');
  const statusMessage = document.getElementById('form-status');
  const successMessage = document.getElementById('success-message');

  // --- Conditional Fields ---
  const hasEmailRadios = document.querySelectorAll('input[name="hasEmail"]');
  const emailDetails = document.getElementById('email-details');

  hasEmailRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'si' && radio.checked) {
        emailDetails.style.display = 'block';
      } else {
        emailDetails.style.display = 'none';
      }
      validateForm(); // Re-validate when conditional fields change
    });
  });

  // --- Save & Restore from localStorage ---
  function saveFormProgress() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  function loadFormProgress() {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedData) return;

    const data = JSON.parse(savedData);
    Object.keys(data).forEach(key => {
      const field = form.elements[key];
      if (!field) return;

      const value = data[key];
      if (field.type === 'radio') {
        const radioToSelect = form.querySelector(`input[name="${key}"][value="${value}"]`);
        if (radioToSelect) radioToSelect.checked = true;
      } else if (field.type === 'checkbox') {
        // This handles single checkboxes, assuming multiple values are not stored under the same key
        field.checked = !!value;
      } else {
        field.value = value;
      }
    });

    // Trigger change events for conditional fields after loading
    document.querySelectorAll('input[name="hasEmail"]').forEach(radio => radio.dispatchEvent(new Event('change')));
  }

  // --- Real-time Validation ---
  const fieldsToValidate = form.querySelectorAll('input[required], textarea[required], select[required], input[type="url"]');

  function validateSingleField(field) {
    let isValid = true;
    const errorContainer = document.getElementById(`${field.id}-error`);

    // Reset state
    field.classList.remove('is-valid', 'is-invalid');
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
    }

    // Check validity based on type
    if (field.type === 'radio' || field.type === 'checkbox') {
      const groupName = field.name;
      const group = form.querySelectorAll(`input[name="${groupName}"]`);
      if ([...group].some(el => el.checked)) {
        // Group is valid, but we don't style individual radios
      } else {
        isValid = false;
      }
    } else if (field.type === 'url' && field.value.trim() !== '') {
      try {
        new URL(field.value);
        isValid = true;
      } catch (_) {
        isValid = false;
        if (errorContainer) {
          errorContainer.textContent = 'Por favor, ingrese una URL válida.';
          errorContainer.style.display = 'block';
        }
      }
    } else if (field.required && field.value.trim() === '') {
      isValid = false;
      if (errorContainer) {
        errorContainer.textContent = 'Este campo es obligatorio.';
        errorContainer.style.display = 'block';
      }
    }

    // Apply visual feedback
    if (field.type !== 'radio' && field.type !== 'checkbox') {
      if (isValid) {
        field.classList.add('is-valid');
      } else {
        field.classList.add('is-invalid');
      }
    }

    return isValid;
  }

  function validateForm() {
    let isFormValid = true;

    // Validate all individual text/textarea/select fields
    fieldsToValidate.forEach(field => {
      if (field.type !== 'radio' && field.type !== 'checkbox') {
        if (!validateSingleField(field)) {
          isFormValid = false;
        }
      }
    });

    // Validate radio button groups
    const radioGroups = [...new Set([...form.querySelectorAll('input[type="radio"][required]')].map(r => r.name))];
    radioGroups.forEach(name => {
      if (!form.querySelector(`input[name="${name}"]:checked`)) {
        isFormValid = false;
      }
    });

    // Validate checkbox groups if needed (example for 'screenInfo')
    const screenInfoError = document.getElementById('screenInfo-error');
    const screenInfoCheckboxes = form.querySelectorAll('input[name="screenInfo"]');
    if ([...screenInfoCheckboxes].length > 0 && ![...screenInfoCheckboxes].some(cb => cb.checked)) {
      isFormValid = false;
      if (screenInfoError) {
        screenInfoError.textContent = 'Debe seleccionar al menos una opción.';
        screenInfoError.style.display = 'block';
      }
    } else if (screenInfoError) {
      screenInfoError.style.display = 'none';
    }

    // Enable/disable submit button
    if (submitButton) {
      submitButton.disabled = !isFormValid;
    }

    return isFormValid;
  }

  // Add event listeners for real-time validation
  fieldsToValidate.forEach(field => {
    field.addEventListener('input', () => validateSingleField(field)); // Validate on input
    field.addEventListener('blur', () => validateSingleField(field)); // Also on blur
  });
  form.addEventListener('change', () => {
    validateForm();
    saveFormProgress(); // Save on any change
  });

  // --- Form Submission ---
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (!validateForm()) {
      if (statusMessage) {
        statusMessage.textContent = 'Por favor, completa todos los campos obligatorios.';
        statusMessage.className = 'form-status is-error';
      }
      // Focus the first invalid field
      const firstInvalid = form.querySelector('.is-invalid, input[required]:not(:checked)');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    if (statusMessage) {
      statusMessage.textContent = 'Enviando...';
      statusMessage.className = 'form-status';
    }
    if (submitButton) {
      submitButton.disabled = true;
    }

    // --- Data Collection ---
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (data[key]) {
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    console.log('Form Data Submitted:', data);

    // --- Simulate Server-Side Action & UI Update ---
    // In a real application, you would send `data` to a server here.
    // For example: using fetch() to POST to an API endpoint.
    setTimeout(() => {
      form.style.display = 'none';
      if (successMessage) {
        successMessage.style.display = 'block';
      }
      // Clear saved data from localStorage after successful submission
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  });

  // Initial setup
  loadFormProgress();
  validateForm();
});