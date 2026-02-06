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
