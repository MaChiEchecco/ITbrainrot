const cardPool = [
  { name: "UdinDinDun", type: "Fuoco", hp: 100, atk: 80, energyCost: { "Fuoco": 2 }, img: "imaginirot/udin din dun.png", evolutionLevel: "A+" },
  { name: "LiriliLarila", type: "Erba", hp: 80, atk: 60, energyCost: { "Erba": 2 }, img: "imaginirot/lirili larila.png", evolutionLevel: "A+" },
  { name: "SpioniroGubino", type: "Acqua", hp: 90, atk: 70, energyCost: { "Acqua": 2 }, img: "imaginirot/spioniro gubino.png", evolutionLevel: "A+" },
  { name: "CapucinoAsasino", type: "Elettro", hp: 85, atk: 75, energyCost: { "Elettro": 2 }, img: "imaginirot/capucino assasino.png", evolutionLevel: "A+" },
  { name: "VaccaSaturnoS", type: "Magico", hp: 120, atk: 90, energyCost: { "Magico": 2 }, img: "imaginirot/vacca saturno s.png", evolutionLevel: "A+" },
  { name: "TrippiTroppi", type: "Indifferenti", hp: 95, atk: 80, energyCost: { "Indifferenti": 2 }, img: "imaginirot/trippi troppi.png", evolutionLevel: "A+" },

  { name: "GlorboFruttodrillo Ultra", type: "Fuoco", hp: 150, atk: 110, energyCost: { "Fuoco": 3 }, img: "imaginirot/glorbofruttodrillo.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "BrrBrrPatapim Ultra", type: "Erba", hp: 130, atk: 100, energyCost: { "Erba": 3 }, img: "imaginirot/brr brr patapim.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "TralaleroTralala Ultra", type: "Acqua", hp: 140, atk: 110, energyCost: { "Acqua": 3 }, img: "imaginirot/tralalero tralala.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "BombarderoCrocodilo Ultra", type: "Elettro", hp: 135, atk: 120, energyCost: { "Elettro": 3 }, img: "imaginirot/bombardero crocodilo.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "TungTungSahur Ultra", type: "Magico", hp: 150, atk: 130, energyCost: { "Magico": 3 }, img: "imaginirot/tung tung sahur.png", rarity: "Ultra", evolutionLevel: "A+" },
  { name: "Mateo Ultra", type: "Indifferenti", hp: 120, atk: 120, energyCost: { "Indifferenti": 3 }, img: "imaginirot/mateo.png", rarity: "Ultra", evolutionLevel: "A+" },

  // Carte Utility
  { name: "Peroni", type: "utilitys", effect: "Cura 15HP", usableOncePerTurn: true, img: "imaginirot/peroni.png" },
  { name: "erPupone", type: "utilitys", effect: "Aumenta ATK di 10 ma toglie 5 HP alla carta che attacca (1x turno)", usableOncePerTurn: true, img: "imaginirot/erPupone.png" },
  { name: "kappone", type: "utilitys", effect: "Avvelena il Pokémon avversario quando attacca, perde 5 HP a turno finché non viene curato.", usableOncePerTurn: false, img: "imaginirot/kappone.png" },
  { name: "ciabbatta", type: "utilitys", effect: "Stordisce una carta avversaria: non può attaccare nel prossimo turno.", usableOncePerTurn: true, img: "imaginirot/ciabbatta.png" },
  { name: "tachipirina", type: "utilitys", effect: "Annulla tutti gli effetti negativi su una tua carta (1x turno)", usableOncePerTurn: true, img: "imaginirot/tachipirina.png" },
  { name: "Napoletano", type: "utilitys", effect: "Ruba energia da una carta avversaria e la trasferisce a una tua carta.", usableOncePerTurn: true, img: "imaginirot/napoletano.png" },
  { name: "Sommer", type: "utilitys", effect: "Impedisce che la carta subisca danni per un turno", usableOncePerTurn: true, img: "imaginirot/sommer.png" },
  { name: "Taremi", type: "utilitys", effect: "Sostituisce una carta dalla tua mano con una carta casuale dal mazzo", usableOncePerTurn: true, img: "imaginirot/taremi.png" }
];

// Variabili di stato globali per gestione uso utility
let PeroniUsataQuestoTurno = false;
let erPuponeUsataQuestoTurno = false;
let napoletanoCooldown = 0;

// Carte in gioco (da definire nel gioco reale)
let playerCards = [];
let opponentCards = [];

// Inizializza proprietà stato sulle carte
function inizializzaCarte(carte) {
  carte.forEach(carta => {
    carta.isPoisoned = carta.isPoisoned || false;
    carta.isStunned = carta.isStunned || false;
    carta.maxHp = carta.maxHp || carta.hp || 100; // fallback a 100 se hp mancante
    carta.energy = carta.energy || 0; // energia iniziale 0 se non definita
  });
}

function openPack() {
  const packResults = document.getElementById("pack-results");
  if (!packResults) {
    console.error("Elemento #pack-results non trovato");
    return;
  }
  packResults.innerHTML = "";

  let newCards = [];

  for (let i = 0; i < 5; i++) {
    const isUltra = Math.random() < 0.1;
    const pool = isUltra
      ? cardPool.filter(c => c.rarity === "Ultra")
      : cardPool.filter(c => !c.rarity);

    const card = pool[Math.floor(Math.random() * pool.length)];
    newCards.push(card);

    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    if (card.type && typeof card.type === "string") {
      cardDiv.classList.add(card.type.toLowerCase());
    }

    if (card.rarity === "Ultra") {
      cardDiv.classList.add("ultra");
    }

    cardDiv.innerHTML = `
      <img src="${card.img}" alt="${card.name}">
      <h4>${card.name}</h4>
      <p>Tipo: ${card.type}</p>
      ${
        card.type.toLowerCase() === "utilitys" && card.effect
          ? `<p>Effetto: ${card.effect}</p>`
          : `
            ${card.hp ? `<p>HP: ${card.hp}</p>` : ""}
            ${card.atk ? `<p>ATK: ${card.atk}</p>` : ""}
            ${card.evolutionLevel ? `<p>Evoluzione: ${card.evolutionLevel}</p>` : ""}
          `
      }
    `;

    packResults.appendChild(cardDiv);
  }

  // Aggiorna localStorage
  let savedCollection = localStorage.getItem("collection");
  let collection = savedCollection ? JSON.parse(savedCollection) : {};

  newCards.forEach(card => {
    if (collection[card.name]) {
      collection[card.name].count++;
    } else {
      collection[card.name] = { ...card, count: 1 };
    }
  });

  localStorage.setItem("collection", JSON.stringify(collection));

  mostraCollezione();
}

function mostraCollezione() {
  const collectionDiv = document.getElementById("collection");
  if (!collectionDiv) {
    console.error("Elemento #collection non trovato");
    return;
  }
  collectionDiv.innerHTML = "";

  let savedCollection = localStorage.getItem("collection");
  if (!savedCollection) {
    collectionDiv.innerHTML = "<p>Nessuna carta in collezione.</p>";
    return;
  }

  const collection = JSON.parse(savedCollection);

  for (const key in collection) {
    const card = collection[key];
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    if (card.type && typeof card.type === "string") {
      cardDiv.classList.add(card.type.toLowerCase());
    }

    if (card.rarity === "Ultra") {
      cardDiv.classList.add("ultra");
    }

    cardDiv.innerHTML = `
      <img src="${card.img}" alt="${card.name}">
      <h4>${card.name} (x${card.count})</h4>
      <p>Tipo: ${card.type}</p>
      ${
        card.type.toLowerCase() === "utilitys" && card.effect
          ? `<p>Effetto: ${card.effect}</p>`
          : `
            ${card.hp ? `<p>HP: ${card.hp}</p>` : ""}
            ${card.atk ? `<p>ATK: ${card.atk}</p>` : ""}
            ${card.evolutionLevel ? `<p>Evoluzione: ${card.evolutionLevel}</p>` : ""}
          `
      }
    `;

    collectionDiv.appendChild(cardDiv);
  }
}

// Funzione helper per verificare se è carta utility
function isUtility(card) {
  return card && card.type && card.type.toLowerCase() === "utilitys";
}

// Inizia nuovo turno, resetta flag e applica status
function iniziaNuovoTurno() {
  PeroniUsataQuestoTurno = false;
  erPuponeUsataQuestoTurno = false;

  if (napoletanoCooldown > 0) {
    napoletanoCooldown--;
  }

  [playerCards, opponentCards].forEach(group => {
    group.forEach(carta => {
      if (carta.isPoisoned) {
        const oldHp = carta.hp;
        carta.hp = Math.max(carta.hp - 5, 0);
        console.log(`${carta.name} perde 5 HP per veleno: ${oldHp} → ${carta.hp}`);
      }
      if (carta.isStunned) {
        carta.isStunned = false;
        console.log(`${carta.name} non è più stordita.`);
      }
    });
  });
}

function usaTaremi(mano, mazzo) {
  if (PeroniUsataQuestoTurno) {
    alert("Hai già usato una carta utility in questo turno.");
    return;
  }

  if (mano.length === 0) {
    alert("Non hai carte in mano da sostituire.");
    return;
  }
  if (mazzo.length === 0) {
    alert("Il mazzo è vuoto, impossibile sostituire.");
    return;
  }

  // Scegli carta dalla mano da sostituire
  const nomiMano = mano.map(c => c.name).join(", ");
  let nomeDaSostituire = prompt(`Scegli la carta da sostituire dalla mano: ${nomiMano}`);

  let idx = mano.findIndex(c => c.name.toLowerCase() === nomeDaSostituire.toLowerCase());
  if (idx === -1) {
    alert("Carta non trovata in mano.");
    return;
  }

  // Pesca una carta casuale dal mazzo
  const randomIndex = Math.floor(Math.random() * mazzo.length);
  const cartaPescata = mazzo.splice(randomIndex, 1)[0];

  // Metti la carta scelta nel mazzo
  mazzo.push(mano[idx]);

  // Rimuovi e sostituisci
  mano[idx] = cartaPescata;

  PeroniUsataQuestoTurno = true;
  alert(`Hai sostituito ${mano[idx].name} con ${cartaPescata.name} dalla tua mano.`);

  aggiornaUI();
}

// Contatore per le carte utility usate in questo turno (max 2)
let utilityUsateQuestoTurno = 0;

// Inizio turno: resettiamo il contatore
function iniziaNuovoTurno() {
  utilityUsateQuestoTurno = 0;
  erPuponeUsataQuestoTurno = false;  // Puoi anche voler cambiare questa logica se serve
  if (napoletanoCooldown > 0) {
    napoletanoCooldown--;
  }
  [playerCards, opponentCards].forEach(group => {
    group.forEach(carta => {
      if (carta.isPoisoned) {
        carta.hp = Math.max(carta.hp - 5, 0);
      }
      if (carta.isStunned) {
        carta.isStunned = false;
      }
    });
  });
}

// In ogni funzione che usa una carta utility, cambiamo il controllo così:

function usaPeroni() {
  if (utilityUsateQuestoTurno >= 2) {
    alert("Hai già usato 2 carte utility in questo turno.");
    return;
  }
  // ... resto della funzione
  // ...
  utilityUsateQuestoTurno++;
  alert("Hai usato Peroni!");
  aggiornaUI();
}

function usaErPupone() {
  if (utilityUsateQuestoTurno >= 2) {
    alert("Hai già usato 2 carte utility in questo turno.");
    return;
  }
  if (erPuponeUsataQuestoTurno) {
    alert("Hai già usato erPupone in questo turno.");
    return;
  }
  // ... resto della funzione
  erPuponeUsataQuestoTurno = true; // questa rimane a parte perché è un limite specifico di questa carta
  utilityUsateQuestoTurno++;
  alert("Hai usato erPupone!");
  aggiornaUI();
}

function usaNapoletano() {
  if (utilityUsateQuestoTurno >= 2) {
    alert("Hai già usato 2 carte utility in questo turno.");
    return;
  }
  if (napoletanoCooldown > 0) {
    alert(`Napoletano è in cooldown. Devi aspettare ancora ${napoletanoCooldown} turno/i.`);
    return;
  }
  // ... resto della funzione
  utilityUsateQuestoTurno++;
  napoletanoCooldown = 2;
  alert("Hai usato Napoletano!");
  aggiornaUI();
}

function usaSommer() {
  if (utilityUsateQuestoTurno >= 2) {
    alert("Hai già usato 2 carte utility in questo turno.");
    return;
  }
  // ... resto della funzione
  utilityUsateQuestoTurno++;
  alert("Hai usato Sommer!");
  aggiornaUI();
}

function usaTaremi(mano, mazzo) {
  if (utilityUsateQuestoTurno >= 2) {
    alert("Hai già usato 2 carte utility in questo turno.");
    return;
  }
  // ... resto della funzione
  utilityUsateQuestoTurno++;
  alert("Hai usato Taremi!");
  aggiornaUI();
}


// Funzione per usare utility Sommer
function usaSommer() {
  if (PeroniUsataQuestoTurno) {
    alert("Hai già usato una carta utility in questo turno.");
    return;
  }

  const cartaNome = prompt("Inserisci il nome della tua carta da proteggere (Sommer):");
  const carta = playerCards.find(c => c.name.toLowerCase() === cartaNome.toLowerCase());

  if (!carta) {
    alert("Carta non trovata.");
    return;
  }

  carta.isProtected = true;
  PeroniUsataQuestoTurno = true;

  alert(`${carta.name} è protetta dai danni per questo turno!`);
  aggiornaUI();
}

// Funzione per usare utility Peroni (cura)
function usaPeroni() {
  if (PeroniUsataQuestoTurno) {
    alert("Hai già usato una carta utility in questo turno.");
    return;
  }

  const cartaNome = prompt("Inserisci il nome della tua carta da curare (Peroni):");
  const carta = playerCards.find(c => c.name.toLowerCase() === cartaNome.toLowerCase());

  if (!carta) {
    alert("Carta non trovata.");
    return;
  }

  const hpVecchi = carta.hp;
  carta.hp = Math.min(carta.hp + 15, carta.maxHp);
  PeroniUsataQuestoTurno = true;

  alert(`${carta.name} è curata di 15 HP (${hpVecchi} → ${carta.hp})`);
  aggiornaUI();
}

// Funzione per usare utility erPupone
function usaErPupone() {
  if (erPuponeUsataQuestoTurno) {
    alert("Hai già usato erPupone in questo turno.");
    return;
  }

  const cartaNome = prompt("Inserisci il nome della tua carta che attacca (erPupone):");
  const carta = playerCards.find(c => c.name.toLowerCase() === cartaNome.toLowerCase());

  if (!carta) {
    alert("Carta non trovata.");
    return;
  }

  carta.atk += 10;
  carta.hp = Math.max(carta.hp - 5, 0);
  erPuponeUsataQuestoTurno = true;

  alert(`${carta.name} ha aumentato ATK di 10 ma perso 5 HP (ora HP: ${carta.hp})`);
  aggiornaUI();
}

// Funzione per usare utility Napoletano
function usaNapoletano() {
  if (napoletanoCooldown > 0) {
    alert(`Napoletano è in cooldown. Devi aspettare ancora ${napoletanoCooldown} turno/i.`);
    return;
  }

  if (PeroniUsataQuestoTurno) {
    alert("Hai già usato una carta utility in questo turno.");
    return;
  }

  const avversarioNome = prompt("Inserisci il nome della carta avversaria da cui rubare energia:");
  const cartaAvversaria = opponentCards.find(c => c.name.toLowerCase() === avversarioNome.toLowerCase());

  if (!cartaAvversaria) {
    alert("Carta avversaria non trovata.");
    return;
  }

  if (cartaAvversaria.energy <= 0) {
    alert("Questa carta avversaria non ha energia da rubare.");
    return;
  }

  const playerCartaNome = prompt("Inserisci il nome della tua carta a cui aggiungere energia:");
  const cartaPlayer = playerCards.find(c => c.name.toLowerCase() === playerCartaNome.toLowerCase());

  if (!cartaPlayer) {
    alert("La tua carta non è stata trovata.");
    return;
  }

  cartaAvversaria.energy--;
  cartaPlayer.energy++;

  PeroniUsataQuestoTurno = true;
  napoletanoCooldown = 2;

  alert(`Hai rubato 1 energia da ${cartaAvversaria.name} e l'hai data a ${cartaPlayer.name}`);
  aggiornaUI();
}

// Funzione aggiornaUI (da implementare)
function aggiornaUI() {
  // Aggiorna lo stato visivo delle carte e dell'interfaccia utente
  console.log("Aggiorna interfaccia utente...");
}

// Esempio: inizializza carte all'inizio del gioco
inizializzaCarte(playerCards);
inizializzaCarte(opponentCards);
