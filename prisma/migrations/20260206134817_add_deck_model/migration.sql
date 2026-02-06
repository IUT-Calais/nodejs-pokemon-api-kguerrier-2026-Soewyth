-- CreateTable
CREATE TABLE "Deck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "Deck_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_Deck_cards" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_Deck_cards_A_fkey" FOREIGN KEY ("A") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Deck_cards_B_fkey" FOREIGN KEY ("B") REFERENCES "PokemonCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Deck_name_ownerId_key" ON "Deck"("name", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "_Deck_cards_AB_unique" ON "_Deck_cards"("A", "B");

-- CreateIndex
CREATE INDEX "_Deck_cards_B_index" ON "_Deck_cards"("B");
