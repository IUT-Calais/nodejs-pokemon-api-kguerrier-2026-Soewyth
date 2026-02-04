import type { Request, Response } from 'express';
import prisma from '../client';



export const getPokemonCards = async (req: Request, res: Response) => {
    // Fetch all pokemon cards from database and manage error
    try { 
        const pokemonCards = await prisma.pokemonCard.findMany();
        res.status(200).json(pokemonCards);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des cartes Pokémon.' });     
    }
}
// Get a single pokemon card by ID
export const getPokemonCardById = async (req: Request, res: Response) => {
    const { pokemonCardId } = req.params;

    // VValidation of ID
    if (!pokemonCardId) {
    res.status(400).json({ error: "pokemonCardId invalide" });
    return;

  }
    // Fetch pokemon card from database
    try {
        const pokemon = await prisma.pokemonCard.findUnique({
        where: { id: Number(pokemonCardId) },
    });
    // Handle case where pokemon card is not found
    if (!pokemon) {
        res.status(404).send(`Carte Pokémon non trouvée, l'id ${pokemonCardId} n'existe pas.`);
    return
    }
    // Send back the found pokemon card and manage error 
    res.status(200).send(`Carte Pokémon ${pokemonCardId} : ` + pokemon?.name);
    } catch (error) {
        res.status(500).send({ error: 'Une erreur est survenue' });
    }
}
