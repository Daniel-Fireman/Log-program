const vehicleRows = document.getElementById("vehicle-rows");
const addVehicleButton = document.getElementById("add-vehicle");
const downloadButton = document.getElementById("download-pdf");

// Opret en ny køretøjsrække.
function addVehicleRow() {
  const row = document.createElement("tr");

  const fields = [
    { type: "text", label: "Køretøj" },
    { type: "datetime-local", label: "Disponeret" },
    { type: "datetime-local", label: "Afgang" },
    { type: "datetime-local", label: "Ankomst" },
    { type: "datetime-local", label: "Fri" },
    { type: "datetime-local", label: "Hjem" },
  ];

  fields.forEach((field) => {
    const cell = document.createElement("td");
    const input = document.createElement("input");

    input.type = field.type;
    input.className = "vehicle-input";
    input.setAttribute("aria-label", field.label);

    if (field.type === "text") {
      input.placeholder = field.label;
    }

    cell.appendChild(input);
    row.appendChild(cell);
  });

  const actionCell = document.createElement("td");
  actionCell.className = "no-pdf";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Slet";
  removeButton.className = "remove-vehicle";

  removeButton.addEventListener("click", () => {
    row.remove();
  });

  actionCell.appendChild(removeButton);
  row.appendChild(actionCell);

  vehicleRows.appendChild(row);
}

addVehicleButton.addEventListener("click", addVehicleRow);

// Start med én tom køretøjsrække.
addVehicleRow();

function getValue(id) {
  return document.getElementById(id).value.trim();
}

// Konverterer dato og tid til dansk format.
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

// Tegner et felt med label og værdi i PDF'en.
function drawField(pdf, label, value, x, y, width) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(label, x, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const lines = pdf.splitTextToSize(value || "-", width - 4);
  pdf.text(lines, x, y + 6);

  return lines.length;
}

// Download rapporten som en A3-PDF.
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
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Titel øverst.
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

  function drawInfoBox(label, value, x, y, width) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(label, x, y);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const lines = pdf.splitTextToSize(value || "-", width - 4);
    pdf.text(lines, x, y + 6);

    return Math.max(12, lines.length * 5 + 8);
  }

  // Første række med oplysninger.
  drawInfoBox(
    "Førstemelding",
    getValue("first-message"),
    leftX,
    32,
    columnWidth,
  );

  drawInfoBox(
    "Alarm modtaget",
    formatDanishDateTime(getValue("alarm-time")),
    rightX,
    32,
    columnWidth,
  );

  // Anden række.
  drawInfoBox("Anmelder", getValue("caller"), leftX, 52, columnWidth);

  drawInfoBox(
    "Anmelder telefon",
    getValue("caller-phone"),
    rightX,
    52,
    columnWidth,
  );

  // Adresse på sin egen række.
  drawInfoBox("Adresse", getValue("address"), leftX, 72, contentWidth);

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

  // Tilpas skriftstørrelsen, så teksten udnytter feltet.
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

  // Køretøjstabel ved bunden af A3-siden.
  const rows = Array.from(vehicleRows.querySelectorAll("tr")).map((row) => {
    const inputs = Array.from(row.querySelectorAll("input"));

    return inputs.map((input, index) => {
      const value = input.value.trim();

      if (!value) {
        return "-";
      }

      // Første felt er køretøjets navn.
      if (index === 0) {
        return value;
      }

      return formatDanishDateTime(value);
    });
  });

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

  // Download.
  pdf.save("Odin-haendelsesrapport.pdf");
});
