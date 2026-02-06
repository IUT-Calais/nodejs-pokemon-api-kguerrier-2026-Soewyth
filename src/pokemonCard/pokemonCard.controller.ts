import type { Request, Response } from 'express';
import prisma from '../client';
import { Type } from '@prisma/client';



export const getPokemonCards = async (_req: Request, res: Response) => {
    // Fetch all pokemon cards from database and manage error
    try {
        const pokemonCards = await prisma.pokemonCard.findMany({
            include: {
                type: true,
                weakness: true,
                attack: true,
            }
        });
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
        return;
    }
    // Fetch pokemon card from database
    try {
        const pokemon = await prisma.pokemonCard.findUnique({
            where: { id: Number(pokemonCardId) },
            include: {
                type: true,
                weakness: true,
                attack: true,
            }
        });
        // Handle case where pokemon card is not found
        if (!pokemon) {
            res.status(404).send(`Carte Pokémon non trouvée, l'id ${pokemonCardId} n'existe pas.`);
            return;

        }
        // Send back the found pokemon card and manage error 
        res.status(200).send(pokemon);
    } catch (error) {
        res.status(500).send({ error: 'Une erreur est survenue' });
    }
};

// Create a new pokemon card
export const createPokemonCard = async (req: Request, res: Response) => {
    const { name, pokedexId, type, lifePoints, size, weight, imageUrl, weakness } = req.body;

    // Required field
    if (!name) {
        res.status(400).json({ error: "Le champ 'name' est requis." });
        return;
    }

    if (pokedexId === undefined || pokedexId === null) {
        res.status(400).json({ error: "Le champ 'pokedexId' est requis." });
        return;
    }
    if (type === undefined || type === null) {
        res.status(400).json({ error: "Le champ 'type' est requis." });
        return;
    }
    if (lifePoints === undefined || lifePoints === null) {
        res.status(400).json({ error: "Le champ 'lifePoints' est requis." });
        return;
    }

    // Create number fields
    const pokedexIdNumber = Number(pokedexId);
    const typeIdNumber = Number(type);
    const lifePointsNumber = Number(lifePoints);
    const weaknessIdNumber = Number(weakness);
    // Verification of number type
    if (isNaN(pokedexIdNumber)) {
        res.status(400).json({ error: "Le champ 'pokedexId' doit être un nombre." });
        return;
    }
    if (isNaN(typeIdNumber)) {
        res.status(400).json({ error: "Le champ 'type' doit être un nombre." });
        return;
    }
    if (isNaN(lifePointsNumber)) {
        res.status(400).json({ error: "Le champ 'lifePoints' doit être un nombre." });
        return;
    }
    // Validation du champ weakness 
    if (isNaN(weakness)) {
        res.status(400).json({ error: "Le champ 'lifePoints' doit être un nombre." });
        return;
    }



    try {
        // Check for existing name or pokedexId
        const existingType = await prisma.type.findUnique({
            where: { id: typeIdNumber },
        });
        if (!existingType) {
            res.status(400).json({ error: `Le type avec l'id '${typeIdNumber}' n'existe pas.` });
            return;
        }

        // Vérification du weakness si fourni
        if (weaknessIdNumber !== undefined) {
            const existingWeaknessType = await prisma.type.findUnique({
                where: { id: weaknessIdNumber },
            });
            if (!existingWeaknessType) {
                res.status(400).json({ error: `Le type weakness avec l'id '${weaknessIdNumber}' n'existe pas.` });
                return;
            }
        }

        const existingName = await prisma.pokemonCard.findUnique({
            where: { name: name },
        });

        if (existingName) {
            res.status(400).json({ error: `Une carte Pokémon avec le nom '${name}' existe déjà.` });
            return;
        }
        const existingPokedexId = await prisma.pokemonCard.findUnique({
            where: { pokedexId: pokedexIdNumber },
        });
        if (existingPokedexId) {
            res.status(400).json({ error: `Une carte Pokémon avec le pokedexId '${pokedexIdNumber}' existe déjà.` });
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
                weaknessId: weaknessIdNumber,
            }
        });
        // Send back the created pokemon card
        res.status(201).json({
            message: 'Carte Pokémon créée avec succès.',
            result: created,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la création de la carte Pokémon.' });
    }
};

// Update an existing pokemon card

export const updatePokemonCard = async (req: Request, res: Response) => {
    const { pokemonCardId } = req.params;
    const { name, pokedexId, type, lifePoints, size, weight, imageUrl, weakness } = req.body;

    // Validation de l'ID
    const id = Number(pokemonCardId);
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "L'id doit être un nombre valide." });
        return;
    }
    // Create 
    const dataToUpdate: {
        name?: string;
        pokedexId?: number;
        typeId?: number;
        lifePoints?: number;
        size?: number;
        weight?: number;
        imageUrl?: string;
        weaknessId?: number;
    } = {};

    // Assign values to dataToUpdate
    if (name !== undefined) {
        dataToUpdate.name = name;
    }
    if (pokedexId !== undefined) {
        dataToUpdate.pokedexId = Number(pokedexId);
    }
    if (type !== undefined) {
        dataToUpdate.typeId = Number(type);
    }
    if (lifePoints !== undefined) {
        dataToUpdate.lifePoints = Number(lifePoints);
    }
    if (size !== undefined) {
        dataToUpdate.size = Number(size);
    }
    if (weight !== undefined) {
        dataToUpdate.weight = Number(weight);
    }
    if (imageUrl !== undefined) {
        dataToUpdate.imageUrl = imageUrl;
    }
    if (weakness !== undefined) {
        dataToUpdate.weaknessId = weakness;
    }

    // verify number fields
    if (dataToUpdate.pokedexId !== undefined && isNaN(dataToUpdate.pokedexId!)) {
        res.status(400).json({ error: "Le champ 'pokedexId' doit être un nombre." });
        return;
    }
    if (dataToUpdate.typeId !== undefined && isNaN(dataToUpdate.typeId as unknown as number)) {
        res.status(400).json({ error: "Le champ 'type' doit être un nombre." });
        return;
    }
    if (dataToUpdate.lifePoints !== undefined && isNaN(dataToUpdate.lifePoints!)) {
        res.status(400).json({ error: "Le champ 'lifePoints' doit être un nombre." });
        return;
    }
    if (dataToUpdate.size !== undefined && isNaN(dataToUpdate.size!)) {
        res.status(400).json({ error: "Le champ 'size' doit être un nombre." });
        return;
    }
    if (dataToUpdate.weight !== undefined && isNaN(dataToUpdate.weight!)) {
        res.status(400).json({ error: "Le champ 'weight' doit être un nombre." });
        return;
    }
    if (dataToUpdate.weaknessId !== undefined && dataToUpdate.weaknessId !== null && isNaN(dataToUpdate.weaknessId)) {
        res.status(400).json({ error: "Le champ 'weakness' doit être un nombre." });
        return;
    }


    try {
        // Verify existing card
        const existingCard = await prisma.pokemonCard.findUnique({
            where: { id: id }
        });
        // Verify if the card exists
        if (!existingCard) {
            res.status(404).json({ error: `La carte Pokémon avec l'id '${pokemonCardId}' n'existe pas.` });
            return;
        }

        // Check for existing type
        if (dataToUpdate.typeId !== undefined) {
            const existingType = await prisma.type.findUnique({ where: { id: dataToUpdate.typeId } });
            if (!existingType) {
                res.status(400).json({ error: `Le type avec l'id '${dataToUpdate.typeId}' n'existe pas.` });
                return;
            }
        }
        // Check for existing weakness type
        if (dataToUpdate.weaknessId !== undefined) {
            const existingWeaknessType = await prisma.type.findUnique({ where: { id: dataToUpdate.weaknessId } });
            if (!existingWeaknessType) {
                res.status(400).json({ error: `Le type weakness avec l'id '${dataToUpdate.weaknessId}' n'existe pas.` });
                return;
            }
        }
        // Check for existing name 
        if (dataToUpdate.name !== undefined) {
            const existingName = await prisma.pokemonCard.findUnique({
                where: { name: dataToUpdate.name },
            });
            if (existingName && existingName.id !== id) {
                res.status(400).json({ error: `Une carte Pokémon avec le nom '${dataToUpdate.name}' existe déjà.` });
                return;
            }
        }
        // Check for existing pokedexId
        if (dataToUpdate.pokedexId !== undefined) {
            const existingPokedexId = await prisma.pokemonCard.findUnique({
                where: { pokedexId: dataToUpdate.pokedexId },
            });
            if (existingPokedexId && existingPokedexId.id !== id) {
                res.status(400).json({ error: `Une carte Pokémon avec le pokedexId '${dataToUpdate.pokedexId}' existe déjà.` });
                return;
            }
        }

        // Update the pokemon card
        const updated = await prisma.pokemonCard.update({
            where: { id: id },
            data: dataToUpdate

        });
        // Send back the updated pokemon card
        res.status(200).json({
            message: 'Carte Pokémon mise à jour avec succès.',
            result: updated,
        });

    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de la carte Pokémon.' });
    }
}
// Delete a pokemon card by ID
export const deletePokemonCard = async (req: Request, res: Response) => {
    const { pokemonCardId } = req.params;
    const id = Number(pokemonCardId);

    // verify id number
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "L'id doit être un nombre valide." });
        return;
    }
    try {
        // fetch existing card
        const existingCard = await prisma.pokemonCard.findUnique({
            where: { id: id }
        });
        // Verify if the card exists
        if (!existingCard) {
            res.status(404).json({ error: `La carte Pokémon avec l'id '${pokemonCardId}' n'existe pas.` });
            return;
        }
        // Delete the pokemon card
        await prisma.pokemonCard.delete({
            where: { id: id }
        })
        res.status(200).json({ message: 'Carte Pokémon supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la suppression de la carte Pokémon.' });
        return;
    }
}