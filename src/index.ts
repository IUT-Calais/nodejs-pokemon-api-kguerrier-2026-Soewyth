import express from 'express';
import { pokemonCardRouter } from './pokemonCard/pokemonCard.router';
import { pokemonAttackRouter } from './pokemonAttack/pokemonAttack.router';
import { userRouter } from './user/user.router';
import { pokemonDeckRouter } from './deck/deck.router';
// On ajoute les informations pour swagger
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

export const app = express();
const port = process.env.PORT || 3000;

let server: ReturnType<typeof app.listen> | null = null;

// Ne démarre le serveur que si le fichier est exécuté directement (pas lors des tests)
if (require.main === module) {
  server = app.listen(port);
  console.log(`Le serveur est démarré sur le port :  '${port}'`);
}

// On charge la spécification Swagger
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Et on affecte le Serveur Swagger UI à l'adresse /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

// routers for different resources
app.use('/pokemon-cards', pokemonCardRouter);
app.use('/pokemon-attacks', pokemonAttackRouter);
app.use('/users', userRouter);
app.use('/decks', pokemonDeckRouter);

export function stopServer() {
  if (server) {
    server.close();
    server = null;
  }
}

export { server };
