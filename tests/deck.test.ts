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
// Test suite for creating a new deck
describe('POST /decks', () => {
    const validDeckData = {
        name: 'Water Deck'
    };

    // Should successfully create a deck
    it('should create a new deck', async () => {
        const mockUser = { id: 1, email: 'user@example.com' };
        const mockCreatedDeck = {
            id: 3,
            name: 'Water Deck',
            ownerId: 1,
            owner: mockUser,
            cards: []
        };

        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.deck.findFirst.mockResolvedValue(null);
        prismaMock.deck.create.mockResolvedValue(mockCreatedDeck as any);

        const response = await request(app)
            .post('/decks')
            .set('Authorization', 'Bearer mockedToken')
            .send(validDeckData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Deck créé avec succès.');
        expect(response.body).toHaveProperty('result');
        expect(response.body.result).toHaveProperty('name', 'Water Deck');
    });

    // Should create a deck with cards
    it('should create a new deck with cards', async () => {
        const dataWithCards = {
            name: 'Electric Deck',
            cards: [1, 2, 3]
        };
        const mockUser = { id: 1, email: 'user@example.com' };
        const mockCreatedDeck = {
            id: 4,
            name: 'Electric Deck',
            ownerId: 1,
            owner: mockUser,
            cards: [
                { id: 1, name: 'Pikachu' },
                { id: 2, name: 'Raichu' },
                { id: 3, name: 'Voltali' }
            ]
        };

        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.deck.findFirst.mockResolvedValue(null);
        prismaMock.deck.create.mockResolvedValue(mockCreatedDeck as any);

        const response = await request(app)
            .post('/decks')
            .set('Authorization', 'Bearer mockedToken')
            .send(dataWithCards);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Deck créé avec succès.');
        expect(response.body).toHaveProperty('result');
    });

    it('should return 401 without token', async () => {
        const response = await request(app)
            .post('/decks')
            .send(validDeckData);

        expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
        const response = await request(app)
            .post('/decks')
            .set('Authorization', 'Bearer invalidToken')
            .send(validDeckData);

        expect(response.status).toBe(401);
    });

    // Should handle missing userId from JWT (edge case)
    it('should return 400 if userId is missing from token', async () => {
        const jwt = require('jsonwebtoken');
        const originalVerify = jwt.verify;

        // Mock temporaire pour retourner un token sans userId
        jwt.verify = jest.fn(() => ({ email: 'test@example.com' }));

        const response = await request(app)
            .post('/decks')
            .set('Authorization', 'Bearer mockedToken')
            .send(validDeckData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', "L'utilisateur doit être authentifié.");

        // Restaurer le mock original
        jwt.verify = originalVerify;
    });

    // Should require name field
    it('should return 400 if name is missing', async () => {
        const invalidData = {};

        const response = await request(app)
            .post('/decks')
            .set('Authorization', 'Bearer mockedToken')
            .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', "Le champ 'name' est requis.");
    });

    // Should validate that owner exists
    it('should return 400 if owner does not exist', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .post('/decks')
            .set('Authorization', 'Bearer mockedToken')
            .send(validDeckData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', "L'utilisateur avec l'id 'mockedUserId' n'existe pas.");
    });

    // Should enforce unique name per user
    it('should return 400 if name already exists for this user', async () => {
        const mockUser = { id: 1, email: 'user@example.com' };
        const existingDeck = { id: 1, name: 'Water Deck', ownerId: 1 };

        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.deck.findFirst.mockResolvedValue(existingDeck as any);

        const response = await request(app)
            .post('/decks')
            .set('Authorization', 'Bearer mockedToken')
            .send(validDeckData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', "Un deck avec le nom 'Water Deck' existe déjà pour cet utilisateur.");
    });

    // Should handle database errors gracefully
    it('should return 500 on database error', async () => {
        prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/decks')
            .set('Authorization', 'Bearer mockedToken')
            .send(validDeckData);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la création du deck.');
    });
});

// Test suite for updating an existing deck
describe('PATCH /decks/:deckId', () => {
    const existingDeck = {
        id: 1,
        name: 'Electric Deck',
        ownerId: 1
    };

    // Should successfully update a deck
    it('should update a deck', async () => {
        const updateData = { name: 'Thunder Deck' };
        const updatedDeck = { ...existingDeck, name: 'Thunder Deck', owner: { id: 1 }, cards: [] };

        prismaMock.deck.findUnique.mockResolvedValue(existingDeck as any);
        prismaMock.deck.findFirst.mockResolvedValue(null);
        prismaMock.deck.update.mockResolvedValue(updatedDeck as any);

        const response = await request(app)
            .patch('/decks/1')
            .set('Authorization', 'Bearer mockedToken')
            .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Deck mis à jour avec succès.');
        expect(response.body).toHaveProperty('result');
    });

    // Should successfully update deck cards
    it('should update deck cards', async () => {
        const updateData = { cards: [4, 5, 6] };
        const updatedDeck = {
            ...existingDeck,
            owner: { id: 1 },
            cards: [{ id: 4 }, { id: 5 }, { id: 6 }]
        };

        prismaMock.deck.findUnique.mockResolvedValue(existingDeck as any);
        prismaMock.deck.update.mockResolvedValue(updatedDeck as any);

        const response = await request(app)
            .patch('/decks/1')
            .set('Authorization', 'Bearer mockedToken')
            .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Deck mis à jour avec succès.');
        expect(response.body).toHaveProperty('result');
    });

    // Should require authentication token
    it('should return 401 without token', async () => {
        const response = await request(app)
            .patch('/decks/1')
            .send({ name: 'Updated' });

        expect(response.status).toBe(401);
    });

    // Should validate authentication token
    it('should return 401 with invalid token', async () => {
        const response = await request(app)
            .patch('/decks/1')
            .set('Authorization', 'Bearer invalidToken')
            .send({ name: 'Updated' });

        expect(response.status).toBe(401);
    });

    // Should validate that ID is a number
    it('should return 400 for invalid id', async () => {
        const response = await request(app)
            .patch('/decks/invalid')
            .set('Authorization', 'Bearer mockedToken')
            .send({ name: 'Updated' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
    });

    it('should return 404 if deck does not exist', async () => {
        prismaMock.deck.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .patch('/decks/999')
            .set('Authorization', 'Bearer mockedToken')
            .send({ name: 'Updated' });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', "Le deck avec l'id '999' n'existe pas.");
    });

    // Should enforce unique name per user
    it('should return 400 if name already exists for this user', async () => {
        const otherDeck = { id: 2, name: 'Fire Deck', ownerId: 1 };

        prismaMock.deck.findUnique.mockResolvedValue(existingDeck as any);
        prismaMock.deck.findFirst.mockResolvedValue(otherDeck as any);

        const response = await request(app)
            .patch('/decks/1')
            .set('Authorization', 'Bearer mockedToken')
            .send({ name: 'Fire Deck' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', "Un deck avec le nom 'Fire Deck' existe déjà pour cet utilisateur.");
    });

    // Should handle database errors gracefully
    it('should return 500 on database error', async () => {
        prismaMock.deck.findUnique.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .patch('/decks/1')
            .set('Authorization', 'Bearer mockedToken')
            .send({ name: 'Updated' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la mise à jour du deck.');
    });
});

