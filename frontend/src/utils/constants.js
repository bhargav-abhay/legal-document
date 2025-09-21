// Application Configuration
export const CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  API_VERSION: 'v1',
  API_TIMEOUT: 30000, // 30 seconds

  // Google Cloud Configuration
  GCP_PROJECT_ID: process.env.REACT_APP_GCP_PROJECT_ID,
  GCP_REGION: process.env.REACT_APP_GCP_REGION || 'us-central1',

  // File Upload Configuration
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ],

  // Feature Flags
  FEATURES: {
    DOCUMENT_UPLOAD: true,
    AI_CHAT: true,
    LEGAL_SEARCH: true,
    NEWS_FEED: true,
    ANALYTICS: true,
    MULTILINGUAL: true,
    EXPORT_ANALYSIS: true,
    BATCH_PROCESSING: false // Coming soon
  },

  // UI Configuration
  ITEMS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 4000,
  ANIMATION_DURATION: 300,

  // Legal Domains
  LEGAL_DOMAINS: {
    general: { name: 'General Law', color: '#6b7280' },
    contract: { name: 'Contract Law', color: '#3b82f6' },
    property: { name: 'Property Law', color: '#10b981' },
    criminal: { name: 'Criminal Law', color: '#ef4444' },
    corporate: { name: 'Corporate Law', color: '#f59e0b' },
    employment: { name: 'Employment Law', color: '#8b5cf6' },
    intellectual: { name: 'Intellectual Property', color: '#ec4899' },
    family: { name: 'Family Law', color: '#14b8a6' },
    tax: { name: 'Tax Law', color: '#f97316' }
  }
};

// Theme Configuration
export const THEME = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Application Messages
export const MESSAGES = {
  // Success Messages
  SUCCESS: {
    DOCUMENT_UPLOADED: 'Document uploaded and analyzed successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    FEEDBACK_SUBMITTED: 'Thank you for your feedback',
    ANALYSIS_EXPORTED: 'Analysis exported successfully'
  },

  // Error Messages
  ERROR: {
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit of 10MB',
    INVALID_FILE_TYPE: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.',
    ANALYSIS_FAILED: 'Document analysis failed. Please try again.',
    AUTH_REQUIRED: 'Please sign in to access this feature',
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
  },

  // Info Messages
  INFO: {
    DEMO_MODE: 'Running in demo mode with mock data',
    PROCESSING_DOCUMENT: 'Analyzing your document with AI...',
    LOADING_RESULTS: 'Loading search results...',
    NO_RESULTS: 'No results found for your search',
    OFFLINE_MODE: 'You are currently offline. Some features may be limited.'
  }
};

// Risk Assessment Levels
export const RISK_LEVELS = {
  CRITICAL: {
    value: 'critical',
    label: 'Critical Risk',
    color: 'red',
    description: 'Immediate attention required'
  },
  HIGH: {
    value: 'high',
    label: 'High Risk',
    color: 'red',
    description: 'Should be addressed before signing'
  },
  MEDIUM: {
    value: 'medium',
    label: 'Medium Risk',
    color: 'yellow',
    description: 'Consider reviewing with legal counsel'
  },
  LOW: {
    value: 'low',
    label: 'Low Risk',
    color: 'green',
    description: 'Standard terms, minimal concern'
  }
};

// Document Types
export const DOCUMENT_TYPES = {
  CONTRACT: 'Service Agreement Contract',
  NDA: 'Non-Disclosure Agreement',
  EMPLOYMENT: 'Employment Contract',
  PRIVACY_POLICY: 'Privacy Policy',
  TERMS_OF_SERVICE: 'Terms of Service',
  LICENSE: 'License Agreement',
  LEASE: 'Lease Agreement',
  PURCHASE: 'Purchase Agreement',
  OTHER: 'Other Legal Document'
};

// Analysis Confidence Levels
export const CONFIDENCE_LEVELS = {
  VERY_HIGH: { min: 95, label: 'Very High', color: 'green' },
  HIGH: { min: 85, label: 'High', color: 'green' },
  MEDIUM: { min: 70, label: 'Medium', color: 'yellow' },
  LOW: { min: 50, label: 'Low', color: 'orange' },
  VERY_LOW: { min: 0, label: 'Very Low', color: 'red' }
};

// Recommendation Priorities
export const RECOMMENDATION_PRIORITIES = {
  CRITICAL: {
    value: 'critical',
    label: 'Critical',
    color: 'red',
    urgency: 'Immediate action required'
  },
  HIGH: {
    value: 'high',
    label: 'High Priority',
    color: 'orange',
    urgency: 'Address before signing'
  },
  MEDIUM: {
    value: 'medium',
    label: 'Medium Priority',
    color: 'yellow',
    urgency: 'Consider addressing'
  },
  LOW: {
    value: 'low',
    label: 'Low Priority',
    color: 'green',
    urgency: 'Optional improvement'
  }
};

// Legal News Categories
export const NEWS_CATEGORIES = {
  SUPREME_COURT: 'Supreme Court',
  FEDERAL_COURTS: 'Federal Courts',
  LEGISLATION: 'Legislation',
  PROFESSIONAL_STANDARDS: 'Professional Standards',
  CRIMINAL_JUSTICE: 'Criminal Justice',
  INTERNATIONAL: 'International',
  REGULATORY: 'Regulatory',
  ETHICS: 'Ethics'
};

// Search Filters
export const SEARCH_FILTERS = {
  JURISDICTION: {
    ALL: 'all',
    FEDERAL: 'federal',
    STATE: 'state',
    LOCAL: 'local'
  },
  DOCUMENT_TYPE: {
    ALL: 'all',
    CASE_LAW: 'case',
    STATUTE: 'statute',
    REGULATION: 'regulation',
    COMMENTARY: 'commentary'
  },
  DATE_RANGE: {
    ALL: 'all',
    LAST_MONTH: '1m',
    LAST_YEAR: '1y',
    LAST_5_YEARS: '5y'
  }
};

// User Roles and Permissions
export const USER_ROLES = {
  FREE: {
    name: 'Free User',
    limits: {
      documentsPerMonth: 5,
      queriesPerMonth: 50,
      exportFormats: ['txt']
    }
  },
  PREMIUM: {
    name: 'Premium User',
    limits: {
      documentsPerMonth: 100,
      queriesPerMonth: 1000,
      exportFormats: ['txt', 'pdf', 'docx']
    }
  },
  ENTERPRISE: {
    name: 'Enterprise User',
    limits: {
      documentsPerMonth: -1, // Unlimited
      queriesPerMonth: -1, // Unlimited
      exportFormats: ['txt', 'pdf', 'docx', 'json']
    }
  }
};

// Analytics Event Types
export const ANALYTICS_EVENTS = {
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_ANALYZED: 'document_analyzed',
  AI_QUERY_SUBMITTED: 'ai_query_submitted',
  SEARCH_PERFORMED: 'search_performed',
  NEWS_ARTICLE_VIEWED: 'news_article_viewed',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  ANALYSIS_EXPORTED: 'analysis_exported'
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEARCH: 'Ctrl+K',
  UPLOAD: 'Ctrl+U',
  NEW_CHAT: 'Ctrl+N',
  EXPORT: 'Ctrl+E',
  HELP: 'F1'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'legal_ai_user_prefs',
  RECENT_SEARCHES: 'legal_ai_recent_searches',
  CHAT_HISTORY: 'legal_ai_chat_history',
  THEME: 'legal_ai_theme',
  LANGUAGE: 'legal_ai_language'
};

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  RELATIVE: 'relative' // e.g., "2 days ago"
};

// Export Formats
export const EXPORT_FORMATS = {
  PDF: { extension: 'pdf', mimeType: 'application/pdf', name: 'PDF Document' },
  DOCX: { extension: 'docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Word Document' },
  TXT: { extension: 'txt', mimeType: 'text/plain', name: 'Text File' },
  JSON: { extension: 'json', mimeType: 'application/json', name: 'JSON Data' }
};

// Animation Presets
export const ANIMATIONS = {
  FADE_IN: { duration: 300, easing: 'ease-out' },
  SLIDE_UP: { duration: 400, easing: 'ease-out' },
  SCALE: { duration: 200, easing: 'ease-out' },
  BOUNCE: { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: '/api/v1/auth/google',
    EMAIL: '/api/v1/auth/email',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout'
  },
  DOCUMENTS: {
    ANALYZE: '/api/v1/documents/analyze',
    HISTORY: '/api/v1/documents/history',
    EXPORT: '/api/v1/documents/export'
  },
  AI: {
    QUERY: '/api/v1/ai/query',
    CHAT: '/api/v1/ai/chat',
    HISTORY: '/api/v1/ai/history'
  },
  SEARCH: {
    LEGAL: '/api/v1/search/legal',
    CASES: '/api/v1/search/cases',
    STATUTES: '/api/v1/search/statutes'
  },
  NEWS: {
    FEED: '/api/v1/news/legal',
    SEARCH: '/api/v1/news/search'
  },
  USER: {
    PROFILE: '/api/v1/user/profile',
    PREFERENCES: '/api/v1/user/preferences',
    ANALYTICS: '/api/v1/user/analytics'
  }
};

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  autoSave: true,
  showConfidence: true,
  defaultDomain: 'general',
  itemsPerPage: 20,
  exportFormat: 'pdf'
};

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_ERROR: 'FILE_ERROR',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

// Legal Citation Formats
export const CITATION_FORMATS = {
  BLUEBOOK: 'bluebook',
  APA: 'apa',
  MLA: 'mla',
  CHICAGO: 'chicago'
};

export default {
  CONFIG,
  THEME,
  MESSAGES,
  RISK_LEVELS,
  DOCUMENT_TYPES,
  CONFIDENCE_LEVELS,
  RECOMMENDATION_PRIORITIES,
  NEWS_CATEGORIES,
  SEARCH_FILTERS,
  USER_ROLES,
  ANALYTICS_EVENTS,
  KEYBOARD_SHORTCUTS,
  STORAGE_KEYS,
  REGEX_PATTERNS,
  DATE_FORMATS,
  EXPORT_FORMATS,
  ANIMATIONS,
  API_ENDPOINTS,
  DEFAULT_SETTINGS,
  ERROR_CODES,
  CITATION_FORMATS
};
