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

// Test suite for getting a single deck by ID
describe('GET /decks/:deckId', () => {
  // Should successfully retrieve a deck by ID
  it('should return the deck', async () => {
    const mockDeck = {
      id: 1,
      name: 'Electric Deck',
      ownerId: 1,
      owner: { id: 1, email: 'user@example.com' },
      cards: [
        { id: 1, name: 'Pikachu', pokedexId: 25 }
      ]
    };

    prismaMock.deck.findUnique.mockResolvedValue(mockDeck as any);

    const response = await request(app).get('/decks/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'Electric Deck');
    expect(response.body).toHaveProperty('owner');
    expect(response.body).toHaveProperty('cards');
  });

  // Should return 404 when deck doesn't exist
  it('should return 404 for unknown deck', async () => {
    prismaMock.deck.findUnique.mockResolvedValue(null);

    const response = await request(app).get('/decks/999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', "Deck non trouvé, l'id 999 n'existe pas.");
  });

  // Should validate that ID is a number
  it('should return 400 for invalid id (not a number)', async () => {
    const response = await request(app).get('/decks/invalid');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should validate that ID is positive
  it('should return 400 for invalid id (zero)', async () => {
    const response = await request(app).get('/decks/0');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should validate that ID is positive
  it('should return 400 for invalid id (negative)', async () => {
    const response = await request(app).get('/decks/-1');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.deck.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/decks/1');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue');
  });
});
