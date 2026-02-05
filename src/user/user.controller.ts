import type { Request, Response } from 'express';
import prisma from '../client';
import bcrypt from 'bcrypt';


// Create a new user
export async function createUser(req: Request, res: Response) {
    const { email, password } = req.body;

    // VErification of required fields
    if (!email) {
        res.status(400).json({ error: "Le champ 'email' est requis." });
        return;
    }

    if (!password) {
        res.status(400).json({ error: "Le champ 'password' est requis." });
        return;
    }

    try {
        // Verify if a user with the same email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            res.status(400).json({ error: `Un utilisateur avec l'email '${email}' existe déjà.` });
            return;
        }

        // Crypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database
        const createdUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword
            }
        });

        // Return the response without the password
        res.status(201).json({
            message: 'Utilisateur créé avec succès.',
            result: {
                id: createdUser.id,
                email: createdUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la création de l\'utilisateur.' });
    }
}