/**
 * FarmPulse - Crop Recommendation Engine
 * Handles crop filtering, searching, and suitability scoring.
 */

import storage from './storage.js';

class CropEngine {
  constructor() {
    this.crops = [];
  }

  async init() {
    try {
      const res = await fetch('./data/crops.json');
      this.crops = await res.json();
    } catch (e) {
      console.error("Failed to load crop data:", e);
    }
  }

  getAllCrops() {
    return this.crops;
  }
  
  getCropById(id) {
    return this.crops.find(c => c.id === id);
  }

  /**
   * Filters the crop library based on search and dropdowns
   */
  filterLibrary(searchTerm, season, soil, water) {
    return this.crops.filter(crop => {
      // 1. Search term (matches name or description)
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || 
        crop.name.toLowerCase().includes(term) || 
        crop.description.toLowerCase().includes(term);
        
      // 2. Season
      const matchesSeason = !season || crop.season === season;
      
      // 3. Soil (crop.soil is an array of suitable soils)
      const matchesSoil = !soil || crop.soil.includes(soil);
      
      // 4. Water requirement
      const matchesWater = !water || crop.waterRequirement === water;
      
      return matchesSearch && matchesSeason && matchesSoil && matchesWater;
    });
  }

  /**
   * Generates a ranked list of suitable crops based on user inputs.
   * This is a rule-based algorithm, NOT an AI model.
   * 
   * @param {Object} inputs { season, soilType, avgTemp, waterAvail }
   * @returns {Array} Ranked array of crops with suitability score and reason
   */
  recommendCrops(inputs) {
    const { season, soilType, avgTemp, waterAvail } = inputs;
    const temp = parseInt(avgTemp);
    
    const scoredCrops = this.crops.map(crop => {
      let score = 100;
      const reasons = [];
      const penalties = [];

      // 1. Season Match (Crucial)
      if (season && crop.season !== season) {
        score -= 40;
        penalties.push(`Wrong season (Requires ${crop.season})`);
      } else if (season) {
        reasons.push("Matches growing season");
      }

      // 2. Soil Match
      if (soilType) {
        if (crop.soil.includes(soilType)) {
          reasons.push(`Thrives in ${soilType}`);
        } else {
          score -= 20;
          penalties.push(`Sub-optimal soil`);
        }
      }

      // 3. Water Match
      if (waterAvail) {
        if (crop.waterRequirement === waterAvail) {
          reasons.push(`Matches water availability`);
        } else if (crop.waterRequirement === 'High' && waterAvail === 'Low') {
          score -= 30; // Critical mismatch
          penalties.push("Requires High water (Shortage likely)");
        } else if (crop.waterRequirement === 'Low' && waterAvail === 'High') {
          score -= 5; // Might suffer from waterlogging, but not as bad as drought
          penalties.push("Prefers less water");
        } else {
          score -= 10;
        }
      }

      // 4. Temperature Match
      if (!isNaN(temp)) {
        if (temp >= crop.temperature.min && temp <= crop.temperature.max) {
          reasons.push("Optimal temperature range");
        } else {
          const diff = Math.min(
            Math.abs(temp - crop.temperature.min),
            Math.abs(temp - crop.temperature.max)
          );
          score -= (diff * 2); // -2 points per degree off
          
          if (temp > crop.temperature.max) {
            penalties.push("Temperature too high");
          } else {
            penalties.push("Temperature too low");
          }
        }
      }
      
      // Prevent negative scores
      score = Math.max(0, score);
      
      // Compile final reason text
      let finalReason = "Suitable for current conditions.";
      if (score < 60 && penalties.length > 0) {
        finalReason = penalties.join(", ");
      } else if (reasons.length > 0) {
        finalReason = reasons.join(", ");
      }

      return {
        crop: crop,
        score: score,
        reason: finalReason
      };
    });

    // Sort by highest score first, then only return top results
    return scoredCrops
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 20); // Don't show completely unsuitable crops
  }
}

export const cropEngine = new CropEngine();
