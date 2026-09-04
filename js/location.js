/**
 * FarmPulse - Location Manager
 * Handles Geolocation API and manual location fallback.
 */

import storage from './storage.js';

const FALLBACK_LOCATIONS = [
  { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
  { name: 'Delhi, Delhi', lat: 28.7041, lon: 77.1025 },
  { name: 'Bangalore, Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Ahmedabad, Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Jaipur, Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow, UP', lat: 26.8467, lon: 80.9462 },
  { name: 'Chandigarh, Punjab', lat: 30.7333, lon: 76.7794 },
  { name: 'Patna, Bihar', lat: 25.5941, lon: 85.1376 }
];

export class LocationManager {
  constructor() {
    this.currentLocation = storage.getUser().location || null;
  }

  /**
   * Tries to get the user's location via Geolocation API.
   * Prompts the user for permission.
   * @returns {Promise<Object>} Location object with lat, lon, name
   */
  async requestLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Try to reverse geocode using Open-Meteo or generic fallback
          // Since reverse geocoding is complex without a dedicated API, we'll assign a placeholder or use nearest preset
          const locName = await this.reverseGeocode(lat, lon);
          
          const location = { lat, lon, name: locName };
          this.setLocation(location);
          resolve(location);
        },
        (error) => {
          console.warn("Geolocation denied or failed. Using fallback.", error.message);
          reject(error);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  /**
   * Sets and saves the location
   */
  setLocation(location) {
    this.currentLocation = location;
    storage.setLocation(location);
    
    // Update global UI badges
    const locationBadges = document.querySelectorAll('.location-badge span');
    locationBadges.forEach(badge => {
      badge.textContent = location.name;
    });
  }

  /**
   * Gets the current location or the default fallback
   */
  getLocation() {
    if (this.currentLocation) {
      return this.currentLocation;
    }
    // Default to first fallback (Pune)
    return FALLBACK_LOCATIONS[0];
  }

  /**
   * Simple mock reverse geocoding for presentation purposes
   */
  async reverseGeocode(lat, lon) {
    // Find nearest from our fallback list as a mock since we don't have a reliable free reverse geocoding API guaranteed in this environment
    let nearest = FALLBACK_LOCATIONS[0];
    let minDist = Infinity;
    
    for (let loc of FALLBACK_LOCATIONS) {
      const dist = Math.sqrt(Math.pow(lat - loc.lat, 2) + Math.pow(lon - loc.lon, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = loc;
      }
    }
    
    if (minDist < 2) {
      return nearest.name;
    }
    return `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
  }
  
  getFallbackLocations() {
    return FALLBACK_LOCATIONS;
  }
}

export const locManager = new LocationManager();
