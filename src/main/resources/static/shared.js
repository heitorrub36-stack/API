const API_BASE_URL = "http://localhost:8080/api";

const FIXED_PROFILES = [
  { name: "MOTORISTA 1", description: "Perfil de admissão para motorista nível 1, com CNH e avaliação médica." },
  { name: "MOTORISTA 2", description: "Perfil de admissão para motorista nível 2, com CNH, exames e decisão gerencial." },
  { name: "ALMOXARIFE", description: "Perfil de admissão para controle de estoque, documentos pessoais e validação RH." },
  { name: "PORTEIRO", description: "Perfil de admissão para portaria, documentação básica e avaliação final." },
  { name: "RECEPCIONISTA", description: "Perfil de admissão para recepção, documentação básica e decisão gerencial." }
];

const DOCUMENT_CATEGORIES = ["RG", "CPF", "CNH", "Comprovante de Endereço", "Exame Admissional", "Certidão de Nascimento", "Certidão de Casamento", "Diploma", "Antecedentes Criminais"];

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || data.error || data.detail || message;
    } catch (_) {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMessage(id, text, type = "success") {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  el.className = `message ${type}`;
  el.textContent = text;
  clearTimeout(el.dataset.timer);
  el.dataset.timer = setTimeout(() => { el.hidden = true; }, 5000);
}

function fillSelect(select, items, valueFn, labelFn, placeholder = "Selecione") {
  if (!select) return;
  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = valueFn(item);
    option.textContent = labelFn(item);
    select.appendChild(option);
  });
}

function roleLabel(role) {
  const labels = {
    ADMINISTRADOR: "Administrador",
    RH: "RH",
    GERENTE: "Gerente",
    MEDICINA_TRABALHO: "Medicina do Trabalho",
    SEGURANCA_TRABALHO: "Segurança do Trabalho",
    CONTRATADO: "Contratado",
    MEDICINA: "Medicina do Trabalho",
    GERAL: "Geral"
  };
  return labels[role] || role || "-";
}

function statusBadge(status) {
  const cls = String(status || "ABERTA").toLowerCase();
  return `<span class="status status-${cls}">${escapeHtml(status || "ABERTA")}</span>`;
}

function artifactStatusBadge(status) {
  return `<span class="artifact-status artifact-${String(status || "ABERTA").toLowerCase()}">${escapeHtml(status || "ABERTA")}</span>`;
}

function formatDate(value) {
  if (!value) return "-";
  const [y, m, d] = String(value).split("-");
  return d ? `${d}/${m}/${y}` : value;
}

function profileName(passport) {
  return passport?.profile?.name || passport?.jobPosition || "Sem perfil";
}

function userName(user) {
  return user?.name || "-";
}

function passportLabel(passport) {
  return `${passport.candidateName} · ${passport.jobPosition || profileName(passport)} · ${passport.status}`;
}

function accessKeyLabel(passport) {
  return passport?.candidateAccessKey ? passport.candidateAccessKey : "sem chave";
}

async function loadUsers() { return api("/users"); }
async function loadProfiles() { return api("/passport-profiles"); }
async function loadPassports() { return api("/passports"); }
async function loadCategories() { return api("/document-categories"); }
async function loadPassportByAccessKey(key) { return api(`/passports/access/${encodeURIComponent(key.trim().toUpperCase())}`); }

async function loadWorkflowTree(passportId) {
  if (!passportId) return [];
  const activities = await api(`/workflow/passports/${passportId}/activities`);
  for (const activity of activities) {
    activity.tasks = await api(`/workflow/activities/${activity.id}/tasks`);
    for (const task of activity.tasks) {
      task.subtasks = await api(`/workflow/tasks/${task.id}/subtasks`);
    }
  }
  return activities;
}

async function loadArtifactsByPassport(passportId) {
  if (!passportId) return [];
  return api(`/artifacts/passport/${passportId}`);
}

function flattenWorkflow(workflow) {
  const items = [];
  workflow.forEach(activity => {
    items.push({ kind: "activities", targetType: "ACTIVITY", id: activity.id, label: activity.name, level: 0, responsibleRole: activity.responsibleRole });
    (activity.tasks || []).forEach(task => {
      items.push({ kind: "tasks", targetType: "TASK", id: task.id, label: task.name, level: 1, responsibleRole: task.responsibleRole });
      (task.subtasks || []).forEach(subtask => {
        items.push({ kind: "subtasks", targetType: "SUBTASK", id: subtask.id, label: subtask.name, level: 2, responsibleRole: subtask.responsibleRole });
      });
    });
  });
  return items;
}

function renderWorkflowTree(workflow, options = {}) {
  if (!workflow || !workflow.length) return `<p class="empty-cell">Nenhuma atividade cadastrada para este passaporte.</p>`;
  return workflow.map(activity => `
    <article class="workflow-card activity-card">
      <div class="workflow-head">
        <div><strong>${escapeHtml(activity.orderNumber || "")}. ${escapeHtml(activity.name)}</strong><span>${escapeHtml(activity.description || "")}</span></div>
        <div class="workflow-actions">${statusBadge(activity.status)}<small>${roleLabel(activity.responsibleRole)}</small>${options.mutable ? workflowStatusButtons("activities", activity.id) : ""}</div>
      </div>
      <div class="workflow-children">
        ${(activity.tasks || []).map(task => `
          <div class="workflow-card task-card">
            <div class="workflow-head">
              <div><strong>${escapeHtml(task.orderNumber || "")}. ${escapeHtml(task.name)}</strong><span>${escapeHtml(task.description || "")}</span><small>Prazo: ${formatDate(task.deadline)}</small></div>
              <div class="workflow-actions">${statusBadge(task.status)}<small>${roleLabel(task.responsibleRole)}</small>${options.mutable ? workflowStatusButtons("tasks", task.id) : ""}${options.canSign ? `<button type="button" class="mini-button" data-sign="TASK" data-id="${task.id}">Assinar</button>` : ""}</div>
            </div>
            <div class="subtask-list">
              ${(task.subtasks || []).map(subtask => `
                <div class="subtask-row">
                  <div><strong>${escapeHtml(subtask.name)}</strong><span>${escapeHtml(subtask.description || "")}</span><small>Prazo: ${formatDate(subtask.deadline)} · ${roleLabel(subtask.responsibleRole)}</small></div>
                  <div class="workflow-actions">${statusBadge(subtask.status)}${options.mutable ? workflowStatusButtons("subtasks", subtask.id) : ""}${options.canSign ? `<button type="button" class="mini-button" data-sign="SUBTASK" data-id="${subtask.id}">Assinar</button>` : ""}</div>
                </div>`).join("") || `<p class="empty-cell small-empty">Sem subtarefas.</p>`}
            </div>
          </div>`).join("") || `<p class="empty-cell small-empty">Sem tarefas.</p>`}
      </div>
    </article>`).join("");
}

function workflowStatusButtons(kind, id) {
  return `<button type="button" class="mini-button" data-workflow-kind="${kind}" data-workflow-id="${id}" data-workflow-status="VALIDA">Válida</button><button type="button" class="mini-button danger-text" data-workflow-kind="${kind}" data-workflow-id="${id}" data-workflow-status="INVALIDA">Inválida</button>`;
}

async function updateWorkflowStatus(kind, id, status) {
  return api(`/workflow/${kind}/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

function attachWorkflowHandlers(container, refresh) {
  container.querySelectorAll("[data-workflow-kind]").forEach(button => {
    button.addEventListener("click", async () => {
      await updateWorkflowStatus(button.dataset.workflowKind, button.dataset.workflowId, button.dataset.workflowStatus);
      await refresh();
    });
  });
}

async function saveArtifactFile(artifactId, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(`artifact-file-${artifactId}`, JSON.stringify({ name: file.name, type: file.type || "application/octet-stream", dataUrl: reader.result }));
      resolve();
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function openArtifact(artifactId) {
  const storedFile = localStorage.getItem(`artifact-file-${artifactId}`);
  if (!storedFile) { alert("Arquivo físico indisponível neste navegador; a API armazena os metadados do artefato."); return; }
  const file = JSON.parse(storedFile);
  const w = window.open();
  if (!w) { alert("Permita pop-ups para visualizar o documento."); return; }
  w.document.write(`<title>${escapeHtml(file.name)}</title><iframe src="${file.dataUrl}" style="border:0;height:100vh;width:100vw"></iframe>`);
  w.document.close();
}

function artifactDestination(artifact) {
  const notes = String(artifact.notes || "").toUpperCase();
  if (notes.includes("ENCAMINHADO PARA: MEDICINA") || notes.includes("DESTINO: MEDICINA") || notes.includes("ENVIADO PARA: MEDICINA")) return "MEDICINA_TRABALHO";
  if (notes.includes("ENCAMINHADO PARA: GERENTE") || notes.includes("DESTINO: GERENTE") || notes.includes("ENVIADO PARA: GERENTE")) return "GERENTE";
  if (notes.includes("ENVIADO PARA: RH") || notes.includes("DESTINO: RH") || notes.includes("PENDENTE_RH") || notes.includes("ORIGEM: CANDIDATO")) return "RH";
  return "GERAL";
}

function artifactOrigin(artifact) {
  const notes = String(artifact.notes || "").toUpperCase();
  if (notes.includes("ORIGEM: CANDIDATO")) return "Candidato";
  if (notes.includes("ORIGEM: RH")) return "RH";
  return "Sistema";
}

function artifactFlowLabel(artifact) {
  const destination = artifactDestination(artifact);
  const origin = artifactOrigin(artifact);
  if (origin === "Candidato" && destination === "RH") return "Candidato → RH";
  if (origin === "RH" && destination === "MEDICINA_TRABALHO") return "RH → Medicina";
  if (origin === "RH" && destination === "GERENTE") return "RH → Gerente";
  return `${origin} → ${roleLabel(destination)}`;
}

function artifactTargetLabel(artifact) {
  if (artifact.subtask) return `Subtarefa: ${artifact.subtask.name}`;
  if (artifact.task) return `Tarefa: ${artifact.task.name}`;
  if (artifact.activity) return `Atividade: ${artifact.activity.name}`;
  return "Workflow";
}

function renderArtifactCard(artifact, options = {}) {
  const reason = artifact.invalidationReason ? `<p class="invalid-reason"><strong>Motivo:</strong> ${escapeHtml(artifact.invalidationReason)}</p>` : "";
  return `
    <article class="artifact-card">
      <div class="artifact-heading"><div><strong>${escapeHtml(artifact.documentName)}</strong><span>${escapeHtml(artifact.fileName)} · ${escapeHtml(artifact.fileType)}</span></div>${artifactStatusBadge(artifact.status)}</div>
      <p>${escapeHtml(artifact.notes || "Sem observações")}</p>${reason}
      <div class="artifact-meta"><span>${escapeHtml(artifactTargetLabel(artifact))}</span><span>Fluxo: ${escapeHtml(artifactFlowLabel(artifact))}</span><span>Tipo: ${escapeHtml(artifact.fileType || "-")}</span><span>Enviado em: ${formatDate(artifact.uploadDate)}</span></div>
      <div class="artifact-actions">
        <button type="button" class="ghost-button" data-open-artifact="${artifact.id}">Abrir</button>
        ${options.canForward ? `<button type="button" class="ghost-button" data-forward-artifact="MEDICINA" data-artifact-id="${artifact.id}">Enviar para Medicina</button><button type="button" class="ghost-button" data-forward-artifact="GERENTE" data-artifact-id="${artifact.id}">Enviar para Gerente</button>` : ""}
        ${options.canValidate ? `<button type="button" class="ghost-button" data-validate-artifact="${artifact.id}">Validar</button><button type="button" class="ghost-button danger-text" data-invalidate-artifact="${artifact.id}">Invalidar</button>` : ""}
        ${options.canSign ? `<button type="button" class="ghost-button" data-sign="ARTIFACT" data-id="${artifact.id}">Assinar</button>` : ""}
      </div>
    </article>`;
}

async function validateArtifact(id) { return api(`/artifacts/validate/${id}`, { method: "PATCH" }); }
async function invalidateArtifact(id, reason) { return api(`/artifacts/${id}/invalidate`, { method: "PATCH", body: JSON.stringify({ reason }) }); }
async function signTarget(signedByUserId, targetType, targetId) { return api("/signatures", { method: "POST", body: JSON.stringify({ signedByUserId, targetType, targetId }) }); }

function attachArtifactHandlers(container, onRefresh) {
  container.querySelectorAll("[data-open-artifact]").forEach(btn => btn.addEventListener("click", () => openArtifact(btn.dataset.openArtifact)));
  container.querySelectorAll("[data-validate-artifact]").forEach(btn => btn.addEventListener("click", async () => { await validateArtifact(btn.dataset.validateArtifact); await onRefresh(); }));
  container.querySelectorAll("[data-invalidate-artifact]").forEach(btn => btn.addEventListener("click", async () => { const reason = prompt("Motivo da invalidação:"); if (reason) { await invalidateArtifact(btn.dataset.invalidateArtifact, reason); await onRefresh(); } }));
}

function attachSignatureHandlers(container, reviewerSelectId, onRefresh) {
  container.querySelectorAll("[data-sign]").forEach(button => {
    button.addEventListener("click", async () => {
      const userId = document.getElementById(reviewerSelectId)?.value;
      if (!userId) { alert("Selecione o usuário responsável antes de assinar."); return; }
      await signTarget(userId, button.dataset.sign, button.dataset.id);
      alert("Assinatura eletrônica registrada.");
      if (onRefresh) await onRefresh();
    });
  });
}
