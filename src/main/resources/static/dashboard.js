let passports = [];
let selectedPassport = null;

window.addEventListener("DOMContentLoaded", () => {
  const refreshButton = document.getElementById("refreshDashboardButton");
  const search = document.getElementById("searchInput");
  const status = document.getElementById("statusFilter");
  const select = document.getElementById("passportSelect");

  refreshButton?.addEventListener("click", refreshDashboard);
  search?.addEventListener("input", renderPassportTable);
  status?.addEventListener("change", renderPassportTable);
  select?.addEventListener("change", selectPassport);

  refreshDashboard();
});

async function refreshDashboard() {
  try {
    const [dashboard, loadedPassports] = await Promise.all([loadDashboard(), loadPassports()]);
    passports = Array.isArray(loadedPassports) ? loadedPassports : [];
    renderCards(dashboard || {});
    renderPassportTable();
    renderPassportSelect();
    await renderWorkflow();
  } catch (error) {
    showMessage("dashboardMessage", error.message || "Erro ao carregar dashboard.", "error");
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? 0;
}

function renderCards(data) {
  setText("totalPassports", data.totalPassports);
  setText("pendingMedicalEvaluation", data.pendingMedicalEvaluation);
  setText("fitWaitingManagerStatus", data.fitWaitingManagerStatus);
  setText("openPassports", data.openPassports);
  setText("validPassports", data.validPassports);
  setText("invalidPassports", data.invalidPassports);
  setText("canceledPassports", data.canceledPassports);
}

function renderPassportTable() {
  const tableBody = document.getElementById("passportTableBody");
  if (!tableBody) return;

  const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const status = document.getElementById("statusFilter")?.value || "";

  const filtered = passports.filter(passport => {
    const text = [passport.candidateName, passport.candidateCpf, passport.jobPosition, passport.candidateAccessKey]
      .join(" ")
      .toLowerCase();

    return (!search || text.includes(search)) && (!status || passport.status === status);
  });

  tableBody.innerHTML = filtered.map(passport => `
    <tr>
      <td>${escapeHtml(passport.candidateName)}</td>
      <td>${escapeHtml(passport.candidateCpf)}</td>
      <td>${escapeHtml(passport.jobPosition)}</td>
      <td><code>${escapeHtml(accessKeyLabel(passport))}</code></td>
      <td>${escapeHtml(passport.medicalStatus)}</td>
      <td>${escapeHtml(passport.managerStatus)}</td>
      <td>${statusBadge(passport.status)}</td>
    </tr>
  `).join("") || `<tr><td colspan="7" class="empty-cell">Nenhum passaporte encontrado.</td></tr>`;
}

function renderPassportSelect() {
  const select = document.getElementById("passportSelect");
  if (!select) return;

  fillSelect(
    select,
    passports,
    passport => passport.id,
    passport => `${passport.candidateName} · ${passport.jobPosition} · ${passport.status}`,
    "Selecione passaporte"
  );

  if (selectedPassport) select.value = selectedPassport.id;
}

async function selectPassport(event) {
  selectedPassport = passports.find(passport => passport.id === event.target.value) || null;
  await renderWorkflow();
}

async function renderWorkflow() {
  const panel = document.getElementById("workflowPanel");
  if (!panel) return;

  if (!selectedPassport) {
    panel.innerHTML = `<p class="empty-cell">Selecione um passaporte para ver atividades, tarefas e subtarefas.</p>`;
    return;
  }

  const tree = await loadWorkflowTree(selectedPassport.id);
  const artifacts = await loadArtifactsByPassport(selectedPassport.id);

  panel.innerHTML = `
    ${renderWorkflowTree(tree)}
    <h4 class="section-gap">Artefatos</h4>
    <div class="artifact-list">
      ${artifacts.length ? artifacts.map(artifact => renderArtifactCard(artifact)).join("") : `<p class="empty-cell">Sem artefatos.</p>`}
    </div>
  `;

  attachArtifactHandlers(panel, renderWorkflow);
}
