// import request from 'supertest';
// import { app } from '../src';
// import { prismaMock } from './jest.setup';
// import { describe, it } from 'node:test';
// import { response } from 'express';

// describe('Deck API', () => {
//   describe('GET /decks', () => {
//     it('should fetch all decks', async () => {
//       const mockDecks: never[] = [];

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual(mockDecks);
//     });
//   });

//   describe('GET /decks/:deckId', () => {
//     it('should fetch a deck by ID', async () => {
//       const mockDeck = {};

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual(mockDeck);
//     });

//     it('should return 404 if deck is not found', async () => {
//       expect(response.status).toBe(404);
//       expect(response.body).toEqual({ error: 'Deck non trouvé' });
//     });
//   });

//   describe('POST /decks', () => {
//     it('should create a new deck', async () => {
//       const createdDeck = {};

//       expect(response.status).toBe(201);
//       expect(response.body).toEqual(createdDeck);
//     });

//     it('should return 400 if name is missing', async () => {
//       expect(response.status).toBe(400);
//       expect(response.body).toEqual({ error: "Le champ 'name' est requis." });
//     });

//     it('should return 400 if ownerId is missing', async () => {
//       expect(response.status).toBe(400);
//       expect(response.body).toEqual({ error: "Le champ 'ownerId' est requis." });
//     });
//   });

//   describe('PATCH /decks/:deckId', () => {
//     it('should update an existing deck', async () => {
//       const updatedDeck = {};

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual(updatedDeck);
//     });

//     it('should return 404 if deck is not found', async () => {
//       expect(response.status).toBe(404);
//     });
//   });

//   describe('DELETE /decks/:deckId', () => {
//     it('should delete a deck', async () => {
//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({ message: 'Deck supprimé avec succès.' });
//     });

//     it('should return 404 if deck is not found', async () => {
//       expect(response.status).toBe(404);
//     });
//   });

//   describe('POST /decks/:deckId/cards', () => {
//     it('should add a card to a deck', async () => {
//       const updatedDeck = {};

//       expect(response.status).toBe(200);
//       expect(response.body.message).toBe('Carte ajoutée au deck avec succès.');
//     });

//     it('should return 404 if deck is not found', async () => {
//       expect(response.status).toBe(404);
//     });

//     it('should return 404 if card is not found', async () => {
//       expect(response.status).toBe(404);
//     });

//     it('should return 400 if card is already in deck', async () => {
//       expect(response.status).toBe(400);
//       expect(response.body).toEqual({ error: 'Cette carte est déjà dans le deck.' });
//     });
//   });

//   describe('DELETE /decks/:deckId/cards/:cardId', () => {
//     it('should remove a card from a deck', async () => {
//       const updatedDeck = {};

//       expect(response.status).toBe(200);
//       expect(response.body.message).toBe('Carte retirée du deck avec succès.');
//     });

//     it('should return 404 if deck is not found', async () => {
//       expect(response.status).toBe(404);
//     });

//     it('should return 400 if card is not in deck', async () => {
//       expect(response.status).toBe(400);
//       expect(response.body).toEqual({ error: "Cette carte n'est pas dans le deck." });
//     });
//   });
// });

// function expect(status: any) {
//   throw new Error('Function not implemented.');
// }
