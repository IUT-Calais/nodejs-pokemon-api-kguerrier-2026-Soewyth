import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.pokemonCard.deleteMany();
  await prisma.type.deleteMany();

  const typeNames = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];

  // Créer les types
  await prisma.type.createMany({
    data: typeNames.map((name) => ({ name })),
  });

  // Créer des cartes Pokémon avec des relations vers les types
  await prisma.pokemonCard.create({
    data: {
      name: "Bulbizarre",
      pokedexId: 1,
      type : { connect: { name: "Grass" } },
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
      type : { connect: { name: "Fire" } },
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
      type : { connect: { name: "Water" } },
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
      type : { connect: { name: "Electric" } },
      lifePoints: 35,
      size: 0.4,
      weight: 6.0,
      imageUrl: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png",
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
