/**
 * FarmPulse - Storage Manager
 * Handles LocalStorage persistence for user preferences, farm data, and tasks.
 */

const STORAGE_KEY = 'farmpulse_data';

// Default application state
const defaultState = {
  theme: 'light',
  user: {
    name: 'Farmer',
    location: null // { lat, lon, name }
  },
  farm: {
    area: '',
    soilType: '',
    primaryCrop: ''
  },
  favorites: [], // Array of crop IDs
  tasks: [] // { id, title, crop, status, date }
};

class StorageManager {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultState, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
    return { ...defaultState };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  // --- Theme ---
  getTheme() {
    return this.state.theme;
  }

  setTheme(theme) {
    this.state.theme = theme;
    this.saveState();
  }

  // --- User & Location ---
  getUser() {
    return this.state.user;
  }

  setUser(userData) {
    this.state.user = { ...this.state.user, ...userData };
    this.saveState();
  }
  
  setLocation(location) {
    this.state.user.location = location;
    this.saveState();
  }

  // --- Farm Details ---
  getFarm() {
    return this.state.farm;
  }
  
  setFarm(farmData) {
    this.state.farm = { ...this.state.farm, ...farmData };
    this.saveState();
  }

  // --- Favorites ---
  getFavorites() {
    return this.state.favorites || [];
  }

  toggleFavorite(cropId) {
    if (!this.state.favorites) this.state.favorites = [];
    
    const index = this.state.favorites.indexOf(cropId);
    if (index > -1) {
      this.state.favorites.splice(index, 1);
    } else {
      this.state.favorites.push(cropId);
    }
    this.saveState();
    return this.state.favorites.includes(cropId);
  }

  isFavorite(cropId) {
    return (this.state.favorites || []).includes(cropId);
  }

  // --- Tasks ---
  getTasks() {
    return this.state.tasks || [];
  }

  addTask(task) {
    if (!this.state.tasks) this.state.tasks = [];
    task.id = Date.now().toString();
    this.state.tasks.push(task);
    this.saveState();
    return task;
  }

  toggleTaskStatus(taskId) {
    if (!this.state.tasks) return;
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      this.saveState();
    }
  }

  deleteTask(taskId) {
    if (!this.state.tasks) return;
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
    this.saveState();
  }
}

// Export a singleton instance
const storage = new StorageManager();
export default storage;
