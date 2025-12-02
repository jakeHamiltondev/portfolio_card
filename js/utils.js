/**
 * Encode an object to base64 for URL transmission
 * @param {Object} obj - Object to encode
 * @returns {string} Base64 encoded string
 */
const encodeObj = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));

/**
 * Decode a base64 string back to an object
 * @param {string} str - Base64 encoded string
 * @returns {Object} Decoded object
 */
const decodeObj = (str) => JSON.parse(decodeURIComponent(escape(atob(str))));

/**
 * Normalize hex color (convert 3-digit to 6-digit)
 * @param {string} hex - Hex color string
 * @returns {string|null} Normalized hex or null if invalid
 */
function _hex(hex) {
  hex = (hex || '').trim().toLowerCase();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(hex)) return null;
  if (hex.length === 4) {
    // Convert #abc to #aabbcc
    hex = '#' + [hex[1], hex[2], hex[3]].map(c => c + c).join('');
  }
  return hex;
}

/**
 * Convert hex to RGB object
 * @param {string} hex - Hex color string
 * @returns {Object|null} RGB object {r, g, b} or null if invalid
 */
function _rgb(hex) {
  hex = _hex(hex);
  if (!hex) return null;
  return {
    r: parseInt(hex.substr(1, 2), 16),
    g: parseInt(hex.substr(3, 2), 16),
    b: parseInt(hex.substr(5, 2), 16)
  };
}

/**
 * Calculate relative luminance of a color
 * @param {string} hex - Hex color string
 * @returns {number} Luminance value (0-1)
 */
function _lum(hex) {
  const rgb = _rgb(hex);
  if (!rgb) return 1;
  
  // Convert to linear RGB and calculate luminance
  const linearize = (val) => {
    val /= 255;
    return val <= 0.03928 
      ? val / 12.92 
      : Math.pow((val + 0.055) / 1.055, 2.4);
  };
  
  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Determine best text color for given background
 * @param {string} bgHex - Background hex color
 * @returns {string} Either '#111827' (dark) or '#ffffff' (light)
 */
function textOn(bgHex) {
  return _lum(bgHex) > 0.5 ? '#111827' : '#ffffff';
}

/**
 * Validate hex color format
 * @param {string} value - String to validate
 * @returns {boolean} True if valid hex color
 */
function isHexColor(value) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test((value || '').trim());
}

/**
 * Pick valid color from text input or color picker
 * @param {string} textVal - Value from text input
 * @param {string} pickerVal - Value from color picker
 * @param {string} fallback - Fallback color
 * @returns {string} Valid hex color
 */
function pickColor(textVal, pickerVal, fallback) {
  const trimmed = (textVal || '').trim();
  if (isHexColor(trimmed)) return trimmed.toLowerCase();
  if (isHexColor(pickerVal)) return pickerVal.toLowerCase();
  return fallback;
}

/**
 * Calculate contrasting text color (alternative method)
 * @param {string} hex - Background hex color
 * @returns {string} Contrasting text color
 */
function contrastColor(hex) {
  let color = (hex || '#000').replace('#', '').trim();
  
  // Convert 3-digit to 6-digit
  if (color.length === 3) {
    color = color.split('').map(x => x + x).join('');
  }
  
  // Parse RGB values
  const r = parseInt(color.slice(0, 2), 16) || 0;
  const g = parseInt(color.slice(2, 4), 16) || 0;
  const b = parseInt(color.slice(4, 6), 16) || 0;
  
  // Calculate YIQ value
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
  return yiq >= 128 ? '#111827' : '#ffffff';
}

/**
 * Format name with proper capitalization
 * Handles hyphenated names, apostrophes, and particles (de, van, etc.)
 * @param {string} name - Name to format
 * @param {boolean} isLastName - Whether this is a last name (allows spaces)
 * @returns {string|null} Formatted name or null if invalid
 */
function formatName(name, isLastName = false) {
  name = name.trim();

  // Normalize spaces
  if (isLastName) {
    name = name.replace(/\s+/g, " ");
  } else {
    name = name.replace(/\s+/g, "");
  }

  // Validate characters
  const allowedRegex = isLastName ? /^[A-Za-z' -]+$/ : /^[A-Za-z'-]+$/;
  if (!allowedRegex.test(name)) return null;

  // Check length
  if (name.length < 1 || name.length > 30) return null;

  // Name particles that should stay lowercase
  const particles = ["de", "del", "la", "las", "los", "da", "das", "dos", 
                     "van", "von", "der", "den", "le", "du", "di"];

  /**
   * Capitalize a word appropriately
   * @param {string} word - Word to capitalize
   * @returns {string} Properly capitalized word
   */
  function capitalize(word) {
    const lower = word.toLowerCase();

    // Keep particles lowercase
    if (particles.includes(lower)) return lower;

    // Handle hyphenated parts
    if (lower.includes("-")) {
      return lower.split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-");
    }

    // Handle apostrophes (O'Neil)
    if (lower.includes("'")) {
      return lower.split("'")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join("'");
    }

    // Standard capitalization
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  // Split into words and capitalize each
  const parts = isLastName ? name.split(" ") : [name];
  return parts.map(capitalize).join(" ");
}

/**
 * Validate email format and return list of errors
 * @param {string} email - Email to validate
 * @returns {Array<string>} Array of error messages
 */
function getEmailErrors(email) {
  const trimmed = email.trim().toLowerCase();
  let errors = [];

  // Length check
  if (trimmed.length < 5 || trimmed.length > 80) {
    errors.push("Email length must be between 5–80 characters.");
  }

  // @ symbol check
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) {
    errors.push("Must contain exactly one '@' symbol.");
  }

  // Basic format checks
  if (trimmed.includes("..")) errors.push("Email cannot contain consecutive dots.");
  if (trimmed.startsWith(".")) errors.push("Email cannot start with a dot.");
  if (trimmed.endsWith(".")) errors.push("Email cannot end with a dot.");
  if (trimmed.startsWith("-")) errors.push("Email cannot start with a dash.");

  // Domain validation
  if (atCount === 1) {
    const [localPart, domainPart] = trimmed.split("@");

    if (!localPart.length) errors.push("Missing text before '@'.");
    if (!domainPart.includes(".")) errors.push("Domain must contain a dot.");
    if (domainPart.includes("..")) errors.push("Domain cannot contain consecutive dots.");
    if (domainPart.startsWith(".")) errors.push("Domain cannot start with a dot.");
    if (domainPart.endsWith(".")) errors.push("Domain cannot end with a dot.");
    if (/[0-9]/.test(domainPart)) errors.push("Domain cannot contain numbers.");

    // TLD validation
    const tld = domainPart.split(".").pop();
    if ((tld || '').length < 2) {
      errors.push("Top-level domain must be at least 2 letters.");
    }
  }

  return errors;
}

/**
 * Format phone number for display and E.164
 * @param {string} countryCode - Country code
 * @param {string} local - 10-digit local number
 * @returns {Object} {pretty, e164} formatted phone numbers
 */
function formatPhone(countryCode, local) {
  const pretty = `+${countryCode} (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  const e164 = `+${countryCode}${local}`;
  return { pretty, e164 };
}

/**
 * Show or hide phone error message
 * @param {string} message - Error message to display (empty to hide)
 */
function showPhoneError(message) {
  const errorBox = document.getElementById('phoneError');
  if (!errorBox) return;

  if (message) {
    errorBox.style.display = 'block';
    errorBox.innerHTML = message;
  } else {
    errorBox.style.display = 'none';
    errorBox.innerHTML = '';
  }
}

/**
 * Parse pretty-formatted phone number back to components
 * @param {string} prettyPhone - Formatted phone like "+1 (555) 123-4567"
 * @returns {Object|null} {cc, local, prettyLocal} or null if invalid
 */
function parsePrettyPhone10(prettyPhone) {
  const match = (prettyPhone || '').match(/^\+?(\d{1,3})\s*\((\d{3})\)\s*(\d{3})-(\d{4})$/);
  if (!match) return null;

  const localNumber = match[2] + match[3] + match[4]; // 10 digits
  const prettyLocal = `(${match[2]})-${match[3]}-${match[4]}`;

  return {
    cc: match[1],
    local: localNumber,
    prettyLocal: prettyLocal
  };
}

/**
 * Add https:// to URL if missing protocol
 * @param {string} url - URL to fix
 * @returns {string} URL with protocol
 */
function fixUrl(url) {
  if (!url || !url.trim()) return '';
  
  url = url.trim();
  
  // Already has protocol
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  
  // Add https://
  return 'https://' + url;
}