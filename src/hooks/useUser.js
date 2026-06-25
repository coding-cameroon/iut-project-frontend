import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data) => {
    try {
      const updated = await userService.updateProfile(data);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    loadUser,
    updateUser
  };
}
