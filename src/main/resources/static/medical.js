let users = [];
let passports = [];
let selectedPassport = null;
let processFlow = [];
let artifacts = [];

window.addEventListener("DOMContentLoaded", () => {
  passportSelect.addEventListener("change", selectPassport);
  medicalForm.addEventListener("submit", saveMedicalReview);
  refreshPage();
});

async function refreshPage() {
  try {
    [users, passports] = await Promise.all([loadUsers(), loadPassports()]);
    fillSelect(medicalReviewer, users.filter(u => u.role === "MEDICINA_TRABALHO" && u.active), u => u.id, u => u.name, "Selecione médico");
    fillSelect(passportSelect, passports, p => p.id, passportLabel, "Selecione passaporte");
    if (selectedPassport) passportSelect.value = selectedPassport.id;
    await refreshSelectedData();
  } catch (error) { showMessage("medicalMessage", error.message || "Erro ao carregar dados.", "error"); }
}

async function selectPassport(event) { selectedPassport = passports.find(p => p.id === event.target.value) || null; await refreshSelectedData(); }

async function refreshSelectedData() {
  if (!selectedPassport) { passportDetails.innerHTML = `<p>Selecione um passaporte.</p>`; medicalArtifacts.innerHTML = `<p class="empty-cell">Nenhum passaporte selecionado.</p>`; medicalProcessFlow.innerHTML = `<p class="empty-cell">Nenhum passaporte selecionado.</p>`; return; }
  processFlow = await loadProcessFlowTree(selectedPassport.id);
  artifacts = await loadArtifactsByPassport(selectedPassport.id);
  renderDetails(); renderArtifacts(); renderProcessFlow();
}

function renderDetails() {
  passportDetails.innerHTML = `<div class="detail-grid"><p><strong>Candidato:</strong> ${escapeHtml(selectedPassport.candidateName)}</p><p><strong>Cargo:</strong> ${escapeHtml(selectedPassport.jobPosition)}</p><p><strong>Chave:</strong> <code>${escapeHtml(accessKeyLabel(selectedPassport))}</code></p><p><strong>Status:</strong> ${statusBadge(selectedPassport.status)}</p><p><strong>Medicina:</strong> ${escapeHtml(selectedPassport.medicalStatus || "-")}</p><p><strong>Observação:</strong> ${escapeHtml(selectedPassport.medicalNotes || "-")}</p></div>`;
  medicalStatus.value = selectedPassport.medicalStatus || "PENDENTE";
  medicalNotes.value = selectedPassport.medicalNotes || "";
}

function renderArtifacts() {
  const items = artifacts.filter(a => ["MEDICINA_TRABALHO", "GERAL"].includes(artifactDestination(a)));
  medicalArtifacts.innerHTML = items.length ? items.map(a => renderArtifactCard(a, { canValidate: true, canSign: true })).join("") : `<p class="empty-cell">Sem documentos destinados à Medicina.</p>`;
  attachArtifactHandlers(medicalArtifacts, refreshSelectedData);
  attachSignatureHandlers(medicalArtifacts, "medicalReviewer", refreshSelectedData);
}

function renderProcessFlow() {
  const tree = processFlow.filter(a => a.responsibleRole === "MEDICINA_TRABALHO" || (a.tasks || []).some(t => t.responsibleRole === "MEDICINA_TRABALHO"));
  medicalProcessFlow.innerHTML = renderProcessFlowTree(tree.length ? tree : processFlow, { canSign: true });
  attachSignatureHandlers(medicalProcessFlow, "medicalReviewer", refreshSelectedData);
}

async function saveMedicalReview(event) {
  event.preventDefault();
  if (!selectedPassport) return showMessage("medicalMessage", "Selecione um passaporte.", "error");
  try {
    selectedPassport = await api(`/passports/${selectedPassport.id}/medical-review`, { method: "PATCH", body: JSON.stringify({ medicalStatus: medicalStatus.value, medicalNotes: medicalNotes.value, medicalReviewerId: medicalReviewer.value || null }) });
    showMessage("medicalMessage", "Avaliação médica registrada.", "success");
    await refreshPage();
  } catch (error) { showMessage("medicalMessage", error.message, "error"); }
}
