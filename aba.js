const searchInput = document.getElementById("aba-search");
const resultSection = document.getElementById("aba-result");
const nameElement = document.getElementById("aba-name");
const statusElement = document.getElementById("aba-status");
const toggleButton = document.getElementById("aba-toggle-status");
const messageElement = document.getElementById("aba-message");

const storageKey = "aba-installations-status";

// Opret ABA1 til ABA100.
// Alle anlæg starter som "I drift".
const installations = {};

for (let i = 1; i <= 100; i++) {
  installations[`ABA${i}`] = "I drift";
}

// Indlæs tidligere gemte statusser.
try {
  const savedData = JSON.parse(localStorage.getItem(storageKey));

  if (savedData && typeof savedData === "object" && !Array.isArray(savedData)) {
    for (let i = 1; i <= 100; i++) {
      const name = `ABA${i}`;
      const status = savedData[name];

      if (status === "I drift" || status === "I service") {
        installations[name] = status;
      }
    }
  }
} catch (error) {
  console.error("Kunne ikke indlæse ABA-statusser:", error);
}

// Gem alle statusser i browseren.
function saveInstallations() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(installations));
  } catch (error) {
    console.error("Kunne ikke gemme ABA-statusser:", error);

    messageElement.textContent = "Status kunne ikke gemmes i browseren.";
  }
}

// Find og vis et anlæg.
function searchInstallation() {
  const searchValue = searchInput.value.trim().toUpperCase();

  // Skjul resultatet, hvis søgefeltet er tomt.
  if (searchValue === "") {
    resultSection.hidden = true;
    messageElement.textContent = "Indtast et anlægsnavn for at søge.";
    return;
  }

  // Accepter ABA1 til ABA100, også uden mellemrum.
  const match = searchValue.match(/^ABA0*(\d{1,3})$/);

  if (!match) {
    resultSection.hidden = true;
    messageElement.textContent =
      "Anlægget blev ikke fundet. Søg f.eks. efter ABA17.";
    return;
  }

  const number = Number(match[1]);

  if (number < 1 || number > 100) {
    resultSection.hidden = true;
    messageElement.textContent = "Anlægget skal være mellem ABA1 og ABA100.";
    return;
  }

  const name = `ABA${number}`;

  nameElement.textContent = name;
  updateStatusDisplay(name);

  resultSection.hidden = false;
  messageElement.textContent = "";
}

// Opdater status og knaptekst for det valgte anlæg.
function updateStatusDisplay(name) {
  const status = installations[name];

  statusElement.textContent = status;
  statusElement.className =
    status === "I drift"
      ? "aba-status-in-service-operation"
      : "aba-status-maintenance";

  toggleButton.textContent =
    status === "I drift" ? "Sæt i service" : "Sæt i drift";
}

// Skift status for det viste anlæg.
toggleButton.addEventListener("click", () => {
  const name = nameElement.textContent;

  if (!installations[name]) {
    return;
  }

  installations[name] =
    installations[name] === "I drift" ? "I service" : "I drift";

  saveInstallations();
  updateStatusDisplay(name);

  messageElement.textContent = `${name} er nu ${installations[name].toLowerCase()}.`;
});

// Søg, mens brugeren skriver.
searchInput.addEventListener("input", searchInstallation);
