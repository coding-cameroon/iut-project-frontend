import { useState, useEffect } from 'react';
import { incidentService } from '../services/incidentService';

export function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getNearbyIncidents();
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (incidentData) => {
    try {
      const newIncident = await incidentService.createIncident(incidentData);
      setIncidents(prev => [newIncident, ...prev]);
      return newIncident;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    incidents,
    loading,
    error,
    loadIncidents,
    createIncident
  };
}
