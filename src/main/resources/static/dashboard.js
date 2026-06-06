const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadPassports();
});

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        const data = await response.json();

        document.getElementById("totalPassports").textContent = data.totalPassports;
        document.getElementById("pendingMedicalEvaluation").textContent = data.pendingMedicalEvaluation;
        document.getElementById("fitWaitingManagerStatus").textContent = data.fitWaitingManagerStatus;
        document.getElementById("openPassports").textContent = data.openPassports;
        document.getElementById("validPassports").textContent = data.validPassports;
        document.getElementById("invalidPassports").textContent = data.invalidPassports;
        document.getElementById("canceledPassports").textContent = data.canceledPassports;
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        alert("Erro ao carregar dashboard.");
    }
}

async function loadPassports() {
    try {
        const response = await fetch(`${API_BASE_URL}/passports`);
        const passports = await response.json();
        const rows = await Promise.all(passports.map(renderPassportRow));

        const tableBody = document.getElementById("passportTableBody");
        tableBody.innerHTML = "";
        rows.forEach(row => tableBody.appendChild(row));
    } catch (error) {
        console.error("Erro ao carregar passaportes:", error);
        alert("Erro ao carregar passaportes.");
    }
}

async function renderPassportRow(passport) {
    const artifacts = await loadArtifacts(passport.id);
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${passport.candidateName}</td>
        <td>${passport.candidateCpf}</td>
        <td>${passport.jobPosition}</td>
        <td>${statusWithIcon(passport.medicalStatus)}</td>
        <td>${statusWithIcon(passport.managerStatus)}</td>
        <td>${renderAttachmentSummary(artifacts)}</td>
        <td>
            <span class="status ${getStatusClass(passport.status)}">
                ${passport.status}
            </span>
        </td>
    `;

    return row;
}

async function loadArtifacts(passportId) {
    try {
        const response = await fetch(`${API_BASE_URL}/artifacts/passport/${passportId}`);
        return response.ok ? await response.json() : [];
    } catch (error) {
        console.error("Erro ao carregar anexos:", error);
        return [];
    }
}

function renderAttachmentSummary(artifacts) {
    if (!artifacts.length) {
        return `<span class="required-warning">! Pendente</span>`;
    }

    const valid = artifacts.filter(artifact => artifact.status === "VALIDA").length;
    const invalid = artifacts.filter(artifact => artifact.status === "INVALIDA").length;
    const pending = artifacts.length - valid - invalid;

    return `
        <span class="attachment-count">${artifacts.length} anexos</span>
        <span class="mini-status">✓ ${valid}</span>
        <span class="mini-status">! ${pending}</span>
        <span class="mini-status">× ${invalid}</span>
    `;
}

function statusWithIcon(value) {
    if (value === "APTO" || value === "APROVADO") {
        return `<span class="validation-icon ok">✓</span> ${value}`;
    }

    if (value === "INAPTO" || value === "REPROVADO") {
        return `<span class="validation-icon bad">×</span> ${value}`;
    }

    return `<span class="validation-icon wait">!</span> ${value}`;
}

function getStatusClass(status) {
    if (status === "ABERTA") {
        return "status-aberta";
    }

    if (status === "VALIDA") {
        return "status-valida";
    }

    if (status === "INVALIDA") {
        return "status-invalida";
    }

    if (status === "CANCELADA") {
        return "status-cancelada";
    }

    return "";
}
