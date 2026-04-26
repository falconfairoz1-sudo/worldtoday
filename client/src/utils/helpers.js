import { formatDistanceToNow, format } from 'date-fns';

// Format date relative to now
export const formatDate = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    return 'Unknown date';
  }
};

// Format full date
export const formatFullDate = (date) => {
  try {
    return format(new Date(date), 'MMMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Unknown date';
  }
};

// Truncate text
export const truncate = (text, length = 150) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Get reading time
export const getReadingTime = (text) => {
  if (!text) return 0;
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Format number with commas
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get sentiment color
export const getSentimentColor = (sentiment) => {
  if (!sentiment) return '#gray';
  switch (sentiment.label) {
    case 'positive':
      return '#4caf50';
    case 'negative':
      return '#f44336';
    default:
      return '#9e9e9e';
  }
};

// Share article
export const shareArticle = async (article) => {
  const shareData = {
    title: article.title,
    text: article.description,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return true;
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      return true;
    }
  } catch (error) {
    console.error('Share error:', error);
    return false;
  }
};

// Detect device
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Scroll to top
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Debounce function
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

// Get category color
export const getCategoryColor = (category) => {
  const colors = {
    politics: '#e91e63',
    technology: '#2196f3',
    business: '#ff9800',
    sports: '#4caf50',
    entertainment: '#9c27b0',
    health: '#f44336',
    science: '#00bcd4',
    general: '#607d8b'
  };
  return colors[category] || colors.general;
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Copy to clipboard with fallback
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Calculate reading time with HTML content
export const calculateReadingTime = (text) => {
  if (!text) return 0;
  const cleanText = text.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const words = cleanText.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes;
};

// Format number with K, M suffix
export const formatCompactNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Get domain from URL
export const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
};

// Print article
export const printArticle = () => {
  window.print();
};
