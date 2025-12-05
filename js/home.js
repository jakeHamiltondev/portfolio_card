/* ==========================================================
   HOME MODULE
   Manages home panel with My Card and Saved Contacts tabs
   ========================================================== */

/**
 * Open the home panel (My Card & Saved Contacts)
 * Loads initial content for both tabs
 */
function openHome() {
  document.getElementById('homePanel').classList.add('active');
  loadMyCardSection();
  loadContacts();
}

/**
 * Close the home panel
 * Returns user to main card view
 */
function closeHome() {
  document.getElementById('homePanel').classList.remove('active');
}

/**
 * Switch active tab in home panel
 * @param {string} tabName - Name of tab to activate ('myCard' or 'contacts')
 */
function switchTab(tabName) {
  // Update tab button states
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  // Update tab content visibility
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(tabName + 'Tab').classList.add('active');

  // Load appropriate content
  if (tabName === 'myCard') {
    loadMyCardSection();
  } else if (tabName === 'contacts') {
    loadContacts();
  }
}

/**
 * Load and display user's card in home panel
 * Shows empty state if no card exists
 */
function loadMyCardSection() {
  const myCard = getMyCard();
  const section = document.getElementById('myCardSection');

  if (!myCard) {
    // Show empty state with create button
    section.innerHTML = `
      <div class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
        <h3>Create Your Business Card</h3>
        <p>Set up your digital business card to share with others</p>
        <button class="save-btn" onclick="openSettings()" style="max-width:200px;margin:20px auto 0;">Create My Card</button>
      </div>`;
    return;
  }

  // Calculate colors for styling
  const accent = myCard.cardColor || '#6366f1';
  const text = textOn(accent);
  const chipBg = text === '#ffffff' 
    ? 'rgba(255,255,255,0.2)' 
    : 'rgba(0,0,0,0.08)';
  const chipBorder = text === '#ffffff' ? '#ffffff' : 'rgba(0,0,0,0.2)';
  const editText = _lum(accent) > 0.85 ? '#111827' : accent;
  const borderColor = _lum(accent) < 0.45 ? '#ffffff' : '#111827';

  // Build name line with optional job title
  const nameLine = (myCard.jobTitle && myCard.jobTitle.trim())
    ? `${myCard.firstName} ${myCard.lastName} - ${myCard.jobTitle}`
    : `${myCard.firstName} ${myCard.lastName}`;

  // Render card preview
  section.innerHTML = `
    <div class="my-card-section" style="background:${accent};color:${text};border:2px solid ${borderColor}">
      <h3 style="color:${text}">My Business Card</h3>

      <div class="my-card-preview">
        <img src="${myCard.profilePic}" alt="${myCard.firstName}" class="my-card-pic">

        <div class="my-card-details">
          <h4 style="color:${text}">${nameLine}</h4>
          <p style="color:${text}">${myCard.email}</p>
          <p style="color:${text}">${myCard.phone || ''}</p>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:20px;">
        <button class="action-btn" onclick="closeHome(); openSettings();" 
          style="background:#fff;color:${editText};font-weight:600;border:1px solid ${chipBorder}">
          Edit Card
        </button>

        <button class="action-btn" onclick="closeHome(); openShare();" 
          style="background:${chipBg};color:${text};border:1px solid ${chipBorder};font-weight:600">
          Share Card
        </button>
      </div>
    </div>`;
}

/**
 * Load and display all saved contacts
 * Shows empty state if no contacts saved
 */
function loadContacts() {
  const contacts = getSavedContacts();
  const grid = document.getElementById('contactsGrid');

  if (contacts.length === 0) {
    // Show empty state
    grid.classList.add('is-empty');
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h3>No contacts yet</h3>
        <p>When someone shares their card with you, save it here</p>
      </div>`;
    return;
  }

  grid.classList.remove('is-empty');

  // Render contact cards
  grid.innerHTML = contacts.map((contact, index) => {
    // Generate avatar URL if no profile pic
    const avatarUrl = contact.profilePic && contact.profilePic.length > 100
      ? contact.profilePic
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.firstName + ' ' + contact.lastName)}&size=120&background=6366f1&color=fff&bold=true`;
    
    return `
      <div class="saved-card">
        <div class="saved-card-header">
          <img src="${avatarUrl}" alt="${contact.firstName}" class="saved-card-pic">
          <div class="saved-card-info">
            <h3>${contact.firstName} ${contact.lastName}</h3>
            <p>${contact.email}</p>
          </div>
        </div>

        <div class="saved-card-actions">
          <button class="action-btn" onclick="viewContact(${index})">View</button>
          <button class="action-btn delete-btn" onclick="deleteContact(${index})">Delete</button>
        </div>
      </div>
    `}).join('');
}

/**
 * Save currently viewed shared card to contacts
 * Prevents duplicate saves and returns user to their own card
 */
function saveContact() {
  if (!sharedCardData) return;

  const success = addContact(sharedCardData);

  if (!success) {
    alert('This contact is already in your collection!');
    return;
  }

  alert(`${sharedCardData.firstName} ${sharedCardData.lastName}'s card saved to your contacts!`);
  document.getElementById('saveContactBtn').classList.remove('show');
  
  // Return to user's own card
  viewingSharedCard = false;
  sharedCardData = null;
  loadMyCard();
  
  // Clean up URL
  if (location.search.includes('card=')) {
    const cleanUrl = `${location.origin}${location.pathname}`;
    history.replaceState({}, '', cleanUrl);
  }
}

/**
 * View a saved contact's card
 * @param {number} index - Index of contact in saved contacts array
 */
function viewContact(index) {
  const contacts = getSavedContacts();
  const contact = contacts[index];

  if (contact) {
    applyCardData(contact);
    closeHome();
    
    // Show "Back to My Card" button
    document.getElementById('backToMyCardBtn').classList.add('show');
  }
}

/**
 * Return to viewing user's own card
 * Hides the "Back to My Card" button and loads user's card
 */
function returnToMyCard() {
  // Hide the back button
  document.getElementById('backToMyCardBtn').classList.remove('show');
  
  // Load user's own card
  loadMyCard();
}

/**
 * Delete a saved contact after confirmation
 * @param {number} index - Index of contact to delete
 */
function deleteContact(index) {
  if (!confirm('Remove this contact?')) return;

  removeContact(index);
  loadContacts();
}