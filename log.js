const form = document.getElementById("incident-form");
const incidentList = document.getElementById("incident-list");
const emptyMessage = document.getElementById("empty-message");

const fields = [
  { key: "firstMessage", label: "Førstemelding", multiline: true },
  { key: "address", label: "Adresse", multiline: false },
  { key: "phone", label: "Anmelder tlf.", multiline: false },
  { key: "vehicles", label: "Køretøjer", multiline: true },
  { key: "comment", label: "Kommentar", multiline: true },
];

const inputElements = {
  firstMessage: document.getElementById("incident-first-message"),
  address: document.getElementById("incident-address"),
  phone: document.getElementById("incident-phone"),
  vehicles: document.getElementById("incident-vehicles"),
  comment: document.getElementById("incident-comment"),
};

// Load saved incidents.
let incidents = [];

try {
  const savedData = JSON.parse(localStorage.getItem("incidents") || "[]");
  incidents = Array.isArray(savedData) ? savedData : [];
} catch (error) {
  console.error("Kunne ikke indlæse incidents:", error);
}

// Preserve data from previous versions.
incidents.forEach((incident) => {
  if (!incident.firstMessage && incident.message) {
    incident.firstMessage = incident.message;
  }

  if (!Array.isArray(incident.comments)) {
    incident.comments = [];
  }

  incident.comments.forEach((comment) => {
    if (typeof comment.title !== "string") {
      comment.title = "";
    }

    if (typeof comment.message !== "string") {
      comment.message = "";
    }
  });
});

function saveIncidents() {
  localStorage.setItem("incidents", JSON.stringify(incidents));
}

// Create icon buttons.
function createIconButton(icon, label, className, callback) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = className;
  button.textContent = icon;
  button.title = label;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", callback);

  return button;
}

// Create a labeled input or textarea.
function createTextField(labelText, value = "", multiline = false) {
  const label = document.createElement("label");
  label.appendChild(document.createTextNode(labelText));

  const input = document.createElement(multiline ? "textarea" : "input");

  if (multiline) {
    input.rows = 3;
  } else {
    input.type = "text";
  }

  input.value = value || "";
  label.appendChild(input);

  return { label, input };
}

// Create save and cancel buttons.
function createEditActions(onCancel) {
  const actions = document.createElement("div");
  actions.className = "edit-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.textContent = "Gem ændringer";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "cancel-button";
  cancelButton.textContent = "Annuller";
  cancelButton.addEventListener("click", onCancel);

  actions.append(saveButton, cancelButton);

  return actions;
}

/* =========================
   Edit an incident
   ========================= */

function createIncidentEditForm(incident, article) {
  const editForm = document.createElement("form");
  editForm.className = "edit-form";

  const editInputs = {};

  fields.forEach((field) => {
    const { label, input } = createTextField(
      field.label,
      incident[field.key],
      field.multiline,
    );

    editInputs[field.key] = input;
    editForm.appendChild(label);
  });

  editForm.appendChild(createEditActions(displayIncidents));

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();

    fields.forEach((field) => {
      incident[field.key] = editInputs[field.key].value.trim();
    });

    saveIncidents();
    displayIncidents();
  });

  article.appendChild(editForm);
}

/* =========================
   Edit a comment
   ========================= */

function createCommentEditForm(comment) {
  const editForm = document.createElement("form");
  editForm.className = "edit-form comment-edit-form";

  const titleField = createTextField("Kommentaroverskrift", comment.title);

  const messageField = createTextField("Kommentar", comment.message, true);

  editForm.append(titleField.label, messageField.label);
  editForm.appendChild(createEditActions(displayIncidents));

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleField.input.value.trim();
    const message = messageField.input.value.trim();

    if (!title && !message) {
      alert("Udfyld mindst et af kommentarfelterne.");
      return;
    }

    comment.title = title;
    comment.message = message;

    saveIncidents();
    displayIncidents();
  });

  return editForm;
}

/* =========================
   Display all incidents
   ========================= */

function displayIncidents() {
  // Remove previously rendered incidents.
  document.querySelectorAll(".incident").forEach((element) => {
    element.remove();
  });

  emptyMessage.hidden = incidents.length > 0;

  incidents.forEach((incident, index) => {
    if (!Array.isArray(incident.comments)) {
      incident.comments = [];
    }

    const article = document.createElement("article");
    article.className = "incident";

    /* Incident header */

    const incidentHeader = document.createElement("div");
    incidentHeader.className = "incident-header";

    incidentHeader.style.display = "flex";
    incidentHeader.style.flexDirection = "row";
    incidentHeader.style.alignItems = "center";
    incidentHeader.style.justifyContent = "space-between";
    incidentHeader.style.width = "100%";
    incidentHeader.style.gap = "12px";
    incidentHeader.style.margin = "0 0 20px";

    const heading = document.createElement("h3");

    heading.textContent = "Hændelse";
    heading.style.display = "block";
    heading.style.flex = "1 1 auto";
    heading.style.minWidth = "0";
    heading.style.margin = "0";

    const actions = document.createElement("div");
    actions.className = "incident-actions";

    actions.style.display = "flex";
    actions.style.flexDirection = "row";
    actions.style.alignItems = "center";
    actions.style.justifyContent = "flex-end";
    actions.style.flexShrink = "0";
    actions.style.gap = "6px";
    actions.style.position = "static";
    actions.style.margin = "0";

    const editButton = createIconButton(
      "✎",
      "Rediger incident",
      "icon-button edit-button",
      () => {
        content.hidden = true;
        commentSection.hidden = true;
        incidentHeader.hidden = true;

        createIncidentEditForm(incident, article);
      },
    );

    const deleteButton = createIconButton(
      "🗑",
      "Slet incident",
      "icon-button delete-button",
      () => {
        if (confirm("Vil du slette denne incident og alle dens kommentarer?")) {
          incidents.splice(index, 1);
          saveIncidents();
          displayIncidents();
        }
      },
    );

    actions.append(editButton, deleteButton);
    incidentHeader.append(heading, actions);

    /* Incident information */

    const content = document.createElement("div");
    content.className = "incident-content";

    fields.forEach((field) => {
      const value = incident[field.key];

      // Hide empty fields.
      if (typeof value !== "string" || !value.trim()) {
        return;
      }

      const fieldContainer = document.createElement("div");
      fieldContainer.className = "incident-field";

      const label = document.createElement("strong");
      label.textContent = field.label;

      const text = document.createElement("p");
      text.textContent = value;

      fieldContainer.append(label, text);
      content.appendChild(fieldContainer);
    });

    const date = document.createElement("small");
    date.className = "incident-date";
    date.textContent = incident.date || "";

    content.appendChild(date);

    /* Comment section */

    const commentSection = document.createElement("div");
    commentSection.className = "comment-section";

    const commentHeading = document.createElement("h4");
    commentHeading.textContent = "Kommentarer";

    const commentForm = document.createElement("form");
    commentForm.className = "comment-form";
    commentForm.hidden = true;

    const commentTitleField = createTextField("Kommentaroverskrift");
    const commentMessageField = createTextField("Kommentar", "", true);

    const addCommentButton = createIconButton(
      "+",
      "Tilføj kommentar",
      "add-comment-button",
      () => {
        commentForm.hidden = !commentForm.hidden;

        if (!commentForm.hidden) {
          commentTitleField.input.focus();
        }
      },
    );

    const saveCommentButton = document.createElement("button");
    saveCommentButton.type = "submit";
    saveCommentButton.textContent = "Tilføj kommentar";

    commentForm.append(
      commentTitleField.label,
      commentMessageField.label,
      saveCommentButton,
    );

    commentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const title = commentTitleField.input.value.trim();
      const message = commentMessageField.input.value.trim();

      if (!title && !message) {
        alert("Udfyld mindst et af kommentarfelterne.");
        return;
      }

      incidents[index].comments.unshift({
        title,
        message,
        date: new Date().toLocaleString(),
      });

      saveIncidents();
      displayIncidents();
    });

    commentSection.append(commentHeading, addCommentButton, commentForm);

    /* Existing comments */

    incident.comments.forEach((comment, commentIndex) => {
      const commentArticle = document.createElement("div");
      commentArticle.className = "incident-comment";

      // The comment title and buttons share one row.
      const commentHeader = document.createElement("div");
      commentHeader.className = "comment-header";

      const commentTitle = document.createElement("strong");
      commentTitle.className = "comment-title";
      commentTitle.textContent = comment.title?.trim() || "Kommentar";

      const commentActions = document.createElement("div");
      commentActions.className = "comment-actions";

      const commentContent = document.createElement("div");
      commentContent.className = "comment-content";

      const editCommentButton = createIconButton(
        "✎",
        "Rediger kommentar",
        "icon-button edit-button",
        () => {
          commentHeader.hidden = true;
          commentContent.hidden = true;

          commentArticle.appendChild(createCommentEditForm(comment));
        },
      );

      const deleteCommentButton = createIconButton(
        "🗑",
        "Slet kommentar",
        "icon-button delete-button",
        () => {
          if (confirm("Vil du slette denne kommentar?")) {
            incidents[index].comments.splice(commentIndex, 1);
            saveIncidents();
            displayIncidents();
          }
        },
      );

      commentActions.append(editCommentButton, deleteCommentButton);

      // Keep the title and actions together in the header.
      commentHeader.append(commentTitle, commentActions);

      // The message and date go underneath the header.
      if (comment.message?.trim()) {
        const message = document.createElement("p");
        message.textContent = comment.message;
        commentContent.appendChild(message);
      }

      const commentDate = document.createElement("small");
      commentDate.textContent = comment.date || "";
      commentContent.appendChild(commentDate);

      commentArticle.append(commentHeader, commentContent);
      commentSection.appendChild(commentArticle);
    });

    /* Final incident structure */

    article.append(incidentHeader, content, commentSection);
    incidentList.appendChild(article);
  });
}

/* =========================
   Create a new incident
   ========================= */

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const incident = {
    date: new Date().toLocaleString(),
    comments: [],
  };

  fields.forEach((field) => {
    incident[field.key] = inputElements[field.key].value.trim();
  });

  const hasContent = fields.some((field) => incident[field.key] !== "");

  if (!hasContent) {
    alert("Udfyld mindst ét felt for at oprette en incident.");
    return;
  }

  incidents.unshift(incident);

  saveIncidents();
  displayIncidents();
  form.reset();
});

/* Initial setup */

displayIncidents();
