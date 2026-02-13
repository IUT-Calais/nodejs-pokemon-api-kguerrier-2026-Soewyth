import express from 'express';
import { pokemonCardRouter } from './pokemonCard/pokemonCard.router';
import { pokemonAttackRouter } from './pokemonAttack/pokemonAttack.router';
import { userRouter } from './user/user.router';
import { pokemonDeckRouter } from './deck/deck.router';
export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// routers for different resources
app.use('/pokemon-cards', pokemonCardRouter);
app.use('/pokemon-attacks', pokemonAttackRouter);
app.use('/users', userRouter);
app.use('/decks', pokemonDeckRouter);

let server: ReturnType<typeof app.listen> | null = null;

// Ne démarre le serveur que si le fichier est exécuté directement (pas lors des tests)
if (require.main === module) {
  server = app.listen(port);
  console.log(`Le serveur est démarré sur le port :  '${port}'`);
}

export function stopServer() {
  if (server) {
    server.close();
    server = null;
  }
}

export { server };
