/* ==========================================================
   SETTINGS MODULE
   Handles settings form validation, saving, and image upload
   ========================================================== */

/* ==========================================================
   INPUT VALIDATION & FORMATTING
   Real-time validation for name, email, and phone inputs
   ========================================================== */

/**
 * Initialize all input validation filters
 * Called on page load
 */
function initializeInputValidation() {
  // Name input filters - allow only letters, hyphens, apostrophes, and spaces
  setTimeout(() => {
    const firstNameInput = document.getElementById("firstNameInput");
    const lastNameInput = document.getElementById("lastNameInput");

    if (firstNameInput) {
      firstNameInput.addEventListener("input", () => {
        // Allow only valid name characters
        firstNameInput.value = firstNameInput.value.replace(/[^A-Za-z'-]/g, "");
      });
    }

    if (lastNameInput) {
      lastNameInput.addEventListener("input", () => {
        // Allow spaces in last names (for multi-part names)
        lastNameInput.value = lastNameInput.value.replace(/[^A-Za-z' -]/g, "");
      });
    }
  }, 300);

  // Email input filter - allows only valid email characters
  document.getElementById("emailInput").addEventListener("input", function(event) {
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
  const emailInput = document.getElementById("emailInput");
  const emailErrorBox = document.getElementById("emailErrorBox");

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

  // Phone number input filter (digits only, max 10)
  (function initPhoneFilter() {
    const localInput = document.getElementById('localNumberInput');
    if (!localInput) return;

    const filter = () => {
      // Remove non-digits and limit to 10
      let value = localInput.value.replace(/\D+/g, '');
      if (value.length > 10) value = value.slice(0, 10);
      localInput.value = value;
    };

    ['input', 'paste', 'change', 'blur'].forEach(evt => {
      localInput.addEventListener(evt, filter);
    });
  })();
}

/* ==========================================================
   COLOR PICKER SYNC
   Keep color picker and text input synchronized
   ========================================================== */

/**
 * Initialize color picker synchronization
 * Called on page load
 */
function initializeColorPickers() {
  // Card color sync
  document.getElementById('cardColorPicker').addEventListener('input', (event) => {
    document.getElementById('cardColorInput').value = event.target.value;
  });

  document.getElementById('cardColorInput').addEventListener('input', (event) => {
    document.getElementById('cardColorPicker').value = event.target.value;
  });

  // Background color sync
  document.getElementById('bgColorPicker').addEventListener('input', (event) => {
    document.getElementById('bgColorInput').value = event.target.value;
  });

  document.getElementById('bgColorInput').addEventListener('input', (event) => {
    document.getElementById('bgColorPicker').value = event.target.value;
  });
}

/* ==========================================================
   SAVE SETTINGS
   Validate and save all card settings to localStorage
   ========================================================== */

/**
 * Validate and save all card settings
 * Performs comprehensive validation before saving
 */
function saveSettings() {
  // Validate and format names
  const firstName = formatName(document.getElementById('firstNameInput').value, false);
  const lastName = formatName(document.getElementById('lastNameInput').value, true);
  
  if (!firstName) {
    alert("Invalid first name.");
    return;
  }
  if (!lastName) {
    alert("Invalid last name.");
    return;
  }

  // Validate email
  const emailErrors = getEmailErrors(document.getElementById('emailInput').value);
  if (emailErrors.length) {
    alert("Email invalid:\n- " + emailErrors.join("\n- "));
    return;
  }

  // Get form values
  const email = document.getElementById('emailInput').value.trim().toLowerCase();
  const linkedin = fixUrl(document.getElementById('linkedinInput').value);
  const jobTitle = document.getElementById('jobTitleInput').value;

  // Validate phone number
  const countryCode = (document.getElementById('countryCodeSelect').value || '').trim();
  const localNumber = (document.getElementById('localNumberInput').value || '').trim();
  
  if (!countryCode) {
    showPhoneError('Please choose a country code.');
    return;
  }
  if (!ALLOWED_COUNTRY_CODES.includes(countryCode)) {
    showPhoneError('Country code is not allowed.');
    return;
  }
  if (localNumber.length !== 10) {
    showPhoneError('Phone number must be exactly 10 digits.');
    return;
  }
  if (!/^\d{10}$/.test(localNumber)) {
    showPhoneError('Phone number can contain digits only.');
    return;
  }
  showPhoneError('');

  // Get color values
  const cardColor = pickColor(
    document.getElementById('cardColorInput').value,
    document.getElementById('cardColorPicker').value,
    '#6366f1'
  );
  const bgColor = pickColor(
    document.getElementById('bgColorInput').value,
    document.getElementById('bgColorPicker').value,
    '#6B46C1'
  );

  // Get portfolio URLs and fix formatting
  const certPage = fixUrl(document.getElementById('certPageInput').value);
  const eduPage = fixUrl(document.getElementById('eduPageInput').value);
  const projPage = fixUrl(document.getElementById('projPageInput').value);
  const refPage = fixUrl(document.getElementById('refPageInput').value);
  const resumePdfPage = fixUrl(document.getElementById('resumePdfInput').value);
  const resumeDocxPage = fixUrl(document.getElementById('resumeDocxInput').value);
  const workPage = fixUrl(document.getElementById('workPageInput').value);

  // Get portfolio visibility settings
  const showCert = document.getElementById('showCertifications').checked;
  const showEdu = document.getElementById('showEducation').checked;
  const showProj = document.getElementById('showProjects').checked;
  const showRef = document.getElementById('showReferences').checked;
  const showResume = document.getElementById('showResume').checked;
  const showWork = document.getElementById('showWork').checked;

  // Get profile picture (uploaded or existing)
  let profilePicData = uploadedImageData || document.getElementById('profilePic').src;
  
  // Format phone number
  const formattedPhone = formatPhone(countryCode, localNumber);

  // Build card data object
  const cardData = {
    firstName: firstName,
    lastName: lastName,
    jobTitle: jobTitle,
    email: email,
    phone: formattedPhone.pretty,
    phoneE164: formattedPhone.e164,
    countryCode: countryCode,
    localNumber: localNumber,
    linkedin: linkedin,
    cardColor: cardColor,
    bgColor: bgColor,
    profilePic: profilePicData,
    portfolioLinks: {
      cert: certPage,
      edu: eduPage,
      proj: projPage,
      ref: refPage,
      resume: {
        pdf: resumePdfPage,
        docx: resumeDocxPage
      },
      work: workPage
    },
    portfolioVisibility: {
      cert: showCert,
      edu: showEdu,
      proj: showProj,
      ref: showRef,
      resume: showResume,
      work: showWork
    },
    lastUpdated: new Date().toISOString()
  };

  // Save to localStorage
  if (!saveMyCard(cardData)) {
    return; // Error already handled by saveMyCard
  }

  // Apply to current card view
  applyCardData(cardData);
  loadMyCardSection();

  // Clear temporary upload data
  uploadedImageData = null;

  // Show success message BEFORE closing panel
  alert('Your card has been saved!');
  closeSettings();
}

/* ==========================================================
   RESET TO DEFAULT
   Clear saved data and reset to John Doe template
   ========================================================== */

/**
 * Reset card to default John Doe template
 * Clears all saved data from localStorage
 */
function resetToJohnDoe() {
  if (!confirm('Are you sure you want to reset to default? This will delete your current card.')) {
    return;
  }

  removeMyCard();

  // Remove ?card= parameter from URL
  if (location.search.includes('card=')) {
    const cleanUrl = `${location.origin}${location.pathname}`;
    history.replaceState({}, '', cleanUrl);
  }

  // Reset viewing state
  viewingSharedCard = false;
  sharedCardData = null;

  // Apply default card
  applyCardData(DEFAULT_CARD);
  loadMyCardSection();

  alert('Card has been reset to default (John Doe).');
}

/* ==========================================================
   IMAGE CROP FUNCTIONALITY
   Allow users to position and zoom their profile picture
   ========================================================== */

let cropState = {
  originalImage: null,
  scale: 1,
  position: { x: 0, y: 0 },
  isDragging: false,
  dragStart: { x: 0, y: 0 }
};

/**
 * Initialize profile picture upload handler with crop tool
 */
function initializeImageUpload() {
  document.getElementById('profilePicInput').addEventListener('change', function(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const fileReader = new FileReader();

      fileReader.onload = function(loadEvent) {
        // Store original image
        cropState.originalImage = loadEvent.target.result;
        
        // Open crop modal
        openCropModal(cropState.originalImage);
      };

      fileReader.readAsDataURL(file);
    }
  });
}

/**
 * Open the crop modal with the uploaded image
 */
function openCropModal(imageDataUrl) {
  const modal = document.getElementById('cropModal');
  const cropImage = document.getElementById('cropImage');
  const zoomSlider = document.getElementById('zoomSlider');
  
  // Reset crop state
  cropState.scale = 1;
  cropState.position = { x: 0, y: 0 };
  cropState.isDragging = false;
  
  // Load image
  cropImage.src = imageDataUrl;
  
  // Wait for image to load to get dimensions
  cropImage.onload = function() {
    const container = document.getElementById('cropContainer');
    const containerSize = Math.min(container.clientWidth, container.clientHeight);
    
    // Calculate initial scale to fit image in container
    const imageAspect = cropImage.naturalWidth / cropImage.naturalHeight;
    
    if (imageAspect > 1) {
      // Landscape
      cropImage.style.height = containerSize + 'px';
      cropImage.style.width = (containerSize * imageAspect) + 'px';
    } else {
      // Portrait or square
      cropImage.style.width = containerSize + 'px';
      cropImage.style.height = (containerSize / imageAspect) + 'px';
    }
    
    // Center image
    centerCropImage();
  };
  
  // Reset zoom slider
  zoomSlider.value = 100;
  
  // Show modal
  modal.classList.add('active');
  document.body.classList.add('cropping'); // Prevent mobile scroll
  
  // Setup event listeners
  setupCropListeners();
}

/**
 * Center the crop image in the container
 */
function centerCropImage() {
  const container = document.getElementById('cropContainer');
  const image = document.getElementById('cropImage');
  
  const containerRect = container.getBoundingClientRect();
  const imageRect = image.getBoundingClientRect();
  
  cropState.position.x = (containerRect.width - imageRect.width) / 2;
  cropState.position.y = (containerRect.height - imageRect.height) / 2;
  
  updateCropImagePosition();
}

/**
 * Setup drag and zoom event listeners
 */
function setupCropListeners() {
  const container = document.getElementById('cropContainer');
  const image = document.getElementById('cropImage');
  const zoomSlider = document.getElementById('zoomSlider');
  
  // Mouse drag
  container.onmousedown = function(e) {
    e.preventDefault();
    cropState.isDragging = true;
    cropState.dragStart = {
      x: e.clientX - cropState.position.x,
      y: e.clientY - cropState.position.y
    };
  };
  
  document.onmousemove = function(e) {
    if (cropState.isDragging) {
      cropState.position.x = e.clientX - cropState.dragStart.x;
      cropState.position.y = e.clientY - cropState.dragStart.y;
      updateCropImagePosition();
    }
  };
  
  document.onmouseup = function() {
    cropState.isDragging = false;
  };
  
  // Touch drag (improved for mobile)
  container.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    cropState.isDragging = true;
    cropState.dragStart = {
      x: touch.clientX - cropState.position.x,
      y: touch.clientY - cropState.position.y
    };
    e.preventDefault(); // Prevent scrolling while dragging
  }, { passive: false });
  
  document.addEventListener('touchmove', function(e) {
    if (cropState.isDragging) {
      e.preventDefault(); // Prevent scrolling while dragging
      const touch = e.touches[0];
      cropState.position.x = touch.clientX - cropState.dragStart.x;
      cropState.position.y = touch.clientY - cropState.dragStart.y;
      updateCropImagePosition();
    }
  }, { passive: false });
  
  document.addEventListener('touchend', function(e) {
    if (cropState.isDragging) {
      e.preventDefault();
      cropState.isDragging = false;
    }
  }, { passive: false });
  
  // Zoom slider
  zoomSlider.oninput = function() {
    const newScale = this.value / 100;
    const scaleDiff = newScale / cropState.scale;
    
    // Adjust position to zoom from center
    const container = document.getElementById('cropContainer');
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;
    
    cropState.position.x = centerX - (centerX - cropState.position.x) * scaleDiff;
    cropState.position.y = centerY - (centerY - cropState.position.y) * scaleDiff;
    
    cropState.scale = newScale;
    updateCropImagePosition();
  };
}

/**
 * Update crop image position and scale
 */
function updateCropImagePosition() {
  const image = document.getElementById('cropImage');
  image.style.transform = `translate(${cropState.position.x}px, ${cropState.position.y}px) scale(${cropState.scale})`;
  image.style.transformOrigin = '0 0';
}

/**
 * Cancel crop and close modal
 */
function cancelCrop() {
  const modal = document.getElementById('cropModal');
  modal.classList.remove('active');
  document.body.classList.remove('cropping'); // Re-enable mobile scroll
  
  // Clear file input
  document.getElementById('profilePicInput').value = '';
  
  // Remove event listeners
  document.onmousemove = null;
  document.onmouseup = null;
  document.ontouchmove = null;
  document.ontouchend = null;
}

/**
 * Save the cropped image
 */
function saveCrop() {
  const container = document.getElementById('cropContainer');
  const image = document.getElementById('cropImage');
  
  // Create canvas for final crop
  const canvas = document.createElement('canvas');
  const size = 800; // Final image size
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  
  // Calculate source dimensions from crop area
  const containerSize = container.clientWidth;
  const imageRect = image.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  // Calculate which part of the image is visible
  const scaleRatio = image.naturalWidth / imageRect.width;
  
  const sourceX = (containerRect.left - imageRect.left) * scaleRatio;
  const sourceY = (containerRect.top - imageRect.top) * scaleRatio;
  const sourceSize = containerSize * scaleRatio;
  
  // Draw cropped portion to canvas
  ctx.drawImage(
    image,
    sourceX, sourceY, sourceSize, sourceSize,
    0, 0, size, size
  );
  
  // Convert to compressed JPEG
  const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
  
  // Store and update previews
  uploadedImageData = croppedDataUrl;
  document.getElementById('previewPic').src = croppedDataUrl;
  document.getElementById('profilePic').src = croppedDataUrl;
  document.getElementById('profilePicSmall').src = croppedDataUrl;
  
  // Close modal
  const modal = document.getElementById('cropModal');
  modal.classList.remove('active');
  document.body.classList.remove('cropping'); // Re-enable mobile scroll
  
  // Log size
  console.log(`Cropped image size: ${(croppedDataUrl.length / 1024).toFixed(0)}KB`);
  
  // Remove event listeners
  document.onmousemove = null;
  document.onmouseup = null;
  document.ontouchmove = null;
  document.ontouchend = null;
}