import express from 'express';
import { pokemonCardRouter } from './pokemonCard/pokemonCard.router';
import { pokemonAttackRouter } from './pokemonAttack/pokemonAttack.router';
import { userRouter } from './user/user.router';
import { deckRouter } from './deck/deck.router';
export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// routers for different resources
app.use('/pokemons-cards', pokemonCardRouter);
app.use('/pokemons-attacks', pokemonAttackRouter);
app.use('/users', userRouter);
app.use('/decks', deckRouter);

export const server = app.listen(port);

console.log(`Le serveur est démarré sur le port :  '${port}'`);
// export function stopServer() {
//   server.close();
// }
