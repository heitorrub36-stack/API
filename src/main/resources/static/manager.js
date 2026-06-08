let users = [];
let passports = [];
let selectedPassport = null;
let processFlow = [];
let artifacts = [];

window.addEventListener("DOMContentLoaded", () => {
  passportSelect.addEventListener("change", selectPassport);
  managerForm.addEventListener("submit", saveManagerReview);
  cancelButton.addEventListener("click", cancelSelectedPassport);
  refreshPage();
});

async function refreshPage() {
  try {
    [users, passports] = await Promise.all([loadUsers(), loadPassports()]);
    fillSelect(managerReviewer, users.filter(u => u.role === "GERENTE" && u.active), u => u.id, u => u.name, "Selecione gerente");
    fillSelect(passportSelect, passports, p => p.id, p => `${passportLabel(p)} · Medicina: ${p.medicalStatus}`, "Selecione passaporte");
    if (selectedPassport) passportSelect.value = selectedPassport.id;
    await refreshSelectedData();
  } catch (error) { showMessage("managerMessage", error.message || "Erro ao carregar dados.", "error"); }
}

async function selectPassport(event) { selectedPassport = passports.find(p => p.id === event.target.value) || null; await refreshSelectedData(); }

async function refreshSelectedData() {
  if (!selectedPassport) { passportDetails.innerHTML = `<p>Selecione um passaporte.</p>`; managerArtifacts.innerHTML = `<p class="empty-cell">Nenhum passaporte selecionado.</p>`; managerProcessFlow.innerHTML = `<p class="empty-cell">Nenhum passaporte selecionado.</p>`; return; }
  processFlow = await loadProcessFlowTree(selectedPassport.id);
  artifacts = await loadArtifactsByPassport(selectedPassport.id);
  renderDetails(); renderArtifacts(); renderProcessFlow();
}

function renderDetails() {
  passportDetails.innerHTML = `<div class="detail-grid"><p><strong>Candidato:</strong> ${escapeHtml(selectedPassport.candidateName)}</p><p><strong>Cargo:</strong> ${escapeHtml(selectedPassport.jobPosition)}</p><p><strong>Chave:</strong> <code>${escapeHtml(accessKeyLabel(selectedPassport))}</code></p><p><strong>Status:</strong> ${statusBadge(selectedPassport.status)}</p><p><strong>Medicina:</strong> ${escapeHtml(selectedPassport.medicalStatus || "-")}</p><p><strong>Gerente:</strong> ${escapeHtml(selectedPassport.managerStatus || "-")}</p></div>`;
  managerStatus.value = selectedPassport.managerStatus || "PENDENTE";
  managerNotes.value = selectedPassport.managerNotes || "";
}

function renderArtifacts() {
  const items = artifacts.filter(a => ["GERENTE", "GERAL"].includes(artifactDestination(a)));
  managerArtifacts.innerHTML = items.length ? items.map(a => renderArtifactCard(a, { canValidate: true, canSign: true })).join("") : `<p class="empty-cell">Sem documentos destinados ao Gerente.</p>`;
  attachArtifactHandlers(managerArtifacts, refreshSelectedData);
  attachSignatureHandlers(managerArtifacts, "managerReviewer", refreshSelectedData);
}

function renderProcessFlow() {
  const tree = processFlow.filter(a => a.responsibleRole === "GERENTE" || (a.tasks || []).some(t => t.responsibleRole === "GERENTE"));
  managerProcessFlow.innerHTML = renderProcessFlowTree(tree.length ? tree : processFlow, { canSign: true });
  attachSignatureHandlers(managerProcessFlow, "managerReviewer", refreshSelectedData);
}

async function saveManagerReview(event) {
  event.preventDefault();
  if (!selectedPassport) return showMessage("managerMessage", "Selecione um passaporte.", "error");
  try {
    selectedPassport = await api(`/passports/${selectedPassport.id}/manager-review`, { method: "PATCH", body: JSON.stringify({ managerStatus: managerStatus.value, managerNotes: managerNotes.value, managerReviewerId: managerReviewer.value || null }) });
    showMessage("managerMessage", "Decisão gerencial registrada.", "success");
    await refreshPage();
  } catch (error) { showMessage("managerMessage", error.message, "error"); }
}

async function cancelSelectedPassport() {
  if (!selectedPassport) return showMessage("managerMessage", "Selecione um passaporte.", "error");
  if (!confirm("Cancelar este passaporte?")) return;
  try {
    selectedPassport = await api(`/passports/${selectedPassport.id}/cancel`, { method: "PATCH" });
    showMessage("managerMessage", "Passaporte cancelado.", "success");
    await refreshPage();
  } catch (error) { showMessage("managerMessage", error.message, "error"); }
}
