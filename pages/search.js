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


let allChunks = [];
let currentPage = 1;

async function searchCard() {
  const input = document.getElementById("card-search").value.trim().toLowerCase();
  const container = document.getElementById("card-container");
  const errorEl = document.getElementById("error-message");
  const paginationEl = document.getElementById("pagination");

  container.innerHTML = "Loading...";
  errorEl.style.display = "none";
  paginationEl.innerHTML = "";

  try {
    const response = await fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php");
    const data = await response.json();

    const filtered = data.data.filter(card =>
      card.name.toLowerCase().includes(input) ||
      card.desc?.toLowerCase().includes(input)
    );

    if (filtered.length === 0) {
      container.innerHTML = "";
      errorEl.textContent = "No results found.";
      errorEl.style.display = "block";
      return;
    }

    // Sort cards (normal -> effect -> other monsters -> spell -> trap)
    const sorted = filtered.sort((a, b) => {
      const order = {
        "Normal Monster": 0,
        "Effect Monster": 1,
        "Fusion Monster": 2,
        "Synchro Monster": 3,
        "XYZ Monster": 4,
        "Link Monster": 5,
        "Spell Card": 6,
        "Trap Card": 7
      };
      return (order[a.type] ?? 99) - (order[b.type] ?? 99);
    });

    // Split into pages of 20
    allChunks = [];
    for (let i = 0; i < sorted.length; i += 35) {
      allChunks.push(sorted.slice(i, i + 35));
    }

    currentPage = 1;
    renderPage(currentPage);
    renderPagination();
  } catch (err) {
    container.innerHTML = "";
    errorEl.textContent = "Failed to load cards.";
    errorEl.style.display = "block";
  }
}


function renderPage(page) {
  const container = document.getElementById("card-container");
  container.innerHTML = "";

  const cards = allChunks[page - 1];
  cards.forEach(card => {
    const encodedName = encodeURIComponent(card.name);
    const isMonster = card.type.includes("Monster");
    const attribute = card.attribute || "N/A";
    const level = card.level !== undefined ? card.level : "N/A";

    let material = "";
    let mainDesc = card.desc || "";

    const descParts = mainDesc.split('\n');
    if (descParts.length > 1) {
      material = descParts[0].trim();
      mainDesc = descParts.slice(1).join('\n').trim();
    } else {
      const match = mainDesc.match(/^"([^"]+)"\s*(.*)/);
      if (match) {
        material = match[1];
        mainDesc = match[2];
      }
    }

    const typeDisplay = isMonster
      ? `[${card.type}/${card.race}]`
      : `[${card.race}/${card.type}]`;

    const tooltipText = `
      <strong style="font-size: 1.1rem;">${card.name}</strong><br>
      <strong>${typeDisplay}</strong><br>
      ${isMonster ? `<strong>Attribute:</strong> ${attribute}<br><strong>Level:</strong> ${level}<br>` : ""}
      ${material ? `<div class="material">${material}</div>` : ""}
      <div class="description" style="font-size: 0.95rem;">${mainDesc}</div>
    `;

    const cardEl = document.createElement("div");
    cardEl.className = "card-preview";

    const cardback = "../../pic/card-back.png";
    cardEl.innerHTML = `
      <a href="/card/${encodedName}" class="card-link">
        <img
        class="card-image"
        src="${cardback}"
        data-src="${card.card_images[0].image_url_small}"
        alt="${card.name}"
        onload="this.src=this.dataset.src"
        onerror="this.src='${cardback}'"
      />
        <div class="card-tooltip">${tooltipText}</div>
      </a>
    `;
    container.appendChild(cardEl);
  });
}


function renderPagination() {
  const paginationEl = document.getElementById("pagination");
  paginationEl.innerHTML = "";

  // Create Left Arrow Button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "<";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
      renderPagination();
      window.scrollTo(0, 0);
    }
  });
  paginationEl.appendChild(prevBtn);

  // Page Indicator
  const pageIndicator = document.createElement("span");
  pageIndicator.textContent = `${currentPage}/${allChunks.length}`;
  pageIndicator.style.color = "#fff";
  pageIndicator.style.margin = "0 12px";
  pageIndicator.style.fontWeight = "bold";
  pageIndicator.style.fontSize = "1.1rem";
  paginationEl.appendChild(pageIndicator);

  // Create Right Arrow Button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = ">";
  nextBtn.disabled = currentPage === allChunks.length;
  nextBtn.addEventListener("click", () => {
    if (currentPage < allChunks.length) {
      currentPage++;
      renderPage(currentPage);
      renderPagination();
      window.scrollTo(0, 0);
    }
  });
  paginationEl.appendChild(nextBtn);
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