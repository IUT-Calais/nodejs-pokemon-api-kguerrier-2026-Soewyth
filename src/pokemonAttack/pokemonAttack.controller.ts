import type { Request, Response } from 'express';
import prisma from '../client';

// Get all pokemon attacks
export const getPokemonAttacks = async (_req: Request, res: Response) => {
    try {
        const attacks = await prisma.pokemonAttack.findMany({
            include: { // include for loading related data as well
                type: true,
            }
        });
        res.status(200).json(attacks);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des attaques.' });
    }
};

// Get a single pokemon attack by ID
export const getPokemonAttackById = async (req: Request, res: Response) => {
    const { attackId } = req.params;
    const id = Number(attackId);

    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "L'id doit être un nombre valide." });
        return;
    }

    try {
        const attack = await prisma.pokemonAttack.findUnique({
            where: { id },
            include: { // include for loading related data as well
                type: true,
                pokemons: true,
            }
        });

        if (!attack) {
            res.status(404).json({ error: `Attaque non trouvée, l'id ${attackId} n'existe pas.` });
            return;
        }

        res.status(200).json(attack);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Create a new pokemon attack
export const createPokemonAttack = async (req: Request, res: Response) => {
    const { name, damages, type} = req.body;

    // Required field
    if (!name) {
        res.status(400).json({ error: "Le champ 'name' est requis." });
        return;
    }
    if (!damages) {
        res.status(400).json({error: "Le champ 'damages' est requis." });
        return;
    }
    if (type === undefined || type === null) {
        res.status(400).json({ error: "Le champ 'type' est requis." });
        return;
    }

    // Create number fields
    const typeIdNumber = Number(type);
    const damagesNumber = Number(damages);
    // Verification of number type
    if (isNaN(typeIdNumber)) {
        res.status(400).json({ error: "Le champ 'type' doit être un nombre." });
        return;
    }
    if (isNaN(damagesNumber)) {
        res.status(400).json({ error: "Le champ 'damages' doit être un nombre." });
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

        const existingName = await prisma.pokemonAttack.findUnique({
            where: { name: name },
        });

        if (existingName) {
            res.status(400).json({ error: `Une attaque avec le nom '${name}' existe déjà.` });
            return;
        }
        // Create the new pokemon attack
        const created = await prisma.pokemonAttack.create({
            data: {
                name: name,
                typeId: typeIdNumber,
                damages: damagesNumber,
            }
        });
        // Send back the created pokemon attack
        res.status(201).json({
            message: 'Attaque Pokémon créée avec succès.',
            result: created,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la création de l\'attaque Pokémon.' });
    }
}; 


// Update an existing pokemon attack
export const updatePokemonAttack = async (req: Request, res: Response) => {
    const { attackId } = req.params;
    const { name, damages, type } = req.body;

    // Validation de l'ID
    const id = Number(attackId);
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "L'id doit être un nombre valide." });
        return;
    }
    // Create data object
    const dataToUpdate: {
        name?: string;
        damages?: number;
        typeId?: number;
    } = {};

    // Assign values to dataToUpdate
    if (name !== undefined) {
        dataToUpdate.name = name;
    }
    if (damages !== undefined) {
        dataToUpdate.damages = Number(damages);
    }
    if (type !== undefined) {
        dataToUpdate.typeId = Number(type);
    }

    // verify number fields
    if (dataToUpdate.damages !== undefined && isNaN(dataToUpdate.damages!)) {
        res.status(400).json({ error: "Le champ 'damages' doit être un nombre." });
        return;
    }
    if (dataToUpdate.typeId !== undefined && isNaN(dataToUpdate.typeId)) {
        res.status(400).json({ error: "Le champ 'type' doit être un nombre." });
        return;
    }
    try {
        // Verify existing attack
        const existingAttack = await prisma.pokemonAttack.findUnique({
            where: { id: id }
        });
        // Verify if the attack exists
        if (!existingAttack) {
            res.status(404).json({ error: `L'attaque avec l'id '${attackId}' n'existe pas.` });
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
        // Check for existing name 
        if (dataToUpdate.name !== undefined) {
            const existingName = await prisma.pokemonAttack.findUnique({
                where: { name: dataToUpdate.name },
            });
            if (existingName && existingName.id !== id) {
                res.status(400).json({ error: `Une attaque avec le nom '${dataToUpdate.name}' existe déjà.` });
                return;
            }
        }

        // Update the pokemon attack
        const updated = await prisma.pokemonAttack.update({
            where: { id: id },
            data: dataToUpdate

        });
        // Send back the updated pokemon attack
        res.status(200).json({
            message: 'Attaque Pokémon mise à jour avec succès.',
            result: updated,
        });

    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de l\'attaque Pokémon.' });
    }
}


// Delete a pokemon attack by ID
export const deletePokemonAttack = async (req: Request, res: Response) => {
    const { attackId } = req.params;

    // Validation de l'ID
    const id = Number(attackId);
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "L'id doit être un nombre valide." });
        return;
    }

    try {
        // Verify existing attack
        const existingAttack = await prisma.pokemonAttack.findUnique({
            where: { id: id }
        });
        // Verify if the attack exists
        if (!existingAttack) {
            res.status(404).json({ error: `L'attaque avec l'id '${attackId}' n'existe pas.` });
            return;
        }

        // Check if attack is used by other pokemon card
        const cardsUsingAttack = await prisma.pokemonCard.findMany({
            where: { attackId: id }
        });
        
        if (cardsUsingAttack.length > 0) {
            res.status(400).json({ 
                error: `Impossible de supprimer cette attaque car elle est utilisée par ${cardsUsingAttack.length} carte(s) Pokémon.` 
            });
            return;
        }

        // Delete the pokemon attack
        await prisma.pokemonAttack.delete({
            where: { id: id }
        });

        res.status(200).json({
            message: 'Attaque Pokémon supprimée avec succès.',
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la suppression de l\'attaque Pokémon.' });
    }
}