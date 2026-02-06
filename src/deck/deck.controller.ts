import type { Request, Response } from 'express';
import prisma from '../client';

// Get all pokemon decks
export const getPokemonDecks = async (_req: Request, res: Response) => {
    try {
        const decks = await prisma.deck.findMany({
            include: { // include for loading related data as well
                owner: true,
                cards: true,
            }
        });
        res.status(200).json(decks);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des decks.' });
    }
};
    
// Get a single pokemon deck by ID
export const getPokemonDeckById = async (req: Request, res: Response) => {
    const { deckId } = req.params;
    const id = Number(deckId);

    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "L'id doit être un nombre valide." });
        return;
    }

    try {
        const deck = await prisma.deck.findUnique({
            where: { id },
            include: { // include for loading related data as well
                owner: true,
                cards: true,
            }
        });

        if (!deck) {
            res.status(404).json({ error: `Deck non trouvé, l'id ${deckId} n'existe pas.` });
            return;
        }

        res.status(200).json(deck);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Create a new pokemon deck
export const createPokemonDeck = async (req: Request, res: Response) => {
    const { name, cards } = req.body;
    const ownerId = req.userId; // Get from JWT

    // Required field
    if (!name) {
        res.status(400).json({ error: "Le champ 'name' est requis." });
        return;
    }

    if (!ownerId) {
        res.status(400).json({ error: "L'utilisateur doit être authentifié." });
        return;
    }

    try {
        // Check if owner exists
        const existingUser = await prisma.user.findUnique({
            where: { id: ownerId },
        });
        if (!existingUser) {
            res.status(400).json({ error: `L'utilisateur avec l'id '${ownerId}' n'existe pas.` });
            return;
        }

        // Check for existing deck with same name for this user
        const existingDeck = await prisma.deck.findFirst({
            where: { 
                name: name,
                ownerId: ownerId
            },
        });
        if (existingDeck) {
            res.status(400).json({ error: `Un deck avec le nom '${name}' existe déjà pour cet utilisateur.` });
            return;
        }

        // Create the new deck with optional cards connection
        const created = await prisma.deck.create({
            data: {
                name: name,
                ownerId: ownerId,
                cards: cards ? {
                    connect: cards.map((cardId: number) => ({ id: Number(cardId) }))
                } : undefined
            },
            include: {
                owner: true,
                cards: true,
            }
        });

        // Send back the created deck
        res.status(201).json({
            message: 'Deck créé avec succès.',
            result: created,
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la création du deck.' });
    }
};

// Update an existing pokemon deck
export const updatePokemonDeck = async (req: Request, res: Response) => {
    const { deckId } = req.params;
    const { name, cards } = req.body;

    // Validation de l'ID
    const id = Number(deckId);
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "L'id doit être un nombre valide." });
        return;
    }

    // Create data object
    const dataToUpdate: {
        name?: string;
        cards?: { set: { id: number }[] };
    } = {};

    // Assign values to dataToUpdate
    if (name !== undefined) {
        dataToUpdate.name = name;
    }

    try {
        // Verify existing deck
        const existingDeck = await prisma.deck.findUnique({
            where: { id: id }
        });
        // Verify if the deck exists
        if (!existingDeck) {
            res.status(404).json({ error: `Le deck avec l'id '${deckId}' n'existe pas.` });
            return;
        }

        // Check for existing name for the same owner
        if (dataToUpdate.name !== undefined) {
            const existingName = await prisma.deck.findFirst({
                where: { 
                    name: dataToUpdate.name,
                    ownerId: existingDeck.ownerId
                },
            });
            if (existingName && existingName.id !== id) {
                res.status(400).json({ error: `Un deck avec le nom '${dataToUpdate.name}' existe déjà pour cet utilisateur.` });
                return;
            }
        }

        // Update cards if provided
        if (cards !== undefined) {
            dataToUpdate.cards = {
                set: cards.map((cardId: number) => ({ id: Number(cardId) }))
            };
        }

        // Update the deck
        const updated = await prisma.deck.update({
            where: { id: id },
            data: dataToUpdate,
            include: {
                owner: true,
                cards: true,
            }
        });

        // Send back the updated deck
        res.status(200).json({
            message: 'Deck mis à jour avec succès.',
            result: updated,
        });

    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour du deck.' });
    }
};

// Delete a pokemon deck by ID
export const deletePokemonDeck = async (req: Request, res: Response) => {
    const { deckId } = req.params;

    // Validation de l'ID
    const id = Number(deckId);
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "L'id doit être un nombre valide." });
        return;
    }

    try {
        // Verify existing deck
        const existingDeck = await prisma.deck.findUnique({
            where: { id: id }
        });
        // Verify if the deck exists
        if (!existingDeck) {
            res.status(404).json({ error: `Le deck avec l'id '${deckId}' n'existe pas.` });
            return;
        }

        // Delete the deck
        await prisma.deck.delete({
            where: { id: id }
        });

        res.status(200).json({
            message: 'Deck supprimé avec succès.',
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la suppression du deck.' });
    }
};