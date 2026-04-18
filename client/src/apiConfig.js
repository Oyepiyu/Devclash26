// Centralized API Configuration
// This file makes it easy to switch between Local testing and Remote testing (Ngrok).

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// If you are on your own PC, we use localhost:5000.
// If your friends are using the Ngrok link, we use the Ngrok link.
export const API_BASE_URL = isLocalhost 
  ? 'http://localhost:5000' 
  : 'https://happily-launder-spearman.ngrok-free.dev';

export const API_URL = `${API_BASE_URL}/api`;
