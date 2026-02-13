import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';

// Test suite for getting all pokemon attacks
describe('GET /pokemons-attacks', () => {
  // Should successfully retrieve a list of pokemon attacks
  it('should return an array of pokemon attacks', async () => {
    const mockAttacks = [
      {
        id: 1,
        name: 'Thunderbolt',
        damages: 90,
        typeId: 1,
        type: { id: 1, name: 'Electric' }
      },
      {
        id: 2,
        name: 'Flamethrower',
        damages: 95,
        typeId: 2,
        type: { id: 2, name: 'Fire' }
      },
      {
        id: 3,
        name: 'Hydro Pump',
        damages: 110,
        typeId: 3,
        type: { id: 3, name: 'Water' }
      }
    ];

    prismaMock.pokemonAttack.findMany.mockResolvedValue(mockAttacks as any);

    const response = await request(app).get('/pokemons-attacks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('damages');
    expect(response.body[0]).toHaveProperty('type');
  });

  // Should return an empty array when database has no attacks
  it('should return empty array when no attacks', async () => {
    prismaMock.pokemonAttack.findMany.mockResolvedValue([]);

    const response = await request(app).get('/pokemons-attacks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonAttack.findMany.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/pokemons-attacks');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la récupération des attaques.');
  });
});

// Test suite for getting a single pokemon attack by ID
describe('GET /pokemons-attacks/:attackId', () => {
  // Should successfully retrieve an attack by ID
  it('should return the attack', async () => {
    const mockAttack = {
      id: 1,
      name: 'Thunderbolt',
      damages: 90,
      typeId: 1,
      type: { id: 1, name: 'Electric' },
      pokemons: []
    };

    prismaMock.pokemonAttack.findUnique.mockResolvedValue(mockAttack as any);

    const response = await request(app).get('/pokemons-attacks/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'Thunderbolt');
    expect(response.body).toHaveProperty('damages', 90);
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('pokemons');
  });

  // Should return 404 when attack doesn't exist
  it('should return 404 for unknown attack', async () => {
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(null);

    const response = await request(app).get('/pokemons-attacks/999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', "Attaque non trouvée, l'id 999 n'existe pas.");
  });

  // Should validate that ID is a number
  it('should return 400 for invalid id (not a number)', async () => {
    const response = await request(app).get('/pokemons-attacks/invalid');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should validate that ID is positive
  it('should return 400 for invalid id (zero)', async () => {
    const response = await request(app).get('/pokemons-attacks/0');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should validate that ID is positive
  it('should return 400 for invalid id (negative)', async () => {
    const response = await request(app).get('/pokemons-attacks/-1');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonAttack.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/pokemons-attacks/1');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue');
  });
});
