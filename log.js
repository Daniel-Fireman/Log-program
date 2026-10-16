const form = document.getElementById("incident-form");
const titleInput = document.getElementById("incident-title");
const messageInput = document.getElementById("incident-message");
const incidentList = document.getElementById("incident-list");
const emptyMessage = document.getElementById("empty-message");

let incidents = JSON.parse(localStorage.getItem("incidents")) || [];

function saveIncidents() {
  localStorage.setItem("incidents", JSON.stringify(incidents));
}

function displayIncidents() {
  document.querySelectorAll(".incident").forEach((incident) => {
    incident.remove();
  });

  emptyMessage.hidden = incidents.length > 0;

  incidents.forEach((incident, index) => {
    // Support incidents created before comments were added.
    if (!incident.comments) {
      incident.comments = [];
    }

    const article = document.createElement("article");
    article.className = "incident";

    // Incident title.
    const heading = document.createElement("h3");
    heading.textContent = incident.title;

    // Incident message.
    const message = document.createElement("p");
    message.textContent = incident.message;

    const date = document.createElement("small");
    date.textContent = incident.date || "";

    // Container for the incident action buttons.
    const incidentActions = document.createElement("div");
    incidentActions.className = "incident-actions";

    // Delete incident button.
    const deleteIncidentButton = document.createElement("button");
    deleteIncidentButton.type = "button";
    deleteIncidentButton.className = "delete-button";
    deleteIncidentButton.textContent = "Delete";
    deleteIncidentButton.setAttribute(
      "aria-label",
      `Delete incident: ${incident.title}`,
    );

    deleteIncidentButton.addEventListener("click", function () {
      if (
        confirm(
          `Are you sure you want to delete "${incident.title}" and all its comments?`,
        )
      ) {
        incidents.splice(index, 1);
        saveIncidents();
        displayIncidents();
      }
    });

    incidentActions.appendChild(deleteIncidentButton);

    // Comment section.
    const commentSection = document.createElement("div");
    commentSection.className = "comment-section";

    // Small plus button.
    const addCommentButton = document.createElement("button");
    addCommentButton.type = "button";
    addCommentButton.className = "add-comment-button";
    addCommentButton.textContent = "+";
    addCommentButton.title = "Add comment";
    addCommentButton.setAttribute("aria-label", "Add comment");

    // Comment form, hidden by default.
    const commentForm = document.createElement("form");
    commentForm.className = "comment-form";
    commentForm.hidden = true;

    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Comment title";

    const commentTitle = document.createElement("input");
    commentTitle.type = "text";
    commentTitle.placeholder = "Enter comment title";
    commentTitle.required = true;

    titleLabel.appendChild(commentTitle);

    const messageLabel = document.createElement("label");
    messageLabel.textContent = "Comment message";

    const commentMessage = document.createElement("textarea");
    commentMessage.placeholder = "Write your comment...";
    commentMessage.rows = 3;
    commentMessage.required = true;

    messageLabel.appendChild(commentMessage);

    const saveCommentButton = document.createElement("button");
    saveCommentButton.type = "submit";
    saveCommentButton.textContent = "Save comment";

    commentForm.append(titleLabel, messageLabel, saveCommentButton);

    // Toggle the comment form.
    addCommentButton.addEventListener("click", function () {
      commentForm.hidden = !commentForm.hidden;

      if (!commentForm.hidden) {
        commentTitle.focus();
      }
    });

    // Save new comments at the beginning of the array.
    commentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const title = commentTitle.value.trim();
      const text = commentMessage.value.trim();

      if (!title || !text) {
        return;
      }

      incidents[index].comments.unshift({
        title: title,
        message: text,
        date: new Date().toLocaleString(),
      });

      saveIncidents();
      displayIncidents();
    });

    // Display comments, newest first.
    const commentsContainer = document.createElement("div");
    commentsContainer.className = "comments-container";

    incident.comments.forEach((comment, commentIndex) => {
      const commentArticle = document.createElement("div");
      commentArticle.className = "incident-comment";

      const commentHeading = document.createElement("h4");
      commentHeading.textContent = comment.title;

      const commentText = document.createElement("p");
      commentText.textContent = comment.message;

      const commentDate = document.createElement("small");
      commentDate.textContent = comment.date || "";

      // Delete comment button.
      const deleteCommentButton = document.createElement("button");
      deleteCommentButton.type = "button";
      deleteCommentButton.className = "delete-button";
      deleteCommentButton.textContent = "Delete";
      deleteCommentButton.setAttribute(
        "aria-label",
        `Delete comment: ${comment.title}`,
      );

      deleteCommentButton.addEventListener("click", function () {
        if (
          confirm(
            `Are you sure you want to delete the comment "${comment.title}"?`,
          )
        ) {
          incidents[index].comments.splice(commentIndex, 1);
          saveIncidents();
          displayIncidents();
        }
      });

      const commentHeader = document.createElement("div");
      commentHeader.className = "comment-header";
      commentHeader.append(commentHeading, deleteCommentButton);

      commentArticle.append(commentHeader, commentText, commentDate);

      commentsContainer.appendChild(commentArticle);
    });

    commentSection.append(commentForm, commentsContainer);

    // Assemble the incident.
    article.append(
      heading,
      message,
      date,
      commentSection,
      incidentActions,
      addCommentButton,
    );

    incidentList.appendChild(article);
  });
}

// Add a new incident.
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const message = messageInput.value.trim();

  if (!title || !message) {
    return;
  }

  incidents.unshift({
    title: title,
    message: message,
    date: new Date().toLocaleString(),
    comments: [],
  });

  saveIncidents();
  displayIncidents();
  form.reset();
});

displayIncidents();
