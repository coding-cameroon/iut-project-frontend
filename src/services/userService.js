import { mockUser } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  async getProfile() {
    await delay(400);
    return { ...mockUser };
  },

  async updateProfile(data) {
    await delay(600);
    Object.assign(mockUser, data);
    return { ...mockUser };
  }
};
