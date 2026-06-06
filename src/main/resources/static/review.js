const API_BASE_URL = "http://localhost:8080/api";

let passports = [];
let artifacts = [];
let selectedPassport = null;

document.addEventListener("DOMContentLoaded", () => {
    loadPassports();

    document.getElementById("passportSelect").addEventListener("change", selectPassport);
    document.getElementById("medicalForm").addEventListener("submit", updateMedicalReview);
    document.getElementById("managerForm").addEventListener("submit", updateManagerReview);
    document.getElementById("cancelButton").addEventListener("click", cancelPassport);
});

async function loadPassports() {
    try {
        const response = await fetch(`${API_BASE_URL}/passports`);
        if (!response.ok) {
            throw new Error("Falha ao carregar passaportes.");
        }

        passports = await response.json();
        renderPassportSelect();
        syncSelectedPassport();
        showPassportDetails();
    } catch (error) {
        console.error("Erro ao carregar passaportes:", error);
        document.getElementById("passportDetails").innerHTML =
            `<p class="required-warning">Nao foi possivel carregar os passaportes.</p>`;
    }
}

function renderPassportSelect() {
    const select = document.getElementById("passportSelect");
    const selectedId = selectedPassport ? selectedPassport.id : "";
    select.innerHTML = `<option value="">Selecione um candidato</option>`;

    passports.forEach(passport => {
        const option = document.createElement("option");
        option.value = passport.id;
        option.textContent = `${passport.candidateName} - ${passport.jobPosition} - ${passport.status}`;
        option.selected = passport.id === selectedId;
        select.appendChild(option);
    });
}

function syncSelectedPassport() {
    if (selectedPassport) {
        selectedPassport = passports.find(passport => passport.id === selectedPassport.id) || null;
    }
}

async function selectPassport(event) {
    selectedPassport = passports.find(passport => passport.id === event.target.value) || null;
    await loadSelectedArtifacts();
    showPassportDetails();
}

async function loadSelectedArtifacts() {
    artifacts = [];

    if (!selectedPassport) {
        renderArtifactLists();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/artifacts/passport/${selectedPassport.id}`);
        artifacts = response.ok ? await response.json() : [];
    } catch (error) {
        console.error("Erro ao carregar anexos:", error);
        artifacts = [];
    }
}

function showPassportDetails() {
    const details = document.getElementById("passportDetails");

    if (!selectedPassport) {
        details.innerHTML = `<p>Selecione um passaporte para visualizar os detalhes.</p>`;
        document.getElementById("medicalForm").reset();
        document.getElementById("managerForm").reset();
        renderArtifactLists();
        return;
    }

    details.innerHTML = `
        <p><strong>Candidato:</strong> ${escapeHtml(selectedPassport.candidateName)}</p>
        <p><strong>CPF:</strong> ${escapeHtml(selectedPassport.candidateCpf)}</p>
        <p><strong>Cargo:</strong> ${escapeHtml(selectedPassport.jobPosition)}</p>
        <p><strong>Status:</strong> <span class="status ${getStatusClass(selectedPassport.status)}">${escapeHtml(selectedPassport.status)}</span></p>
        <p><strong>Resultado medico:</strong> ${statusWithIcon(selectedPassport.medicalStatus)}</p>
        <p><strong>Observacao medica:</strong> ${escapeHtml(selectedPassport.medicalNotes || "Sem observacoes")}</p>
        <p><strong>Decisao do gerente:</strong> ${statusWithIcon(selectedPassport.managerStatus)}</p>
        <p><strong>Observacao do gerente:</strong> ${escapeHtml(selectedPassport.managerNotes || "Sem observacoes")}</p>
    `;

    document.getElementById("medicalStatus").value =
        selectedPassport.medicalStatus === "PENDENTE" ? "" : selectedPassport.medicalStatus;
    document.getElementById("medicalNotes").value = selectedPassport.medicalNotes || "";
    document.getElementById("managerStatus").value =
        selectedPassport.managerStatus === "PENDENTE" ? "" : selectedPassport.managerStatus;
    document.getElementById("managerNotes").value = selectedPassport.managerNotes || "";

    renderArtifactLists();
}

function renderArtifactLists() {
    const medicalArtifacts = artifacts.filter(artifact => isMedicalArtifact(artifact));
    const managerArtifacts = artifacts.filter(artifact => isManagerArtifact(artifact));

    document.getElementById("medicalArtifacts").innerHTML =
        renderArtifacts(medicalArtifacts, "Nenhum anexo direcionado para Medicina.");
    document.getElementById("managerArtifacts").innerHTML =
        renderArtifacts(managerArtifacts, "Nenhum anexo direcionado para Gerente.");
}

function renderArtifacts(items, emptyMessage) {
    if (!selectedPassport) {
        return `<p>Selecione um passaporte para visualizar os anexos.</p>`;
    }

    if (!items.length) {
        return `<p class="required-warning">${emptyMessage}</p>`;
    }

    return `<div class="artifact-grid">${items.map(renderArtifact).join("")}</div>`;
}

function renderArtifact(artifact) {
    const reason = artifact.invalidationReason
        ? `<p class="artifact-reason">Motivo: ${escapeHtml(artifact.invalidationReason)}</p>`
        : "";

    return `
        <article class="artifact-card">
            <div class="artifact-heading">
                <span class="artifact-icon ${getArtifactStatusClass(artifact.status)}">${getArtifactIcon(artifact.status)}</span>
                <div>
                    <strong>${escapeHtml(artifact.documentName)}</strong>
                    <span>${escapeHtml(artifact.fileName)} - ${escapeHtml(artifact.fileType)}</span>
                </div>
            </div>
            <p>${escapeHtml(artifact.notes || "Sem observacoes")}</p>
            ${reason}
            <div class="artifact-actions">
                <span class="artifact-status ${getArtifactStatusClass(artifact.status)}">${escapeHtml(artifact.status)}</span>
                <button type="button" class="ghost-button" onclick="openArtifact('${artifact.id}')">Abrir</button>
                <button type="button" class="ghost-button" onclick="validateArtifact('${artifact.id}')">Validar</button>
                <button type="button" class="ghost-button danger-text" onclick="invalidateArtifact('${artifact.id}')">Invalidar</button>
            </div>
        </article>
    `;
}

function openArtifact(artifactId) {
    const storedFile = localStorage.getItem(`artifact-file-${artifactId}`);

    if (!storedFile) {
        alert("Arquivo indisponivel neste navegador. O backend salvou os metadados, e o arquivo fica no armazenamento local.");
        return;
    }

    const file = JSON.parse(storedFile);
    const newWindow = window.open();

    if (!newWindow) {
        alert("Permita pop-ups para abrir o documento.");
        return;
    }

    newWindow.document.write(`
        <title>${escapeHtml(file.name)}</title>
        <iframe src="${file.dataUrl}" style="border:0;height:100vh;width:100vw;"></iframe>
    `);
    newWindow.document.close();
}

async function validateArtifact(artifactId) {
    await updateArtifactStatus(`${API_BASE_URL}/artifacts/validate/${artifactId}`, { method: "PATCH" });
}

async function invalidateArtifact(artifactId) {
    const reason = prompt("Informe o motivo da invalidacao do documento:");
    if (!reason || !reason.trim()) {
        return;
    }

    await updateArtifactStatus(`${API_BASE_URL}/artifacts/${artifactId}/invalidate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

        await loadSelectedArtifacts();
        renderArtifactLists();
    } catch (error) {
        console.error("Erro ao atualizar anexo:", error);
        alert("Erro ao conectar com a API.");
    }
}

async function updateMedicalReview(event) {
    event.preventDefault();

    if (!selectedPassport) {
        alert("Selecione um passaporte primeiro.");
        return;
    }

    const body = {
        medicalStatus: document.getElementById("medicalStatus").value,
        medicalNotes: document.getElementById("medicalNotes").value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/passports/${selectedPassport.id}/medical-review`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            alert("Erro ao salvar avaliacao medica.");
            return;
        }

        selectedPassport = await response.json();
        await loadPassports();
        alert("Avaliacao medica salva com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar avaliacao medica:", error);
        alert("Erro ao conectar com a API.");
    }
}

async function updateManagerReview(event) {
    event.preventDefault();

    if (!selectedPassport) {
        alert("Selecione um passaporte primeiro.");
        return;
    }

    const body = {
        managerStatus: document.getElementById("managerStatus").value,
        managerNotes: document.getElementById("managerNotes").value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/passports/${selectedPassport.id}/manager-review`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            alert("Erro ao salvar decisao do gerente.");
            return;
        }

        selectedPassport = await response.json();
        await loadPassports();
        alert("Decisao do gerente salva com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar decisao do gerente:", error);
        alert("Erro ao conectar com a API.");
    }
}

async function cancelPassport() {
    if (!selectedPassport) {
        alert("Selecione um passaporte primeiro.");
        return;
    }

    if (!confirm("Deseja realmente cancelar este passaporte?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/passports/${selectedPassport.id}/cancel`, {
            method: "PATCH"
        });

        if (!response.ok) {
            alert("Erro ao cancelar passaporte.");
            return;
        }

        selectedPassport = await response.json();
        await loadPassports();
        alert("Passaporte cancelado com sucesso.");
    } catch (error) {
        console.error("Erro ao cancelar passaporte:", error);
        alert("Erro ao conectar com a API.");
    }
}

function isMedicalArtifact(artifact) {
    return hasArtifactDestination(artifact, "MEDICO");
}

function isManagerArtifact(artifact) {
    return hasArtifactDestination(artifact, "GERENTE");
}

function hasArtifactDestination(artifact, destination) {
    return (artifact.notes || "")
        .split(";")
        .map(part => part.trim())
        .includes(`Destino: ${destination}`);
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

function getArtifactIcon(status) {
    if (status === "VALIDA") {
        return "OK";
    }
    if (status === "INVALIDA") {
        return "X";
    }
    return "!";
}

function getArtifactStatusClass(status) {
    if (status === "VALIDA") {
        return "artifact-valid valid";
    }
    if (status === "INVALIDA") {
        return "artifact-invalid invalid";
    }
    return "artifact-pending pending";
}

function getStatusClass(status) {
    return `status-${String(status || "").toLowerCase()}`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
