/**
 * FarmPulse - Main App Utility
 * Handles global UI bindings: Theme switching, mobile menu, etc.
 */

import storage from './storage.js';
import { locManager } from './location.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    this.initTheme();
    this.initMobileMenu();
    this.initLocationUI();
  }

  initTheme() {
    const savedTheme = storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        storage.setTheme(newTheme);
        this.updateThemeIcon(newTheme);
      });
    });
  }

  updateThemeIcon(theme) {
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
      toggle.textContent = theme === 'light' ? '🌙' : '☀️';
    });
  }

  initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    
    if (mobileBtn && mobileMenuOverlay) {
      mobileBtn.addEventListener('click', () => {
        mobileMenuOverlay.classList.toggle('active');
        mobileBtn.textContent = mobileMenuOverlay.classList.contains('active') ? '✕' : '☰';
      });
    }
  }

  initLocationUI() {
    const loc = locManager.getLocation();
    const locationBadges = document.querySelectorAll('.location-badge span');
    locationBadges.forEach(badge => {
      badge.textContent = loc.name;
    });
  }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  window.farmApp = new App();
});
