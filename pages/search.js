


function showMoreSets() {
  const extraSets = document.getElementById("extra-sets");
  const btn = document.getElementById("view-more-btn");

  if (extraSets && btn) {
    extraSets.classList.remove("hidden");  // Show hidden sets
    btn.style.display = "none";            // Hide the button after one click
  }
}

function searchCard(){
    const cardName = document.getElementById("card-search").value.trim();
    const errorEl = document.getElementById("error-message");
    const container = document.getElementById("card-container");

    errorEl.style.display = "none";  // hide previous error
    container.innerHTML = "";

    if(!cardName){
        errorEl.textContent = "Please enter a card name.";
        errorEl.style.display = "block";
        return;
    }

    const APIURL = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cardName)}`;

    fetch(APIURL)
    .then(res => res.json())
    .then(data => {
        const card = data.data[0];

        const setList = card.card_sets || [];
        const visibleSets = setList.slice(0, 3);
        const hiddenSets = setList.slice(3);

        const setsHTML = `
        <h3>Card Sets:</h3>
        <ul class="card-set-list">
            ${visibleSets.map(set => `
            <li>${set.set_name} (${set.set_rarity}) - $${set.set_price}</li>
            `).join("")}
        </ul>
        ${hiddenSets.length > 0 ? `
            <ul class="card-set-list hidden" id="extra-sets">
            ${hiddenSets.map(set => `
                <li>${set.set_name} (${set.set_rarity}) - $${set.set_price}</li>
            `).join("")}
            </ul>
            <button class="view-more-btn" id="view-more-btn" onclick="showMoreSets()">View More</button>
        ` : ""}
        `;
        const container = document.getElementById("card-container");

        container.innerHTML = `
        <div class="card-detail">
            <h2 class="card-name">${card.name}</h2>
            <div class="card-info">
            <img class="card-image" src="${card.card_images[0].image_url}" alt="${card.name}">
            <div class="card-meta">
                <p><strong>Type:</strong> ${card.type}</p>
                <p><strong>Attribute:</strong> ${card.attribute || "N/A"}</p>
                <p><strong>Level:</strong> ${card.level || "N/A"}</p>
                <p><strong>Typing:</strong> ${card.race}</p>
                <p><strong>ATK/DEF:</strong> ${card.atk}/${card.def}</p>
                <p><strong>Description:</strong><br>${card.desc}</p>
            </div>
            </div>
            <div class="card-sets">${setsHTML}</div>
            <div class="card-prices">
            <h3>Prices:</h3>
            <ul>
                <li>Cardmarket: $${card.card_prices[0].cardmarket_price}</li>
                <li>TCGPlayer: $${card.card_prices[0].tcgplayer_price}</li>
                <li>eBay: $${card.card_prices[0].ebay_price}</li>
                <li>Amazon: $${card.card_prices[0].amazon_price}</li>
                <li>CoolStuffInc: $${card.card_prices[0].coolstuffinc_price}</li>
            </ul>
            </div>
        </div>
        `;

    })
    .catch(() => {
        errorEl.textContent = "No such card exists. Please check spelling.";
        errorEl.style.display = "block";
    })
}


// Wrap all your listeners inside DOMContentLoaded to ensure elements exist
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("card-search");
  const container = document.getElementById("card-container");

  // Clear results/error message on input change
  searchInput.addEventListener("input", () => {
    container.innerHTML = "";
    const errorEl = document.getElementById("error-message");
    if (errorEl) errorEl.style.display = "none"; // Also hide error message if you have one
  });

  // Trigger searchCard() when pressing Enter inside input
  searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchCard();
    }
  });
});
