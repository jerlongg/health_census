const addPatientButton = document.getElementById("addPatient");
const report = document.getElementById("report");
const btnSearch = document.getElementById("btnSearch");
const conditionInput = document.getElementById("conditionInput");
const result = document.getElementById("result");
const formError = document.getElementById("formError");

const patients = [];
const CONDITIONS = ["Diabetes", "Thyroid", "High Blood Pressure"];
const GENDERS = ["Male", "Female"];

function getSelectedGender() {
    const checked = document.querySelector('input[name="gender"]:checked');
    return checked ? checked.value : "";
}

function showFormError(message) {
    if (formError) {
        formError.textContent = message;
    }
}

function clearFormError() {
    if (formError) {
        formError.textContent = "";
    }
}

function addPatient() {
    const name = document.getElementById("name").value.trim();
    const gender = getSelectedGender();
    const age = document.getElementById("age").value.trim();
    const condition = document.getElementById("condition").value;

    if (!name || !gender || !age || !condition) {
        showFormError("Please fill in name, gender, age and condition.");
        return;
    }

    const ageNumber = Number(age);
    if (!Number.isFinite(ageNumber) || ageNumber < 1 || ageNumber > 120) {
        showFormError("Please enter a valid age between 1 and 120.");
        return;
    }

    patients.push({ name, gender, age: ageNumber, condition });
    clearFormError();
    resetForm();
    generateReport();
}

function resetForm() {
    document.getElementById("name").value = "";
    const checkedGender = document.querySelector('input[name="gender"]:checked');
    if (checkedGender) {
        checkedGender.checked = false;
    }
    document.getElementById("age").value = "";
    document.getElementById("condition").value = "";
}

function emptyCounts() {
    const counts = {};
    for (const condition of CONDITIONS) {
        counts[condition] = 0;
    }
    return counts;
}

function bump(counts, key) {
    counts[key] = (counts[key] || 0) + 1;
}

// function for generating report
function generateReport() {
    if (patients.length === 0) {
        report.innerHTML = "<p>No patients added yet.</p>";
        return;
    }

    const conditionsCount = emptyCounts();
    const genderConditionsCount = {};
    for (const gender of GENDERS) {
        genderConditionsCount[gender] = emptyCounts();
    }

    for (const patient of patients) {
        bump(conditionsCount, patient.condition);
        if (genderConditionsCount[patient.gender]) {
            bump(genderConditionsCount[patient.gender], patient.condition);
        }
    }

    let html = `Number of patients: ${patients.length}<br><br>`;
    html += `Conditions Breakdown:<br>`;
    for (const condition of Object.keys(conditionsCount)) {
        html += `${condition}: ${conditionsCount[condition]}<br>`;
    }

    html += `<br>Gender-Based Conditions:<br>`;
    for (const gender of Object.keys(genderConditionsCount)) {
        html += `${gender}:<br>`;
        for (const condition of Object.keys(genderConditionsCount[gender])) {
            html += `&nbsp;&nbsp;${condition}: ${genderConditionsCount[gender][condition]}<br>`;
        }
    }

    report.innerHTML = html;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function imageSource(condition) {
    const src = condition.imagesrc || "";
    return src.startsWith("./") || src.startsWith("/") ? src : `./img/${src}`;
}

async function searchCondition() {
    const query = conditionInput.value.trim().toLowerCase();
    result.innerHTML = "";

    if (!query) {
        result.innerHTML = "<p>Please enter a health condition.</p>";
        return;
    }

    try {
        const response = await fetch("./health_analysis.json");
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const condition = data.conditions.find(
            (item) =>
                item.name.toLowerCase() === query ||
                item.name.toLowerCase().includes(query)
        );

        if (!condition) {
            result.innerHTML = `<p>No information found for "${escapeHtml(
                conditionInput.value.trim()
            )}".</p>`;
            return;
        }

        const symptoms = condition.symptoms.map((item) => `<li>${item}</li>`).join("");
        const prevention = condition.prevention.map((item) => `<li>${item}</li>`).join("");

        result.innerHTML = `
            <h3>${condition.name}</h3>
            <img src="${imageSource(condition)}" alt="${condition.name}" width="200">
            <h4>Symptoms</h4>
            <ul>${symptoms}</ul>
            <h4>Prevention</h4>
            <ul>${prevention}</ul>
            <h4>Treatment</h4>
            <p>${condition.treatment}</p>
        `;
    } catch (error) {
        console.error("Error:", error);
        result.innerHTML =
            "<p>Unable to load condition data. If you opened this file directly, serve the folder with a local web server (for example: <code>python3 -m http.server</code>).</p>";
    }
}

addPatientButton.addEventListener("click", addPatient);
btnSearch.addEventListener("click", searchCondition);
conditionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchCondition();
    }
});

generateReport();
