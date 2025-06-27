


function showMoreSets() {
  const extraSets = document.getElementById("extra-sets");
  const btn = document.getElementById("view-more-btn");

  if (extraSets && btn) {
    extraSets.classList.remove("hidden");  // Show hidden sets
    btn.style.display = "none";            // Hide the button after one click
  }
}

function enableDynamicTooltipAlignment() {
  document.querySelectorAll('.card-preview').forEach(preview => {
    const tooltip = preview.querySelector('.card-tooltip');
    if (!tooltip) return;

    preview.addEventListener('mouseenter', () => {
      // Reset any manual positioning
      tooltip.style.left = "";
      tooltip.style.right = "";
      tooltip.style.transform = "";

      const rect = tooltip.getBoundingClientRect();
      const containerRect = preview.getBoundingClientRect();
      const screenWidth = window.innerWidth;

      const tooltipWidth = rect.width;
      const cardLeft = containerRect.left;
      const cardRight = containerRect.right;

      // Too close to left
      if (cardLeft < tooltipWidth / 2) {
        tooltip.style.left = "0";
        tooltip.style.transform = "none";
      }
      // Too close to right
      else if (screenWidth - cardRight < tooltipWidth / 2) {
        tooltip.style.right = "0";
        tooltip.style.left = "auto";
        tooltip.style.transform = "none";
      }
      // Centered (default)
      else {
        tooltip.style.left = "50%";
        tooltip.style.transform = "translateX(-50%)";
      }
    });
  });
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

    const APIURL = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cardName)}`;

fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cardName)}`)
  .then(res => res.json())
  .then(data => {
    const card = data.data;

    card.sort((a,b) => {
      const getRank = (card) => {
        const type = card.type.toLowerCase();

        if(type == "normal monster") return 0;
        if(type == "effect monster") return 1
        if(type.includes("monster")) return 2;
        if(type.includes("spell")) return 3;
        if(type.includes("trap")) return 4;
        return 5;
      };

      return getRank(a) - getRank(b);
      
    });

    const container = document.getElementById("card-container");
    container.innerHTML = ""; // Clear previous results

    card.forEach(card => {
      const encodedName = encodeURIComponent(card.name);
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
          <ul class="card-set-list hidden" id="extra-sets-${card.id}">
            ${hiddenSets.map(set => `
              <li>${set.set_name} (${set.set_rarity}) - $${set.set_price}</li>
            `).join("")}
          </ul>
          <button class="view-more-btn" onclick="document.getElementById('extra-sets-${card.id}').classList.remove('hidden'); this.remove();">View More</button>
        ` : ""}
      `;

      const isMonster = card.type.includes("Monster");

      const statsHTML = isMonster
        ? `
          <p><strong>Attribute:</strong> ${card.attribute || "N/A"}</p>
          <p><strong>Level:</strong> ${card.level || "N/A"}</p>
          <p><strong>Typing:</strong> ${card.race || "N/A"}</p>
          <p><strong>ATK/DEF:</strong> ${card.atk ?? "N/A"} / ${card.def ?? "N/A"}</p>
        `
        : `
          <p><strong>Type:</strong> ${card.type || "N/A"}</p>
          <p><strong>Typing:</strong> ${card.race || "N/A"}</p>
        `;

      // Split material from description
      const fullDesc = card.desc || "";
      let material = "";
      let mainDesc = fullDesc;

      const descParts = fullDesc.split('\n');
      if (descParts.length > 1) {
        material = descParts[0].trim();
        mainDesc = descParts.slice(1).join('\n').trim();
      } else {
        const match = fullDesc.match(/^"([^"]+)"\s*(.*)/);
        if (match) {
          material = match[1];
          mainDesc = match[2];
        }
      }

      if(isMonster){};
      const tooltipText = `
        <strong>${card.name}</strong><br>
        <strong>[${isMonster ? `${card.type} / ${card.race}` : `${card.race} ${card.type}`}]</strong><br>
        ${isMonster ? `<strong>Attribute:</strong> ${card.attribute}<br><strong>Level:</strong> ${card.level}<br>` : ""}
        ${material ? `<div class="material">${material}</div>` : ""}
        <div class="description">${mainDesc}</div>
      `;

      container.innerHTML += `
        <div class="card-preview">
          <a href="/card/${encodedName}" class="card-link">
            <img class="card-image" src="../pic/card-back.png" data-src="${card.card_images[0].image_url}" alt="${card.name}" onload="this.onload=null; this.src=this.getAttribute('data-src');" />
            <div class="card-tooltip">${tooltipText}</div>
          </a>
        </div>
      `;
    });
    enableDynamicTooltipAlignment()
  })
  .catch(() => {
    errorEl.textContent = "No such card exists. Please check spelling.";
    errorEl.style.display = "block";
  });
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