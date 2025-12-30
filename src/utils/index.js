// Utility functions

/**
 * Creates a URL for a given page name
 * @param {string} page - The page name
 * @returns {string} The URL for the page
 */
export const createPageUrl = (page) => {
  const pages = {
    "Home": "/",
    "Results": "/results",
    "Settings": "/settings",
    "ManageAffiliate": "/manage-affiliate",
    "BulkUpload": "/bulk-upload"
  };
  return pages[page] || "/";
};

/**
 * Formats a number with commas
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Truncates text to a specific length
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
