import { RISK_LEVELS, CONFIDENCE_LEVELS, DATE_FORMATS } from './constants';

// File Utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isValidFileType = (file, allowedTypes) => {
  const extension = '.' + getFileExtension(file.name).toLowerCase();
  return allowedTypes.includes(extension);
};

export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

// Text Utilities
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalizeFirst(word)).join(' ');
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const stripHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Date Utilities
export const formatDate = (date, format = DATE_FORMATS.SHORT) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (format === DATE_FORMATS.RELATIVE) {
    return formatRelativeTime(dateObj);
  }
  
  const options = {
    [DATE_FORMATS.SHORT]: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    },
    [DATE_FORMATS.LONG]: { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    },
    [DATE_FORMATS.WITH_TIME]: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    [DATE_FORMATS.ISO]: undefined // Will use toISOString()
  };
  
  if (format === DATE_FORMATS.ISO) {
    return dateObj.toISOString().split('T')[0];
  }
  
  return dateObj.toLocaleDateString('en-US', options[format]);
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
};

export const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  return today.toDateString() === compareDate.toDateString();
};

export const isThisWeek = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  return compareDate >= weekStart && compareDate <= weekEnd;
};

// Risk Assessment Utilities
export const getRiskLevel = (riskScore) => {
  if (riskScore >= 8) return RISK_LEVELS.CRITICAL;
  if (riskScore >= 6) return RISK_LEVELS.HIGH;
  if (riskScore >= 4) return RISK_LEVELS.MEDIUM;
  return RISK_LEVELS.LOW;
};

export const getRiskColor = (level) => {
  const colors = {
    critical: 'text-red-400 bg-red-500/10 border-red-500/30',
    high: 'text-red-400 bg-red-500/10 border-red-500/30',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    low: 'text-green-400 bg-green-500/10 border-green-500/30'
  };
  return colors[level?.toLowerCase()] || colors.low;
};

export const getConfidenceLevel = (score) => {
  const levels = Object.values(CONFIDENCE_LEVELS);
  return levels.find(level => score >= level.min) || CONFIDENCE_LEVELS.VERY_LOW;
};

export const getConfidenceColor = (score) => {
  const level = getConfidenceLevel(score);
  const colors = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
    red: 'text-red-400'
  };
  return colors[level.color] || colors.red;
};

// URL Utilities
export const buildUrl = (base, path, params = {}) => {
  const url = new URL(path, base);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export const getQueryParams = (search = window.location.search) => {
  const params = new URLSearchParams(search);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
};

export const updateQueryParams = (updates) => {
  const url = new URL(window.location);
  Object.keys(updates).forEach(key => {
    if (updates[key] === null || updates[key] === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, updates[key]);
    }
  });
  window.history.replaceState({}, '', url);
};

// Array Utilities
export const groupBy = (array, keyFn) => {
  return array.reduce((groups, item) => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    const group = groups[key] || [];
    group.push(item);
    groups[key] = group;
    return groups;
  }, {});
};

export const sortBy = (array, keyFn, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof keyFn === 'function' ? keyFn(a) : a[keyFn];
    const bVal = typeof keyFn === 'function' ? keyFn(b) : b[keyFn];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = (array, keyFn) => {
  const seen = new Set();
  return array.filter(item => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Object Utilities
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  Object.keys(obj).forEach(key => {
    cloned[key] = deepClone(obj[key]);
  });
  return cloned;
};

export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = (obj, keys) => {
  const result = {};
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
};

export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Number Utilities
export const formatNumber = (num, options = {}) => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    ...restOptions
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    ...restOptions
  }).format(num);
};

export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatPercentage = (value, locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const roundTo = (num, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

// Color Utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Local Storage Utilities
export const setStorageItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('Error setting localStorage item:', error);
    return false;
  }
};

export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return defaultValue;
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing localStorage item:', error);
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Performance Utilities
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function executedFunction(...args) {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Browser Utilities
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

export const downloadFile = (data, filename, mimeType = 'application/octet-stream') => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const browsers = {
    chrome: /chrome|chromium|crios/i,
    firefox: /firefox|fxios/i,
    safari: /safari|mobile.*safari/i,
    edge: /edg/i,
    opera: /opera|opr\//i
  };

  for (const [name, regex] of Object.entries(browsers)) {
    if (regex.test(ua)) {
      return name;
    }
  }
  return 'unknown';
};

// Validation Utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Security Utilities
export const sanitizeHtml = (html) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  const reg = /[&<>"'/]/gi;
  return html.replace(reg, (match) => map[match]);
};

export const generateRandomId = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Error Handling Utilities
export const createError = (message, code, details = {}) => {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  error.timestamp = new Date().toISOString();
  return error;
};

export const isNetworkError = (error) => {
  return error.message.includes('fetch') || 
         error.message.includes('Network') ||
         error.message.includes('connection');
};

export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

// Analytics Utilities
export const trackEvent = (eventName, properties = {}) => {
  // This would integrate with your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, properties);
  }
  
  // Example: Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, properties);
  }
  
  // Example: Custom analytics
  if (window.customAnalytics) {
    window.customAnalytics.track(eventName, properties);
  }
};

export const trackPageView = (pageName, properties = {}) => {
  trackEvent('page_view', {
    page_name: pageName,
    ...properties
  });
};

export const trackUserInteraction = (element, action, properties = {}) => {
  trackEvent('user_interaction', {
    element,
    action,
    ...properties
  });
};

// A/B Testing Utilities
export const getVariant = (testName, variants = ['A', 'B']) => {
  // Simple hash-based variant assignment
  const userId = getStorageItem('user_id') || generateRandomId();
  const hash = Array.from(userId + testName).reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const variantIndex = Math.abs(hash) % variants.length;
  return variants[variantIndex];
};

// SEO Utilities
export const updateMetaTags = (tags) => {
  Object.entries(tags).forEach(([property, content]) => {
    let element = document.querySelector(`meta[property="${property}"]`) ||
                  document.querySelector(`meta[name="${property}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(property.startsWith('og:') ? 'property' : 'name', property);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  });
};

export const updatePageTitle = (title, suffix = ' - Legal Document AI') => {
  document.title = title + suffix;
};

// Accessibility Utilities
export const focusElement = (selector) => {
  const element = document.querySelector(selector);
  if (element) {
    element.focus();
    return true;
  }
  return false;
};

export const announceToScreenReader = (message) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const trapFocus = (containerElement) => {
  const focusableElements = containerElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      containerElement.blur();
    }
  };
  
  containerElement.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    containerElement.removeEventListener('keydown', handleTabKey);
  };
};

// Legal Document Specific Utilities
export const extractLegalTerms = (text) => {
  const legalTerms = [
    'indemnification', 'liability', 'breach', 'termination', 'consideration',
    'warranty', 'covenant', 'arbitration', 'jurisdiction', 'governing law',
    'force majeure', 'confidentiality', 'non-disclosure', 'intellectual property',
    'damages', 'remedy', 'notice', 'amendment', 'assignment', 'severability'
  ];
  
  const foundTerms = [];
  const lowerText = text.toLowerCase();
  
  legalTerms.forEach(term => {
    if (lowerText.includes(term)) {
      foundTerms.push(term);
    }
  });
  
  return foundTerms;
};

export const calculateReadingTime = (text, wordsPerMinute = 200) => {
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  if (minutes < 1) return 'Less than 1 minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 1 && remainingMinutes === 0) return '1 hour';
  if (remainingMinutes === 0) return `${hours} hours`;
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
};

export const assessDocumentComplexity = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/);
  const avgSentenceLength = words.length / sentences.length;
  
  // Count complex words (more than 2 syllables)
  const complexWords = words.filter(word => {
    const syllableCount = word.toLowerCase().replace(/[^aeiou]/g, '').length;
    return syllableCount > 2;
  }).length;
  
  const complexWordRatio = complexWords / words.length;
  
  // Flesch-Kincaid Grade Level approximation
  const gradeLevel = 0.39 * avgSentenceLength + 11.8 * complexWordRatio - 15.59;
  
  let complexity;
  if (gradeLevel < 6) complexity = 'Elementary';
  else if (gradeLevel < 9) complexity = 'Middle School';
  else if (gradeLevel < 13) complexity = 'High School';
  else if (gradeLevel < 16) complexity = 'College';
  else complexity = 'Graduate';
  
  return {
    gradeLevel: Math.max(1, Math.round(gradeLevel)),
    complexity,
    avgSentenceLength: Math.round(avgSentenceLength),
    complexWordRatio: Math.round(complexWordRatio * 100),
    readingTime: calculateReadingTime(text)
  };
};

// Export all utilities as default object for easy importing
export default {
  // File utilities
  formatFileSize,
  getFileExtension,
  isValidFileType,
  validateFileSize,
  
  // Text utilities
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  stripHtml,
  
  // Date utilities
  formatDate,
  formatRelativeTime,
  isToday,
  isThisWeek,
  
  // Risk utilities
  getRiskLevel,
  getRiskColor,
  getConfidenceLevel,
  getConfidenceColor,
  
  // URL utilities
  buildUrl,
  getQueryParams,
  updateQueryParams,
  
  // Array utilities
  groupBy,
  sortBy,
  uniqueBy,
  chunk,
  
  // Object utilities
  deepClone,
  omit,
  pick,
  isEmpty,
  
  // Number utilities
  formatNumber,
  formatCurrency,
  formatPercentage,
  clamp,
  roundTo,
  
  // Color utilities
  hexToRgb,
  rgbToHex,
  
  // Storage utilities
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  
  // Performance utilities
  debounce,
  throttle,
  
  // Browser utilities
  copyToClipboard,
  downloadFile,
  getDeviceType,
  isTouchDevice,
  getBrowserInfo,
  
  // Validation utilities
  isValidEmail,
  isValidPassword,
  isValidUrl,
  isValidPhoneNumber,
  
  // Security utilities
  sanitizeHtml,
  generateRandomId,
  generateUUID,
  
  // Error handling
  createError,
  isNetworkError,
  getErrorMessage,
  
  // Analytics utilities
  trackEvent,
  trackPageView,
  trackUserInteraction,
  
  // A/B testing
  getVariant,
  
  // SEO utilities
  updateMetaTags,
  updatePageTitle,
  
  // Accessibility utilities
  focusElement,
  announceToScreenReader,
  trapFocus,
  
  // Legal document utilities
  extractLegalTerms,
  calculateReadingTime,
  assessDocumentComplexity
};
