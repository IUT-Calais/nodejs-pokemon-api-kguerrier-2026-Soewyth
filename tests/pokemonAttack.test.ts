import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';

// Test suite for getting all pokemon attacks
describe('GET /pokemon-attacks', () => {
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

    const response = await request(app).get('/pokemon-attacks');

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

    const response = await request(app).get('/pokemon-attacks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonAttack.findMany.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/pokemon-attacks');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la récupération des attaques.');
  });
});

// Test suite for getting a single pokemon attack by ID
describe('GET /pokemon-attacks/:attackId', () => {
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

    const response = await request(app).get('/pokemon-attacks/1');

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

    const response = await request(app).get('/pokemon-attacks/999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', "Attaque non trouvée, l'id 999 n'existe pas.");
  });

  // Should validate that ID is a number
  it('should return 400 for invalid id (not a number)', async () => {
    const response = await request(app).get('/pokemon-attacks/invalid');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should validate that ID is positive
  it('should return 400 for invalid id (zero)', async () => {
    const response = await request(app).get('/pokemon-attacks/0');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should validate that ID is positive
  it('should return 400 for invalid id (negative)', async () => {
    const response = await request(app).get('/pokemon-attacks/-1');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonAttack.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/pokemon-attacks/1');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue');
  });
});

// Test suite for creating a new pokemon attack
describe('POST /pokemon-attacks', () => {
  const validAttackData = {
    name: 'Solar Beam',
    damages: 120,
    type: 1
  };

  // Should successfully create a pokemon attack
  it('should create a new pokemon attack', async () => {
    const mockType = { id: 1, name: 'Grass' };
    const mockCreatedAttack = {
      id: 5,
      name: 'Solar Beam',
      damages: 120,
      typeId: 1
    };

    prismaMock.type.findUnique.mockResolvedValue(mockType as any);
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(null);
    prismaMock.pokemonAttack.create.mockResolvedValue(mockCreatedAttack as any);

    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer mockedToken')
      .send(validAttackData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Attaque Pokémon créée avec succès.');
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toHaveProperty('name', 'Solar Beam');
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/pokemon-attacks')
      .send(validAttackData);

    expect(response.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer invalidToken')
      .send(validAttackData);

    expect(response.status).toBe(401);
  });

  // Should require name field
  it('should return 400 if name is missing', async () => {
    const invalidData = { ...validAttackData } as any;
    delete invalidData.name;

    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'name' est requis.");
  });

  // Should require damages field
  it('should return 400 if damages is missing', async () => {
    const invalidData = { ...validAttackData } as any;
    delete invalidData.damages;

    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'damages' est requis.");
  });

  // Should require type field
  it('should return 400 if type is missing', async () => {
    const invalidData = { ...validAttackData } as any;
    delete invalidData.type;

    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'type' est requis.");
  });

  // Should validate that type is a number
  it('should return 400 if type is not a number', async () => {
    const invalidData = { ...validAttackData, type: 'invalid' };

    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'type' doit être un nombre.");
  });

  // Should validate that damages is a number
  it('should return 400 if damages is not a number', async () => {
    const invalidData = { ...validAttackData, damages: 'invalid' };

    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'damages' doit être un nombre.");
  });

  // Should validate that type exists in database
  it('should return 400 if type does not exist', async () => {
    prismaMock.type.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer mockedToken')
      .send(validAttackData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le type avec l'id '1' n'existe pas.");
  });

  // Should enforce unique name constraint
  it('should return 400 if name already exists', async () => {
    const mockType = { id: 1, name: 'Grass' };
    const existingAttack = { id: 1, name: 'Solar Beam', damages: 100, typeId: 1 };

    prismaMock.type.findUnique.mockResolvedValue(mockType as any);
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(existingAttack as any);

    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer mockedToken')
      .send(validAttackData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Une attaque avec le nom 'Solar Beam' existe déjà.");
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.type.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/pokemon-attacks')
      .set('Authorization', 'Bearer mockedToken')
      .send(validAttackData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', "Une erreur est survenue lors de la création de l'attaque Pokémon.");
  });
});

// Test suite for updating an existing pokemon attack
describe('PATCH /pokemon-attacks/:attackId', () => {
  const existingAttack = {
    id: 1,
    name: 'Thunderbolt',
    damages: 90,
    typeId: 1
  };

  // Should successfully update a pokemon attack
  it('should update a pokemon attack', async () => {
    const updateData = { name: 'Thunderbolt Updated', damages: 95 };
    const updatedAttack = { ...existingAttack, name: 'Thunderbolt Updated', damages: 95 };

    prismaMock.pokemonAttack.findUnique.mockResolvedValueOnce(existingAttack as any);
    prismaMock.pokemonAttack.findUnique.mockResolvedValueOnce(null);
    prismaMock.pokemonAttack.update.mockResolvedValue(updatedAttack as any);

    const response = await request(app)
      .patch('/pokemon-attacks/1')
      .set('Authorization', 'Bearer mockedToken')
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Attaque Pokémon mise à jour avec succès.');
    expect(response.body).toHaveProperty('result');
  });

  // Should require authentication token
  it('should return 401 without token', async () => {
    const response = await request(app)
      .patch('/pokemon-attacks/1')
      .send({ name: 'Updated' });

    expect(response.status).toBe(401);
  });

  // Should validate authentication token
  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .patch('/pokemon-attacks/1')
      .set('Authorization', 'Bearer invalidToken')
      .send({ name: 'Updated' });

    expect(response.status).toBe(401);
  });

  // Should validate that ID is a number
  it('should return 400 for invalid id', async () => {
    const response = await request(app)
      .patch('/pokemon-attacks/invalid')
      .set('Authorization', 'Bearer mockedToken')
      .send({ name: 'Updated' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  it('should return 404 if pokemon attack does not exist', async () => {
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .patch('/pokemon-attacks/999')
      .set('Authorization', 'Bearer mockedToken')
      .send({ name: 'Updated' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', "L'attaque avec l'id '999' n'existe pas.");
  });

  // Should validate that new type exists in database
  it('should return 400 if type does not exist', async () => {
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(existingAttack as any);
    prismaMock.type.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .patch('/pokemon-attacks/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ type: 999 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le type avec l'id '999' n'existe pas.");
  });

  // Should validate that type is a number
  it('should return 400 if type is not a number', async () => {
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(existingAttack as any);

    const response = await request(app)
      .patch('/pokemon-attacks/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ type: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'type' doit être un nombre.");
  });

  // Should validate that damages is a number
  it('should return 400 if damages is not a number', async () => {
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(existingAttack as any);

    const response = await request(app)
      .patch('/pokemon-attacks/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ damages: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'damages' doit être un nombre.");
  });

  // Should enforce unique name constraint
  it('should return 400 if name already exists on another attack', async () => {
    const otherAttack = { id: 2, name: 'Flamethrower', damages: 95, typeId: 2 };

    prismaMock.pokemonAttack.findUnique.mockResolvedValueOnce(existingAttack as any);
    prismaMock.pokemonAttack.findUnique.mockResolvedValueOnce(otherAttack as any);

    const response = await request(app)
      .patch('/pokemon-attacks/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ name: 'Flamethrower' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Une attaque avec le nom 'Flamethrower' existe déjà.");
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonAttack.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .patch('/pokemon-attacks/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ name: 'Updated' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', "Une erreur est survenue lors de la mise à jour de l'attaque Pokémon.");
  });
});

// Test suite for deleting a pokemon attack
describe('DELETE /pokemon-attacks/:attackId', () => {
  const existingAttack = {
    id: 1,
    name: 'Thunderbolt',
    damages: 90,
    typeId: 1
  };

  // Should successfully delete a pokemon attack
  it('should delete a pokemon attack', async () => {
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(existingAttack as any);
    prismaMock.pokemonCard.findMany.mockResolvedValue([]);
    prismaMock.pokemonAttack.delete.mockResolvedValue(existingAttack as any);

    const response = await request(app)
      .delete('/pokemon-attacks/1')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Attaque Pokémon supprimée avec succès.');
  });

  // Should require authentication token
  it('should return 401 without token', async () => {
    const response = await request(app).delete('/pokemon-attacks/1');

    expect(response.status).toBe(401);
  });

  // Should validate authentication token
  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .delete('/pokemon-attacks/1')
      .set('Authorization', 'Bearer invalidToken');

    expect(response.status).toBe(401);
  });

  // Should validate that ID is a number
  it('should return 400 for invalid id', async () => {
    const response = await request(app)
      .delete('/pokemon-attacks/invalid')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should validate that ID is positive
  it('should return 400 for negative id', async () => {
    const response = await request(app)
      .delete('/pokemon-attacks/-1')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  it('should return 404 if pokemon attack does not exist', async () => {
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .delete('/pokemon-attacks/999')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', "L'attaque avec l'id '999' n'existe pas.");
  });

  // Should not delete attack if used by pokemon cards
  it('should return 400 if attack is used by pokemon cards', async () => {
    const mockCards = [
      { id: 1, name: 'Pikachu', attackId: 1 },
      { id: 2, name: 'Raichu', attackId: 1 }
    ];

    prismaMock.pokemonAttack.findUnique.mockResolvedValue(existingAttack as any);
    prismaMock.pokemonCard.findMany.mockResolvedValue(mockCards as any);

    const response = await request(app)
      .delete('/pokemon-attacks/1')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Impossible de supprimer cette attaque car elle est utilisée par 2 carte(s) Pokémon.');
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonAttack.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .delete('/pokemon-attacks/1')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', "Une erreur est survenue lors de la suppression de l'attaque Pokémon.");
  });
});
