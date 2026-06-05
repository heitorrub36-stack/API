const API_BASE_URL = "http://localhost:8080/api";

let passports = [];
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

function renderRhTable() {
    const tableBody = document.getElementById("rhPassportTableBody");
    tableBody.innerHTML = "";

    passports.forEach(passport => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${passport.candidateName}</td>
            <td>${passport.candidateCpf}</td>
            <td>${passport.jobPosition}</td>
            <td>${passport.medicalResult}</td>
            <td>${passport.managerDecision}</td>
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
            <td>${passport.medicalResult}</td>
            <td>${passport.managerDecision}</td>
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

        document.getElementById("passportForm").reset();

        await loadAllData();

        alert("Passaporte criado com sucesso!");
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
        return;
    }

    details.innerHTML = renderPassportDetails(selectedMedicalPassport);

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
        return;
    }

    details.innerHTML = renderPassportDetails(selectedManagerPassport);

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
        <p><strong>Resultado medico:</strong> ${passport.medicalResult}</p>
        <p><strong>Observacao medica:</strong> ${passport.medicalNotes || "Sem observacoes"}</p>
        <p><strong>Decisao do gerente:</strong> ${passport.managerDecision}</p>
        <p><strong>Observacao do gerente:</strong> ${passport.managerNotes || "Sem observacoes"}</p>
    `;
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
        showMedicalPassportDetails();

        alert("Avaliacao medica salva com sucesso!");
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
        showManagerPassportDetails();

        alert("Decisao do gerente salva com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar decisao do gerente:", error);
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
        showManagerPassportDetails();

        alert("Passaporte cancelado com sucesso!");
    } catch (error) {
        console.error("Erro ao cancelar passaporte:", error);
        alert("Erro ao conectar com a API.");
    }
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
