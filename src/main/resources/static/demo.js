const API_BASE_URL = "http://localhost:8080/api";

let passports = [];
let artifactsByPassport = {};
let selectedMedicalPassport = null;
let selectedManagerPassport = null;

document.addEventListener("DOMContentLoaded", () => {
    configureTabs();
    configureForms();
    loadAllData();
});

function configureTabs() {
    const buttons = document.querySelectorAll(".tab-button");
    const tabs = document.querySelectorAll(".tab-content");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedTab = button.dataset.tab;

            buttons.forEach(btn => btn.classList.remove("active"));
            tabs.forEach(tab => tab.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(selectedTab).classList.add("active");

            loadAllData();
        });
    });
}

function configureForms() {
    document.getElementById("passportForm").addEventListener("submit", createPassport);
    document.getElementById("medicalPassportSelect").addEventListener("change", selectMedicalPassport);
    document.getElementById("managerPassportSelect").addEventListener("change", selectManagerPassport);
    document.getElementById("medicalForm").addEventListener("submit", updateMedicalReview);
    document.getElementById("managerForm").addEventListener("submit", updateManagerReview);
    document.getElementById("cancelButton").addEventListener("click", cancelPassport);
}

async function loadAllData() {
    await loadDashboard();
    await loadPassports();
}

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
        passports = await response.json();
        await loadArtifactsForPassports();

        renderRhTable();
        renderDashboardTable();
        renderPassportSelect("medicalPassportSelect", selectedMedicalPassport);
        renderPassportSelect("managerPassportSelect", selectedManagerPassport);
        syncSelectedPassports();
        showMedicalPassportDetails();
        showManagerPassportDetails();
    } catch (error) {
        console.error("Erro ao carregar passaportes:", error);
    }
}

async function loadArtifactsForPassports() {
    artifactsByPassport = {};

    await Promise.all(passports.map(async passport => {
        artifactsByPassport[passport.id] = await loadArtifacts(passport.id);
    }));
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

function renderRhTable() {
    const tableBody = document.getElementById("rhPassportTableBody");
    tableBody.innerHTML = "";

    passports.forEach(passport => {
        const row = document.createElement("tr");
        const artifacts = artifactsByPassport[passport.id] || [];

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

        tableBody.appendChild(row);
    });
}

function renderDashboardTable() {
    const tableBody = document.getElementById("dashboardPassportTableBody");
    tableBody.innerHTML = "";

    passports.forEach(passport => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${passport.candidateName}</td>
            <td>${passport.candidateCpf}</td>
            <td>${passport.jobPosition}</td>
            <td>${statusWithIcon(passport.medicalResult)}</td>
            <td>${statusWithIcon(passport.managerDecision)}</td>
            <td>
                <span class="status ${getStatusClass(passport.status)}">
                    ${passport.status}
                </span>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function renderPassportSelect(selectId, selectedPassport) {
    const select = document.getElementById(selectId);
    const selectedId = selectedPassport ? selectedPassport.id : "";

    select.innerHTML = `<option value="">Selecione um candidato</option>`;

    passports.forEach(passport => {
        const option = document.createElement("option");
        option.value = passport.id;
        option.textContent = `${passport.candidateName} - ${passport.jobPosition} - ${passport.status}`;

        if (passport.id === selectedId) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

function syncSelectedPassports() {
    if (selectedMedicalPassport) {
        selectedMedicalPassport = passports.find(passport => passport.id === selectedMedicalPassport.id) || null;
    }

    if (selectedManagerPassport) {
        selectedManagerPassport = passports.find(passport => passport.id === selectedManagerPassport.id) || null;
    }
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

        await loadAllData();

        alert("Passaporte criado com anexos.");
    } catch (error) {
        console.error("Erro ao criar passaporte:", error);
        alert("Erro ao conectar com a API.");
    }
}

function selectMedicalPassport(event) {
    selectedMedicalPassport = passports.find(passport => passport.id === event.target.value) || null;
    showMedicalPassportDetails();
}

function selectManagerPassport(event) {
    selectedManagerPassport = passports.find(passport => passport.id === event.target.value) || null;
    showManagerPassportDetails();
}

function showMedicalPassportDetails() {
    const details = document.getElementById("medicalPassportDetails");

    if (!selectedMedicalPassport) {
        details.innerHTML = `<p>Selecione um passaporte para visualizar os detalhes.</p>`;
        document.getElementById("medicalForm").reset();
        document.getElementById("medicalArtifacts").innerHTML = `<p>Os anexos do candidato aparecer&atilde;o aqui.</p>`;
        return;
    }

    details.innerHTML = renderPassportDetails(selectedMedicalPassport);
    renderArtifactList("medicalArtifacts", getMedicalArtifacts(selectedMedicalPassport.id), "Nenhum anexo direcionado para Medicina.");

    document.getElementById("medicalResult").value =
        selectedMedicalPassport.medicalResult === "PENDENTE" ? "" : selectedMedicalPassport.medicalResult;

    document.getElementById("medicalNotes").value =
        selectedMedicalPassport.medicalNotes || "";
}

function showManagerPassportDetails() {
    const details = document.getElementById("managerPassportDetails");

    if (!selectedManagerPassport) {
        details.innerHTML = `<p>Selecione um passaporte para visualizar os detalhes.</p>`;
        document.getElementById("managerForm").reset();
        document.getElementById("managerArtifacts").innerHTML = `<p>Os anexos do candidato para o gerente aparecer&atilde;o aqui.</p>`;
        return;
    }

    details.innerHTML = renderPassportDetails(selectedManagerPassport);
    renderArtifactList("managerArtifacts", getManagerArtifacts(selectedManagerPassport.id), "Nenhum anexo direcionado para Gerente.");

    document.getElementById("managerDecision").value =
        selectedManagerPassport.managerDecision === "PENDENTE" ? "" : selectedManagerPassport.managerDecision;

    document.getElementById("managerNotes").value =
        selectedManagerPassport.managerNotes || "";
}

function renderPassportDetails(passport) {
    return `
        <p><strong>Candidato:</strong> ${passport.candidateName}</p>
        <p><strong>CPF:</strong> ${passport.candidateCpf}</p>
        <p><strong>Cargo:</strong> ${passport.jobPosition}</p>
        <p><strong>Status:</strong>
            <span class="status ${getStatusClass(passport.status)}">
                ${passport.status}
            </span>
        </p>
        <p><strong>Resultado medico:</strong> ${statusWithIcon(passport.medicalResult)}</p>
        <p><strong>Observacao medica:</strong> ${passport.medicalNotes || "Sem observacoes"}</p>
        <p><strong>Decisao do gerente:</strong> ${statusWithIcon(passport.managerDecision)}</p>
        <p><strong>Observacao do gerente:</strong> ${passport.managerNotes || "Sem observacoes"}</p>
    `;
}

function renderArtifactList(containerId, artifacts, emptyMessage) {
    const container = document.getElementById(containerId);

    if (!artifacts.length) {
        container.innerHTML = `<p class="required-warning">! ${emptyMessage}</p>`;
        return;
    }

    container.innerHTML = `
        <div class="artifact-grid">
            ${artifacts.map(renderArtifact).join("")}
        </div>
    `;
}

function renderArtifact(artifact) {
    const reason = artifact.invalidationReason
        ? `<p class="artifact-reason">Motivo: ${artifact.invalidationReason}</p>`
        : "";

    return `
        <article class="artifact-card">
            <div class="artifact-heading">
                <span class="artifact-icon ${getArtifactStatusClass(artifact.status)}">${getArtifactIcon(artifact.status)}</span>
                <div>
                    <strong>${artifact.doucumentName}</strong>
                    <span>${artifact.fileName} - ${artifact.fileType}</span>
                </div>
            </div>
            <p>${artifact.notes || "Sem observacoes"}</p>
            ${reason}
            <div class="artifact-actions">
                <span class="artifact-status ${getArtifactStatusClass(artifact.status)}">${artifact.status}</span>
                <button type="button" class="ghost-button" onclick="openArtifact('${artifact.id}')">Abrir</button>
                <button type="button" class="ghost-button" onclick="validateArtifact('${artifact.id}')">✓ Validar</button>
                <button type="button" class="ghost-button danger-text" onclick="invalidateArtifact('${artifact.id}')">× Invalidar</button>
            </div>
        </article>
    `;
}

function openArtifact(artifactId) {
    const storedFile = localStorage.getItem(`artifact-file-${artifactId}`);

    if (!storedFile) {
        alert("Arquivo indisponivel para visualizacao neste navegador. O sistema atual salvou apenas os metadados no backend.");
        return;
    }

    const file = JSON.parse(storedFile);
    const newWindow = window.open();

    if (!newWindow) {
        alert("Permita pop-ups para abrir o documento.");
        return;
    }

    newWindow.document.write(`
        <title>${file.name}</title>
        <iframe src="${file.dataUrl}" style="border:0;height:100vh;width:100vw;"></iframe>
    `);
    newWindow.document.close();
}

async function updateMedicalReview(event) {
    event.preventDefault();

    if (!selectedMedicalPassport) {
        alert("Selecione um passaporte primeiro.");
        return;
    }

    const body = {
        medicalResult: document.getElementById("medicalResult").value,
        medicalNotes: document.getElementById("medicalNotes").value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/passports/${selectedMedicalPassport.id}/medical-review`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            alert("Erro ao salvar avaliacao medica.");
            return;
        }

        selectedMedicalPassport = await response.json();

        await loadAllData();

        alert("Avaliacao medica salva com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar avaliacao medica:", error);
        alert("Erro ao conectar com a API.");
    }
}

async function updateManagerReview(event) {
    event.preventDefault();

    if (!selectedManagerPassport) {
        alert("Selecione um passaporte primeiro.");
        return;
    }

    const body = {
        managerDecision: document.getElementById("managerDecision").value,
        managerNotes: document.getElementById("managerNotes").value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/passports/${selectedManagerPassport.id}/manager-review`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            alert("Erro ao salvar decisao do gerente.");
            return;
        }

        selectedManagerPassport = await response.json();

        await loadAllData();

        alert("Decisao do gerente salva com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar decisao do gerente:", error);
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

async function validateArtifact(artifactId) {
    await updateArtifactStatus(`${API_BASE_URL}/artifacts/validate/${artifactId}`, {
        method: "PATCH"
    });
}

async function invalidateArtifact(artifactId) {
    const reason = prompt("Informe o motivo da invalidacao do documento:");

    if (!reason || !reason.trim()) {
        return;
    }

    await updateArtifactStatus(`${API_BASE_URL}/artifacts/${artifactId}/invalidate`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason })
    });
}

async function updateArtifactStatus(url, options) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            alert("Erro ao atualizar anexo.");
            return;
        }

        await loadAllData();
    } catch (error) {
        console.error("Erro ao atualizar anexo:", error);
        alert("Erro ao conectar com a API.");
    }
}

async function cancelPassport() {
    if (!selectedManagerPassport) {
        alert("Selecione um passaporte primeiro.");
        return;
    }

    const confirmCancel = confirm("Deseja realmente cancelar este passaporte?");

    if (!confirmCancel) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/passports/${selectedManagerPassport.id}/cancel`, {
            method: "PATCH"
        });

        if (!response.ok) {
            alert("Erro ao cancelar passaporte.");
            return;
        }

        selectedManagerPassport = await response.json();

        await loadAllData();

        alert("Passaporte cancelado com sucesso.");
    } catch (error) {
        console.error("Erro ao cancelar passaporte:", error);
        alert("Erro ao conectar com a API.");
    }
}

function getMedicalArtifacts(passportId) {
    return (artifactsByPassport[passportId] || []).filter(artifact => hasArtifactDestination(artifact, "MEDICO"));
}

function getManagerArtifacts(passportId) {
    return (artifactsByPassport[passportId] || []).filter(artifact => hasArtifactDestination(artifact, "GERENTE"));
}

function hasArtifactDestination(artifact, destination) {
    return (artifact.notes || "")
        .split(";")
        .map(part => part.trim())
        .includes(`Destino: ${destination}`);
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

function getArtifactIcon(status) {
    if (status === "VALIDADO") {
        return "✓";
    }

    if (status === "INVALIDADO") {
        return "×";
    }

    return "!";
}

function getArtifactStatusClass(status) {
    if (status === "VALIDADO") {
        return "artifact-valid valid";
    }

    if (status === "INVALIDADO") {
        return "artifact-invalid invalid";
    }

    return "artifact-pending pending";
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
