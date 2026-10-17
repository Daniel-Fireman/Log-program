const searchForm = document.getElementById("aba-search-form");
const searchInput = document.getElementById("aba-search");
const resultSection = document.getElementById("aba-result");
const nameElement = document.getElementById("aba-name");
const locationElement = document.getElementById("aba-location");
const statusElement = document.getElementById("aba-status");
const phoneDisplay = document.getElementById("aba-phone-display");
const serviceTimeDisplay = document.getElementById("aba-service-time-display");
const toggleButton = document.getElementById("aba-toggle-status");
const messageElement = document.getElementById("aba-message");

const showServiceListButton = document.getElementById("show-service-list");
const serviceListSection = document.getElementById("aba-service-list");
const serviceListRows = document.getElementById("service-list-rows");
const serviceListEmpty = document.getElementById("service-list-empty");

const storageKey = "aba-installations-status";

// Eksempel-lokationer til øvelsen.
// ABA-numrene har faste lokationer, så de ændrer sig ikke ved genindlæsning.
const locations = [
  "Skejby Sygehus",
  "Retten i Aarhus",
  "ARoS Aarhus Kunstmuseum",
  "Dokk1",
  "Aarhus Rådhus",
  "Aarhus Hovedbanegård",
  "Aarhus Universitet – hovedbygningen",
  "Moesgaard Museum",
  "Den Gamle By",
  "Musikhuset Aarhus",
  "Ceresbyen – kontorbygning",
  "Navitas",
  "INCUBA Katrinebjerg",
  "Aarhus Teater",
  "Tivoli Friheden",
  "Marselisborg Slot – besøgsområde",
  "Aarhus Stadion",
  "Jydsk Væddeløbsbane",
  "Aarhus Universitetshospital – P-hus",
  "Bruuns Galleri",
  "Storcenter Nord",
  "Veri Center",
  "Bazar Vest",
  "Aarhus Street Food",
  " Godsbanen",
  "Væksthusene i Botanisk Have",
  "Botanisk Have – driftsbygning",
  "Aarhus Domkirke",
  "Vor Frue Kirke",
  "Sankt Lukas Kirke",
  "Aarhus Havn – administrationsbygning",
  "Aarhus Ø – boligbyggeri",
  "Isbjerget",
  "Navitas – undervisningsfløj",
  "Lighthouse Aarhus",
  "Marselisborg Lystbådehavn",
  "Mindeparken – servicebygning",
  "Tangkrogen – eventbygning",
  "Riis Skov – driftsbygning",
  "Egå Marina",
  "Risskov – kontorbygning",
  "Viby Torv – butiksbygning",
  "Aarhus Syd – lagerbygning",
  "Højbjerg – boligforening",
  "Holme – idrætshal",
  "Tranbjerg – skolebygning",
  "Beder-Malling Idrætscenter",
  "Lystrup Idrætscenter",
  "Skødstrup Skole",
  "Risskov Gymnasium",
  "Aarhus Katedralskole",
  "Marselisborg Gymnasium",
  "Viby Gymnasium",
  "Aarhus Tech",
  "VIA University College – Ceresbyen",
  "Erhvervsakademi Aarhus",
  "Aarhus Universitet – Katrinebjerg",
  "Aarhus Universitet – Nobelparken",
  "Aarhus Universitet – bygning 1440",
  "Aarhus Universitet – laboratoriebygning",
  "Skejby – kontorbygning",
  "Skejby – lagerhal",
  "Tilst – logistikcenter",
  "Brabrand – industribygning",
  "Hasle – boligforening",
  "Gellerup – kulturhus",
  "City Vest – butiksområde",
  "Aarhus Fragtcentral",
  "Aarhus Vand – teknisk bygning",
  "Kredsløb – driftsbygning",
  "Aarhus Brandstation – øvelsesbygning",
  "Aarhus Politigård",
  "Østjyllands Politi – administrationsbygning",
  "Aarhus Universitetshospital – laboratoriefløj",
  "Aarhus Universitetshospital – patienthotel",
  "Aarhus Universitetshospital – varemodtagelse",
  "Aarhus Universitetshospital – teknisk afdeling",
  "Aarhus Havn – lagerhal",
  "Aarhus Havn – terminalbygning",
  "Aarhus Havn – værkstedsbygning",
  "Aarhus C – kontorbygning",
  "Aarhus C – parkeringshus",
  "Frederiksbjerg – boligforening",
  "Trøjborg – erhvervsejendom",
  "Latinerkvarteret – butiksejendom",
  "Åbyhøj – skolebygning",
  "Åbyhøj – erhvervsbygning",
  "Vejlby-Risskov Hallen",
  "Aarhus Skøjtehal",
  "Ceres Park – servicebygning",
  "Aarhus Svømmestadion",
  "Badeanstalten Spanien",
  "Aarhus Kunsthal",
  "Kunsthal Aarhus – depot",
  "Kulturhuset DOKK1 – teknikrum",
  "Aarhus Musikskole",
  "Aarhus Bibliotek – Højbjerg",
  "Aarhus Bibliotek – Risskov",
  "Aarhus Bibliotek – Viby",
];

// Opret ABA1 til ABA100.
const installations = {};

for (let i = 1; i <= 100; i++) {
  installations[`ABA${i}`] = {
    location: locations[i - 1],
    status: "I drift",
    phone: "",
    serviceSince: "",
  };
}

// Indlæs gemte data fra browseren.
try {
  const savedData = JSON.parse(localStorage.getItem(storageKey));

  if (savedData && typeof savedData === "object" && !Array.isArray(savedData)) {
    for (let i = 1; i <= 100; i++) {
      const name = `ABA${i}`;
      const saved = savedData[name];

      if (typeof saved === "string") {
        // Understøtter statusser fra den tidligere version.
        if (saved === "I drift" || saved === "I service") {
          installations[name].status = saved;
        }
      } else if (saved && typeof saved === "object") {
        if (saved.status === "I drift" || saved.status === "I service") {
          installations[name].status = saved.status;
        }

        if (typeof saved.phone === "string") {
          installations[name].phone = saved.phone;
        }

        if (typeof saved.serviceSince === "string") {
          installations[name].serviceSince = saved.serviceSince;
        }
      }
    }
  }
} catch (error) {
  console.error("Kunne ikke indlæse ABA-data:", error);
}

function saveInstallations() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(installations));
    return true;
  } catch (error) {
    console.error("Kunne ikke gemme ABA-data:", error);
    messageElement.textContent = "Kunne ikke gemme ændringerne i browseren.";
    return false;
  }
}

function getSelectedInstallation() {
  const name = nameElement.dataset.abaName;
  return installations[name] ? name : null;
}

function formatDateTime(dateString) {
  if (!dateString) {
    return "Ikke registreret";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Ikke registreret";
  }

  return date.toLocaleString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function updateStatusDisplay(name) {
  const installation = installations[name];

  nameElement.textContent = name;
  nameElement.dataset.abaName = name;
  locationElement.textContent = `Lokation: ${installation.location}`;
  statusElement.textContent = installation.status;

  statusElement.className =
    installation.status === "I drift"
      ? "aba-status-in-service-operation"
      : "aba-status-maintenance";

  if (installation.status === "I service") {
    phoneDisplay.textContent = `Telefonnummer: ${installation.phone || "Ikke angivet"}`;
    phoneDisplay.hidden = false;

    serviceTimeDisplay.textContent = `Sat i service: ${formatDateTime(installation.serviceSince)}`;
    serviceTimeDisplay.hidden = false;
  } else {
    phoneDisplay.textContent = "";
    phoneDisplay.hidden = true;

    serviceTimeDisplay.textContent = "";
    serviceTimeDisplay.hidden = true;
  }

  toggleButton.textContent =
    installation.status === "I drift" ? "Sæt i service" : "Sæt i drift";
}

// Søg kun ved Enter eller klik på Søg.
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const searchValue = searchInput.value.trim().toUpperCase();

  if (!searchValue) {
    resultSection.hidden = true;
    messageElement.textContent = "Indtast et anlægsnummer for at søge.";
    return;
  }

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

  updateStatusDisplay(name);
  resultSection.hidden = false;
  serviceListSection.hidden = true;
  showServiceListButton.textContent = "Vis alle anlæg i service";
  messageElement.textContent = "";
});

// Skift status for det valgte anlæg.
toggleButton.addEventListener("click", () => {
  const name = getSelectedInstallation();

  if (!name) return;

  const installation = installations[name];

  if (installation.status === "I drift") {
    const phone = prompt(
      `Indtast telefonnummer for ${name} (${installation.location}), når anlægget sættes i service:`,
    );

    if (phone === null) return;

    if (!phone.trim()) {
      alert("Du skal indtaste et telefonnummer.");
      return;
    }

    installation.phone = phone.trim();
    installation.status = "I service";
    installation.serviceSince = new Date().toISOString();
  } else {
    const confirmed = confirm(`Vil du sætte ${name} tilbage i drift?`);

    if (!confirmed) return;

    installation.status = "I drift";
    installation.phone = "";
    installation.serviceSince = "";
  }

  if (!saveInstallations()) return;

  updateStatusDisplay(name);
  renderServiceList();

  messageElement.textContent = `${name} (${installation.location}) er nu ${installation.status.toLowerCase()}.`;
});

// Vis eller skjul servicelisten.
showServiceListButton.addEventListener("click", () => {
  const shouldShow = serviceListSection.hidden;

  serviceListSection.hidden = !shouldShow;
  showServiceListButton.textContent = shouldShow
    ? "Skjul serviceliste"
    : "Vis alle anlæg i service";

  if (shouldShow) {
    renderServiceList();
    messageElement.textContent = "";
  }
});

// Opbyg listen over anlæg i service.
function renderServiceList() {
  serviceListRows.replaceChildren();

  const serviceInstallations = Object.entries(installations)
    .filter(([, installation]) => installation.status === "I service")
    .sort(([nameA], [nameB]) => {
      return (
        Number(nameA.replace("ABA", "")) - Number(nameB.replace("ABA", ""))
      );
    });

  serviceListEmpty.hidden = serviceInstallations.length > 0;

  for (const [name, installation] of serviceInstallations) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = name;

    const locationCell = document.createElement("td");
    locationCell.textContent = installation.location;

    const statusCell = document.createElement("td");
    statusCell.textContent = installation.status;
    statusCell.className = "aba-status-maintenance";

    const phoneCell = document.createElement("td");
    phoneCell.textContent = installation.phone || "Ikke angivet";

    const timeCell = document.createElement("td");
    timeCell.textContent = formatDateTime(installation.serviceSince);

    row.append(nameCell, locationCell, statusCell, phoneCell, timeCell);

    row.tabIndex = 0;
    row.classList.add("aba-service-row");
    row.setAttribute("aria-label", `Åbn ${name} – ${installation.location}`);

    function openInstallation() {
      searchInput.value = name;
      updateStatusDisplay(name);
      resultSection.hidden = false;
      serviceListSection.hidden = true;
      showServiceListButton.textContent = "Vis alle anlæg i service";
      messageElement.textContent = "";
    }

    row.addEventListener("click", openInstallation);

    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openInstallation();
      }
    });

    serviceListRows.appendChild(row);
  }
}

renderServiceList();
