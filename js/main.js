/* ==========================================================
   MAIN MODULE
   Core application initialization and global state management
   ========================================================== */

/* ==========================================================
   GLOBAL STATE VARIABLES
   Core application state management
   ========================================================== */

// Card flip state
let isFlipped = false;

// Shared card viewing state
let viewingSharedCard = false;  // true when viewing someone else's card via URL
let sharedCardData = null;      // decoded data from ?card= URL parameter

// Temporary storage for image uploads before saving
let uploadedImageData = null;

/* ==========================================================
   INITIALIZATION
   Check URL for shared card on page load
   ========================================================== */

window.addEventListener('DOMContentLoaded', () => {
  checkForSharedCard();
  initializeEventListeners();
  initializeParallaxEffect();
  initializeFlipPrevention();
});

/* ==========================================================
   SHARED CARD DETECTION
   Check URL parameters for shared card data
   ========================================================== */

/**
 * Check if URL contains ?card= parameter and load shared card
 * Called on page load to determine viewing mode
 */
function checkForSharedCard() {
  const urlParams = new URLSearchParams(window.location.search);
  const cardData = urlParams.get('card');

  if (cardData) {
    // We're viewing a shared card
    viewingSharedCard = true;

    try {
      // Decode the card data from URL
      sharedCardData = decodeObj(cardData);
      applyCardData(sharedCardData);

      // Show save button for visitors
      const saveBtn = document.getElementById('saveContactBtn');
      if (saveBtn) saveBtn.classList.add('show');

      // Hide share button (doesn't make sense for visitors)
      const shareBtn = document.getElementById('shareButton');
      if (shareBtn) shareBtn.style.display = 'none';

      // Update hint text
      const hint = document.getElementById('hintText');
      if (hint) hint.textContent = 'Click card to see full details';
    } catch (error) {
      console.error('Invalid card data:', error);
      loadMyCard(); // Fall back to user's own card
    }
  } else {
    // No shared card, load user's own card
    loadMyCard();
  }
}

/* ==========================================================
   PERSONAL CARD LOADING
   Load user's saved card from localStorage
   ========================================================== */

/**
 * Load the user's own business card from localStorage
 * Falls back to default card if none exists
 */
function loadMyCard() {
  viewingSharedCard = false;

  const cardData = getMyCard();

  if (cardData) {
    applyCardData(cardData);
  } else {
    // No saved card, use default template
    applyCardData(DEFAULT_CARD);
  }
}

/* ==========================================================
   SETTINGS PANEL NAVIGATION
   Open/close settings panel
   ========================================================== */

/**
 * Open the settings panel
 */
function openSettings() {
  document.getElementById('settingsPanel').classList.add('active');
}

/**
 * Close the settings panel
 */
function closeSettings() {
  document.getElementById('settingsPanel').classList.remove('active');
}

/* ==========================================================
   EMAIL INPUT VALIDATION
   Live filtering and validation for email input
   ========================================================== */

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  // Email input filter - allows only valid email characters
  const emailInput = document.getElementById("emailInput");
  if (emailInput) {
    emailInput.addEventListener("input", function(event) {
      let value = event.target.value.toLowerCase();

      // Remove invalid characters
      value = value.replace(/[^a-z0-9@._-]/g, "");
      value = value.replace(/\s+/g, "");

      // Clean up domain part (no numbers in domain)
      if (value.includes("@")) {
        const atIndex = value.indexOf("@");
        let localPart = value.slice(0, atIndex);
        let domainPart = value.slice(atIndex + 1).replace(/[0-9]/g, "");
        value = localPart + "@" + domainPart;
      }

      event.target.value = value;
    });

    // Live email validation feedback
    const emailErrorBox = document.getElementById("emailErrorBox");
    if (emailErrorBox) {
      emailInput.addEventListener("input", () => {
        const value = emailInput.value.trim().toLowerCase();
        const errors = getEmailErrors(value);

        if (errors.length === 0) {
          emailErrorBox.style.display = "none";
          emailErrorBox.innerHTML = "";
        } else {
          emailErrorBox.style.display = "block";
          emailErrorBox.innerHTML = "⚠ Email is invalid:<br>• " + errors.join("<br>• ");
        }
      });
    }
  }
}

/* ==========================================================
   CARD PARALLAX EFFECT
   3D tilt effect on mouse movement / touch
   ========================================================== */

/**
 * Initialize parallax effect on card container
 */
function initializeParallaxEffect() {
  const cardContainer = document.querySelector('.card-container');

  if (!cardContainer) return;

  // Mouse move parallax (desktop)
  cardContainer.addEventListener('mousemove', (event) => {
    if (window.innerWidth > 768) {
      const rect = cardContainer.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation based on mouse position
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      cardContainer.style.transform = 
        `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  });

  // Reset on mouse leave
  cardContainer.addEventListener('mouseleave', () => {
    cardContainer.style.transform = 
      'perspective(1500px) rotateX(0deg) rotateY(0deg)';
  });

  // Touch parallax (mobile)
  cardContainer.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    const rect = cardContainer.getBoundingClientRect();

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Gentler rotation for touch
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    cardContainer.style.transform = 
      `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  // Reset on touch end
  cardContainer.addEventListener('touchend', () => {
    cardContainer.style.transform = 
      'perspective(1500px) rotateX(0deg) rotateY(0deg)';
  });
}

/* ==========================================================
   PREVENT ACCIDENTAL CARD FLIP
   Stop flip on interactive element clicks
   ========================================================== */

/**
 * Prevent accidental card flip when clicking interactive elements
 * Stops propagation for links, buttons, inputs, etc.
 */
function initializeFlipPrevention() {
  const cardRoot = document.getElementById('businessCard');
  if (!cardRoot) return;

  // Elements that should not trigger card flip
  const NON_FLIP_SELECTORS = 'a, button, input, select, textarea, [data-no-flip], .portfolio-link';

  // Use capture phase to intercept before flip handler
  ['click', 'touchstart'].forEach(eventType => {
    cardRoot.addEventListener(eventType, (event) => {
      if (event.target.closest(NON_FLIP_SELECTORS)) {
        return;
      }
    }, { capture: true });
  });
}