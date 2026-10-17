const alarmStorageKey = "tyverialarm-data";
const alarmLockKey = "tyverialarm-lock";

const alarmAddresses = [
  "Banegårdspladsen 1, 8000 Aarhus C",
  "Skejbyparken 1, 8200 Aarhus N",
  "Hack Kampmanns Plads 2, 8000 Aarhus C",
  "Aros Allé 2, 8000 Aarhus C",
  "Dokk1, Hack Kampmanns Plads 2, 8000 Aarhus C",
  "Vester Allé 15, 8000 Aarhus C",
  "Frederiksgade 78, 8000 Aarhus C",
  "Thomas Jensens Allé 2, 8000 Aarhus C",
  "Nørrebrogade 44, 8000 Aarhus C",
  "Olof Palmes Allé 18, 8200 Aarhus N",
  "Graham Bells Vej 12, 8200 Aarhus N",
  "Søren Frichs Vej 36, 8230 Åbyhøj",
  "Edwin Rahrs Vej 32, 8220 Brabrand",
  "Skanderborgvej 180, 8260 Viby J",
  "Viby Ringvej 4, 8260 Viby J",
  "Silkeborgvej 290, 8230 Åbyhøj",
  "Marselis Boulevard 1, 8000 Aarhus C",
  "Margrethepladsen 1, 8000 Aarhus C",
  "Katrinebjergvej 89, 8200 Aarhus N",
  "Finlandsgade 20, 8200 Aarhus N",
  "Palle Juul-Jensens Boulevard 99, 8200 Aarhus N",
  "Brendstrupgårdsvej 21, 8200 Aarhus N",
  "Tordenskjoldsgade 21, 8200 Aarhus N",
  "Jægergårdsgade 65, 8000 Aarhus C",
  "Inge Lehmanns Gade 10, 8000 Aarhus C",
  "Skovbrynet 5, 8000 Aarhus C",
  "Observatorievejen 1, 8000 Aarhus C",
  "Møllevangs Allé 20, 8210 Aarhus V",
  "Hasle Ringvej 4, 8210 Aarhus V",
  "Gunnar Clausens Vej 26, 8260 Viby J",
];

let alarmTimer = null;

// Opret en tilfældig ventetid mellem 5 og 10 minutter.
function getNextAlarmTime() {
  const minutes = Math.floor(Math.random() * 6) + 5;
  return Date.now() + minutes * 60 * 1000;
}

// Hent alarmdata fra browseren.
function loadAlarmData() {
  try {
    const saved = JSON.parse(localStorage.getItem(alarmStorageKey));

    if (saved && Array.isArray(saved.alarms) && Number.isFinite(saved.nextAt)) {
      return saved;
    }
  } catch (error) {
    console.error("Kunne ikke indlæse alarmdata:", error);
  }

  return {
    alarms: [],
    nextAt: getNextAlarmTime(),
  };
}

// Gem alarmdata.
function saveAlarmData(data) {
  try {
    localStorage.setItem(alarmStorageKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Kunne ikke gemme alarmdata:", error);
    return false;
  }
}

// Opret alarmområdet øverst til venstre.

const alarmMinimizedKey = "tyverialarm-minimized";

function createAlarmContainer() {
  let container = document.getElementById("tyverialarm-container");

  if (container) {
    return container;
  }

  container = document.createElement("aside");
  container.id = "tyverialarm-container";
  container.setAttribute("aria-label", "Aktive tyverialarmer");

  const header = document.createElement("div");
  header.id = "tyverialarm-header";

  const heading = document.createElement("h2");
  heading.textContent = "Aktive tyverialarmer";

  const minimizeButton = document.createElement("button");
  minimizeButton.id = "tyverialarm-minimize";
  minimizeButton.type = "button";

  const list = document.createElement("div");
  list.id = "tyverialarm-list";

  function updateMinimizedState(isMinimized) {
    container.classList.toggle("minimized", isMinimized);

    minimizeButton.textContent = isMinimized ? "Udvid" : "Minimér";
    minimizeButton.setAttribute("aria-expanded", String(!isMinimized));
  }

  // Hent den gemte tilstand, når siden åbnes
  const savedState = localStorage.getItem(alarmMinimizedKey);
  updateMinimizedState(savedState === "true");

  minimizeButton.addEventListener("click", () => {
    const isMinimized = !container.classList.contains("minimized");

    updateMinimizedState(isMinimized);

    // Gem tilstanden, så den huskes på de andre sider
    localStorage.setItem(alarmMinimizedKey, String(isMinimized));
  });

  header.append(heading, minimizeButton);
  container.append(header, list);
  document.body.appendChild(container);

  return container;
}

// Vis alle aktive alarmer.
function renderAlarms() {
  const container = createAlarmContainer();
  const list = document.getElementById("tyverialarm-list");
  const data = loadAlarmData();

  list.replaceChildren();

  container.hidden = data.alarms.length === 0;

  data.alarms.forEach((alarm) => {
    const card = document.createElement("article");
    card.className = "tyverialarm-card";

    const title = document.createElement("h3");
    title.textContent = "TYVERIALARM";

    const address = document.createElement("p");
    address.textContent = `Adresse: ${alarm.address}`;

    const time = document.createElement("p");
    time.textContent = `Modtaget: ${formatAlarmTime(alarm.createdAt)}`;

    const finishButton = document.createElement("button");
    finishButton.type = "button";
    finishButton.textContent = "Afslut alarm";

    finishButton.addEventListener("click", () => {
      const confirmed = confirm(
        `Vil du afslutte tyverialarmen på ${alarm.address}?`,
      );

      if (!confirmed) {
        return;
      }

      finishAlarm(alarm.id);
    });

    card.append(title, address, time, finishButton);
    list.appendChild(card);
  });
}

// Formatér alarmens tidspunkt.
function formatAlarmTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Afslut den valgte alarm.
function finishAlarm(alarmId) {
  const data = loadAlarmData();

  data.alarms = data.alarms.filter((alarm) => alarm.id !== alarmId);

  if (saveAlarmData(data)) {
    renderAlarms();
  }
}

// Forsøg at sikre, at kun én åben side opretter alarmen.
function tryCreateAlarm() {
  const now = Date.now();

  try {
    const lock = JSON.parse(localStorage.getItem(alarmLockKey));

    if (lock && lock.expiresAt > now) {
      scheduleNextAlarm(1000);
      return;
    }

    localStorage.setItem(
      alarmLockKey,
      JSON.stringify({ expiresAt: now + 5000 }),
    );

    // Genlæs data efter låsen er oprettet.
    const data = loadAlarmData();

    if (Date.now() < data.nextAt) {
      scheduleNextAlarm();
      return;
    }

    const address =
      alarmAddresses[Math.floor(Math.random() * alarmAddresses.length)];

    data.alarms.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      address,
      createdAt: Date.now(),
    });

    data.nextAt = getNextAlarmTime();

    if (saveAlarmData(data)) {
      renderAlarms();
    }
  } catch (error) {
    console.error("Kunne ikke oprette tyverialarm:", error);
  } finally {
    try {
      localStorage.removeItem(alarmLockKey);
    } catch (error) {
      console.error("Kunne ikke frigive alarmlåsen:", error);
    }

    scheduleNextAlarm();
  }
}

// Planlæg næste alarm.
function scheduleNextAlarm(retryDelay = null) {
  clearTimeout(alarmTimer);

  const data = loadAlarmData();
  const delay = retryDelay ?? Math.max(0, data.nextAt - Date.now());

  alarmTimer = setTimeout(() => {
    tryCreateAlarm();
  }, delay);
}

// Opdatér visningen, hvis en anden side ændrer alarmerne.
window.addEventListener("storage", (event) => {
  if (event.key === alarmStorageKey) {
    renderAlarms();
    scheduleNextAlarm();
  }
});

// Start systemet på siden.
createAlarmContainer();
renderAlarms();

// Sørg for, at der findes et gemt tidspunkt for næste alarm.
if (!localStorage.getItem(alarmStorageKey)) {
  saveAlarmData(loadAlarmData());
}

scheduleNextAlarm();
