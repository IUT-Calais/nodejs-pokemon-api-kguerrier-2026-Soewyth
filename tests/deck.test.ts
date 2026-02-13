import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';

// Test suite for getting all decks
describe('GET /decks', () => {
  // Should successfully retrieve a list of decks
  it('should return an array of decks', async () => {
    const mockDecks = [
      {
        id: 1,
        name: 'Electric Deck',
        ownerId: 1,
        owner: { id: 1, email: 'user@example.com' },
        cards: []
      },
      {
        id: 2,
        name: 'Fire Deck',
        ownerId: 2,
        owner: { id: 2, email: 'user2@example.com' },
        cards: []
      }
    ];

    prismaMock.deck.findMany.mockResolvedValue(mockDecks as any);

    const response = await request(app).get('/decks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('owner');
    expect(response.body[0]).toHaveProperty('cards');
  });

  // Should return an empty array when database has no decks
  it('should return empty array when no decks', async () => {
    prismaMock.deck.findMany.mockResolvedValue([]);

    const response = await request(app).get('/decks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.deck.findMany.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/decks');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la récupération des decks.');
  });
});
