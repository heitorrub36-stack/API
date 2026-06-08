let users = [];
let profiles = [];
let passports = [];
let categories = [];
let selectedPassport = null;
let selectedWorkflow = [];
let selectedArtifacts = [];

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("userForm").addEventListener("submit", createUser);
  document.getElementById("seedUsersButton").addEventListener("click", seedUsers);
  document.getElementById("profileForm").addEventListener("submit", createProfile);
  document.getElementById("createFixedProfilesButton").addEventListener("click", createFixedProfiles);
  document.getElementById("passportForm").addEventListener("submit", createPassport);
  document.getElementById("passportSelect").addEventListener("change", selectPassport);
  document.getElementById("activityForm").addEventListener("submit", createActivity);
  document.getElementById("taskForm").addEventListener("submit", createTask);
  document.getElementById("subtaskForm").addEventListener("submit", createSubtask);
  document.getElementById("categoryForm").addEventListener("submit", createCategory);
  document.getElementById("artifactForm").addEventListener("submit", createArtifact);
  document.getElementById("refreshButton").addEventListener("click", refreshAll);
  document.getElementById("passportProfile").addEventListener("change", syncJobWithProfile);
  renderFixedProfiles();
  renderFixedJobOptions();
  renderDocumentOptions();
  refreshAll();
});

async function refreshAll() {
  try {
    [users, profiles, passports, categories] = await Promise.all([loadUsers(), loadProfiles(), loadPassports(), loadCategories().catch(() => [])]);
    renderUsers();
    renderProfiles();
    renderPassportFormOptions();
    renderCandidateCount();
    renderPassports();
    renderPassportSelect();
    renderCategories();
    renderDocumentOptions();
    await refreshSelectedPassportData();
  } catch (error) {
    showMessage("rhMessage", error.message || "Erro ao carregar dados.", "error");
  }
}

function renderCandidateCount() {
  const candidateCount = document.getElementById("candidateCount");
  if (candidateCount) candidateCount.textContent = passports.length;
}

function renderFixedProfiles() {
  document.getElementById("fixedProfileGrid").innerHTML = FIXED_PROFILES.map(profile => `
    <article class="fixed-card">
      <strong>${profile.name}</strong>
      <span>${profile.description}</span>
      <button type="button" class="ghost-button" data-fixed-profile="${profile.name}">Usar este perfil</button>
    </article>`).join("");
  document.querySelectorAll("[data-fixed-profile]").forEach(button => button.addEventListener("click", () => {
    const profile = FIXED_PROFILES.find(item => item.name === button.dataset.fixedProfile);
    document.getElementById("profileName").value = profile.name;
    document.getElementById("profileDescription").value = profile.description;
    document.getElementById("profileVersion").value = 1;
    document.getElementById("profilePublished").value = "false";
  }));
}

function renderFixedJobOptions() {
  fillSelect(document.getElementById("jobPosition"), FIXED_PROFILES, p => p.name, p => p.name, "Selecione o cargo fixo");
}

function renderDocumentOptions() {
  const allNames = [...new Set([...DOCUMENT_CATEGORIES, ...categories.map(c => c.name)])];
  const select = document.getElementById("artifactDocumentName");
  if (select) {
    select.innerHTML = allNames.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
  }
}

async function createUser(event) {
  event.preventDefault();
  try {
    const payload = {
      name: document.getElementById("userName").value.trim(),
      email: document.getElementById("userEmail").value.trim(),
      role: document.getElementById("userRole").value,
      active: true
    };
    await api("/users", { method: "POST", body: JSON.stringify(payload) });
    event.target.reset();
    showMessage("rhMessage", "Usuário cadastrado com sucesso.", "success");
    await refreshAll();
  } catch (error) { showMessage("rhMessage", error.message, "error"); }
}

async function seedUsers() {
  const examples = [
    { name: "Maria RH", email: "maria.rh@passport.local", role: "RH", active: true },
    { name: "João Candidato", email: "joao.candidato@passport.local", role: "CONTRATADO", active: true },
    { name: "Dra. Ana Medicina", email: "ana.med@passport.local", role: "MEDICINA_TRABALHO", active: true },
    { name: "Carlos Gerente", email: "carlos.gerente@passport.local", role: "GERENTE", active: true },
    { name: "Admin Sistema", email: "admin@passport.local", role: "ADMINISTRADOR", active: true }
  ];
  try {
    const existing = await loadUsers();
    for (const user of examples) {
      if (!existing.some(item => item.email === user.email)) await api("/users", { method: "POST", body: JSON.stringify(user) });
    }
    showMessage("rhMessage", "Atores de exemplo criados ou já existentes.", "success");
    await refreshAll();
  } catch (error) { showMessage("rhMessage", error.message, "error"); }
}

async function createProfile(event) {
  event.preventDefault();
  try {
    const payload = {
      name: document.getElementById("profileName").value.trim(),
      description: document.getElementById("profileDescription").value.trim(),
      version: Number(document.getElementById("profileVersion").value || 1),
      published: document.getElementById("profilePublished").value === "true",
      active: true
    };
    await api("/passport-profiles", { method: "POST", body: JSON.stringify(payload) });
    event.target.reset();
    document.getElementById("profileVersion").value = 1;
    showMessage("rhMessage", "Perfil criado com sucesso.", "success");
    await refreshAll();
  } catch (error) { showMessage("rhMessage", error.message, "error"); }
}

async function createFixedProfiles() {
  try {
    const existing = await loadProfiles();
    for (const p of FIXED_PROFILES) {
      if (!existing.some(e => e.name === p.name)) {
        await api("/passport-profiles", { method: "POST", body: JSON.stringify({ ...p, version: 1, published: true, active: true }) });
      }
    }
    showMessage("rhMessage", "Perfis fixos criados/publicados ou já existentes.", "success");
    await refreshAll();
  } catch (error) { showMessage("rhMessage", error.message, "error"); }
}

async function updateProfile(profile, patch) {
  const payload = { name: profile.name, description: profile.description, version: profile.version || 1, published: profile.published || false, active: profile.active !== false, ...patch };
  await api(`/passport-profiles/${profile.id}`, { method: "PUT", body: JSON.stringify(payload) });
  await refreshAll();
}

async function createProfileNewVersion(profile) {
  const base = profile.name.replace(/\s+-\s+v\d+$/i, "");
  const version = (profile.version || 1) + 1;
  await api("/passport-profiles", { method: "POST", body: JSON.stringify({ name: `${base} - v${version}`, description: `Nova versão de ${profile.name}. ${profile.description || ""}`, version, published: false, active: true }) });
  showMessage("rhMessage", "Nova versão do perfil criada como rascunho.", "success");
  await refreshAll();
}

async function createPassport(event) {
  event.preventDefault();
  try {
    const payload = {
      createdByRh: document.getElementById("createdByRh").value,
      profileId: document.getElementById("passportProfile").value,
      candidateName: document.getElementById("candidateName").value.trim(),
      candidateCpf: document.getElementById("candidateCpf").value.trim(),
      jobPosition: document.getElementById("jobPosition").value
    };
    const passport = await api("/passports", { method: "POST", body: JSON.stringify(payload) });
    selectedPassport = passport;
    event.target.reset();
    showMessage("rhMessage", `Passaporte criado. Chave do candidato: ${accessKeyLabel(passport)}`, "success");
    await refreshAll();
  } catch (error) { showMessage("rhMessage", error.message, "error"); }
}

function syncJobWithProfile() {
  const id = document.getElementById("passportProfile").value;
  const profile = profiles.find(p => p.id === id);
  if (profile && FIXED_PROFILES.some(f => f.name === profile.name)) document.getElementById("jobPosition").value = profile.name;
}

async function createActivity(event) {
  event.preventDefault();
  if (!selectedPassport) return showMessage("rhMessage", "Selecione um passaporte.", "error");
  await api(`/workflow/passports/${selectedPassport.id}/activities`, { method: "POST", body: JSON.stringify({ name: activityName.value.trim(), description: "Atividade criada pelo RH", orderNumber: Number(activityOrder.value || selectedWorkflow.length + 1), responsibleRole: activityRole.value }) });
  event.target.reset();
  await refreshSelectedPassportData();
}

async function createTask(event) {
  event.preventDefault();
  await api(`/workflow/activities/${activityForTask.value}/tasks`, { method: "POST", body: JSON.stringify({ name: taskName.value.trim(), description: "Tarefa criada pelo RH", deadline: taskDeadline.value || null, responsibleRole: taskRole.value }) });
  event.target.reset();
  await refreshSelectedPassportData();
}

async function createSubtask(event) {
  event.preventDefault();
  await api(`/workflow/tasks/${taskForSubtask.value}/subtasks`, { method: "POST", body: JSON.stringify({ name: subtaskName.value.trim(), description: "Subtarefa criada pelo RH", deadline: subtaskDeadline.value || null, responsibleRole: subtaskRole.value }) });
  event.target.reset();
  await refreshSelectedPassportData();
}

async function createCategory(event) {
  event.preventDefault();
  try {
    await api("/document-categories", { method: "POST", body: JSON.stringify({ name: categoryName.value.trim(), description: categoryDescription.value.trim(), permitType: categoryPermitType.value.trim(), active: true }) });
    event.target.reset();
    showMessage("rhMessage", "Categoria de documento criada.", "success");
    await refreshAll();
  } catch (error) { showMessage("rhMessage", error.message, "error"); }
}

async function createArtifact(event) {
  event.preventDefault();
  if (!selectedPassport) return showMessage("rhMessage", "Selecione um passaporte.", "error");
  const [targetType, id] = artifactTarget.value.split(":");
  const file = artifactFile.files[0];
  const selectedFileType = document.getElementById("artifactFileType").value;
  const payload = {
    documentName: artifactDocumentName.value,
    fileName: file.name,
    fileType: selectedFileType || file.type || "application/octet-stream",
    notes: `Origem: RH; Destino: ${artifactDestination.value}; Tipo do documento: ${artifactDocumentName.value}; Tipo do arquivo: ${selectedFileType}; ${artifactNotes.value.trim()}`
  };
  if (targetType === "ACTIVITY") payload.activityId = id;
  if (targetType === "TASK") payload.taskId = id;
  if (targetType === "SUBTASK") payload.subtaskId = id;
  try {
    const artifact = await api("/artifacts", { method: "POST", body: JSON.stringify(payload) });
    await saveArtifactFile(artifact.id, file);
    event.target.reset();
    showMessage("rhMessage", "Artefato vinculado ao workflow.", "success");
    await refreshSelectedPassportData();
  } catch (error) { showMessage("rhMessage", error.message, "error"); }
}

function renderUsers() {
  userList.innerHTML = users.map(u => `<article class="actor-row"><strong>${escapeHtml(u.name)}</strong><span>${escapeHtml(u.email)}</span><span class="mini-status">${roleLabel(u.role)}</span></article>`).join("") || `<p class="empty-cell">Nenhum usuário cadastrado.</p>`;
}

function renderProfiles() {
  profileList.innerHTML = profiles.map(p => `
    <article class="actor-row"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.description || "Sem descrição")}</span><span class="mini-status">v${p.version || 1} · ${p.published ? "Publicado" : "Rascunho"} · ${p.active ? "Ativo" : "Inativo"}</span><div class="row-actions"><button data-publish-profile="${p.id}" class="mini-button">Publicar</button><button data-toggle-profile="${p.id}" class="mini-button">${p.active ? "Desabilitar" : "Habilitar"}</button><button data-version-profile="${p.id}" class="mini-button">Nova versão</button></div></article>`).join("") || `<p class="empty-cell">Nenhum perfil cadastrado.</p>`;
  profileList.querySelectorAll("[data-publish-profile]").forEach(b => b.onclick = async () => updateProfile(profiles.find(p => p.id === b.dataset.publishProfile), { published: true, active: true }));
  profileList.querySelectorAll("[data-toggle-profile]").forEach(b => b.onclick = async () => { const p = profiles.find(p => p.id === b.dataset.toggleProfile); await updateProfile(p, { active: !p.active }); });
  profileList.querySelectorAll("[data-version-profile]").forEach(b => b.onclick = async () => createProfileNewVersion(profiles.find(p => p.id === b.dataset.versionProfile)));
}

function renderPassportFormOptions() {
  fillSelect(createdByRh, users.filter(u => u.role === "RH" && u.active), u => u.id, u => u.name, "Selecione o RH");
  fillSelect(passportProfile, profiles.filter(p => p.active && p.published), p => p.id, p => `${p.name} · v${p.version || 1}`, "Selecione perfil publicado");
}

function renderPassports() {
  passportTableBody.innerHTML = passports.map(p => `<tr><td>${escapeHtml(p.candidateName)}</td><td>${escapeHtml(p.candidateCpf)}</td><td>${escapeHtml(p.jobPosition)}</td><td><code>${escapeHtml(accessKeyLabel(p))}</code></td><td>${escapeHtml(profileName(p))}</td><td>${escapeHtml(userName(p.createdByRh))}</td><td>${statusBadge(p.status)}</td></tr>`).join("") || `<tr><td colspan="7" class="empty-cell">Nenhum passaporte cadastrado.</td></tr>`;
}

function renderPassportSelect() {
  fillSelect(passportSelect, passports, p => p.id, p => `${p.candidateName} · ${p.jobPosition} · ${accessKeyLabel(p)}`, "Selecione um passaporte");
  if (selectedPassport) passportSelect.value = selectedPassport.id;
}

async function selectPassport(event) {
  selectedPassport = passports.find(p => p.id === event.target.value) || null;
  await refreshSelectedPassportData();
}

async function refreshSelectedPassportData() {
  if (!selectedPassport) {
    workflowPanel.innerHTML = `<p class="empty-cell">Selecione um passaporte para ver o workflow.</p>`;
    artifactTarget.innerHTML = `<option value="">Selecione um passaporte primeiro</option>`;
    activityForTask.innerHTML = `<option value="">Selecione um passaporte primeiro</option>`;
    taskForSubtask.innerHTML = `<option value="">Selecione uma tarefa primeiro</option>`;
    artifactList.innerHTML = "";
    if (typeof rhInboxList !== "undefined") rhInboxList.innerHTML = `<p class="empty-cell">Selecione um passaporte para ver documentos recebidos.</p>`;
    return;
  }
  selectedWorkflow = await loadWorkflowTree(selectedPassport.id);
  selectedArtifacts = await loadArtifactsByPassport(selectedPassport.id);
  workflowPanel.innerHTML = renderWorkflowTree(selectedWorkflow, { mutable: true });
  attachWorkflowHandlers(workflowPanel, refreshSelectedPassportData);
  const flat = flattenWorkflow(selectedWorkflow);
  fillSelect(activityForTask, flat.filter(i => i.targetType === "ACTIVITY"), i => i.id, i => i.label, "Selecione atividade");
  fillSelect(taskForSubtask, flat.filter(i => i.targetType === "TASK"), i => i.id, i => i.label, "Selecione tarefa");
  fillSelect(artifactTarget, flat, i => `${i.targetType}:${i.id}`, i => `${"—".repeat(i.level)} ${i.label}`, "Selecione destino");
  const inboxArtifacts = selectedArtifacts.filter(a => artifactDestination(a) === "RH" && artifactOrigin(a) === "Candidato");
  rhInboxList.innerHTML = inboxArtifacts.length
    ? inboxArtifacts.map(a => renderArtifactCard(a, { canForward: true })).join("")
    : `<p class="empty-cell">Nenhum documento enviado pelo candidato aguardando encaminhamento do RH.</p>`;
  attachArtifactHandlers(rhInboxList, refreshSelectedPassportData);
  attachForwardHandlers(rhInboxList);

  artifactList.innerHTML = selectedArtifacts.length ? selectedArtifacts.map(a => renderArtifactCard(a, { canValidate: true })).join("") : `<p class="empty-cell">Nenhum artefato.</p>`;
  attachArtifactHandlers(artifactList, refreshSelectedPassportData);
}


async function forwardArtifact(originalArtifact, destination) {
  const targetLabel = destination === "MEDICINA" ? "Medicina" : "Gerente";
  const payload = {
    activityId: originalArtifact.activity?.id || null,
    taskId: originalArtifact.task?.id || null,
    subtaskId: originalArtifact.subtask?.id || null,
    documentName: originalArtifact.documentName,
    fileName: originalArtifact.fileName,
    fileType: originalArtifact.fileType,
    notes: `Origem: RH; Encaminhado para: ${destination}; Documento recebido do candidato; Tipo do documento: ${originalArtifact.documentName}; Tipo do arquivo: ${originalArtifact.fileType}; Referência original: ${originalArtifact.id}`
  };

  const forwarded = await api("/artifacts", { method: "POST", body: JSON.stringify(payload) });
  copyArtifactFile(originalArtifact.id, forwarded.id);
  showMessage("rhMessage", `Documento encaminhado para ${targetLabel}.`, "success");
  await refreshSelectedPassportData();
}

function copyArtifactFile(sourceId, destinationId) {
  const storedFile = localStorage.getItem(`artifact-file-${sourceId}`);
  if (storedFile) localStorage.setItem(`artifact-file-${destinationId}`, storedFile);
}

function attachForwardHandlers(container) {
  container.querySelectorAll("[data-forward-artifact]").forEach(button => {
    button.addEventListener("click", async () => {
      const artifact = selectedArtifacts.find(item => item.id === button.dataset.artifactId);
      if (!artifact) return showMessage("rhMessage", "Documento não encontrado para encaminhamento.", "error");
      await forwardArtifact(artifact, button.dataset.forwardArtifact);
    });
  });
}

function renderCategories() {
  categoryList.innerHTML = categories.length ? categories.map(c => `<span class="tag">${escapeHtml(c.name)} · ${escapeHtml(c.permitType || "")}</span>`).join("") : DOCUMENT_CATEGORIES.map(c => `<span class="tag muted-tag">${escapeHtml(c)}</span>`).join("");
}
