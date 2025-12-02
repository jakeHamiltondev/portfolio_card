// ===============================
// DEFAULT CARD CONFIGURATION
// Default values for new business cards (John Doe template)
// ===============================
const DEFAULT_CARD = {
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Student',
  email: 'john.doe@email.com',
  phone: '+1 (555)-123-4567',
  phoneE164: '+15551234567',
  countryCode: '1',
  localNumber: '5551234567',
  linkedin: 'https://linkedin.com/in/johndoe',
  cardColor: '#6366f1',
  bgColor: '#6B46C1',
  profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  portfolioLinks: {
    cert: '',
    edu: '',
    proj: '',
    ref: '',
    resume: {
      pdf: '',
      docx: ''
    },
    work: ''
  },
  portfolioVisibility: {
    cert: true,
    edu: true,
    proj: true,
    ref: true,
    resume: true,
    work: true
  },
  lastUpdated: ''
};

// ===============================
// ALLOWED COUNTRY CODES
// Country codes permitted for phone numbers
// ===============================
const ALLOWED_COUNTRY_CODES = ['1', '44', '61', '81', '91', '353'];

// ===============================
// LOCAL STORAGE KEYS
// Keys used for localStorage operations
// ===============================
const STORAGE_KEYS = {
  MY_CARD: 'myCard',
  SAVED_CONTACTS: 'savedContacts',
  HINT_DISMISSED: 'hintDismissed'
};

// ===============================
// PORTFOLIO LABELS
// Display names for portfolio sections
// ===============================
const PORTFOLIO_LABELS = {
  cert: 'Certifications',
  edu: 'Education',
  proj: 'Projects',
  ref: 'References',
  resume: 'Resume',
  work: 'Work Experience'
};