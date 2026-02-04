import type { Request, Response } from 'express';
import prisma from '../client';



export const getPokemonCards = async (_req: Request, res: Response) => {
    // Fetch all pokemon cards from database and manage error
    try {
        const pokemonCards = await prisma.pokemonCard.findMany();
        res.status(200).json(pokemonCards);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des cartes Pokémon.' });
    }
};
// Get a single pokemon card by ID
export const getPokemonCardById = async (req: Request, res: Response) => {
    const { pokemonCardId } = req.params;

    const id = Number(pokemonCardId);
    // verify number id
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "L'id doit être un nombre valide." });
        ;
    }
    // VValidation of ID
    if (!pokemonCardId) {
        res.status(400).json({ error: "pokemonCardId invalide" });
        ;

    }
    // Fetch pokemon card from database
    try {
        const pokemon = await prisma.pokemonCard.findUnique({
            where: { id: Number(pokemonCardId) },
        });
        // Handle case where pokemon card is not found
        if (!pokemon) {
            res.status(404).send(`Carte Pokémon non trouvée, l'id ${pokemonCardId} n'existe pas.`);

        }
        // Send back the found pokemon card and manage error 
        res.status(200).send(`Carte Pokémon ${pokemonCardId} : ` + pokemon?.name);
    } catch (error) {
        res.status(500).send({ error: 'Une erreur est survenue' });
    }
};

// Create a new pokemon card
export const createPokemonCard = async (req: Request, res: Response) => {
    const { name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;

    // Required field
    if (!name)
        res.status(400).json({ error: "Le champ 'name' est requis." });
    if (pokedexId === undefined || pokedexId === null)
        res.status(400).json({ error: "Le champ 'pokedexId' est requis." });
    if (type === undefined || type === null)
        res.status(400).json({ error: "Le champ 'type' est requis." });
    if (lifePoints === undefined || lifePoints === null)
        res.status(400).json({ error: "Le champ 'lifePoints' est requis." });

    // Create number fields
    const pokedexIdNumber = Number(pokedexId);
    const typeIdNumber = Number(type);
    const lifePointsNumber = Number(lifePoints);
    // Verification of number type
    if (isNaN(pokedexIdNumber))
        res.status(400).json({ error: "Le champ 'pokedexId' doit être un nombre." });
    if (isNaN(typeIdNumber))
        res.status(400).json({ error: "Le champ 'type' doit être un nombre." });
    if (isNaN(lifePointsNumber))
        res.status(400).json({ error: "Le champ 'lifePoints' doit être un nombre." });

    try {
        // Check for existing name or pokedexId
        const existingType = await prisma.type.findUnique({
            where: { id: typeIdNumber },
        });
        if (!existingType) {
            res.status(404).json({ error: `Le type avec l'id '${typeIdNumber}' n'existe pas.` });
            return; 
        }
        const existingName = await prisma.pokemonCard.findUnique({
            where: { name: name },
        });

        if (existingName) {
            res.status(404).json({ error: `Une carte Pokémon avec le nom '${name}' existe déjà.` });
            return;
        }
        const existingPokedexId = await prisma.pokemonCard.findUnique({
            where: { pokedexId: pokedexIdNumber },
        });
        if (existingPokedexId) {
            res.status(404).json({ error: `Une carte Pokémon avec le pokedexId '${pokedexIdNumber}' existe déjà.` });
            return;
        }
        // Create the new pokemon card
        const created = await prisma.pokemonCard.create({
            data: {
                name: name,
                pokedexId: pokedexIdNumber,
                typeId: typeIdNumber,
                lifePoints: lifePointsNumber,
                size: size,
                weight: weight,
                imageUrl: imageUrl,
            }
        });
        res.status(201).json(`Le pokémon à été ajouté avec succès : '${created}'`);
    }
    catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la création de la carte Pokémon.' });
    }


};