import {getBSTForPokemon} from './dist/pokemonStats.js';

async function testPricing() {
  console.log('Testing Pokemon pricing for IDs 2-5...\n');

  for (let id = 2; id <= 5; id++) {
    const bst = await getBSTForPokemon(id);

    // Calculate cost using same formula as resolver
    let multiplier;
    if (bst < 600) {
      const exp = (bst - 200) / 15;
      multiplier = Math.exp(exp);
    } else {
      const baseExp = (600 - 200) / 15;
      const baseCost600 = Math.exp(baseExp);
      const legendaryExp = (bst - 800) / 5;
      const legendaryMult = Math.exp(legendaryExp);
      multiplier = baseCost600 * legendaryMult;
    }

    const cost = Math.floor(100 * multiplier);
    console.log(`Pokemon ID ${id}:`);
    console.log(`  BST: ${bst}`);
    console.log(`  Cost: ${cost.toLocaleString()}`);
    console.log();
  }
}

testPricing().catch(console.error);
