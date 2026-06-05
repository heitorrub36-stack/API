const API_BASE_URL = "http://localhost:8080/api";

let passports = [];
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
        passports = await response.json();

        const select = document.getElementById("passportSelect");
        select.innerHTML = `<option value="">Selecione um candidato</option>`;

        passports.forEach(passport => {
            const option = document.createElement("option");
            option.value = passport.id;
            option.textContent = `${passport.candidateName} - ${passport.jobPosition} - ${passport.status}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar passaportes:", error);
        alert("Erro ao carregar passaportes.");
    }
}

function selectPassport(event) {
    const passportId = event.target.value;

    selectedPassport = passports.find(passport => passport.id === passportId);

    showPassportDetails();
}

function showPassportDetails() {
    const details = document.getElementById("passportDetails");

    if (!selectedPassport) {
        details.innerHTML = `<p>Selecione um passaporte para visualizar os detalhes.</p>`;
        return;
    }

    details.innerHTML = `
        <p><strong>Candidato:</strong> ${selectedPassport.candidateName}</p>
        <p><strong>CPF:</strong> ${selectedPassport.candidateCpf}</p>
        <p><strong>Cargo:</strong> ${selectedPassport.jobPosition}</p>
        <p><strong>Status:</strong> 
            <span class="status ${getStatusClass(selectedPassport.status)}">
                ${selectedPassport.status}
            </span>
        </p>
        <p><strong>Resultado médico:</strong> ${selectedPassport.medicalResult}</p>
        <p><strong>Observação médica:</strong> ${selectedPassport.medicalNotes || "Sem observações"}</p>
        <p><strong>Decisão do gerente:</strong> ${selectedPassport.managerDecision}</p>
        <p><strong>Observação do gerente:</strong> ${selectedPassport.managerNotes || "Sem observações"}</p>
    `;

    document.getElementById("medicalResult").value =
        selectedPassport.medicalResult === "PENDENTE" ? "" : selectedPassport.medicalResult;

    document.getElementById("medicalNotes").value =
        selectedPassport.medicalNotes || "";

    document.getElementById("managerDecision").value =
        selectedPassport.managerDecision === "PENDENTE" ? "" : selectedPassport.managerDecision;

    document.getElementById("managerNotes").value =
        selectedPassport.managerNotes || "";
}

async function updateMedicalReview(event) {
    event.preventDefault();

    if (!selectedPassport) {
        alert("Selecione um passaporte primeiro.");
        return;
    }

    const medicalResult = document.getElementById("medicalResult").value;
    const medicalNotes = document.getElementById("medicalNotes").value;

    const body = {
        medicalResult,
        medicalNotes
    };

    try {
        const response = await fetch(`${API_BASE_URL}/passports/${selectedPassport.id}/medical-review`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            alert("Erro ao salvar avaliação médica.");
            return;
        }

        selectedPassport = await response.json();

        alert("Avaliação médica salva com sucesso!");

        await loadPassports();
        showPassportDetails();
    } catch (error) {
        console.error("Erro ao salvar avaliação médica:", error);
        alert("Erro ao conectar com a API.");
    }
}

async function updateManagerReview(event) {
    event.preventDefault();

    if (!selectedPassport) {
        alert("Selecione um passaporte primeiro.");
        return;
    }

    const managerDecision = document.getElementById("managerDecision").value;
    const managerNotes = document.getElementById("managerNotes").value;

    const body = {
        managerDecision,
        managerNotes
    };

    try {
        const response = await fetch(`${API_BASE_URL}/passports/${selectedPassport.id}/manager-review`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            alert("Erro ao salvar decisão do gerente.");
            return;
        }

        selectedPassport = await response.json();

        alert("Decisão do gerente salva com sucesso!");

        await loadPassports();
        showPassportDetails();
    } catch (error) {
        console.error("Erro ao salvar decisão do gerente:", error);
        alert("Erro ao conectar com a API.");
    }
}

async function cancelPassport() {
    if (!selectedPassport) {
        alert("Selecione um passaporte primeiro.");
        return;
    }

    const confirmCancel = confirm("Deseja realmente cancelar este passaporte?");

    if (!confirmCancel) {
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

        alert("Passaporte cancelado com sucesso!");

        await loadPassports();
        showPassportDetails();
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