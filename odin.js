const vehicleRows = document.getElementById("vehicle-rows");
const addVehicleButton = document.getElementById("add-vehicle");
const downloadButton = document.getElementById("download-pdf");
const clearButton = document.getElementById("clear-odin");
const form = document.getElementById("odin-form");

const storageKey = "odin-report";

/* =========================
   Hent værdier fra felter
   ========================= */

function getValue(id) {
  return document.getElementById(id).value.trim();
}

/* =========================
   Køretøjer
   ========================= */

function addVehicleRow(savedValues = []) {
  const row = document.createElement("tr");

  const fields = [
    { type: "text", label: "Køretøj" },
    { type: "datetime-local", label: "Disponeret" },
    { type: "datetime-local", label: "Afgang" },
    { type: "datetime-local", label: "Ankomst" },
    { type: "datetime-local", label: "Fri" },
    { type: "datetime-local", label: "Hjem" },
  ];

  fields.forEach((field, index) => {
    const cell = document.createElement("td");
    const input = document.createElement("input");

    input.type = field.type;
    input.className = "vehicle-input";
    input.setAttribute("aria-label", field.label);

    input.value = savedValues[index] || "";

    if (field.type === "text") {
      input.placeholder = field.label;
    }

    cell.appendChild(input);
    row.appendChild(cell);
  });

  // Handlinger for rækken.
  const actionCell = document.createElement("td");
  actionCell.className = "no-pdf";

  const removeButton = document.createElement("button");

  removeButton.type = "button";
  removeButton.textContent = "Slet";
  removeButton.className = "remove-vehicle";

  removeButton.addEventListener("click", () => {
    row.remove();
    saveOdinData();
  });

  actionCell.appendChild(removeButton);
  row.appendChild(actionCell);

  vehicleRows.appendChild(row);

  return row;
}

// Tilføj et køretøj.
addVehicleButton.addEventListener("click", () => {
  addVehicleRow();
  saveOdinData();
});

/* =========================
   Gem data
   ========================= */

function saveOdinData() {
  const data = {
    firstMessage: getValue("first-message"),
    alarmTime: getValue("alarm-time"),
    caller: getValue("caller"),
    callerPhone: getValue("caller-phone"),
    address: getValue("address"),
    incidentCourse: getValue("incident-course"),

    vehicles: Array.from(vehicleRows.querySelectorAll("tr")).map((row) =>
      Array.from(row.querySelectorAll("input")).map((input) => input.value),
    ),
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error("Kunne ikke gemme Odin-data:", error);
  }
}

/* =========================
   Indlæs gemte data
   ========================= */

function loadOdinData() {
  let data = null;

  try {
    const savedData = localStorage.getItem(storageKey);
    data = savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error("Kunne ikke indlæse Odin-data:", error);
  }

  if (data && typeof data === "object") {
    document.getElementById("first-message").value = data.firstMessage || "";

    document.getElementById("alarm-time").value = data.alarmTime || "";

    document.getElementById("caller").value = data.caller || "";

    document.getElementById("caller-phone").value = data.callerPhone || "";

    document.getElementById("address").value = data.address || "";

    document.getElementById("incident-course").value =
      data.incidentCourse || "";

    // Genskab de gemte køretøjer.
    if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
      data.vehicles.forEach((vehicle) => {
        addVehicleRow(Array.isArray(vehicle) ? vehicle : []);
      });
    } else {
      addVehicleRow();
    }
  } else {
    // Opret en tom række, hvis der ikke findes gemte data.
    addVehicleRow();
  }
}

/* =========================
   Automatisk lagring
   ========================= */

// Gem, når brugeren skriver eller ændrer et felt.
form.addEventListener("input", saveOdinData);
form.addEventListener("change", saveOdinData);

/* =========================
   Ryd alt indhold
   ========================= */

clearButton.addEventListener("click", () => {
  const confirmed = confirm(
    "Er du sikker på, at du vil rydde alle oplysninger og køretøjer? Dette kan ikke fortrydes.",
  );

  if (!confirmed) {
    return;
  }

  // Ryd hændelsesoplysningerne.
  form.reset();

  // Fjern alle køretøjsrækker.
  vehicleRows.replaceChildren();

  // Opret én ny, tom køretøjsrække.
  addVehicleRow();

  // Gem den tomme rapport.
  saveOdinData();
});

/* =========================
   Dansk datoformat
   ========================= */

function formatDanishDateTime(value) {
  if (!value) {
    return "-";
  }

  const parts = value.split("T");

  if (parts.length !== 2) {
    return value;
  }

  const [year, month, day] = parts[0].split("-");
  const time = parts[1];

  return `${day}-${month}-${year} kl. ${time}`;
}

/* =========================
   PDF-hjælpefunktion
   ========================= */

function drawInfoBox(pdf, label, value, x, y, width) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(label, x, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const lines = pdf.splitTextToSize(value || "-", width - 4);

  pdf.text(lines, x, y + 6);

  return Math.max(12, lines.length * 5 + 8);
}

/* =========================
   Download A3-PDF
   ========================= */

downloadButton.addEventListener("click", () => {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert(
      "PDF-biblioteket kunne ikke indlæses. Kontrollér internetforbindelsen.",
    );
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Titel.
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("ODIN - HÆNDELSESRAPPORT", margin, 18);

  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.7);
  pdf.line(margin, 23, pageWidth - margin, 23);

  // Hændelsesoplysninger i to kolonner.
  const columnGap = 12;
  const columnWidth = (contentWidth - columnGap) / 2;

  const leftX = margin;
  const rightX = margin + columnWidth + columnGap;

  drawInfoBox(
    pdf,
    "Førstemelding",
    getValue("first-message"),
    leftX,
    32,
    columnWidth,
  );

  drawInfoBox(
    pdf,
    "Alarm modtaget",
    formatDanishDateTime(getValue("alarm-time")),
    rightX,
    32,
    columnWidth,
  );

  drawInfoBox(pdf, "Anmelder", getValue("caller"), leftX, 52, columnWidth);

  drawInfoBox(
    pdf,
    "Anmelder telefon",
    getValue("caller-phone"),
    rightX,
    52,
    columnWidth,
  );

  drawInfoBox(pdf, "Adresse", getValue("address"), leftX, 72, contentWidth);

  // Stort felt til hændelsesforløb.
  const courseTop = 91;
  const tableTop = 224;
  const courseBottom = tableTop - 8;
  const courseHeight = courseBottom - courseTop;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Hændelsesforløb", margin, courseTop);

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.3);

  pdf.rect(margin, courseTop + 4, contentWidth, courseHeight - 4);

  const course = getValue("incident-course") || "-";
  const textX = margin + 4;
  const textY = courseTop + 12;
  const textWidth = contentWidth - 8;
  const availableTextHeight = courseHeight - 16;

  // Tilpas skriftstørrelsen efter mængden af tekst.
  let fontSize = 11;
  let courseLines = [];

  while (fontSize > 6) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(fontSize);

    courseLines = pdf.splitTextToSize(course, textWidth);

    const lineHeight = fontSize * 0.42;

    if (courseLines.length * lineHeight <= availableTextHeight) {
      break;
    }

    fontSize -= 0.5;
  }

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(fontSize);

  pdf.text(courseLines, textX, textY, {
    lineHeightFactor: 1.25,
  });

  // Hent alle køretøjer og deres tidspunkter.
  const rows = Array.from(vehicleRows.querySelectorAll("tr")).map((row) => {
    const inputs = Array.from(row.querySelectorAll("input"));

    return inputs.map((input, index) => {
      const value = input.value.trim();

      if (!value) {
        return "-";
      }

      // Første kolonne indeholder køretøjets navn.
      if (index === 0) {
        return value;
      }

      return formatDanishDateTime(value);
    });
  });

  // Køretøjstabel ved bunden af A3-siden.
  pdf.autoTable({
    startY: tableTop,

    head: [["Køretøj", "Disponeret", "Afgang", "Ankomst", "Fri", "Hjem"]],

    body: rows,

    theme: "grid",

    margin: {
      left: margin,
      right: margin,
      bottom: 10,
    },

    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
      valign: "middle",
    },

    headStyles: {
      fontStyle: "bold",
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
    },

    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: "auto" },
      2: { cellWidth: "auto" },
      3: { cellWidth: "auto" },
      4: { cellWidth: "auto" },
      5: { cellWidth: "auto" },
    },

    rowPageBreak: "avoid",
  });

  pdf.save("Odin-haendelsesrapport.pdf");
});

/* =========================
   Start Odin
   ========================= */

// Indlæs gemte oplysninger, når siden åbnes.
loadOdinData();
