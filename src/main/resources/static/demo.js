let selectedPassport = null;
let workflow = [];
let artifacts = [];

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("accessForm").addEventListener("submit", accessPassport);
  document.getElementById("candidateArtifactForm").addEventListener("submit", uploadArtifact);
  renderDocumentOptions();
});

function renderDocumentOptions() {
  documentName.innerHTML = DOCUMENT_CATEGORIES.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
}

async function accessPassport(event) {
  event.preventDefault();
  try {
    selectedPassport = await loadPassportByAccessKey(accessKey.value);
    showMessage("candidateMessage", "Passaporte localizado com sucesso.", "success");
    await refreshSelectedData();
  } catch (error) {
    selectedPassport = null;
    showMessage("candidateMessage", error.message || "Chave inválida.", "error");
    await refreshSelectedData();
  }
}

async function refreshSelectedData() {
  if (!selectedPassport) {
    passportDetails.innerHTML = `<p>Informe sua chave para visualizar o passaporte.</p>`;
    workflowPanel.innerHTML = `<p class="empty-cell">Nenhum passaporte selecionado.</p>`;
    artifactList.innerHTML = `<p class="empty-cell">Nenhum passaporte selecionado.</p>`;
    artifactTarget.innerHTML = `<option value="">Informe a chave primeiro</option>`;
    return;
  }
  workflow = await loadWorkflowTree(selectedPassport.id);
  artifacts = await loadArtifactsByPassport(selectedPassport.id);
  renderDetails();
  renderWorkflow();
  renderArtifacts();
  renderTargetSelect();
}

function renderDetails() {
  passportDetails.innerHTML = `<div class="detail-grid"><p><strong>Candidato:</strong> ${escapeHtml(selectedPassport.candidateName)}</p><p><strong>CPF:</strong> ${escapeHtml(selectedPassport.candidateCpf)}</p><p><strong>Cargo:</strong> ${escapeHtml(selectedPassport.jobPosition)}</p><p><strong>Perfil:</strong> ${escapeHtml(profileName(selectedPassport))}</p><p><strong>Chave:</strong> <code>${escapeHtml(accessKeyLabel(selectedPassport))}</code></p><p><strong>Status:</strong> ${statusBadge(selectedPassport.status)}</p></div>`;
}

function renderWorkflow() { workflowPanel.innerHTML = renderWorkflowTree(workflow, { mutable: false }); }

function renderTargetSelect() {
  const targets = flattenWorkflow(workflow).filter(item => ["ACTIVITY", "TASK", "SUBTASK"].includes(item.targetType));
  fillSelect(artifactTarget, targets, item => `${item.targetType}:${item.id}`, item => `${"—".repeat(item.level)} ${item.label}`, "Selecione uma atividade/tarefa/subtarefa");
}

function renderArtifacts() {
  artifactList.innerHTML = artifacts.length ? artifacts.map(a => renderArtifactCard(a, { canValidate: false })).join("") : `<p class="empty-cell">Nenhum documento enviado.</p>`;
  attachArtifactHandlers(artifactList, refreshSelectedData);
}

async function uploadArtifact(event) {
  event.preventDefault();
  if (!selectedPassport) return showMessage("candidateMessage", "Informe a chave do passaporte antes de enviar documentos.", "error");
  const [kind, id] = artifactTarget.value.split(":");
  const file = artifactFile.files[0];
  const selectedFileType = document.getElementById("artifactFileType").value;
  const payload = {
    documentName: documentName.value,
    fileName: file.name,
    fileType: selectedFileType || file.type || "application/octet-stream",
    notes: `Origem: CANDIDATO; Enviado para: RH; Encaminhamento: PENDENTE_RH; Tipo do documento: ${documentName.value}; Tipo do arquivo: ${selectedFileType}; ${artifactNotes.value.trim()}`
  };
  if (kind === "ACTIVITY") payload.activityId = id;
  if (kind === "TASK") payload.taskId = id;
  if (kind === "SUBTASK") payload.subtaskId = id;
  try {
    const artifact = await api("/artifacts", { method: "POST", body: JSON.stringify(payload) });
    await saveArtifactFile(artifact.id, file);
    event.target.reset();
    showMessage("candidateMessage", "Documento enviado com sucesso.", "success");
    await refreshSelectedData();
  } catch (error) { showMessage("candidateMessage", error.message || "Erro ao enviar documento.", "error"); }
}
