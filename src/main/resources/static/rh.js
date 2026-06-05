const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadPassports();

    const form = document.getElementById("passportForm");
    form.addEventListener("submit", createPassport);
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

        const tableBody = document.getElementById("passportTableBody");
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
    } catch (error) {
        console.error("Erro ao carregar passaportes:", error);
    }
}

async function createPassport(event) {
    event.preventDefault();

    const candidateName = document.getElementById("candidateName").value;
    const candidateCpf = document.getElementById("candidateCpf").value;
    const jobPosition = document.getElementById("jobPosition").value;

    const passport = {
        candidateName,
        candidateCpf,
        jobPosition
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

        await loadDashboard();
        await loadPassports();

        alert("Passaporte criado com sucesso!");
    } catch (error) {
        console.error("Erro ao criar passaporte:", error);
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
