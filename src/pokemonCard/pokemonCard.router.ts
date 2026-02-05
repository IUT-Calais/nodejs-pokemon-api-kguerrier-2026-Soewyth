import { Router } from 'express';
import { verifyJWT } from '../common/jwt.middleware';


// Import controller functions
import { getPokemonCards, 
    getPokemonCardById, 
    createPokemonCard, 
    updatePokemonCard, 
    deletePokemonCard 
} from './pokemonCard.controller';

// Create router
export const pokemonCardRouter = Router();


// Define routes 
pokemonCardRouter.get('/', getPokemonCards);
pokemonCardRouter.get('/:pokemonCardId', getPokemonCardById);
pokemonCardRouter.post('/', verifyJWT, createPokemonCard);
pokemonCardRouter.patch('/:pokemonCardId', verifyJWT, updatePokemonCard);
pokemonCardRouter.delete('/:pokemonCardId', verifyJWT, deletePokemonCard);