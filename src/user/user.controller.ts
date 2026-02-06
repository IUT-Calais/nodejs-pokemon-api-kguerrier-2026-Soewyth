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
            { expiresIn: '2'}
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

// Get all users
export async function getUsers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true
            }
        });

        res.status(200).json({
            message: 'Liste des utilisateurs récupérée avec succès.',
            result: users
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des utilisateurs.' });
    }
}

// Get user by ID
export async function getUserById(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Number(id);

    if (isNaN(userId)) {
        res.status(400).json({ error: "L'ID doit être un nombre valide." });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true
            }
        });

        if (!user) {
            res.status(404).json({ error: `Utilisateur avec l'ID ${userId} non trouvé.` });
            return;
        }

        res.status(200).json({
            message: 'Utilisateur récupéré avec succès.',
            result: user
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de l\'utilisateur.' });
    }
}

// Update user by ID
export async function updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Number(id);
    const { email, password } = req.body;

    if (isNaN(userId)) {
        res.status(400).json({ error: "L'ID doit être un nombre valide." });
        return;
    }

    // one field must be provided
    if (!email && !password) {
        res.status(400).json({ error: "Au moins un champ 'email' ou 'password' doit être fourni." });
        return;
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            res.status(404).json({ error: `Utilisateur avec l'ID ${userId} non trouvé.` });
            return;
        }

        // Check if email is already taken by another user
        if (email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: email }
            });

            if (emailExists && emailExists.id !== userId) {
                res.status(400).json({ error: `Un utilisateur avec l'email '${email}' existe déjà.` });
                return;
            }
        }

        // Prepare update data
        const updateData: { email?: string; password?: string } = {};

        if (email) {
            updateData.email = email;
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true
            }
        });

        res.status(200).json({
            message: 'Utilisateur mis à jour avec succès.',
            result: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.' });
    }
}

// Delete user by ID
export async function deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Number(id);

    if (isNaN(userId)) {
        res.status(400).json({ error: "L'ID doit être un nombre valide." });
        return;
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            res.status(404).json({ error: `Utilisateur avec l'ID ${userId} non trouvé.` });
            return;
        }

        // Delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la suppression de l\'utilisateur.' });
    }
}