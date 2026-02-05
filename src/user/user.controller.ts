import type { Request, Response } from 'express';
import prisma from '../client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';


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

// Login user
export async function loginUser(req: Request, res: Response) {
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
        // Verify if the user exists
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            res.status(401).json({ error: "Email ou mot de passe incorrect." });
            return;
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: "Email ou mot de passe incorrect." });
            return;
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '2h' }
        );

        // Retourner le token
        res.status(200).json({
            message: 'Connexion réussie.',
            token,
            user: {
                id: user.id,
                email: user.email
            }
        }); 
        return;
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la connexion.' });
        return;
    }
}