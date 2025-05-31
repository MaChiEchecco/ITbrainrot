// Tutte le carte disponibili
const allCards = [
  { name: "UdinDinDun", type: "fuoco", hp: 100, atk: 80, energyCost: { "fuoco": 2 }, img: "imaginirot/udin din dun.png", evolutionLevel: "A+" },
  { name: "LiriliLarila", type: "erba", hp: 80, atk: 60, energyCost: { "erba": 2 }, img: "imaginirot/lirili larila.png", evolutionLevel: "A+" },
  { name: "SpioniroGubino", type: "acqua", hp: 90, atk: 70, energyCost: { "acqua": 2 }, img: "imaginirot/spioniro gubino.png", evolutionLevel: "A+" },
  { name: "CapucinoAsasino", type: "elettro", hp: 85, atk: 75, energyCost: { "elettro": 2 }, img: "imaginirot/capucino assasino.png", evolutionLevel: "A+" },
  { name: "VaccaSaturnoS", type: "magico", hp: 120, atk: 90, energyCost: { "magico": 2 }, img: "imaginirot/vacca saturno s.png", evolutionLevel: "A+" },
  { name: "TrippiTroppi", type: "indifferenti", hp: 95, atk: 80, energyCost: { "indifferenti": 2 }, img: "imaginirot/trippi troppi.png", evolutionLevel: "A+" },
  { name: "GlorboFruttodrillo Ultra", type: "ultra", hp: 150, atk: 110, energyCost: { "fuoco": 3 }, img: "imaginirot/glorbofruttodrillo.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "BrrBrrPatapim Ultra", type: "ultra", hp: 130, atk: 100, energyCost: { "erba": 3 }, img: "imaginirot/brr brr patapim.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "TralaleroTralala Ultra", type: "ultra", hp: 140, atk: 110, energyCost: { "acqua": 3 }, img: "imaginirot/tralalero tralala.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "BombarderoCrocodilo Ultra", type: "ultra", hp: 135, atk: 120, energyCost: { "elettro": 3 }, img: "imaginirot/bombardero crocodilo.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "TungTungSahur Ultra", type: "ultra", hp: 150, atk: 130, energyCost: { "magico": 3 }, img: "imaginirot/tung tung sahur.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "Mateo Ultra", type: "ultra", hp: 120, atk: 120, energyCost: { "indifferenti": 3 }, img: "imaginirot/mateo.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "Peroni", type: "utility", effect: "Cura 15HP", usableOncePerTurn: true, img: "imaginirot/peroni.png" },
  { name: "erPupone", type: "utility", effect: "Aumenta ATK di 10 ma toglie 5 HP", usableOncePerTurn: true, img: "imaginirot/erPupone.png" },
  { name: "kappone", type: "utility", effect: "Avvelena", usableOncePerTurn: false, img: "imaginirot/kappone.png" },
  { name: "ciabbatta", type: "utility", effect: "Stordisce", usableOncePerTurn: true, img: "imaginirot/ciabbatta.png" },
  { name: "tachipirina", type: "utility", effect: "Annulla effetti negativi", usableOncePerTurn: true, img: "imaginirot/tachipirina.png" },
  { name: "Napoletano", type: "utility", effect: "Ruba energia", usableOncePerTurn: true, img: "imaginirot/napoletano.png" },
  { name: "Sommer", type: "utility", effect: "Scudo 1 turno", usableOncePerTurn: true, img: "imaginirot/sommer.png" },
  { name: "Taremi", type: "utility", effect: "Pesca extra", usableOncePerTurn: true, img: "imaginirot/taremi.png" }
];

// Funzione per mischiare un array
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Dimensioni
const maxHandSize = 5;
const benchSize = 3;
const deckSize = 20;

 function buildDeck() {
  console.log('buildDeck ...');

  const poolCopy = [...allCards];
  let selectedCards = [];
  let utilityCount = 0;
  const maxUtilityCards = 5;

  while (selectedCards.length < deckSize && poolCopy.length > 0) {
    const idx = Math.floor(Math.random() * poolCopy.length);
    const card = poolCopy.splice(idx, 1)[0];

    if (card.type === "utility") {
      if (utilityCount < maxUtilityCards) {
        selectedCards.push(card);
        utilityCount++;
      }
    } else {
      selectedCards.push(card);
    }
  }

  return selectedCards;
}


// Inizializza energie giocatore e IA
function initializeEnergy() {
  const allTypes = new Set();
  allCards.forEach(card => {
    if(card.energyCost){
      Object.keys(card.energyCost).forEach(type => allTypes.add(type));
    }
  });
  allTypes.forEach(type => {
    player.energy[type] = 0;
    ai.energy[type] = 0;
  });
}

// Oggetti giocatore e IA
let player = {
  deck: [],
  hand: [],
  bench: [],
  activeCard: null,
  energy: {}
};

let ai = {
  deck: [],
  hand: [],
  bench: [],
  activeCard: null,
  energy: {}
};

// Inizializza gioco
function initializeGame() {
  initializeEnergy();

  player.deck = shuffle(buildDeck());
  ai.deck = shuffle(buildDeck());

  player.hand = [];
  ai.hand = [];

  for(let i = 0; i < maxHandSize; i++) {
    if(player.deck.length > 0) player.hand.push(player.deck.pop());
    if(ai.deck.length > 0) ai.hand.push(ai.deck.pop());
  }

  // Carta attiva: prende la prima NON utility
  player.activeCard = player.hand.find(c => c.type !== "utility") || null;
  if (player.activeCard) {
    player.hand = player.hand.filter(c => c !== player.activeCard);
  }

  ai.activeCard = ai.hand.find(c => c.type !== "utility") || null;
  if (ai.activeCard) {
    ai.hand = ai.hand.filter(c => c !== ai.activeCard);
  }

  // Panchina: fino a benchSize, ma solo non-utility
  player.bench = player.hand.filter(c => c.type !== "utility").splice(0, benchSize);
  player.hand = player.hand.filter(c => !player.bench.includes(c));

  ai.bench = ai.hand.filter(c => c.type !== "utility").splice(0, benchSize);
  ai.hand = ai.hand.filter(c => !ai.bench.includes(c));

  updateUI();
}


  player.activeCard = player.hand.shift() || null;
  ai.activeCard = ai.hand.shift() || null;

  player.bench = [];
  ai.bench = [];

  for(let i = 0; i < benchSize; i++) {
    if(player.hand.length > 0) player.bench.push(player.hand.shift());
    if(ai.hand.length > 0) ai.bench.push(ai.hand.shift());
  }



// Funzione attacco
function attack(attacker, defender) {
  const card = attacker.activeCard;
  if (!card || !card.energyCost) return;

  // Controlla energia
  const canAttack = Object.entries(card.energyCost)
    .every(([type, amt]) => attacker.energy[type] >= amt);
  if (!canAttack) {
    console.log(`${attacker === player ? 'Giocatore' : 'IA'} non ha energia sufficiente per attaccare.`);
    return;
  }

  // Consuma energia
  for (let [type, amt] of Object.entries(card.energyCost)) {
    attacker.energy[type] -= amt;
  }

  // Infliggi danno
  if (defender.activeCard) {
    defender.activeCard.hp -= card.atk;
    if(defender.activeCard.hp < 0) defender.activeCard.hp = 0;
  }

  // Se muore carta attiva, sostituisci con panchina
  if (defender.activeCard && defender.activeCard.hp <= 0) {
    defender.activeCard = defender.bench.shift() || null;
  }
}

// Prossimo turno giocatore
function nextTurn() {
  if(player.deck.length > 0) player.hand.push(player.deck.pop());

  const chosen = document.getElementById("energyChoice").value;
  if(chosen) player.energy[chosen]++;

  attack(player, ai);

  updateUI();

  setTimeout(() => {
    aiTurn();
    updateUI();
  }, 1000);
}

// Turno IA
function aiTurn() {
  if(ai.deck.length > 0) ai.hand.push(ai.deck.pop());

  const aiTypes = Object.keys(ai.energy);
  if(aiTypes.length > 0){
    const randomType = aiTypes[Math.floor(Math.random() * aiTypes.length)];
    ai.energy[randomType]++;
  }

  attack(ai, player);
}

// Renderizza carte
function renderCard(id, cards, canSwitch, owner) {
  const div = document.getElementById(id);
  if(!div) return; // Controllo esistenza div
  div.innerHTML = "";

  cards.forEach((card, i) => {
    if (!card) return;
    const c = document.createElement("div");
    c.className = "card " + card.type;
    c.title = card.name;
    c.innerHTML = `
      <img src="${card.img}" alt="${card.name}" style="height: 120px" />
      <strong>${card.name}</strong>
      <div>HP: ${card.hp}</div>
      <div>ATK: ${card.atk}</div>
      <div>Tipo: ${card.type}</div>
      <div>Energia: ${JSON.stringify(card.energyCost || {})}</div>
    `;

    if (canSwitch && id === "playerBench") {
      c.style.border = "2px solid blue";
      c.style.cursor = "pointer";
      c.onclick = () => {
        const temp = owner.activeCard;
        owner.activeCard = owner.bench[i];
        owner.bench[i] = temp;
        updateUI();
      };
    }

    div.appendChild(c);
  });
}

// Aggiungi opzioni energia al select
function addEnergyOption(type) {
  const sel = document.getElementById("energyChoice");
  if(!sel) return;
  const opt = document.createElement("option");
  opt.value = type;
  opt.textContent = type;
  sel.appendChild(opt);
}

// Aggiorna UI
function updateUI() {
  const deckCountElem = document.getElementById("deckCount");
  if(deckCountElem) deckCountElem.textContent = player.deck.length;

  const aiDeckCountElem = document.getElementById("aiDeckCount");
  if(aiDeckCountElem) aiDeckCountElem.textContent = ai.deck.length;

  const energyDisplay = document.getElementById("energyDisplay");
  if(energyDisplay){
    energyDisplay.textContent = Object.entries(player.energy)
      .map(([type, val]) => `${type}: ${val}`)
      .join(", ");
  }

  renderCard("playerActive", [player.activeCard], false, player);
  renderCard("aiActive", [ai.activeCard], false, ai);

  renderCard("playerBench", player.bench, true, player);
  renderCard("aiBench", ai.bench, false, ai);

  renderCard("hand", player.hand, false, player);
}

// Inizializza opzioni energia
function initEnergyOptions() {
  const energyTypes = new Set();
  allCards.forEach(c => {
    if (c.energyCost) {
      Object.keys(c.energyCost).forEach(type => energyTypes.add(type));
    }
  });
  energyTypes.forEach(type => addEnergyOption(type));
}

// Aspetta DOM e assegna eventi
document.addEventListener("DOMContentLoaded", () => {
  const endTurnBtn = document.getElementById("endTurnBtn");
  if(endTurnBtn) endTurnBtn.onclick = nextTurn;

  initEnergyOptions();
  initializeGame();
});
