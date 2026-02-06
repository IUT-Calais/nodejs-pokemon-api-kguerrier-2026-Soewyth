import request from 'supertest';
import { describe, expect, it } from 'vitest'
import { app } from '../src/index.js';
import { prismaMock } from './jest.setup.js';


describe('GET /users', () => {
    it('should return an array of users', async () => {
        const mockedUsersArray = [
            { id: 1, name: 'Alice', email: '', password: '' },
            { id: 2, name: 'Bob', email: '', password: '' },
        ];
        prismaMock.user.findMany.mockResolvedValue(mockedUsersArray);
        const response = await request(app).get('/users');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockedUsersArray);
    });
});


describe('GET /users/:idUser', () => {
    it('should return the user', async () => {
        const mockedUser = { id: 1, name: 'Alice', email: '', password: '' };
        prismaMock.user.findUnique.mockResolvedValue(mockedUser);
        const response = await request(app).get('/users/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockedUser);
    });
    it('should return null for unknown user', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        const response = await request(app).get('/users/unknown');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({});
    });
});