/**
 * FarmPulse - Planner Engine
 * Handles fetching calendar data and rendering tasks.
 */

class PlannerEngine {
  async getCalendarData() {
    try {
      const res = await fetch('./data/crop-calendar.json');
      return await res.json();
    } catch (e) {
      console.error("Failed to load crop calendar data:", e);
      return {};
    }
  }

  async getCropsList() {
    try {
      const res = await fetch('./data/crops.json');
      return await res.json();
    } catch (e) {
      return [];
    }
  }
}

export const plannerEngine = new PlannerEngine();
