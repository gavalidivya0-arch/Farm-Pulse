/**
 * FarmPulse - Irrigation Advisor
 * Rule-based irrigation calculator.
 */

import { weatherApi } from './weather.js';
import { locManager } from './location.js';

class IrrigationEngine {
  
  /**
   * Calculates irrigation recommendation
   * @param {Object} inputs { crop, soil, stage }
   * @returns {Object} recommendation details
   */
  async analyze(inputs) {
    const loc = locManager.getLocation();
    // Fetch live weather to base our decision on
    const weather = await weatherApi.getCurrentWeather(loc.lat, loc.lon);
    
    const { crop, soil, stage } = inputs;
    
    // Soil moisture mapping index (Mock logic based on soil type to simulate retention)
    let soilMoistureIndex = weather.soilMoisture;
    if (soil === 'Sandy') soilMoistureIndex -= 10;
    if (soil === 'Clay' || soil === 'Black Soil') soilMoistureIndex += 15;
    
    // Determine status
    let status = 'Not Needed';
    let level = 'high'; // Gauge level color: high = green, medium = yellow, low = red
    let reqLevel = 'Low';
    
    if (soilMoistureIndex < 35) {
      status = 'Irrigation Needed';
      level = 'low';
      reqLevel = 'High';
    } else if (soilMoistureIndex < 55) {
      status = 'Moderate Irrigation';
      level = 'medium';
      reqLevel = 'Medium';
    }

    // Adjust based on rain probability
    if (weather.precipProb > 60 && status === 'Moderate Irrigation') {
      status = 'Not Needed (Rain Expected)';
      reqLevel = 'None';
    } else if (weather.precipProb > 80 && status === 'Irrigation Needed') {
      status = 'Wait (Heavy Rain Expected)';
      reqLevel = 'Monitor';
    }

    // Determine recommended time
    let time = "6:00 AM - 8:00 AM"; // Default optimal time
    if (weather.temperature > 35) {
      time = "5:00 AM - 7:00 AM or after 6:00 PM"; // Avoid evaporation loss
    }
    
    // Volume estimation logic (rough rule-based estimate)
    // Base: 40,000 Liters / Acre per irrigation for standard crop
    let volumeEstimate = 0;
    if (reqLevel === 'High') volumeEstimate = 50000;
    else if (reqLevel === 'Medium') volumeEstimate = 25000;
    
    if (soil === 'Sandy') volumeEstimate *= 1.2; // Sandy drains fast
    if (soil === 'Clay' || soil === 'Black Soil') volumeEstimate *= 0.8; // Retains well
    
    // Explanation Generation
    let explanation = `Current soil moisture is at ${soilMoistureIndex}% (adjusted for ${soil} soil). `;
    if (weather.precipProb > 50) {
      explanation += `Since rain probability is high (${weather.precipProb}%), extensive irrigation may not be necessary.`;
    } else {
      explanation += `Rainfall is unlikely (${weather.precipProb}%). `;
      if (reqLevel !== 'None' && reqLevel !== 'Monitor') {
        explanation += `Based on the ${stage} stage of your crop, apply recommended water volume to maintain optimal growth.`;
      }
    }

    return {
      status,
      level,
      reqLevel,
      weather: weather,
      soilMoistureIndex,
      time,
      volume: volumeEstimate > 0 ? `${Math.round(volumeEstimate).toLocaleString()} L / Acre` : '0 L',
      explanation
    };
  }
}

export const irrigationEngine = new IrrigationEngine();
