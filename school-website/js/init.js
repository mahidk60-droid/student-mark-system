window.addEventListener('firebase-ready', async () => {
  await renderStorageUI();
});

window.addEventListener('DOMContentLoaded', () => {
  buildAdminClassAssignUI();
  updateSubjectDropdown();
  toggleGroupVisibility();
});
