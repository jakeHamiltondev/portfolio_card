/* ==========================================================
   PORTFOLIO MODULE
   Handles portfolio button rendering and link opening
   ========================================================== */

/**
 * Handle portfolio button clicks
 * Opens the configured URL or shows appropriate message
 * @param {Event} event - Click event
 * @param {string} type - Portfolio type (cert/edu/proj/ref/resume/work)
 */
function openLink(event, type) {
  event.stopPropagation(); // Prevent card flip

  const linkMap = {
    cert: 'Certifications',
    edu: 'Education',
    proj: 'Projects',
    ref: 'References',
    resume: 'Resume',
    work: 'Work Experience'
  };

  // Get URL from global portfolio links
  const url = window.portfolioLinks && window.portfolioLinks[type] 
    ? window.portfolioLinks[type].trim() 
    : '';

  if (url) {
    // Open URL in new tab
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      alert('Pop-up blocked! Please allow pop-ups for this site.');
    }
  } else {
    // No URL configured
    const itemName = linkMap[type] || 'This item';

    if (viewingSharedCard) {
      alert(`No ${itemName} link available for this contact.`);
    } else {
      alert(`No link set for ${itemName}.\n\nAdd a URL in Settings to link to your portfolio.`);
    }
  }
}

/**
 * Render portfolio section with only visible items
 * Dynamically adjusts grid layout based on number of items
 * @param {Object} cardData - Card data with portfolio settings
 */
function renderPortfolioSection(cardData) {
  const visibility = cardData.portfolioVisibility || { 
    cert: true, edu: true, proj: true, ref: true, resume: true, work: true
  };

  // Build array of visible portfolio items
  const visibleItems = [];
  if (visibility.cert !== false) {
    visibleItems.push({
      type: 'cert',
      label: 'Certifications'
    });
  }
  if (visibility.edu !== false) {
    visibleItems.push({
      type: 'edu',
      label: 'Education'
    });
  }
  if (visibility.proj !== false) {
    visibleItems.push({
      type: 'proj',
      label: 'Projects'
    });
  }
  if (visibility.ref !== false) {
    visibleItems.push({
      type: 'ref',
      label: 'References'
    });
  }
  if (visibility.resume !== false) {
    visibleItems.push({
      type: 'resume',
      label: 'Resume'
    });
  }
  if (visibility.work !== false) {
    visibleItems.push({
      type: 'work',
      label: 'Work'
    });
  }

  const portfolioSection = document.querySelector('.portfolio-links');
  if (!portfolioSection) return;

  // Hide section if no items
  if (visibleItems.length === 0) {
    portfolioSection.style.display = 'none';
    return;
  }

  // Determine grid layout based on item count
  let gridStyle = 'margin: 0 auto; display: grid; gap: 6px;';
  let gridHtml = '';

  switch (visibleItems.length) {
    case 1:
      gridStyle += 'grid-template-columns: 1fr; max-width: 140px;';
      gridHtml = visibleItems.map(item => 
        `<button class="portfolio-link" data-link-type="${item.type}">${item.label}</button>`
      ).join('');
      break;

    case 2:
      gridStyle += 'grid-template-columns: 1fr 1fr; max-width: 200px;';
      gridHtml = visibleItems.map(item => 
        `<button class="portfolio-link" data-link-type="${item.type}">${item.label}</button>`
      ).join('');
      break;

    case 3:
      gridStyle += 'grid-template-columns: 1fr 1fr; max-width: 200px;';
      gridHtml = `
        <button class="portfolio-link" data-link-type="${visibleItems[0].type}">${visibleItems[0].label}</button>
        <button class="portfolio-link" data-link-type="${visibleItems[1].type}">${visibleItems[1].label}</button>
        <div style="grid-column: 1 / -1; display: flex; justify-content: center;">
          <button class="portfolio-link" data-link-type="${visibleItems[2].type}">${visibleItems[2].label}</button>
        </div>
      `;
      break;

    case 4:
      gridStyle += 'grid-template-columns: 1fr 1fr; max-width: 200px;';
      gridHtml = visibleItems.map(item => 
        `<button class="portfolio-link" data-link-type="${item.type}">${item.label}</button>`
      ).join('');
      break;

    case 5:
      gridStyle += 'grid-template-columns: 1fr 1fr; max-width: 200px;';
      gridHtml = `
        <button class="portfolio-link" data-link-type="${visibleItems[0].type}">${visibleItems[0].label}</button>
        <button class="portfolio-link" data-link-type="${visibleItems[1].type}">${visibleItems[1].label}</button>
        <button class="portfolio-link" data-link-type="${visibleItems[2].type}">${visibleItems[2].label}</button>
        <button class="portfolio-link" data-link-type="${visibleItems[3].type}">${visibleItems[3].label}</button>
        <div style="grid-column: 1 / -1; display: flex; justify-content: center;">
          <button class="portfolio-link" data-link-type="${visibleItems[4].type}">${visibleItems[4].label}</button>
        </div>
      `;
      break;

    case 6:
    default:
      gridStyle += 'grid-template-columns: 1fr 1fr 1fr; max-width: 300px;';
      gridHtml = visibleItems.map(item => 
        `<button class="portfolio-link" data-link-type="${item.type}">${item.label}</button>`
      ).join('');
      break;
  }

  // Render portfolio section
  portfolioSection.style.display = 'block';
  portfolioSection.innerHTML = `
    <h3>PORTFOLIO</h3>
    <div class="portfolio-links-grid" style="${gridStyle}">
      ${gridHtml}
    </div>
  `;

  // Attach click handlers to all portfolio buttons
  attachPortfolioClickHandlers();
}

/**
 * Attach click handlers to portfolio buttons
 * Handles special resume logic with multiple formats
 */
function attachPortfolioClickHandlers() {
  const portfolioSection = document.querySelector('.portfolio-links');
  if (!portfolioSection) return;

  const buttons = portfolioSection.querySelectorAll('.portfolio-link');
  
  buttons.forEach((button) => {
    button.addEventListener('click', function(event) {
      event.stopPropagation(); // Prevent card flip

      const type = this.getAttribute('data-link-type');
      const linkMap = {
        cert: 'Certifications',
        edu: 'Education',
        proj: 'Projects',
        ref: 'References',
        resume: 'Resume',
        work: 'Work Experience'
      };

      // Special handling for resume with multiple formats
      if (type === 'resume') {
        const resumeData = window.portfolioLinks && window.portfolioLinks.resume;
        let pdfUrl = '';
        let docxUrl = '';

        // Handle both old string format and new object format
        if (typeof resumeData === 'string') {
          pdfUrl = resumeData.trim();
        } else if (resumeData && typeof resumeData === 'object') {
          pdfUrl = (resumeData.pdf || '').trim();
          docxUrl = (resumeData.docx || '').trim();
        }

        // If both formats available, let user choose
        if (pdfUrl && docxUrl) {
          const choice = confirm(
            'Choose your preferred format:\n\n' +
            'OK = PDF\n' +
            'Cancel = Word (DOCX)'
          );
          const urlToOpen = choice ? pdfUrl : docxUrl;
          window.open(urlToOpen, '_blank');
          return;
        }

        // If only one format available, open it
        const url = pdfUrl || docxUrl;
        if (url) {
          window.open(url, '_blank');
        } else {
          const itemName = linkMap[type] || 'This item';
          if (viewingSharedCard) {
            alert(`No ${itemName} link available for this contact.`);
          } else {
            alert(`No link set for ${itemName}.\n\nAdd a URL in Settings to link to your portfolio.`);
          }
        }
        return;
      }

      // Handle all other portfolio types normally
      const url = window.portfolioLinks && window.portfolioLinks[type] 
        ? window.portfolioLinks[type].trim() 
        : '';

      if (url) {
        window.open(url, '_blank');
      } else {
        const itemName = linkMap[type] || 'This item';
        if (viewingSharedCard) {
          alert(`No ${itemName} link available for this contact.`);
        } else {
          alert(`No link set for ${itemName}.\n\nAdd a URL in Settings to link to your portfolio.`);
        }
      }
    });
  });
}