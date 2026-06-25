export const mockIncidents = [
  {
    id: 1,
    type: 'fire',
    title: 'Building Fire',
    description: 'Smoke coming from 3rd floor',
    location: { lat: 48.8566, lng: 2.3522 },
    distance: 0.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    severity: 'high',
    media: null
  },
  {
    id: 2,
    type: 'accident',
    title: 'Car Accident',
    description: 'Two cars collided at intersection',
    location: { lat: 48.8576, lng: 2.3532 },
    distance: 0.8,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    severity: 'medium',
    media: null
  },
  {
    id: 3,
    type: 'crime',
    title: 'Suspicious Activity',
    description: 'Unusual behavior reported',
    location: { lat: 48.8556, lng: 2.3512 },
    distance: 1.2,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    severity: 'low',
    media: null
  }
];

export const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null,
  stats: {
    totalIncidents: 12,
    responseRate: 85,
    joinDate: new Date('2024-01-15')
  },
  history: [
    { id: 1, type: 'fire', title: 'Small Fire', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), status: 'resolved' },
    { id: 2, type: 'accident', title: 'Minor Collision', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), status: 'resolved' }
  ]
};
