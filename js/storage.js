/* ==========================================================
   STORAGE MODULE
   Wrapper around localStorage for card and contacts data
   ========================================================== */

/**
 * Get user's business card from localStorage
 * @returns {Object|null} Card data object or null if not found
 */
function getMyCard() {
  try {
    const myCard = localStorage.getItem('myCard');
    return myCard ? JSON.parse(myCard) : null;
  } catch (error) {
    console.error('Failed to get card from storage:', error);
    return null;
  }
}

/**
 * Save user's business card to localStorage
 * @param {Object} cardData - Card data to save
 * @returns {boolean} True if successful, false otherwise
 */
function saveMyCard(cardData) {
  try {
    localStorage.setItem('myCard', JSON.stringify(cardData));
    return true;
  } catch (error) {
    console.error('Failed to save card to storage:', error);
    alert('Could not save your card (storage full). Try reducing image size.');
    return false;
  }
}

/**
 * Remove user's business card from localStorage
 * @returns {boolean} True if successful, false otherwise
 */
function removeMyCard() {
  try {
    localStorage.removeItem('myCard');
    return true;
  } catch (error) {
    console.error('Failed to remove card from storage:', error);
    return false;
  }
}

/**
 * Get all saved contacts from localStorage
 * @returns {Array} Array of contact objects (empty array if none)
 */
function getSavedContacts() {
  try {
    const contacts = localStorage.getItem('savedContacts');
    return contacts ? JSON.parse(contacts) : [];
  } catch (error) {
    console.error('Failed to get contacts from storage:', error);
    return [];
  }
}

/**
 * Save all contacts to localStorage
 * @param {Array} contacts - Array of contact objects
 * @returns {boolean} True if successful, false otherwise
 */
function saveSavedContacts(contacts) {
  try {
    localStorage.setItem('savedContacts', JSON.stringify(contacts));
    return true;
  } catch (error) {
    console.error('Failed to save contacts to storage:', error);
    return false;
  }
}

/**
 * Add a contact to saved contacts
 * @param {Object} contact - Contact object to add
 * @returns {boolean} True if successful, false if duplicate or error
 */
function addContact(contact) {
  const contacts = getSavedContacts();
  
  // Check for duplicates
  const exists = contacts.some(c =>
    c.firstName === contact.firstName &&
    c.lastName === contact.lastName &&
    c.email === contact.email
  );
  
  if (exists) {
    return false; // Duplicate
  }
  
  // Add timestamp
  contact.savedAt = new Date().toISOString();
  
  contacts.push(contact);
  return saveSavedContacts(contacts);
}

/**
 * Remove a contact by index
 * @param {number} index - Index of contact to remove
 * @returns {boolean} True if successful, false otherwise
 */
function removeContact(index) {
  const contacts = getSavedContacts();
  
  if (index < 0 || index >= contacts.length) {
    return false; // Invalid index
  }
  
  contacts.splice(index, 1);
  return saveSavedContacts(contacts);
}