import type { Request, Response } from 'express';
import prisma from '../client';
import { Type } from '@prisma/client';


// Create a new user
export async function createUser(req: Request, res: Response) {
    const { email, password } = req.body;
}