const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadPassports();

    document.getElementById("passportForm").addEventListener("submit", createPassport);
});

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        const data = await response.json();

        document.getElementById("totalPassports").textContent = data.totalPassports;
        document.getElementById("pendingMedicalEvaluation").textContent = data.pendingMedicalEvaluation;
        document.getElementById("fitWaitingManagerDecision").textContent = data.fitWaitingManagerDecision;
        document.getElementById("openPassports").textContent = data.openPassports;
        document.getElementById("validPassports").textContent = data.validPassports;
        document.getElementById("invalidPassports").textContent = data.invalidPassports;
        document.getElementById("canceledPassports").textContent = data.cancelledPassports;
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
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
    }
}

async function renderPassportRow(passport) {
    const artifacts = await loadArtifacts(passport.id);
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${passport.candidateName}</td>
        <td>${passport.candidateCpf}</td>
        <td>${passport.jobPosition}</td>
        <td>${statusWithIcon(passport.medicalResult)}</td>
        <td>${statusWithIcon(passport.managerDecision)}</td>
        <td>${renderAttachmentSummary(artifacts)}</td>
        <td>
            <span class="status ${getStatusClass(passport.status)}">
                ${passport.status}
            </span>
        </td>
    `;

    return row;
}

async function createPassport(event) {
    event.preventDefault();

    const medicalDocumentsInput = document.getElementById("medicalDocuments");
    const managerDocumentsInput = document.getElementById("managerDocuments");

    if (!medicalDocumentsInput.files.length || !managerDocumentsInput.files.length) {
        alert("Anexe ao menos um documento para o Medico e um para o Gerente.");
        return;
    }

    const passport = {
        candidateName: document.getElementById("candidateName").value,
        candidateCpf: document.getElementById("candidateCpf").value,
        jobPosition: document.getElementById("jobPosition").value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/passports`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(passport)
        });

        if (!response.ok) {
            alert("Erro ao criar passaporte.");
            return;
        }

        const createdPassport = await response.json();
        await uploadArtifacts(createdPassport.id, medicalDocumentsInput.files, "Documento medico do candidato", "Origem: CANDIDATO; Destino: MEDICO");
        await uploadArtifacts(createdPassport.id, managerDocumentsInput.files, "Documento gerencial do candidato", "Origem: CANDIDATO; Destino: GERENTE");

        document.getElementById("passportForm").reset();

        await loadDashboard();
        await loadPassports();

        alert("Passaporte criado com anexos.");
    } catch (error) {
        console.error("Erro ao criar passaporte:", error);
        alert("Erro ao conectar com a API.");
    }
}

async function uploadArtifacts(passportId, files, documentNamePrefix, notes) {
    const requests = Array.from(files).map(async file => {
        const artifact = {
            passportId,
            documentName: `${documentNamePrefix}: ${file.name}`,
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            notes
        };

        const response = await fetch(`${API_BASE_URL}/artifacts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(artifact)
        });

        if (response.ok) {
            const savedArtifact = await response.json();
            await saveArtifactFile(savedArtifact.id, file);
        }

        return response;
    });

    const responses = await Promise.all(requests);

    if (responses.some(response => !response.ok)) {
        throw new Error("Erro ao registrar um ou mais anexos.");
    }
}

function saveArtifactFile(artifactId, file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            localStorage.setItem(`artifact-file-${artifactId}`, JSON.stringify({
                name: file.name,
                type: file.type || "application/octet-stream",
                dataUrl: reader.result
            }));
            resolve();
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

async function loadArtifacts(passportId) {
    try {
        const response = await fetch(`${API_BASE_URL}/artifacts/passport/${passportId}`);
        return response.ok ? response.json() : [];
    } catch (error) {
        console.error("Erro ao carregar anexos:", error);
        return [];
    }
}

function renderAttachmentSummary(artifacts) {
    if (!artifacts.length) {
        return `<span class="required-warning">! Pendente</span>`;
    }

    const valid = artifacts.filter(artifact => artifact.status === "VALIDADO").length;
    const invalid = artifacts.filter(artifact => artifact.status === "INVALIDADO").length;
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
