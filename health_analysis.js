const addPatientButton = document.getElementById("addPatient");
const report = document.getElementById("report");
const btnSearch = document.getElementById("btnSearch");
const conditionInput = document.getElementById("conditionInput");
const result = document.getElementById("result");
const patients = [];

function addPatient() {
    const name = document.getElementById("name").value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const age = document.getElementById("age").value;
    const condition = document.getElementById("condition").value;

    const isValid = name && gender && age && condition;
    if (!isValid) {
        return;
    }

    patients.push({ name, gender, age, condition });
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

function generateReport() {
    const numPatients = patients.length;
    const conditionsCount = {
        Diabetes: 0,
        Thyroid: 0,
        "High Blood Pressure": 0,
    };
    const genderConditionsCount = {
        Male: {
            Diabetes: 0,
            Thyroid: 0,
            "High Blood Pressure": 0,
        },
        Female: {
            Diabetes: 0,
            Thyroid: 0,
            "High Blood Pressure": 0,
        },
    };

    for (const patient of patients) {
        conditionsCount[patient.condition] =
            (conditionsCount[patient.condition] ?? 0) + 1;
        const genderCount = genderConditionsCount[patient.gender];
        if (genderCount) {
            genderCount[patient.condition] =
                (genderCount[patient.condition] ?? 0) + 1;
        }
    }

    let html = `Number of patients: ${numPatients}<br><br>`;
    html += `Conditions Breakdown:<br>`;
    for (const condition in conditionsCount) {
        html += `${condition}: ${conditionsCount[condition]}<br>`;
    }

    html += `<br>Gender-Based Conditions:<br>`;
    for (const gender in genderConditionsCount) {
        html += `${gender}:<br>`;
        for (const condition in genderConditionsCount[gender]) {
            html += `&nbsp;&nbsp;${condition}: ${genderConditionsCount[gender][condition]}<br>`;
        }
    }

    report.innerHTML = html;
}

async function searchCondition() {
    const query = conditionInput.value.trim().toLowerCase();
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
            result.innerHTML = `<p>No information found for "${conditionInput.value.trim()}".</p>`;
            return;
        }

        const symptoms = condition.symptoms.map((item) => `<li>${item}</li>`).join("");
        const prevention = condition.prevention.map((item) => `<li>${item}</li>`).join("");
        result.innerHTML = `
            <h3>${condition.name}</h3>
            <img src="./img/${condition.imagesrc}" alt="${condition.name}" width="200">
            <h4>Symptoms</h4>
            <ul>${symptoms}</ul>
            <h4>Prevention</h4>
            <ul>${prevention}</ul>
            <h4>Treatment</h4>
            <p>${condition.treatment}</p>
        `;
    } catch (error) {
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
