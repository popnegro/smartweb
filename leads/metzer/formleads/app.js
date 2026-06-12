// Initialize Lucide icons
const refreshIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const steps = Array.from(document.querySelectorAll(".step"));
const progressBar = document.getElementById("progressBar");
const stepStatus = document.getElementById("stepStatus");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const form = document.getElementById("wizardForm");
const summary = document.getElementById("summary");
const formStatus = document.getElementById("formStatus");
const advisorLink = document.getElementById("advisorLink");
const privacyToast = document.getElementById("privacyToast");
const sistemaExistenteContainer = document.getElementById("sistemaExistenteContainer");

// --- State ---
let currentStep = 0;
let isSubmitting = false;
let isPrivacyToastDismissed = false;
const stepNames = ["Proyecto", "Ubicación", "Detalles", "Plazo", "Contacto", "Resumen"];

// --- Configuration ---
const siteConfig = window.METZER_SITE_CONFIG || {};
const DEFAULT_LOGO = "metzer-brand.png";

// --- Masks ---
let phoneMask;
if (form.telefono && window.IMask) {
  phoneMask = IMask(form.telefono, {
    mask: '+{54} 9 00 0000-0000'
  });
}

// --- Helpers ---
const toggleSistemaExistente = () => {
  if (!sistemaExistenteContainer) return;
  const tipoProyecto = getRadioValue("tipo_proyecto");
  if (tipoProyecto === "Nuevo Proyecto") {
    sistemaExistenteContainer.style.display = "none";
    form.sistema_existente.value = "Ninguno";
  } else {
    sistemaExistenteContainer.style.display = "block";
  }
};

const getRadioValue = (name) =>
  form.querySelector(`input[name="${name}"]:checked`)?.value || "";

const setText = (parent, selector, value) => {
  const el = parent.querySelector(selector);
  if (el) {
    el.textContent = value || "-";
  }
};

const fields = {
  tipo_proyecto: {
    input: () => form.querySelector('input[name="tipo_proyecto"]'),
    error: document.getElementById("tipoError"),
  },
  cultivo: {
    input: () => form.querySelector('input[name="cultivo"]'),
    error: document.getElementById("cultivoError"),
  },
  nombre: {
    input: () => form.nombre,
    error: document.getElementById("nombreError"),
  },
  email: {
    input: () => form.email,
    error: document.getElementById("emailError"),
  },
  telefono: {
    input: () => form.telefono,
    error: document.getElementById("telefonoError"),
  },
};

const getFormData = () => ({
  tipo_proyecto: getRadioValue("tipo_proyecto"),
  cultivo: getRadioValue("cultivo"),
  provincia: form.provincia.value,
  superficie: form.superficie.value,
  fuente_agua: form.fuente_agua.value,
  sistema_existente: form.sistema_existente.value,
  fecha_estimada: form.fecha_estimada.value,
  estado: form.estado.value,
  detalle: form.detalle.value.trim(),
  nombre: form.nombre.value.trim(),
  empresa: form.empresa.value.trim(),
  email: form.email.value.trim(),
  telefono: form.telefono.value.trim(),
});

const setFieldError = (fieldName, message) => {
  const field = fields[fieldName];

  if (!field) return;

  const input = field.input();

  if (field.error) {
    field.error.textContent = message;
  }

  if (input) {
    const isInvalid = !!message;
    input.setAttribute("aria-invalid", isInvalid ? "true" : "false");

    // Toggle clases para inputs estándar
    if (isInvalid) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      input.classList.add("shake-animation"); // Añadir animación de error
    } else {
      input.classList.remove("is-invalid");
      
      let hasValue = input.type === "radio" ? !!getRadioValue(input.name) : input.value.trim() !== "";
      
      if (input.id === "telefono" && phoneMask) {
        hasValue = phoneMask.masked.isComplete;
      }

      if (hasValue) input.classList.add("is-valid");
      else input.classList.remove("is-valid");
    }

    // Lógica específica para tarjetas (Radios)
    if (input.type === "radio") {
      const cards = form.querySelectorAll(`input[name="${input.name}"]`);
      cards.forEach(radio => {
        const card = radio.closest(".card");
        if (card) {
          if (isInvalid) {
            card.classList.add("is-invalid");
            card.classList.remove("is-valid");
            card.classList.add("shake-animation");
          } else {
            card.classList.remove("is-invalid");
            if (radio.checked) card.classList.add("is-valid");
            else card.classList.remove("is-valid");
          }
        }
      });
    }
  }
};

const clearErrors = () => {
  Object.keys(fields).forEach((fieldName) => {
    setFieldError(fieldName, "");
  });

  formStatus.textContent = "";
};

const focusField = (fieldName) => {
  const input = fields[fieldName]?.input();

  if (input) {
    input.focus();
  }
};

// --- UI Management ---
const updateWizard = () => {
  steps.forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);
  });

  const currentStepNumber = currentStep + 1;

  progressBar.style.width = `${(currentStepNumber / steps.length) * 100}%`;
  progressBar.setAttribute("aria-valuenow", String(currentStepNumber));
  stepStatus.textContent = `Paso ${currentStepNumber} de ${steps.length} · ${stepNames[currentStep]}`;
  prevBtn.style.visibility = currentStep === 0 ? "hidden" : "visible";
  nextBtn.textContent =
    currentStep === steps.length - 1 ? "Solicitar asesoramiento" : "Siguiente";

  // Mostrar toast de privacidad a partir del paso de contacto (índice 4)
  if (privacyToast) {
    const shouldShow = currentStep >= 4 && !isPrivacyToastDismissed;
    privacyToast.classList.toggle("visible", shouldShow);
  }

  if (currentStep === steps.length - 1) {
    buildSummary();
  }

  // Ejecutar lógica condicional al actualizar el wizard
  toggleSistemaExistente();
};

// --- Validation ---
const validateCurrentStep = () => {
  clearErrors();
  const data = getFormData();
  // Email Regex estándar RFC 5322 simplificado para alta compatibilidad
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  switch (currentStep) {
    case 0:
      if (!data.tipo_proyecto) {
        setFieldError("tipo_proyecto", "Seleccione el tipo de proyecto.");
        return false;
      }
      if (!data.cultivo) {
        setFieldError("cultivo", "Seleccione un cultivo para continuar.");
        return false;
      }
      break;

    case 4:
      if (!data.nombre) return (setFieldError("nombre", "Ingrese su nombre."), focusField("nombre"), false);
      if (!data.email) return (setFieldError("email", "Ingrese un email."), focusField("email"), false);
      if (!emailRegex.test(data.email)) {
        return (setFieldError("email", "El formato del email no es válido."), focusField("email"), false);
      }
      if (!data.telefono || (phoneMask && !phoneMask.masked.isComplete)) {
        setFieldError("telefono", "Ingrese un número completo (+54 9 ...).");
        focusField("telefono");
        return false;
      }
      break;

    default:
      break;
  }

  return true;
};

// --- Summary & Submission ---
const buildSummary = () => {
  const data = getFormData();
  const isNuevoProyecto = data.tipo_proyecto === "Nuevo Proyecto";

  summary.innerHTML = `
    <div class="summary-grid">
      <div class="summary-section">
        <h4>Datos Técnicos</h4>
        <div class="summary-item"><strong>Tipo:</strong> <span data-summary="tipo_proyecto"></span></div>
        <div class="summary-item"><strong>Cultivo:</strong> <span data-summary="cultivo"></span></div>
        <div class="summary-item"><strong>Superficie:</strong> <span data-summary="superficie"></span></div>
        <div class="summary-item"><strong>Ubicación:</strong> <span data-summary="provincia"></span></div>
        <div class="summary-item"><strong>Agua:</strong> <span data-summary="fuente_agua"></span></div>
        ${isNuevoProyecto ? "" : '<div class="summary-item"><strong>Sistema:</strong> <span data-summary="sistema_existente"></span></div>'}
      </div>
      <div class="summary-section">
        <h4>Contacto y Plazo</h4>
        <div class="summary-item"><strong>Inicio:</strong> <span data-summary="fecha_estimada"></span></div>
        <div class="summary-item"><strong>Nombre:</strong> <span data-summary="nombre"></span></div>
        <div class="summary-item"><strong>WhatsApp:</strong> <span data-summary="telefono"></span></div>
        <div class="summary-item"><strong>Email:</strong> <span data-summary="email"></span></div>
      </div>
      <div class="summary-obs">
        <h4>Observaciones</h4>
        <div data-summary="detalle" class="summary-box"></div>
      </div>
    </div>
  `;

  [
    "tipo_proyecto",
    "cultivo",
    "provincia",
    "superficie",
    "fuente_agua",
    "sistema_existente",
    "fecha_estimada",
    "nombre",
    "email",
    "telefono",
    "detalle",
  ].forEach((key) => {
    const value = data[key];
    setText(summary, `[data-summary="${key}"]`, value);
  });

  if (!data.detalle) {
    setText(summary, '[data-summary="detalle"]', "Sin observaciones");
  }
};

const showSuccessMessage = () => {
  const logoPath = siteConfig.logoPath || DEFAULT_LOGO;

  // Ocultar toast de privacidad al finalizar
  if (privacyToast) {
    privacyToast.classList.remove("visible");
  }

  document.querySelector(".wizard-card").innerHTML = `
    <div class="wizard-header-logo">
      <img src="${logoPath}" alt="Metzer Logo" class="form-logo-img">
    </div>
    <div style="text-align:center;padding:var(--brand-padding-card)">
      <div style="margin-bottom:16px; display:flex; justify-content:center; color:var(--brand-primary)">
        <i data-lucide="check-circle" style="width:64px; height:64px"></i> <!-- Icono de Lucide -->
      </div>
      <h2>Solicitud enviada</h2>
      <p>
        Recibimos su solicitud. Un especialista de Metzer revisará
        cultivo, superficie y ubicación para contactarlo con una
        recomendación inicial dentro de 24/48 hs hábiles.
      </p>
      <button class="btn btn-primary" type="button" id="restartBtn"> 
        Nueva solicitud
      </button>
    </div>`;

  refreshIcons();

  document.getElementById("restartBtn").addEventListener("click", () => {
    window.location.reload();
  });
};

const setSubmitState = (submitting) => {
  isSubmitting = submitting;
  nextBtn.disabled = submitting;
  prevBtn.disabled = submitting;
  nextBtn.textContent = submitting ? "Enviando..." : "Solicitar asesoramiento";
};

const submitLead = async () => {
  setSubmitState(true);

  try {
    const response = await fetch(
      siteConfig.leadEndpoint || "/api/send-lead.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getFormData()),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "No se pudo enviar la solicitud.");
    }

    showSuccessMessage();
  } catch (error) {
    formStatus.textContent =
      "No pudimos enviar la solicitud. Revise su conexión e intente nuevamente.";
    console.error("Error enviando lead:", error);
    setSubmitState(false);
  }
};

// --- Event Listeners ---
nextBtn.addEventListener("click", () => {
  if (isSubmitting || !validateCurrentStep()) return;

  if (currentStep < steps.length - 1) {
    currentStep += 1;
    updateWizard();
    steps[currentStep]?.querySelector("h2")?.focus();
  } else {
    submitLead();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep -= 1;
    updateWizard();
    steps[currentStep]?.querySelector("h2")?.focus();
  }
});

form.querySelectorAll('input[name="cultivo"]').forEach((input) => {
  input.addEventListener("change", () => {
    setFieldError("cultivo", "");
  });
});

form.querySelectorAll('input[name="tipo_proyecto"]').forEach((input) => {
  input.addEventListener("change", () => {
    setFieldError("tipo_proyecto", "");
    toggleSistemaExistente();
  });
});

["nombre", "email", "telefono"].forEach((fieldName) => {
  form[fieldName].addEventListener("input", () => {
    setFieldError(fieldName, "");
  });
});

form.addEventListener("animationend", (e) => {
  if (e.animationName === "shake") {
    e.target.classList.remove("shake-animation");
  }
});

const closePrivacyToastBtn = document.getElementById("closePrivacyToast");
if (closePrivacyToastBtn && privacyToast) {
  closePrivacyToastBtn.addEventListener("click", () => {
    isPrivacyToastDismissed = true;
    privacyToast.classList.remove("visible");
  });
}

const updateLogos = () => {
  const logoPath = siteConfig.logoPath || DEFAULT_LOGO;
  const headerLogo = document.getElementById("headerLogo");
  const formLogo = document.getElementById("formLogo");
  if (headerLogo) headerLogo.src = logoPath;
  if (formLogo) formLogo.src = logoPath;
};

// --- Initialization ---
if (advisorLink && siteConfig.advisorUrl) {
  advisorLink.href = siteConfig.advisorUrl;
}

updateWizard();
refreshIcons();
updateLogos();
