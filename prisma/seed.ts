import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.pokemonCard.deleteMany();
  await prisma.type.deleteMany();
  await prisma.user.deleteMany();

  const typeNames = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];

  // create a user
  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      password: await bcrypt.hash("admin", 10),
    },
  });
  // Create types
  await prisma.type.createMany({
    data: typeNames.map((name) => ({ name })),
  });


  // Create pokemon cards
  await prisma.pokemonCard.create({
    data: {
      name: "Bulbizarre",
      pokedexId: 1,
      type: { connect: { name: "Grass" } },
      lifePoints: 45,
      size: 0.7,
      weight: 6.9,
      imageUrl: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png",
    },
  });
  await prisma.pokemonCard.create({
    data: {
      name: "Salamèche",
      pokedexId: 4,
      type: { connect: { name: "Fire" } },
      lifePoints: 39,
      size: 0.6,
      weight: 8.5,
      imageUrl: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/004.png",
    },
  });
  await prisma.pokemonCard.create({
    data: {
      name: "Carapuce",
      pokedexId: 7,
      type: { connect: { name: "Water" } },
      lifePoints: 44,
      size: 0.5,
      weight: 9.0,
      imageUrl: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png",
    },
  });

  await prisma.pokemonCard.create({
    data: {
      name: "Pikachu",
      pokedexId: 25,
      type: { connect: { name: "Electric" } },
      lifePoints: 35,
      size: 0.4,
      weight: 6.0,
      imageUrl: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png",
    },
  });
  await prisma.pokemonCard.create({
    data: {
      name: "Miaouss",
      pokedexId: 52,
      type: { connect: { name: "Normal" } },
      lifePoints: 40,
      size: 0.4,
      weight: 4.2,
      imageUrl: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/052.png",
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
