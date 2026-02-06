import { Router } from 'express';
import { verifyJWT } from '../common/jwt.middleware';

// Import controller functions
import {
    getPokemonDecks,
    getPokemonDeckById,
    // createPokemonDeck,
    // updatePokemonDeck,
    // deletePokemonDeck
} from './deck.controller';

// Create router
export const pokemonDeckRouter = Router();

// Define routes
pokemonDeckRouter.get('/', getPokemonDecks);
pokemonDeckRouter.get('/:deckId', getPokemonDeckById);

// pokemonDeckRouter.post('/', verifyJWT, createPokemonDeck);
// pokemonDeckRouter.patch('/:deckId', verifyJWT, updatePokemonDeck);
// pokemonDeckRouter.delete('/:deckId', verifyJWT, deletePokemonDeck);
