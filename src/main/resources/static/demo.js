const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", loadDashboard);

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

function setText(id, value) {
    document.getElementById(id).textContent = value ?? 0;
}
