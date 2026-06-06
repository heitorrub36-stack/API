const API_BASE_URL = "http://localhost:8080/api";

let rhUsers = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("passportForm").addEventListener("submit", createPassport);
    document.getElementById("createDefaultRhButton").addEventListener("click", createDefaultRhUser);

    loadPageData();
});

async function loadPageData() {
    await Promise.all([
        loadRhUsers(),
        loadDashboard(),
        loadPassports()
    ]);
}

async function loadRhUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
            throw new Error("Falha ao carregar usuarios.");
        }

        const users = await response.json();
        rhUsers = users.filter(user => user.role === "RH" && user.active);
        renderRhUsers();
    } catch (error) {
        console.error("Erro ao carregar usuarios RH:", error);
        showMessage("Nao foi possivel carregar os usuarios RH.", "error");
        renderRhUsers();
    }
}

function renderRhUsers() {
    const select = document.getElementById("createdByRh");
    select.innerHTML = `<option value="">Selecione o responsavel RH</option>`;

    rhUsers.forEach(user => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        select.appendChild(option);
    });

    if (!rhUsers.length) {
        select.innerHTML = `<option value="">Nenhum RH ativo cadastrado</option>`;
        showMessage("Cadastre um usuario RH ou use o botao Criar RH padrao para liberar o cadastro.", "warning");
    }
}

async function createDefaultRhUser() {
    const payload = {
        name: "RH Padrao",
        email: "rh.padrao@passport.local",
        role: "RH",
        active: true
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok && response.status !== 409) {
            throw new Error("Falha ao criar usuario RH.");
        }

        await loadRhUsers();
        showMessage("Usuario RH pronto para uso.", "success");
    } catch (error) {
        console.error("Erro ao criar usuario RH:", error);
        showMessage("Nao foi possivel criar o usuario RH padrao.", "error");
    }
}

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
        document.getElementById("passportTableBody").innerHTML =
            `<tr><td colspan="7" class="empty-cell">Nao foi possivel carregar os passaportes.</td></tr>`;
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

async function createPassport(event) {
    event.preventDefault();

    const medicalDocumentsInput = document.getElementById("medicalDocuments");
    const managerDocumentsInput = document.getElementById("managerDocuments");

    if (!document.getElementById("createdByRh").value) {
        showMessage("Selecione um responsavel RH antes de cadastrar.", "error");
        return;
    }

    if (!medicalDocumentsInput.files.length || !managerDocumentsInput.files.length) {
        showMessage("Anexe ao menos um documento para Medicina e um para Gerente.", "error");
        return;
    }

    const passport = {
        candidateName: document.getElementById("candidateName").value.trim(),
        candidateCpf: document.getElementById("candidateCpf").value.trim(),
        jobPosition: document.getElementById("jobPosition").value.trim(),
        createdByRh: document.getElementById("createdByRh").value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/passports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(passport)
        });

        if (!response.ok) {
            const detail = await readError(response);
            showMessage(detail || "Erro ao criar passaporte.", "error");
            return;
        }

        const createdPassport = await response.json();
        await uploadArtifacts(createdPassport.id, medicalDocumentsInput.files, "Documento medico do candidato", "Origem: CANDIDATO; Destino: MEDICO");
        await uploadArtifacts(createdPassport.id, managerDocumentsInput.files, "Documento gerencial do candidato", "Origem: CANDIDATO; Destino: GERENTE");

        document.getElementById("passportForm").reset();
        await loadPageData();
        showMessage("Passaporte criado com anexos.", "success");
    } catch (error) {
        console.error("Erro ao criar passaporte:", error);
        showMessage("Erro ao conectar com a API.", "error");
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
            headers: { "Content-Type": "application/json" },
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

function showMessage(text, type) {
    const message = document.getElementById("formMessage");
    message.textContent = text;
    message.className = `message ${type || ""}`;
    message.hidden = false;
}

function setText(id, value) {
    document.getElementById(id).textContent = value ?? 0;
}

async function readError(response) {
    try {
        const data = await response.json();
        return data.detail || data.message || data.error;
    } catch (error) {
        return "";
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
