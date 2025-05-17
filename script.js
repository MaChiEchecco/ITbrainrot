// Oggetto con le 10 carte
const cards = {
  "Tralalero Tralala": { hp: 100, atk: 50, ability: "Heal 20 HP" },
  "Oi Oi Oi Bondrito Bandito": { hp: 120, atk: 25 },
  "Tung Tung Sahur": { hp: 160, atk: 30, ability: { type: "doubleAttack", chance: 0.5 } },
  "Bombardero Crocodilo": { hp: 150, atk: 40 },
  "Glorbo Fruttodrillo": { hp: 220, atk: 10, ability: { type: "reduceSelfDamageOnAttack", value: 10 } },
  "Brr Brr Patapim": { hp: 180, atk: 15, ability: { type: "healAllies", value: 5 } },
  "Vacca Saturno S.": { hp: 110, atk: 35 },
  "Lirili Larila": { hp: 230, atk: 10, ability: { type: "giveBackDamage", value: 10 } },
  "Trippi Troppi": { hp: 300, atk: 5 },
  "mateo": { hp: 90, atk: 45, ability: { type: "stun", chance: 0.1, duration: 1, trigger: "afterAttack" } }
};

// Variabile per gestire se l'abilità di Patapim è stata già usata
let patapimAbilitaUsata = false;

const cpuCard = { name: "CPU Card", hp: 350, atk: 40 };
let currentTurn = 'player';
let turn = 1;

// === ATTACCO GIOCATORE ===
function attack() {
  if (currentTurn !== 'player') {
    alert("Non è il tuo turno!");
    return;
  }

  const selectedCardInput = document.querySelector('input[name="selectedCard"]:checked');
  if (!selectedCardInput) {
    alert("Seleziona una carta!");
    return;
  }

  const cardName = selectedCardInput.value;
  const cardKey = Object.keys(cards).find(name => name.toLowerCase() === cardName.toLowerCase());
  const playerCard = cards[cardKey];
  let damage = playerCard.atk;

  // Controlla abilità del giocatore
  if (playerCard.ability?.type === "doubleAttack" && Math.random() < playerCard.ability.chance) {
    damage += playerCard.atk;
    console.log(`${cardName} ha attivato DOPPIO ATTACCO!`);
  }
  if (playerCard.ability === "Heal 20 HP") {
    playerCard.hp = Math.min(100, playerCard.hp + 20); // Cura, ma non supera il massimo HP
    document.getElementById("attackMessage").textContent = `${cardName} ha curato 20 HP!`;
  }

  cpuCard.hp -= damage;
  cpuCard.hp = Math.max(0, cpuCard.hp); // Evita HP negativi
  document.getElementById("cpuHP").textContent = cpuCard.hp;

  // Suono dell'attacco
  const audioPath = `/suoni/${cardName.toLowerCase()}.mp3`;
  const audio = new Audio(audioPath);
  audio.play().catch(e => console.log("Audio mancante:", audioPath));

  // Verifica se la CPU è stata sconfitta
  if (cpuCard.hp <= 0) {
    document.getElementById("attackMessage").textContent += " LA CPU È STATA SCONFITTA!";
    document.getElementById("attackBtn").disabled = true; // Disabilita il pulsante
    return;
  }

  // Aggiorna il contatore dei turni
  const turnCounter = document.getElementById("turnCounter");
  turnCounter.textContent = parseInt(turnCounter.textContent) + 1;

  // Passaggio del turno alla CPU
  currentTurn = "cpu";
  document.getElementById('attackBtn').disabled = true;

  // La CPU attacca dopo un breve ritardo
  setTimeout(() => cpuAttack(), 4000);
}

// === ATTACCO CPU ===
function cpuAttack() {
  if (currentTurn !== 'cpu') return;

  // Ottieni tutte le carte del giocatore ancora vive
  const aliveCards = Object.entries(cards)
    .filter(([name, data]) => data.hp > 0)
    .map(([name, data]) => ({ name, data }));

  if (aliveCards.length === 0) {
    document.getElementById("attackMessage").textContent += " TUTTE LE CARTE DEL GIOCATORE SONO STATE DISTRUTTE!";
    document.getElementById("attackBtn").disabled = true;
    return;
  }

  // Seleziona una carta casuale tra quelle vive
  const randomCardObj = aliveCards[Math.floor(Math.random() * aliveCards.length)];
  const cardName = randomCardObj.name;
  const card = randomCardObj.data;

  // Calcolo del danno casuale tra 30 e 50
  const cpuDamage = Math.floor(Math.random() * 21) + 30;
  card.hp -= cpuDamage;
  if (card.hp < 0) card.hp = 0;

  // Aggiorna il messaggio di attacco
  document.getElementById("attackMessage").textContent =
    `La CPU attacca ${cardName} infliggendo ${cpuDamage} danni!`;

  // Aggiorna la UI degli HP per quella carta
  const radioInput = document.querySelector(`input[value="${cardName}"]`);
  const cardLabel = radioInput.closest("label");
  const hpParagraph = cardLabel.querySelector("p.hp");
  hpParagraph.textContent = `HP: ${card.hp}`;

  // Disabilita la carta se è stata sconfitta
  if (card.hp === 0) {
    cardLabel.classList.add('disabled');
    radioInput.disabled = true;
  }

  // Verifica se tutte le carte sono morte
  const allDead = Object.values(cards).every(card => card.hp <= 0);
  if (allDead) {
    document.getElementById("attackMessage").textContent += " TUTTE LE CARTE DEL GIOCATORE SONO STATE DISTRUTTE!";
    document.getElementById("attackBtn").disabled = true;
    return;
  }

  // Passaggio del turno
  document.getElementById("turnCounter").textContent =
    parseInt(document.getElementById("turnCounter").textContent) + 1;

  currentTurn = 'player';
  setTimeout(() => {
    document.getElementById('attackBtn').disabled = false;
  }, 1000);
}

// EVENTO ATTACCO
if(document.getElementById("attackBtn")) {
  document.getElementById("attackBtn").addEventListener("click", attack);
}

// Gestione UI e Selezione
const cardInputs = document.querySelectorAll('input[name="selectedCard"]');
const cardDisplay = document.getElementById("cartaSelezionata");

// Gestione dell'abilitazione/disabilitazione delle carte
cardInputs.forEach(input => {
  input.addEventListener("change", () => {
    const label = input.closest("label");
    const img = label.querySelector("img");
    const ps = label.querySelectorAll("p");

    const nomeCarta = input.value.trim(); // Rimuovi spazi extra e confronta in modo preciso

    // Confronto case-insensitive per trovare la carta
    const cardName = Object.keys(cards).find(card => card.toLowerCase() === nomeCarta.toLowerCase());

    if (!cardName) {
      console.error(`Carta "${nomeCarta}" non trovata nel mazzo.`);
      return;
    }

    const hpAttuali = cards[cardName].hp; // Accedi ora correttamente alla proprietà hp

    // Azzera il contenuto dell'area di visualizzazione
    cardDisplay.innerHTML = "";

    // Verifica se l'immagine esiste per la carta selezionata
    if (img) {
      const newImg = document.createElement("img");
      newImg.src = img.src;
      newImg.alt = img.alt;
      cardDisplay.appendChild(newImg);
    }

    // Aggiungi tutti i paragrafi di informazioni sulla carta
    ps.forEach(p => {
      const newP = document.createElement("p");
      newP.innerHTML = p.innerHTML;
      cardDisplay.appendChild(newP);
    });

    // Mostra HP attuali della carta selezionata
    const hpP = document.createElement("p");
    hpP.className = "hp";
    hpP.textContent = `HP attuali: ${hpAttuali}`;
    cardDisplay.appendChild(hpP);
  });
});

// Classe per la gestione del giocatore
class Player {
  constructor(name) {
    this.name = name;
    this.isStunned = false; // Stato dello stordimento
    this.turnsStunned = 0; // Numero di turni
  }
}

// Eventi Patapim abilità
document.querySelectorAll('input[name="selectedCard"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    const selected = document.querySelector('input[name="selectedCard"]:checked').value;
    const btn = document.getElementById('patapimAbilityBtn');

    if (selected === "Brr Brr Patapim" && currentTurn === 'player') {
      btn.style.display = "inline-block";
    } else {
      btn.style.display = "none";
    }
  });
});

function usaAbilitaPatapim() {
  if (currentTurn !== 'player') {
    alert("Non è il tuo turno!");
    return;
  }

  if (patapimAbilitaUsata) {
    alert("Hai già usato l'abilità di Patapim in questo turno!");
    return;
  }

  Object.keys(cards).forEach((name) => {
    const card = cards[name];

    // Solo se la carta non è morta
    if (card.hp > 0) {
      card.hp += 1;

      // Aggiorna anche la UI, se la carta è presente nella pagina
      const input = document.querySelector(`input[value="${name}"]`);
      if (input) {
        const label = input.closest("label");
        const hpParagraph = label.querySelector("p.hp");
        if (hpParagraph) {
          hpParagraph.textContent = `HP: ${card.hp}`;
        }
      }
    }
  });

  patapimAbilitaUsata = true;

  document.getElementById("attackMessage").textContent =
    "🌿 Brr Brr Patapim ha curato tutti gli alleati di 5 HP!";
}

function avanzaTurno() {
  // Reset delle abilità e stato del turno
  patapimAbilitaUsata = false;

  // Altri aggiornamenti del turno
  currentTurn = currentTurn === 'player' ? 'cpu' : 'player';
}

// Tabelle con DataTables
const tbody = document.querySelector('#cardTable tbody');

for (const [name, stats] of Object.entries(cards)) {
  const row = document.createElement('tr');
  
  row.innerHTML = `
    <td>${name}</td>
    <td>${stats.hp}</td>
    <td>${stats.atk}</td>
  `;

  tbody.appendChild(row);
}

// Inizializza DataTables per la tabella
$(document).ready(function() {
  $('#cardTable').DataTable();
});

// Gestisci la selezione della carta
document.querySelectorAll('input[name="selectedCard"]').forEach((input) => {
  input.addEventListener('change', () => {
    // Rimuovi la classe "selected" da tutte le carte
    document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));
    
    // Aggiungi la classe "selected" alla carta selezionata
    const selectedCard = document.querySelector(`#card-tralalero`);
    selectedCard.classList.add('selected');

    // Esegui l'animazione di elettricità
    triggerElectricity();
  });
});

// Gestisci la selezione della carta
document.querySelectorAll('input[name="selectedCard"]').forEach((input) => {
  input.addEventListener('change', () => {
    // Rimuovi la classe "selected" da tutte le carte
    document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));
    
    // Seleziona la carta Tralalero Tralala
    const selectedCardName = input.value.trim().toLowerCase();

    // Aggiungi la classe "selected" solo alla carta selezionata
    if (selectedCardName === 'tralalero tralala') {
      const selectedCard = document.querySelector(`#card-tralalero tralala`);
      selectedCard.classList.add('selected');

      // Attiva l'effetto di elettricità solo per Tralalero Tralala
      triggerElectricityEffect();
    }
  });
});

// Funzione per attivare l'effetto di elettricità
function triggerElectricityEffect() {
  const electricityEffect = document.getElementById("electricity-effect");

  // Mostra l'effetto
  electricityEffect.style.visibility = "visible";
  
  // Rimuovi l'effetto dopo che l'animazione è finita
  electricityEffect.addEventListener('animationend', () => {
    electricityEffect.style.visibility = "hidden";
  });
}