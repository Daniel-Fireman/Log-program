(function () {
  "use strict";

  const alarmStorageKey = "tyverialarm-data";
  const alarmLockKey = "tyverialarm-lock";
  const closedAlarmStorageKey = "tyverialarm-log";
  const alarmSoundKey = "tyverialarm-lyd";
  const alarmMinimizedKey = "tyverialarm-minimized";

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
    "Tordenskjoldsgade 21, 8000 Aarhus C",
    "Jægergårdsgade 65, 8000 Aarhus C",
    "Inge Lehmanns Gade 10, 8000 Aarhus C",
    "Skovbrynet 5, 8000 Aarhus C",
    "Observatorievejen 1, 8000 Aarhus C",
    "Møllevangs Allé 20, 8210 Aarhus V",
    "Hasle Ringvej 4, 8210 Aarhus V",
    "Gunnar Clausens Vej 26, 8260 Viby J",
  ];

  let alarmTimer = null;
  let alarmAudioContext = null;

  // Opret en tilfældig ventetid.
  // 0.6 minutter = 36 sekunder.
  function getNextAlarmTime() {
    const minutes = 0.6;
    return Date.now() + minutes * 60 * 1000;
  }

  // Hent aktive alarmer fra browseren.
  function loadAlarmData() {
    try {
      const saved = JSON.parse(localStorage.getItem(alarmStorageKey));

      if (
        saved &&
        Array.isArray(saved.alarms) &&
        Number.isFinite(saved.nextAt)
      ) {
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

  // Gem aktive alarmer.
  function saveAlarmData(data) {
    try {
      localStorage.setItem(alarmStorageKey, JSON.stringify(data));

      return true;
    } catch (error) {
      console.error("Kunne ikke gemme alarmdata:", error);
      return false;
    }
  }

  // Hent afsluttede alarmer.
  function loadClosedAlarms() {
    try {
      const saved = JSON.parse(localStorage.getItem(closedAlarmStorageKey));

      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error("Kunne ikke indlæse tyverialarm-log:", error);
      return [];
    }
  }

  // Gem afsluttede alarmer.
  function saveClosedAlarms(alarms) {
    try {
      localStorage.setItem(closedAlarmStorageKey, JSON.stringify(alarms));

      return true;
    } catch (error) {
      console.error("Kunne ikke gemme tyverialarm-log:", error);
      return false;
    }
  }

  // Gem ændringer på en aktiv alarm.
  function updateAlarm(alarmId, changes) {
    const data = loadAlarmData();

    const alarm = data.alarms.find((item) => item.id === alarmId);

    if (!alarm) return;

    Object.assign(alarm, changes);
    saveAlarmData(data);
  }

  // Formatér et tidspunkt til dansk visning.
  function formatDateTime(value) {
    if (!value) return "Ikke angivet";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Ikke angivet";
    }

    return date.toLocaleString("da-DK");
  }

  // Formatér tidspunktet for modtagelse af en alarm.
  function formatAlarmTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Afspil en kort pling-lyd.
  function playPling() {
    if (localStorage.getItem(alarmSoundKey) !== "true") {
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!alarmAudioContext) {
        alarmAudioContext = new AudioContextClass();
      }

      // Browseren skal have tilladt lydafspilning.
      if (alarmAudioContext.state !== "running") {
        return;
      }

      const oscillator = alarmAudioContext.createOscillator();
      const gain = alarmAudioContext.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        1046.5,
        alarmAudioContext.currentTime,
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        1568,
        alarmAudioContext.currentTime + 0.12,
      );

      gain.gain.setValueAtTime(0.0001, alarmAudioContext.currentTime);

      gain.gain.exponentialRampToValueAtTime(
        0.25,
        alarmAudioContext.currentTime + 0.015,
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        alarmAudioContext.currentTime + 0.65,
      );

      oscillator.connect(gain);
      gain.connect(alarmAudioContext.destination);

      oscillator.start();
      oscillator.stop(alarmAudioContext.currentTime + 0.65);
    } catch (error) {
      console.error("Kunne ikke afspille alarmlyd:", error);
    }
  }

  // Aktivér lyd efter et klik fra brugeren.
  async function enableAlarmSound() {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        alert("Din browser understøtter ikke lydafspilning.");
        return;
      }

      if (!alarmAudioContext) {
        alarmAudioContext = new AudioContextClass();
      }

      await alarmAudioContext.resume();

      localStorage.setItem(alarmSoundKey, "true");

      updateSoundButton();

      // Afspil en testlyd.
      playPling();
    } catch (error) {
      console.error("Kunne ikke aktivere alarmlyd:", error);
    }
  }

  // Opdatér teksten på lydknappen.
  function updateSoundButton() {
    const button = document.getElementById("tyverialarm-sound");

    if (!button) return;

    const enabled = localStorage.getItem(alarmSoundKey) === "true";

    button.textContent = enabled ? "Lyd til" : "Lyd fra";

    button.setAttribute("aria-pressed", String(enabled));
  }

  // Opret alarmområdet øverst til venstre.
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

    // Knap til lyd.
    const soundButton = document.createElement("button");
    soundButton.id = "tyverialarm-sound";
    soundButton.type = "button";

    soundButton.addEventListener("click", async () => {
      if (localStorage.getItem(alarmSoundKey) === "true") {
        localStorage.setItem(alarmSoundKey, "false");
        updateSoundButton();
      } else {
        await enableAlarmSound();
      }
    });

    // Knap til at minimere alarmområdet.
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

    // Hent gemt tilstand.
    const savedState = localStorage.getItem(alarmMinimizedKey);

    updateMinimizedState(savedState === "true");

    minimizeButton.addEventListener("click", () => {
      const isMinimized = !container.classList.contains("minimized");

      updateMinimizedState(isMinimized);

      localStorage.setItem(alarmMinimizedKey, String(isMinimized));
    });

    header.append(heading, soundButton, minimizeButton);

    container.append(header, list);

    document.body.appendChild(container);

    updateSoundButton();

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

      // Felt til tidspunkt for videregivelse.
      const forwardedLabel = document.createElement("label");

      forwardedLabel.textContent = "Givet videre:";
      forwardedLabel.htmlFor = `forwarded-${alarm.id}`;

      const forwardedInput = document.createElement("input");

      forwardedInput.type = "datetime-local";
      forwardedInput.id = `forwarded-${alarm.id}`;
      forwardedInput.value = alarm.forwardedAt || "";

      forwardedInput.addEventListener("change", () => {
        updateAlarm(alarm.id, {
          forwardedAt: forwardedInput.value,
        });
      });

      // Felt til tilbagemelding.
      const feedbackLabel = document.createElement("label");

      feedbackLabel.textContent = "Tilbagemelding:";
      feedbackLabel.htmlFor = `feedback-${alarm.id}`;

      const feedbackInput = document.createElement("textarea");

      feedbackInput.id = `feedback-${alarm.id}`;
      feedbackInput.rows = 3;

      feedbackInput.placeholder = "Skriv tilbagemelding på alarmen...";

      feedbackInput.value = alarm.feedback || "";

      feedbackInput.addEventListener("input", () => {
        updateAlarm(alarm.id, {
          feedback: feedbackInput.value,
        });
      });

      // Knap til at afslutte alarmen.
      const finishButton = document.createElement("button");

      finishButton.type = "button";
      finishButton.textContent = "Afslut alarm";

      finishButton.addEventListener("click", () => {
        const confirmed = confirm(
          `Vil du afslutte tyverialarmen på ${alarm.address}?`,
        );

        if (!confirmed) return;

        finishAlarm(alarm.id);
      });

      card.append(
        title,
        address,
        time,
        forwardedLabel,
        forwardedInput,
        feedbackLabel,
        feedbackInput,
        finishButton,
      );

      list.appendChild(card);
    });
  }

  // Afslut alarmen og gem den i loggen.
  function finishAlarm(alarmId) {
    const data = loadAlarmData();

    const alarm = data.alarms.find((item) => item.id === alarmId);

    if (!alarm) return;

    const closedAlarm = {
      id: alarm.id,
      address: alarm.address,
      createdAt: alarm.createdAt,
      forwardedAt: alarm.forwardedAt || "",
      feedback: alarm.feedback || "",
      finishedAt: Date.now(),
    };

    const closedAlarms = loadClosedAlarms();

    // Nyeste afsluttede alarm placeres øverst.
    closedAlarms.unshift(closedAlarm);

    // Gem først loggen.
    if (!saveClosedAlarms(closedAlarms)) {
      alert("Alarmen kunne ikke gemmes i loggen. Den er stadig aktiv.");
      return;
    }

    // Fjern derefter alarmen fra listen over aktive alarmer.
    data.alarms = data.alarms.filter((item) => item.id !== alarmId);

    if (saveAlarmData(data)) {
      renderAlarms();
    }
  }

  // Opret en ny tilfældig tyverialarm.
  function tryCreateAlarm() {
    const now = Date.now();
    let retryDelay = null;

    try {
      const lock = JSON.parse(localStorage.getItem(alarmLockKey));

      // En anden side er i gang med at oprette en alarm.
      if (lock && lock.expiresAt > now) {
        retryDelay = 1000;
        return;
      }

      // Opret en midlertidig lås.
      localStorage.setItem(
        alarmLockKey,
        JSON.stringify({
          expiresAt: now + 5000,
        }),
      );

      // Genindlæs data efter låsen er oprettet.
      const data = loadAlarmData();

      // Alarmen skal ikke oprettes før det planlagte tidspunkt.
      if (Date.now() < data.nextAt) {
        return;
      }

      const address =
        alarmAddresses[Math.floor(Math.random() * alarmAddresses.length)];

      const newAlarm = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

        address,
        createdAt: Date.now(),
        forwardedAt: "",
        feedback: "",
      };

      data.alarms.push(newAlarm);

      data.nextAt = getNextAlarmTime();

      if (saveAlarmData(data)) {
        renderAlarms();
        playPling();
      }
    } catch (error) {
      console.error("Kunne ikke oprette tyverialarm:", error);
    } finally {
      // Frigiv låsen.
      try {
        localStorage.removeItem(alarmLockKey);
      } catch (error) {
        console.error("Kunne ikke frigive alarmlåsen:", error);
      }

      scheduleNextAlarm(retryDelay);
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

  // Opdatér visningen, når en anden side ændrer aktive alarmer.
  window.addEventListener("storage", (event) => {
    if (event.key === alarmStorageKey) {
      renderAlarms();
      scheduleNextAlarm();
    }
  });

  // Start systemet.
  createAlarmContainer();
  renderAlarms();

  // Sørg for, at der findes gemte alarmdata.
  if (!localStorage.getItem(alarmStorageKey)) {
    saveAlarmData(loadAlarmData());
  }

  scheduleNextAlarm();
})();
