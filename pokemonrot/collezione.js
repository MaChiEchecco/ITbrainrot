// Funzione per visualizzare la collezione senza duplicati e con selezione mazzo
function displayCollection() {
  const collectionContainer = document.getElementById("collection");
  collectionContainer.innerHTML = "";

  // Recupera la collezione dal localStorage
  let collection = JSON.parse(localStorage.getItem("collection") || "{}");
  collection = Object.values(collection);

  console.log('collection = ', collection);

  collection.forEach(card => {
    const div = document.createElement("div");
    div.classList.add("card");

    const tipoClasse = card.type.toLowerCase();
    const ultraClasse = card.rarity === "Ultra" ? "ultra" : "";

    div.className = `card ${tipoClasse} ${ultraClasse}`;
    div.innerHTML = `
      <img src="${card.img}" alt="${card.name}">
      <h4>${card.name}</h4>
      <p>Tipo: ${card.type}</p>
      ${card.hp ? `<p>HP: ${card.hp}</p><p>ATK: ${card.atk}</p>` : `<p>${card.effect}</p>`}
      <p>Evoluzione: ${card.evolutionLevel || '-'}</p>
      <p><strong>Quantità: ${card.count}</strong></p>
    `;

    div.onclick = () => toggleCardInDeck(card, div);
    collectionContainer.appendChild(div);
  });

  updateDeckCounter();
}

// Funzione per aggiungere una nuova carta alla collezione (e gestire i duplicati)
function addCardToCollection(newCard) {
  let savedCollection = localStorage.getItem("collection");
  let collection = savedCollection ? JSON.parse(savedCollection) : {};

  if (collection[newCard.name]) {
    collection[newCard.name].count++;
  } else {
    collection[newCard.name] = { ...newCard, count: 1 };
  }

  localStorage.setItem("collection", JSON.stringify(collection));
}

// 🔁 Gestione mazzo
let mazzo = [];

function toggleCardInDeck(card, element) {
  const index = mazzo.findIndex(c => c.name === card.name);
  if (index !== -1) {
    mazzo.splice(index, 1);
    element.classList.remove("selected");
  } else {
    if (mazzo.length >= 20) {
      alert("Puoi selezionare solo 20 carte nel mazzo.");
      return;
    }
    mazzo.push(card);
    element.classList.add("selected");
  }
  updateDeckCounter();
}

function updateDeckCounter() {
  const counter = document.getElementById("deckCounter");
  if (counter) {
    counter.textContent = `Carte nel mazzo: ${mazzo.length}/20`;
  }
}

function saveDeck() {
  if (mazzo.length !== 20) {
    alert("Devi selezionare esattamente 20 carte!");
    return;
  }
  localStorage.setItem("mazzoSalvato", JSON.stringify(mazzo));
  alert("Mazzo salvato! Vai su lotta.html per iniziare la battaglia.");
}

// Esegui al caricamento della pagina
window.onload = function () {
  displayCollection();  // Visualizza la collezione esistente
};