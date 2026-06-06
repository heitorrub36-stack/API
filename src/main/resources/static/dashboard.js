const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadPassports();
});

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        if (!response.ok) {
            throw new Error("Falha ao carregar dashboard.");
        }

        const data = await response.json();
        setText("totalPassports", data.totalPassports);
        setText("pendingMedicalEvaluation", data.pendingMedicalEvaluation);
        setText("fitWaitingManagerStatus", data.fitWaitingManagerStatus);
        setText("openPassports", data.openPassports);
        setText("validPassports", data.validPassports);
        setText("invalidPassports", data.invalidPassports);
        setText("canceledPassports", data.canceledPassports);
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        showDashboardMessage("Nao foi possivel carregar os indicadores.", "error");
    }
}

async function loadPassports() {
    try {
        const response = await fetch(`${API_BASE_URL}/passports`);
        if (!response.ok) {
            throw new Error("Falha ao carregar passaportes.");
        }

        const passports = await response.json();
        const rows = await Promise.all(passports.map(renderPassportRow));

        const tableBody = document.getElementById("passportTableBody");
        tableBody.innerHTML = "";

        if (!rows.length) {
            tableBody.innerHTML = `<tr><td colspan="7" class="empty-cell">Nenhum passaporte cadastrado.</td></tr>`;
            return;
        }

        rows.forEach(row => tableBody.appendChild(row));
    } catch (error) {
        console.error("Erro ao carregar passaportes:", error);
        showDashboardMessage("Nao foi possivel carregar os passaportes.", "error");
    }
}

async function renderPassportRow(passport) {
    const artifacts = await loadArtifacts(passport.id);
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${escapeHtml(passport.candidateName)}</td>
        <td>${escapeHtml(passport.candidateCpf)}</td>
        <td>${escapeHtml(passport.jobPosition)}</td>
        <td>${statusWithIcon(passport.medicalStatus)}</td>
        <td>${statusWithIcon(passport.managerStatus)}</td>
        <td>${renderAttachmentSummary(artifacts)}</td>
        <td><span class="status ${getStatusClass(passport.status)}">${escapeHtml(passport.status)}</span></td>
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
        return `<span class="required-warning">Pendente</span>`;
    }

    const valid = artifacts.filter(artifact => artifact.status === "VALIDA").length;
    const invalid = artifacts.filter(artifact => artifact.status === "INVALIDA").length;
    const pending = artifacts.length - valid - invalid;

    return `
        <span class="attachment-count">${artifacts.length} anexos</span>
        <span class="mini-status">OK ${valid}</span>
        <span class="mini-status">Pend. ${pending}</span>
        <span class="mini-status">Inv. ${invalid}</span>
    `;
}

function statusWithIcon(value) {
    const status = value || "PENDENTE";
    if (status === "APTO" || status === "APROVADO") {
        return `<span class="validation-icon ok">OK</span> ${escapeHtml(status)}`;
    }
    if (status === "INAPTO" || status === "REPROVADO") {
        return `<span class="validation-icon bad">X</span> ${escapeHtml(status)}`;
    }
    return `<span class="validation-icon wait">!</span> ${escapeHtml(status)}`;
}

function getStatusClass(status) {
    return `status-${String(status || "").toLowerCase()}`;
}

function showDashboardMessage(text, type) {
    const message = document.getElementById("dashboardMessage");
    message.textContent = text;
    message.className = `message ${type || ""}`;
    message.hidden = false;
}

function setText(id, value) {
    document.getElementById(id).textContent = value ?? 0;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
