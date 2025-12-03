/* ==========================================================
   CARD MODULE
   Handles card flip interaction and data display
   ========================================================== */

/**
 * Flip the business card to show opposite side
 * Triggered by clicking the card
 */
function flipCard() {
  const card = document.getElementById('businessCard');
  const hint = document.getElementById('hintText');

  isFlipped = !isFlipped;

  if (isFlipped) {
    card.classList.add('flipped');
    hint.style.display = 'none';
  } else {
    card.classList.remove('flipped');
    hint.style.display = 'block';
  }
}

/**
 * Build a share-safe version of card data
 * Excludes large file blobs and sensitive information
 * @param {Object} cardData - Full card data
 * @returns {Object} Sanitized card data for sharing
 */
function buildShareObj(cardData) {
  // Ensure resume is properly structured
  let resumeData = cardData.portfolioLinks?.resume;
  if (typeof resumeData === 'string') {
    // Backward compatibility: convert old string format to new object format
    resumeData = { pdf: resumeData, docx: '' };
  } else if (!resumeData) {
    resumeData = { pdf: '', docx: '' };
  }

  return {
    firstName: cardData.firstName,
    lastName: cardData.lastName,
    jobTitle: cardData.jobTitle,
    email: cardData.email,
    phone: cardData.phone,
    phoneE164: cardData.phoneE164,
    linkedin: cardData.linkedin,
    cardColor: cardData.cardColor,
    bgColor: cardData.bgColor,
    profilePic: cardData.profilePic,
    portfolioLinks: {
      ...cardData.portfolioLinks,
      resume: resumeData
    },
    portfolioVisibility: cardData.portfolioVisibility || { 
      cert: true, edu: true, proj: true, ref: true, resume: true, work: true 
    }
  };
}

/**
 * Apply card data to all UI elements
 * Updates the business card display and settings form
 * @param {Object} cardData - Card data to apply
 */
function applyCardData(cardData) {
  // Update name and job title
  document.getElementById('fullName').textContent = 
    `${cardData.firstName} ${cardData.lastName}`;
  document.getElementById('jobTitle').textContent = cardData.jobTitle || '';

  // Update LinkedIn
  const linkedinLink = document.getElementById('linkedinLink');
  linkedinLink.href = cardData.linkedin || '#';
  linkedinLink.textContent = (cardData.linkedin || '')
    .replace('https://', '')
    .replace('http://', '');

  // Parse and format phone number
  let prettyPhone = cardData.phone;
  let e164Phone = cardData.phoneE164;

  if (!e164Phone && cardData.phone) {
    const parsed = parsePrettyPhone10(cardData.phone);
    if (parsed) {
      const formatted = formatPhone(parsed.cc, parsed.local);
      prettyPhone = formatted.pretty;
      e164Phone = formatted.e164;
    }
  }

  // Update phone display
  document.getElementById('phoneText').textContent = prettyPhone || '';
  document.getElementById('phoneLink').href = e164Phone ? 'tel:' + e164Phone : '#';

  // Update email
  document.getElementById('emailText').textContent = cardData.email;
  document.getElementById('emailLink').href = 'mailto:' + cardData.email;

  // Update images
  document.getElementById('profilePic').src = cardData.profilePic;
  document.getElementById('profilePicSmall').src = cardData.profilePic;
  document.getElementById('previewPic').src = cardData.profilePic;

  // Update card colors
  const cardColor = cardData.cardColor;
  document.getElementById('cardFront').style.background = 
    `linear-gradient(135deg, ${cardColor} 0%, ${cardColor} 50%, ${cardColor} 100%)`;
  document.getElementById('cardBack').style.background = cardColor;
  
  // Calculate text colors for contrast
  const textColor = contrastColor(cardColor);
  const chipBg = textColor === '#ffffff' 
    ? 'rgba(255,255,255,0.2)' 
    : 'rgba(0,0,0,0.15)';
  const chipBgHover = textColor === '#ffffff' 
    ? 'rgba(255,255,255,0.3)' 
    : 'rgba(0,0,0,0.25)';

  // Apply CSS custom properties for dynamic styling
  const cardBackEl = document.getElementById('cardBack');
  cardBackEl.style.setProperty('--card-text', textColor);
  cardBackEl.style.setProperty('--card-chip-bg', chipBg);
  cardBackEl.style.setProperty('--card-chip-bg-hover', chipBgHover);

  // Update background gradient
  document.body.style.setProperty('background', 
    `radial-gradient(circle at center, white 0%, ${cardData.bgColor} 100%)`, 
    'important');

  // Populate settings form (only for own card, not shared)
  if (!viewingSharedCard) {
    document.getElementById('firstNameInput').value = cardData.firstName;
    document.getElementById('lastNameInput').value = cardData.lastName;
    document.getElementById('jobTitleInput').value = cardData.jobTitle || '';
    document.getElementById('emailInput').value = cardData.email;
    document.getElementById('linkedinInput').value = cardData.linkedin || '';
    document.getElementById('cardColorInput').value = cardData.cardColor;
    document.getElementById('cardColorPicker').value = cardData.cardColor;
    document.getElementById('bgColorInput').value = cardData.bgColor;
    document.getElementById('bgColorPicker').value = cardData.bgColor;

    // Portfolio URLs
    const portfolioLinks = cardData.portfolioLinks || {};

    // Handle resume - support both old string format and new object format
    let resumeData = portfolioLinks.resume;
    if (typeof resumeData === 'string') {
      // Backward compatibility
      document.getElementById('resumePdfInput').value = resumeData;
      document.getElementById('resumeDocxInput').value = '';
    } else if (resumeData && typeof resumeData === 'object') {
      document.getElementById('resumePdfInput').value = resumeData.pdf || '';
      document.getElementById('resumeDocxInput').value = resumeData.docx || '';
    } else {
      document.getElementById('resumePdfInput').value = '';
      document.getElementById('resumeDocxInput').value = '';
    }

    document.getElementById('certPageInput').value = portfolioLinks.cert || '';
    document.getElementById('eduPageInput').value = portfolioLinks.edu || '';
    document.getElementById('projPageInput').value = portfolioLinks.proj || '';
    document.getElementById('refPageInput').value = portfolioLinks.ref || '';
    document.getElementById('workPageInput').value = portfolioLinks.work || '';     

    // Phone number fields
    const countryCodeSelect = document.getElementById('countryCodeSelect');
    const localNumberInput = document.getElementById('localNumberInput');

    let countryCode = cardData.countryCode;
    let localNumber = cardData.localNumber;

    // Try to parse from pretty phone if not available
    if ((!countryCode || !localNumber) && cardData.phone) {
      const parsed = parsePrettyPhone10(cardData.phone);
      if (parsed) {
        countryCode = parsed.cc;
        localNumber = parsed.local;
      }
    }

    // Set values if valid
    countryCodeSelect.value = (countryCode && ALLOWED_COUNTRY_CODES.includes(countryCode)) 
      ? countryCode 
      : '';
    localNumberInput.value = localNumber 
      ? localNumber.replace(/\D+/g, '').slice(0, 10) 
      : '';

    // Portfolio visibility checkboxes
    const visibility = cardData.portfolioVisibility || { 
      cert: true, edu: true, proj: true, ref: true, resume: true, work: true  
    };
    document.getElementById('showCertifications').checked = visibility.cert !== false;
    document.getElementById('showEducation').checked = visibility.edu !== false;
    document.getElementById('showProjects').checked = visibility.proj !== false;
    document.getElementById('showReferences').checked = visibility.ref !== false;
    document.getElementById('showResume').checked = visibility.resume !== false;     
    document.getElementById('showWork').checked = visibility.work !== false;         
  }

  // Store portfolio links globally for button handlers
  const portfolioLinks = cardData.portfolioLinks || {};
  if (portfolioLinks.resume && typeof portfolioLinks.resume === 'string') {
    // Convert old string format to new object format
    portfolioLinks.resume = { pdf: portfolioLinks.resume, docx: '' };
  } else if (!portfolioLinks.resume) {
    // Ensure resume exists as an object
    portfolioLinks.resume = { pdf: '', docx: '' };
  }
  window.portfolioLinks = portfolioLinks;

  console.log('✅ Set window.portfolioLinks:', window.portfolioLinks); // Debug line

  // Render portfolio section with visibility settings
  renderPortfolioSection(cardData);
}