import { Router } from 'express';


// Import controller functions
import { getPokemonCards, 
    getPokemonCardById, 
    // createPokemonCard, 
    // updatePokemonCard, 
    // deletePokemonCard 
} from './pokemonCard.controller';

// Create router
export const pokemonCardRouter = Router();


// Define routes 
pokemonCardRouter.get('/', getPokemonCards);
pokemonCardRouter.get('/:pokemonCardId', getPokemonCardById);
// pokemonCardRouter.post('/', createPokemonCard);
// pokemonCardRouter.put('/:pokemonCardId', updatePokemonCard);
// pokemonCardRouter.delete('/:pokemonCardId', deletePokemonCard);