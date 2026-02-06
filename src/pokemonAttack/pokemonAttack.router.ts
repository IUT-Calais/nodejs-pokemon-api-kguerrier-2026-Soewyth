import { Router } from 'express';
import { verifyJWT } from '../common/jwt.middleware';

// Import controller functions
import {
    getPokemonAttacks,
    getPokemonAttackById,
    createPokemonAttack,
    updatePokemonAttack,
    deletePokemonAttack
} from './pokemonAttack.controller';

// Create router
export const pokemonAttackRouter = Router();

// Define routes
pokemonAttackRouter.get('/', getPokemonAttacks);
pokemonAttackRouter.get('/:attackId', getPokemonAttackById);

pokemonAttackRouter.post('/', verifyJWT, createPokemonAttack);
pokemonAttackRouter.patch('/:attackId', verifyJWT, updatePokemonAttack);
pokemonAttackRouter.delete('/:attackId', verifyJWT, deletePokemonAttack);
