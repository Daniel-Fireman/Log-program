const closedAlarmStorageKey = "tyverialarm-log";

const logContainer = document.getElementById("tyv-log");
const emptyMessage = document.getElementById("tyv-empty");

function formatDateTime(value) {
  if (!value) return "Ikke angivet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Ikke angivet";

  return date.toLocaleString("da-DK");
}

function loadClosedAlarms() {
  try {
    const saved = JSON.parse(localStorage.getItem(closedAlarmStorageKey));

    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Kunne ikke indlæse tyverialarm-log:", error);
    return [];
  }
}

function displayClosedAlarms() {
  const alarms = loadClosedAlarms();

  logContainer.replaceChildren();

  emptyMessage.hidden = alarms.length > 0;
  logContainer.appendChild(emptyMessage);

  alarms.forEach((alarm) => {
    const article = document.createElement("article");
    article.className = "tyv-log-card";

    const heading = document.createElement("h2");
    heading.textContent = "TYVERIALARM";

    const address = document.createElement("p");
    address.textContent = `Adresse: ${alarm.address}`;

    const received = document.createElement("p");
    received.textContent = `Alarm modtaget: ${formatDateTime(alarm.createdAt)}`;

    const forwarded = document.createElement("p");
    forwarded.textContent = `Givet videre: ${formatDateTime(alarm.forwardedAt)}`;

    const finished = document.createElement("p");
    finished.textContent = `Alarm afsluttet: ${formatDateTime(alarm.finishedAt)}`;

    const feedbackHeading = document.createElement("h3");
    feedbackHeading.textContent = "Tilbagemelding";

    const feedback = document.createElement("p");
    feedback.textContent = alarm.feedback || "Ingen tilbagemelding angivet.";

    article.append(
      heading,
      address,
      received,
      forwarded,
      finished,
      feedbackHeading,
      feedback,
    );

    logContainer.appendChild(article);
  });
}

displayClosedAlarms();

// Opdatér loggen, hvis en anden side afslutter en alarm.
window.addEventListener("storage", (event) => {
  if (event.key === closedAlarmStorageKey) {
    displayClosedAlarms();
  }
});
