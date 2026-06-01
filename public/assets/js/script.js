document.addEventListener('DOMContentLoaded', function() {

  // ── Scroll animation ──────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── cniFile (seulement sur les pages qui l'ont) ───────
 
const cniFile = document.getElementById('cniFile');
if (cniFile) {
  cniFile.addEventListener('change', function() {
    const wrap = this.closest('.file-input-wrap');
    const btn = wrap.querySelector('.file-btn');
    const text = wrap.querySelector('.file-text strong');
    if (this.files && this.files[0]) {
      text.textContent = this.files[0].name;
      btn.innerHTML = '<i class="bi bi-check-circle me-1" style="color:#198754"></i>Chargé';
      wrap.style.borderColor = '#198754';
    }
  });
}

  // ── Filter pills ──────────────────────────────────────
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.table-toolbar, .d-flex')
        ?.querySelectorAll('.filter-pill')
        .forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // ── OTP auto-focus ────────────────────────────────────
  document.querySelectorAll('#twoFAModal input[maxlength="1"]')
    .forEach((input, i, inputs) => {
      input.addEventListener('input', () => {
        if (input.value && i < inputs.length - 1) inputs[i+1].focus();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) inputs[i-1].focus();
      });
    });

  // ── Sidebar navigation ────────────────────────────────
  const sidebarItems = document.querySelectorAll('.sidebar-item[data-panel]');
  const panels = document.querySelectorAll('.portal-panel');
  if (sidebarItems.length > 0) {
    sidebarItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.dataset.panel;
        sidebarItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        panels.forEach(p => p.classList.remove('active'));
        document.getElementById('panel-' + target)?.classList.add('active');
        document.getElementById('sidebarEl')?.classList.remove('open');
      });
    });
  }

  // ── File inputs génériques ────────────────────────────
  document.querySelectorAll('.file-input-wrap input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
      const wrap = this.closest('.file-input-wrap');
      const btn = wrap.querySelector('.file-btn-sm');
      const strong = wrap.querySelector('strong');
      if (this.files && this.files[0]) {
        const name = this.files[0].name.length > 20
          ? this.files[0].name.substring(0, 18) + '…'
          : this.files[0].name;
        if (strong) strong.textContent = name;
        if (btn) btn.innerHTML = '<i class="bi bi-check-circle" style="color:#198754"></i>';
        wrap.style.borderColor = '#198754';
      }
    });
  });

});