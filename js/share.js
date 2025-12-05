/* ==========================================================
   SHARE MODULE
   Handles QR code generation and link sharing
   ========================================================== */

/**
 * Open the share panel (QR code generation)
 * Validates that user has a card before opening
 */
function openShare() {
  const myCard = getMyCard();
  if (!myCard) {
    alert('Please create your card in Settings first!');
    return;
  }

  document.getElementById('sharePanel').classList.add('active');
  generateQRCode();
}

/**
 * Close the share panel
 * Returns user to main card view
 */
function closeShare() {
  document.getElementById('sharePanel').classList.remove('active');
}

/**
 * Generate QR code for card sharing
 * Creates shareable URL and renders QR code image
 */
function generateQRCode() {
  const rawCard = getMyCard();
  const qrContainer = document.getElementById('qrcode');
  const warningsDiv = document.getElementById('qrWarnings');

  if (!rawCard || !qrContainer) return;

  // Build share object (exclude large data)
  const fullShareObj = buildShareObj(rawCard);
  
  // Smart profile picture handling for QR codes
  let profilePicForQR = fullShareObj.profilePic;
  
  // Only exclude if it's a large base64 image
  if (profilePicForQR && profilePicForQR.startsWith('data:image')) {
    // Base64 image - too large for QR, exclude it
    profilePicForQR = '';
  }
  // If it's a URL (http/https), keep it - it's small enough
  
  const qrShareObj = {
    ...fullShareObj,
    profilePic: profilePicForQR
  };
  
  const encodedCard = encodeObj(qrShareObj);

  // Build share URL
  let baseUrl = `${location.origin}${location.pathname}`;
  
  // Normalize URL (remove existing query params)
  try {
    const url = new URL(baseUrl, window.location.href);
    url.search = '';
    baseUrl = url.href;
  } catch (error) {
    // If URL parsing fails, use as-is
  }

  const shareUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}card=${encodedCard}`;

  // Clear previous content
  qrContainer.innerHTML = '';
  if (warningsDiv) warningsDiv.innerHTML = '';

  // Check for network accessibility issues
  try {
    const urlTest = new URL(baseUrl, window.location.href);
    const protocol = (urlTest.protocol || '').replace(':', '');
    const hostname = (urlTest.hostname || '').toLowerCase();

    if (protocol === 'file') {
      if (warningsDiv) {
        warningsDiv.innerHTML = 
          'This is a local file (<code>file://</code>). Phones cannot open that. ' +
          'Run a web server and use your network URL instead.';
      }
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (warningsDiv) {
        warningsDiv.innerHTML = 
          'The QR points to <code>localhost</code>. Other devices cannot reach it. ' +
          'Use your network IP (e.g., <code>http://192.168.1.23:5500/yourfile.html</code>).';
      }
    }
  } catch (error) {
    // Ignore URL parsing errors
  }

  // Check if payload is too large for QR code
  if (encodedCard.length > 4000) {
    qrContainer.innerHTML = `
      <div style="padding:20px;text-align:center;">
        <p style="color:#6b7280;margin-bottom:12px;">
          QR code generation failed. Use Copy Link or Open Link buttons below:
        </p>
        <div style="background:#f3f4f6;padding:12px;border-radius:8px;word-break:break-all;
                    font-size:11px;font-family:monospace;margin-bottom:12px;">
          ${shareUrl}
        </div>
      </div>`;
    return;
  }

  // Generate QR code using quickchart.io
  const qrImage = document.createElement('img');
  qrImage.style.maxWidth = '100%';
  qrImage.style.height = 'auto';
  qrImage.crossOrigin = 'anonymous';

  let imageLoaded = false;
  
  // Timeout fallback (5 seconds)
  const timeout = setTimeout(() => {
    if (!imageLoaded) {
      qrContainer.innerHTML = `
        <div style="padding:20px;text-align:center;">
          <p style="color:#6b7280;margin-bottom:12px;">QR generation timed out.</p>
          <div style="background:#f3f4f6;padding:12px;border-radius:8px;word-break:break-all;
                      font-size:11px;font-family:monospace;">
            ${shareUrl}
          </div>
        </div>`;
    }
  }, 5000);

  qrImage.onload = function() {
    imageLoaded = true;
    clearTimeout(timeout);
    qrContainer.innerHTML = '';
    qrContainer.appendChild(qrImage);
  };

  qrImage.onerror = function() {
    imageLoaded = true;
    clearTimeout(timeout);
    qrContainer.innerHTML = `
      <div style="padding:20px;text-align:center;">
        <p style="color:#6b7280;margin-bottom:12px;">QR image failed to load.</p>
        <div style="background:#f3f4f6;padding:12px;border-radius:8px;word-break:break-all;
                    font-size:11px;font-family:monospace;">
          ${shareUrl}
        </div>
      </div>`;
  };

  // Set QR code source
  qrImage.src = `https://quickchart.io/qr?text=${encodeURIComponent(shareUrl)}&size=256&dark=000000&light=ffffff`;
}

/**
 * Build shareable URL from current card data
 * Includes full profile picture (for Copy Link functionality)
 * @returns {string} Complete shareable URL
 */
function buildShareUrlFromUI() {
  const rawCard = getMyCard();
  if (!rawCard) return `${location.origin}${location.pathname}`;

  const shareObj = buildShareObj(rawCard);
  const encodedCard = encodeObj(shareObj);

  let baseUrl = `${location.origin}${location.pathname}`;

  try {
    const url = new URL(baseUrl, window.location.href);
    url.search = '';
    baseUrl = url.href;
  } catch (error) {
    // Use baseUrl as-is
  }

  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}card=${encodedCard}`;
}

/**
 * Copy share link to clipboard
 * Uses modern Clipboard API with fallback
 */
function copyShareLink() {
  const url = buildShareUrlFromUI();
  navigator.clipboard.writeText(url)
    .then(() => alert('Link copied to clipboard!'))
    .catch(() => alert('Copy failed. Please select and copy manually.'));
}

/**
 * Open share link in new tab (for testing)
 * Useful for previewing how shared card will look
 */
function openShareLink() {
  const url = buildShareUrlFromUI();
  window.open(url, '_blank');
}