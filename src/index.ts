import express from 'express';
import { pokemonCardRouter } from './pokemonCard/pokemonCard.router';
import { userRouter } from './user/user.router';
export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/pokemon-cards', pokemonCardRouter);
app.use('/users', userRouter);

export const server = app.listen(port);

console.log(`Le serveur est démarré sur le port :  '${port}'`);
// export function stopServer() {
//   server.close();
// }
