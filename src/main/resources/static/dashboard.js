let passports = [];
let selectedPassport = null;

window.addEventListener("DOMContentLoaded", () => {
  refreshDashboardButton.addEventListener("click", refreshDashboard);
  searchInput.addEventListener("input", renderPassportTable);
  statusFilter.addEventListener("change", renderPassportTable);
  passportSelect.addEventListener("change", selectPassport);
  refreshDashboard();
});

async function refreshDashboard() {
  try {
    const [dashboard, loadedPassports] = await Promise.all([loadDashboard(), loadPassports()]);
    passports = loadedPassports;
    renderCards(dashboard);
    renderPassportTable();
    renderPassportSelect();
    await renderWorkflow();
  } catch (error) { showMessage("dashboardMessage", error.message || "Erro ao carregar dashboard.", "error"); }
}

function renderCards(data) {
  totalPassports.textContent = data.totalPassports;
  pendingMedicalEvaluation.textContent = data.pendingMedicalEvaluation;
  fitWaitingManagerStatus.textContent = data.fitWaitingManagerStatus;
  openPassports.textContent = data.openPassports;
  validPassports.textContent = data.validPassports;
  invalidPassports.textContent = data.invalidPassports;
  canceledPassports.textContent = data.canceledPassports;
}

function renderPassportTable() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;
  const filtered = passports.filter(p => {
    const text = [p.candidateName, p.candidateCpf, p.jobPosition, p.candidateAccessKey].join(" ").toLowerCase();
    return (!search || text.includes(search)) && (!status || p.status === status);
  });
  passportTableBody.innerHTML = filtered.map(p => `<tr><td>${escapeHtml(p.candidateName)}</td><td>${escapeHtml(p.candidateCpf)}</td><td>${escapeHtml(p.jobPosition)}</td><td><code>${escapeHtml(accessKeyLabel(p))}</code></td><td>${escapeHtml(p.medicalStatus)}</td><td>${escapeHtml(p.managerStatus)}</td><td>${statusBadge(p.status)}</td></tr>`).join("") || `<tr><td colspan="7" class="empty-cell">Nenhum passaporte encontrado.</td></tr>`;
}

function renderPassportSelect() {
  fillSelect(passportSelect, passports, p => p.id, p => `${p.candidateName} · ${p.jobPosition} · ${p.status}`, "Selecione passaporte");
  if (selectedPassport) passportSelect.value = selectedPassport.id;
}

async function selectPassport(event) { selectedPassport = passports.find(p => p.id === event.target.value) || null; await renderWorkflow(); }

async function renderWorkflow() {
  if (!selectedPassport) { workflowPanel.innerHTML = `<p class="empty-cell">Selecione um passaporte para ver atividades, tarefas e subtarefas.</p>`; return; }
  const tree = await loadWorkflowTree(selectedPassport.id);
  const artifacts = await loadArtifactsByPassport(selectedPassport.id);
  workflowPanel.innerHTML = `${renderWorkflowTree(tree)}<h4 class="section-gap">Artefatos</h4><div class="artifact-list">${artifacts.length ? artifacts.map(a => renderArtifactCard(a)).join("") : `<p class="empty-cell">Sem artefatos.</p>`}</div>`;
  attachArtifactHandlers(workflowPanel, renderWorkflow);
}
