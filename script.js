const searchInput = document.getElementById("searchInput");
const domainFilter = document.getElementById("domainFilter");
const modeFilter = document.getElementById("modeFilter");

const internshipList = document.getElementById("internshipList");
const resultCount = document.getElementById("resultCount");

const statusMessage = document.getElementById("statusMessage");
const retryButton = document.getElementById("retryButton");

const detailsDialog = document.getElementById("detailsDialog");
const closeDialog = document.getElementById("closeDialog");
const dialogContent = document.getElementById("dialogContent");

const applicationDialog = document.getElementById("applicationDialog");
const closeApplicationDialog =
    document.getElementById("closeApplicationDialog");

const applicationForm = document.getElementById("applicationForm");
const applicationRole = document.getElementById("applicationRole");
const applicationMessage = document.getElementById("applicationMessage");

let internships = [];
let selectedInternship = null;


/* =========================
   LOAD DATA
========================= */

async function loadInternships() {

    showLoading();

    try {

        const response = await fetch("internships.json");

        if (!response.ok) {
            throw new Error("Unable to load internship data.");
        }

        const data = await response.json();

        if (!data.internships || !Array.isArray(data.internships)) {
            throw new Error("Invalid internship data.");
        }

        internships = data.internships;

        createDomainOptions();

        renderInternships(internships);

        statusMessage.textContent =
            "Internships loaded successfully.";

        retryButton.classList.add("hidden");

    } catch (error) {

        console.error(error);

        statusMessage.textContent =
            "Sorry, internship data could not be loaded.";

        retryButton.classList.remove("hidden");

        internshipList.innerHTML = "";
        resultCount.textContent = "0 internships";
    }
}


/* =========================
   LOADING STATE
========================= */

function showLoading() {

    statusMessage.textContent = "Loading internships...";

    retryButton.classList.add("hidden");

    internshipList.innerHTML = `
        <div class="empty-state">
            <h3>Loading...</h3>
            <p>Please wait while internships are loaded.</p>
        </div>
    `;
}


/* =========================
   DOMAIN OPTIONS
========================= */

function createDomainOptions() {

    const domains = [
        ...new Set(internships.map(internship => internship.domain))
    ];

    domainFilter.innerHTML =
        `<option value="all">All domains</option>`;

    domains.forEach(domain => {

        const option = document.createElement("option");

        option.value = domain;
        option.textContent = domain;

        domainFilter.appendChild(option);
    });
}


/* =========================
   RENDER INTERNSHIPS
========================= */

function renderInternships(list) {

    internshipList.innerHTML = "";

    resultCount.textContent =
        `${list.length} ${list.length === 1 ? "internship" : "internships"}`;


    if (list.length === 0) {

        internshipList.innerHTML = `
            <div class="empty-state">
                <h3>No internships found</h3>
                <p>
                    Try changing your search or filter options.
                </p>
            </div>
        `;

        return;
    }


    list.forEach(internship => {

        const card = document.createElement("article");

        card.className = "internship-card";

        card.innerHTML = `
            <span class="card-id">${escapeHTML(internship.id)}</span>

            <h3>${escapeHTML(internship.title)}</h3>

            <p class="card-domain">
                ${escapeHTML(internship.domain)}
            </p>

            <div class="card-info">

                <span class="badge">
                    ${escapeHTML(internship.mode)}
                </span>

                <span class="badge">
                    ${escapeHTML(internship.location)}
                </span>

                <span class="badge">
                    ${internship.openings} opening${internship.openings === 1 ? "" : "s"}
                </span>

            </div>

            <div class="skills">

                ${internship.skills
                    .map(skill =>
                        `<span class="skill">${escapeHTML(skill)}</span>`
                    )
                    .join("")
                }

            </div>

            <div class="card-actions">

                <button
                    class="secondary-button details-button"
                    type="button"
                    data-id="${escapeHTML(internship.id)}"
                >
                    View Details
                </button>

                <button
                    class="primary-button apply-button"
                    type="button"
                    data-id="${escapeHTML(internship.id)}"
                >
                    Apply Now
                </button>

            </div>
        `;

        internshipList.appendChild(card);
    });
}


/* =========================
   FILTERING
========================= */

function filterInternships() {

    const searchText =
        searchInput.value.trim().toLowerCase();

    const selectedDomain =
        domainFilter.value;

    const selectedMode =
        modeFilter.value;


    const filtered = internships.filter(internship => {

        const searchableText = [
            internship.title,
            internship.domain,
            internship.location,
            ...internship.skills
        ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
            searchableText.includes(searchText);


        const matchesDomain =
            selectedDomain === "all" ||
            internship.domain === selectedDomain;


        const matchesMode =
            selectedMode === "all" ||
            internship.mode === selectedMode;


        return (
            matchesSearch &&
            matchesDomain &&
            matchesMode
        );
    });


    renderInternships(filtered);

    statusMessage.textContent =
        filtered.length === 0
            ? "No matching internships."
            : "Showing matching internships.";
}


/* =========================
   VIEW DETAILS
========================= */

function openDetails(id) {

    const internship =
        internships.find(item => item.id === id);

    if (!internship) {
        return;
    }


    dialogContent.innerHTML = `

        <p class="card-id">${escapeHTML(internship.id)}</p>

        <h2>${escapeHTML(internship.title)}</h2>

        <p>
            <strong>Domain:</strong>
            ${escapeHTML(internship.domain)}
        </p>

        <p>
            <strong>Work Mode:</strong>
            ${escapeHTML(internship.mode)}
        </p>

        <p>
            <strong>Location:</strong>
            ${escapeHTML(internship.location)}
        </p>

        <p>
            <strong>Openings:</strong>
            ${internship.openings}
        </p>

        <h3>Required Skills</h3>

        <ul>
            ${internship.skills
                .map(skill =>
                    `<li>${escapeHTML(skill)}</li>`
                )
                .join("")
            }
        </ul>

        <button
            class="primary-button"
            type="button"
            id="dialogApplyButton"
        >
            Apply Now
        </button>
    `;


    detailsDialog.showModal();


    document
        .getElementById("dialogApplyButton")
        .addEventListener("click", () => {

            detailsDialog.close();

            openApplication(id);
        });
}


/* =========================
   APPLICATION
========================= */

function openApplication(id) {

    selectedInternship =
        internships.find(item => item.id === id);

    if (!selectedInternship) {
        return;
    }


    applicationRole.textContent =
        `Applying for: ${selectedInternship.title}`;


    applicationMessage.textContent = "";

    applicationForm.reset();

    applicationDialog.showModal();

    document
        .getElementById("applicantName")
        .focus();
}


/* =========================
   APPLICATION SUBMIT
========================= */

applicationForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("applicantName").value.trim();

    const email =
        document.getElementById("applicantEmail").value.trim();

    const message =
        document.getElementById("applicantMessage").value.trim();


    if (!name || !email || !message) {

        applicationMessage.textContent =
            "Please complete all required fields.";

        return;
    }


    applicationMessage.textContent =
        `Thank you, ${name}! Your application for ${selectedInternship.title} has been recorded for this demo.`;

    applicationForm.reset();
});


/* =========================
   CLOSE DIALOGS
========================= */

closeDialog.addEventListener("click", () => {
    detailsDialog.close();
});


closeApplicationDialog.addEventListener("click", () => {
    applicationDialog.close();
});


detailsDialog.addEventListener("click", event => {

    if (event.target === detailsDialog) {
        detailsDialog.close();
    }
});


applicationDialog.addEventListener("click", event => {

    if (event.target === applicationDialog) {
        applicationDialog.close();
    }
});


/* =========================
   CARD BUTTON EVENTS
========================= */

internshipList.addEventListener("click", event => {

    const detailsButton =
        event.target.closest(".details-button");

    const applyButton =
        event.target.closest(".apply-button");


    if (detailsButton) {

        openDetails(detailsButton.dataset.id);

        return;
    }


    if (applyButton) {

        openApplication(applyButton.dataset.id);
    }
});


/* =========================
   FILTER EVENTS
========================= */

searchInput.addEventListener(
    "input",
    filterInternships
);

domainFilter.addEventListener(
    "change",
    filterInternships
);

modeFilter.addEventListener(
    "change",
    filterInternships
);


/* =========================
   RETRY
========================= */

retryButton.addEventListener(
    "click",
    loadInternships
);


/* =========================
   SECURITY HELPER
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   START APP
========================= */

loadInternships();