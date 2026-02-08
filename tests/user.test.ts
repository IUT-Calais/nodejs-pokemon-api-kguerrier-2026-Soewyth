import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';

// Test  for getting all users
describe('GET /users', () => {
  // Should successfully retrieve a list of users
  it('should return an array of users', async () => {
    const mockUsers = [
      { id: 1, email: 'alice@example.com' },
      { id: 2, email: 'bob@example.com' },
      { id: 3, email: 'charlie@example.com' }
    ];

    prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

    const response = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Liste des utilisateurs récupérée avec succès.');
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toHaveLength(3);
    expect(response.body.result[0]).toHaveProperty('id');
    expect(response.body.result[0]).toHaveProperty('email');
  });

  // Should require authentication token
  it('should return 401 without token', async () => {
    const response = await request(app).get('/users');

    expect(response.status).toBe(401);
  });

  // Should validate authentication token
  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer invalidToken');

    expect(response.status).toBe(401);
  });

  // Should return an empty array when database has no users
  it('should return empty array when no users', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Liste des utilisateurs récupérée avec succès.');
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toEqual([]);
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.user.findMany.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Une erreur est survenue lors de la récupération des utilisateurs.');
  });
});

// Test suite for getting a single user by ID
describe('GET /users/:id', () => {
  // Should successfully retrieve a user by ID
  it('should return the user', async () => {
    const mockUser = {
      id: 1,
      email: 'alice@example.com'
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    const response = await request(app)
      .get('/users/1')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Utilisateur récupéré avec succès.');
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toHaveProperty('id', 1);
    expect(response.body.result).toHaveProperty('email', 'alice@example.com');
    expect(response.body.result).not.toHaveProperty('password');
  });

  // Should require authentication token
  it('should return 401 without token', async () => {
    const response = await request(app).get('/users/1');

    expect(response.status).toBe(401);
  });

  // Should validate authentication token
  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/users/1')
      .set('Authorization', 'Bearer invalidToken');

    expect(response.status).toBe(401);
  });

  // Should return 404 when user doesn't exist
  it('should return 404 for unknown user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .get('/users/999')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', "Utilisateur avec l'ID 999 non trouvé.");
  });

  // Should validate that ID is a number
  it('should return 400 for invalid id (not a number)', async () => {
    const response = await request(app)
      .get('/users/invalid')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'ID doit être un nombre valide.");
  });

  // Should validate that ID is a number (testing with string)
  it('should return 400 for invalid id (text)', async () => {
    const response = await request(app)
      .get('/users/abc')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'ID doit être un nombre valide.");
  });

  // Should handle database errors gracefully
  it('should return 500 on database error', async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/users/1')
      .set('Authorization', 'Bearer mockedToken');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', "Une erreur est survenue lors de la récupération de l'utilisateur.");
  });
});
