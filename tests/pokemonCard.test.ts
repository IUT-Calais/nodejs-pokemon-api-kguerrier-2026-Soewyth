import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';

// Test  for getting all pokemon cards from the collection
describe('GET /pokemon-cards', () => {
  // Should successfully retrieve a list of pokemon cards
  it('should return an array of pokemon cards', async () => {
    const mockPokemonCards = [
      {
        id: 1,
        name: 'Bulbizarre',
        pokedexId: 1,
        typeId: 1,
        lifePoints: 45,
        attackId: 1,
        size: 0.7,
        weight: 6.9,
        imageUrl: 'https://example.com/bulbizarre.png',
        weaknessId: 2,
        type: { id: 1, name: 'Plante' },
        weakness: { id: 2, name: 'Feu' },
        attack: { id: 1, name: 'Charge', damages: 20, typeId: 1 }
      },
      {
        id: 2,
        name: 'Salamèche',
        pokedexId: 4,
        typeId: 2,
        lifePoints: 39,
        attackId: 2,
        size: 0.6,
        weight: 8.5,
        imageUrl: 'https://example.com/salameche.png',
        weaknessId: 3,
        type: { id: 2, name: 'Feu' },
        weakness: { id: 3, name: 'Eau' },
        attack: { id: 2, name: 'Flammèche', damages: 40, typeId: 2 }
      }
    ];

    prismaMock.pokemonCard.findMany.mockResolvedValue(mockPokemonCards);

    const response = await request(app).get('/pokemon-cards');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockPokemonCards);
    expect(response.body).toHaveLength(2);
  });

  // Should return an empty array when database has no cards
  it('should return empty array when no pokemon cards', async () => {
    prismaMock.pokemonCard.findMany.mockResolvedValue([]);

    const response = await request(app).get('/pokemon-cards');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonCard.findMany.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/pokemon-cards');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la récupération des cartes Pokémon.');
  });
});

// Test  for getting a single pokemon card by ID
describe('GET /pokemon-cards/:pokemonCardId', () => {
  // Should successfully retrieve a pokemon card by its ID
  it('should return the pokemon card', async () => {
    const mockPokemonCard = {
      id: 1,
      name: 'Bulbizarre',
      pokedexId: 1,
      typeId: 1,
      lifePoints: 45,
      attackId: 1,
      size: 0.7,
      weight: 6.9,
      imageUrl: 'https://example.com/bulbizarre.png',
      weaknessId: 2,
      type: { id: 1, name: 'Plante' },
      weakness: { id: 2, name: 'Feu' },
      attack: { id: 1, name: 'Charge', damages: 20, typeId: 1 }
    };

    prismaMock.pokemonCard.findUnique.mockResolvedValue(mockPokemonCard);

    const response = await request(app).get('/pokemon-cards/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockPokemonCard);
  });

  // Should return 404 when pokemon card doesn't exist
  it('should return 404 for unknown pokemon card', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(null);

    const response = await request(app).get('/pokemon-cards/999');

    expect(response.status).toBe(404);
  });

  // Should validate that ID is a number
  it('should return 400 for invalid id (not a number)', async () => {
    const response = await request(app).get('/pokemon-cards/invalid');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should validate that ID is positive
  it('should return 400 for invalid id (negative number)', async () => {
    const response = await request(app).get('/pokemon-cards/-1');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonCard.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/pokemon-cards/1');

    expect(response.status).toBe(500);
  });
});

// Test  for creating a new pokemon card
describe('POST /pokemon-cards', () => {
  const validPokemonData = {
    name: 'Carapuce',
    pokedexId: 7,
    type: 3,
    lifePoints: 44,
    attack: 1,
    size: 0.5,
    weight: 9.0,
    imageUrl: 'https://example.com/carapuce.png',
    weakness: 1
  };

  // Should successfully create a pokemon card with all fields
  it('should create a new pokemon card', async () => {
    const mockType = { id: 3, name: 'Eau' };
    const mockAttack = { id: 1, name: 'Charge', damages: 20, typeId: 1 };
    const mockWeaknessType = { id: 1, name: 'Plante' };
    const mockCreatedCard = {
      id: 3,
      name: 'Carapuce',
      pokedexId: 7,
      typeId: 3,
      lifePoints: 44,
      attackId: 1,
      size: 0.5,
      weight: 9.0,
      imageUrl: 'https://example.com/carapuce.png',
      weaknessId: 1
    };

    prismaMock.type.findUnique.mockResolvedValueOnce(mockType);
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(mockAttack);
    prismaMock.type.findUnique.mockResolvedValueOnce(mockWeaknessType);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(null);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(null);
    prismaMock.pokemonCard.create.mockResolvedValue(mockCreatedCard);

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(validPokemonData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Carte Pokémon créée avec succès.');
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toHaveProperty('name', 'Carapuce');
  });

  // Should create a pokemon card without weakness 
  it('should create a new pokemon card without weakness', async () => {
    const dataWithoutWeakness = {
      name: 'Pikachu',
      pokedexId: 25,
      type: 4,
      lifePoints: 35,
      attack: 2,
      size: 0.4,
      weight: 6.0,
      imageUrl: 'https://example.com/pikachu.png'
    };
    
    const mockType = { id: 4, name: 'Electrik' };
    const mockAttack = { id: 2, name: 'Tonnerre', damages: 50, typeId: 4 };
    const mockCreatedCard = {
      id: 4,
      name: 'Pikachu',
      pokedexId: 25,
      typeId: 4,
      lifePoints: 35,
      attackId: 2,
      size: 0.4,
      weight: 6.0,
      imageUrl: 'https://example.com/pikachu.png',
      weaknessId: null
    };

    prismaMock.type.findUnique.mockResolvedValueOnce(mockType);
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(mockAttack);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(null);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(null);
    prismaMock.pokemonCard.create.mockResolvedValue(mockCreatedCard);

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(dataWithoutWeakness);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Carte Pokémon créée avec succès.');
    expect(response.body).toHaveProperty('result');
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/pokemon-cards')
      .send(validPokemonData);

    expect(response.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer invalidToken')
      .send(validPokemonData);

    expect(response.status).toBe(401);
  });

  // Should require name field
  it('should return 400 if name is missing', async () => {
    const invalidData = { ...validPokemonData } as any;
    delete invalidData.name;

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'name' est requis.");
  });

  // Should require pokedexId field
  it('should return 400 if pokedexId is missing', async () => {
    const invalidData = { ...validPokemonData } as any;
    delete invalidData.pokedexId;

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'pokedexId' est requis.");
  });

  // Should require type field
  it('should return 400 if type is missing', async () => {
    const invalidData = { ...validPokemonData } as any;
    delete invalidData.type;

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'type' est requis.");
  });

  // Should require lifePoints field
  it('should return 400 if lifePoints is missing', async () => {
    const invalidData = { ...validPokemonData } as any;
    delete invalidData.lifePoints;

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'lifePoints' est requis.");
  });

  // Should require attack field
  it('should return 400 if attack is missing', async () => {
    const invalidData = { ...validPokemonData } as any;
    delete invalidData.attack;

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'attack' est requis.");
  });

  // Should validate that type is a number
  it('should return 400 if type is not a number', async () => {
    const invalidData = { ...validPokemonData, type: 'invalid' };

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'type' doit être un nombre.");
  });

  // Should validate that pokedexId is a number
  it('should return 400 if pokedexId is not a number', async () => {
    const invalidData = { ...validPokemonData, pokedexId: 'invalid' };

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'pokedexId' doit être un nombre.");
  });

  it('should return 400 if lifePoints is not a number', async () => {
    const invalidData = { ...validPokemonData, lifePoints: 'invalid' };

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'lifePoints' doit être un nombre.");
  });

  // Should validate that attack is a number
  it('should return 400 if attack is not a number', async () => {
    const invalidData = { ...validPokemonData, attack: 'invalid' };

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'attack' doit être un nombre.");
  });

  // Should validate that weakness is a number when provided
  it('should return 400 if weakness is not a number', async () => {
    const invalidData = { ...validPokemonData, weakness: 'invalid' };

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'weakness' doit être un nombre.");
  });

  // Should validate that type exists in database
  it('should return 400 if type does not exist', async () => {
    prismaMock.type.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(validPokemonData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le type avec l'id '3' n'existe pas.");
  });

  // Should validate that attack exists in database
  it('should return 400 if attack does not exist', async () => {
    const mockType = { id: 3, name: 'Eau' };
    prismaMock.type.findUnique.mockResolvedValue(mockType);
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(validPokemonData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'attaque avec l'id '1' n'existe pas.");
  });

  // Should validate that weakness type exists in database
  it('should return 400 if weakness type does not exist', async () => {
    const mockType = { id: 3, name: 'Eau' };
    const mockAttack = { id: 1, name: 'Charge', damages: 20, typeId: 1 };

    prismaMock.type.findUnique.mockResolvedValueOnce(mockType);
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(mockAttack);
    prismaMock.type.findUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(validPokemonData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le type weakness avec l'id '1' n'existe pas.");
  });

  // Should enforce unique name constraint
  it('should return 400 if name already exists', async () => {
    const mockType = { id: 3, name: 'Eau' };
    const mockAttack = { id: 1, name: 'Charge', damages: 20, typeId: 1 };
    const mockWeaknessType = { id: 1, name: 'Plante' };
    const existingCard = { id: 1, name: 'Carapuce', pokedexId: 10, typeId: 3, lifePoints: 44, attackId: 1, size: 0.5, weight: 9.0, imageUrl: '', weaknessId: 1 };

    prismaMock.type.findUnique.mockResolvedValueOnce(mockType);
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(mockAttack);
    prismaMock.type.findUnique.mockResolvedValueOnce(mockWeaknessType);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(existingCard);

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(validPokemonData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Une carte Pokémon avec le nom 'Carapuce' existe déjà.");
  });

  // Should enforce unique pokedexId constraint
  it('should return 400 if pokedexId already exists', async () => {
    const mockType = { id: 3, name: 'Eau' };
    const mockAttack = { id: 1, name: 'Charge', damages: 20, typeId: 1 };
    const mockWeaknessType = { id: 1, name: 'Plante' };
    const existingCard = { id: 1, name: 'OtherName', pokedexId: 7, typeId: 3, lifePoints: 44, attackId: 1, size: 0.5, weight: 9.0, imageUrl: '', weaknessId: 1 };

    prismaMock.type.findUnique.mockResolvedValueOnce(mockType);
    prismaMock.pokemonAttack.findUnique.mockResolvedValue(mockAttack);
    prismaMock.type.findUnique.mockResolvedValueOnce(mockWeaknessType);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(null);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(existingCard);

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(validPokemonData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Une carte Pokémon avec le pokedexId '7' existe déjà.");
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    const mockType = { id: 3, name: 'Eau' };
    prismaMock.type.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/pokemon-cards')
      .set('Authorization', 'Bearer mockedToken')
      .send(validPokemonData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la création de la carte Pokémon.');
  });
});

// Test  for updating an existing pokemon card
describe('PATCH /pokemon-cards/:pokemonCardId', () => {
  const existingCard = {
    id: 1,
    name: 'Bulbizarre',
    pokedexId: 1,
    typeId: 1,
    lifePoints: 45,
    attackId: 1,
    size: 0.7,
    weight: 6.9,
    imageUrl: '',
    weaknessId: 2
  };

  // Should successfully update a pokemon card
  it('should update a pokemon card', async () => {
    const updateData = { name: 'Bulbizarre Updated', lifePoints: 50, imageUrl: 'https://new-image.png' };
    const updatedCard = { ...existingCard, name: 'Bulbizarre Updated', lifePoints: 50, imageUrl: 'https://new-image.png' };

    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(existingCard);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(null);
    prismaMock.pokemonCard.update.mockResolvedValue(updatedCard);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Carte Pokémon mise à jour avec succès.');
    expect(response.body).toHaveProperty('result');
  });

  // Should require authentication token
  it('should return 401 without token', async () => {
    const response = await request(app)
      .patch('/pokemon-cards/1')
      .send({ name: 'Updated' });

    expect(response.status).toBe(401);
  });

  // Should validate authentication token
  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer invalidToken')
      .send({ name: 'Updated' });

    expect(response.status).toBe(401);
  });

  // Should validate that ID is a number
  it('should return 400 for invalid id', async () => {
    const response = await request(app)
      .patch('/pokemon-cards/invalid')
      .set('Authorization', 'Bearer mockedToken')
      .send({ name: 'Updated' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  it('should return 404 if pokemon card does not exist', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .patch('/pokemon-cards/999')
      .set('Authorization', 'Bearer mockedToken')
      .send({ name: 'Updated' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', "La carte Pokémon avec l'id '999' n'existe pas.");
  });

  // Should validate that new type exists in database
  it('should return 400 if type does not exist', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(existingCard);
    prismaMock.type.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ type: 999 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le type avec l'id '999' n'existe pas.");
  });

  // Should validate that type is a number
  it('should return 400 if type is not a number', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(existingCard);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ type: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'type' doit être un nombre.");
  });

  // Should validate that new weakness type exists in database
  it('should return 400 if weakness type does not exist', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(existingCard);
    prismaMock.type.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ weakness: 999 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le type weakness avec l'id '999' n'existe pas.");
  });

  // Should validate that pokedexId is a number
  it('should return 400 if pokedexId is not a number', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(existingCard);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ pokedexId: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'pokedexId' doit être un nombre.");
  });

  it('should return 400 if lifePoints is not a number', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(existingCard);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ lifePoints: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'lifePoints' doit être un nombre.");
  });

  // Should validate that size is a number
  it('should return 400 if size is not a number', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(existingCard);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ size: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'size' doit être un nombre.");
  });

  // Should validate that weight is a number
  it('should return 400 if weight is not a number', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(existingCard);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ weight: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'weight' doit être un nombre.");
  });

  // Should validate that weakness is a number
  it('should return 400 if weakness is not a number', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(existingCard);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ weakness: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Le champ 'weakness' doit être un nombre.");
  });

  // Should enforce unique name constraint
  it('should return 400 if name already exists on another card', async () => {
    const otherCard = { id: 2, name: 'Salamèche', pokedexId: 4, typeId: 2, lifePoints: 39, attackId: 2, size: 0.6, weight: 8.5, imageUrl: '', weaknessId: 3 };

    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(existingCard);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(otherCard);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ name: 'Salamèche' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Une carte Pokémon avec le nom 'Salamèche' existe déjà.");
  });

  // Should enforce unique pokedexId constraint
  it('should return 400 if pokedexId already exists on another card', async () => {
    const otherCard = { id: 2, name: 'Salamèche', pokedexId: 4, typeId: 2, lifePoints: 39, attackId: 2, size: 0.6, weight: 8.5, imageUrl: '', weaknessId: 3 };

    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(existingCard);
    prismaMock.pokemonCard.findUnique.mockResolvedValueOnce(otherCard);

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ pokedexId: 4 });

    expect(response.status).toBe(400);
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonCard.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .patch('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken')
      .send({ name: 'Updated' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la mise à jour de la carte Pokémon.');
  });
});

// Test suite for deleting a pokemon card
describe('DELETE /pokemon-cards/:pokemonCardId', () => {
  const existingCard = {
    id: 1,
    name: 'Bulbizarre',
    pokedexId: 1,
    typeId: 1,
    lifePoints: 45,
    attackId: 1,
    size: 0.7,
    weight: 6.9,
    imageUrl: '',
    weaknessId: 2
  };

  // Should successfully delete a pokemon card
  it('should delete a pokemon card', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(existingCard);
    prismaMock.pokemonCard.delete.mockResolvedValue(existingCard);

    const response = await request(app)
      .delete('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Carte Pokémon supprimée avec succès.');
  });

  // Should require authentication token
  it('should return 401 without token', async () => {
    const response = await request(app).delete('/pokemon-cards/1');

    expect(response.status).toBe(401);
  });

  // Should validate authentication token
  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .delete('/pokemon-cards/1')
      .set('Authorization', 'Bearer invalidToken');

    expect(response.status).toBe(401);
  });

  // Should validate that ID is a number
  it('should return 400 for invalid id', async () => {
    const response = await request(app)
      .delete('/pokemon-cards/invalid')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  // Should validate that ID is positive
  it('should return 400 for negative id', async () => {
    const response = await request(app)
      .delete('/pokemon-cards/-1')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'id doit être un nombre valide.");
  });

  it('should return 404 if pokemon card does not exist', async () => {
    prismaMock.pokemonCard.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .delete('/pokemon-cards/999')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', "La carte Pokémon avec l'id '999' n'existe pas.");
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.pokemonCard.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .delete('/pokemon-cards/1')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la suppression de la carte Pokémon.');
  });
});
