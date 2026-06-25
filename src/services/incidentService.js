import { mockIncidents } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Map severity number to string (for compatibility)
const severityMap = {
  1: 'low',
  2: 'medium',
  3: 'high',
  4: 'critical'
};

export const incidentService = {
  async getNearbyIncidents() {
    await delay(500);
    return [...mockIncidents];
  },

  async createIncident(payload) {
    await delay(800);
    
    console.log('📤 Sending alert payload:', JSON.stringify(payload, null, 2));
    
    const newIncident = {
      id: Date.now(), // Use unique ID
      type: payload.mediaType === 'photo' ? 'photo' : payload.mediaType === 'voice' ? 'voice' : 'other',
      title: payload.title,
      description: payload.description,
      severity: severityMap[payload.severity] || 'medium',
      severityLevel: payload.severity,
      location: payload.location,
      media: payload.media,
      mediaType: payload.mediaType,
      timestamp: payload.timestamp || new Date().toISOString(),
      distance: 0,
      status: 'pending'
    };
    
    mockIncidents.unshift(newIncident);
    
    console.log('✅ Alert created successfully:', newIncident);
    
    return newIncident;
  },

  async getIncidentById(id) {
    await delay(300);
    return mockIncidents.find(i => i.id === id);
  }
};
