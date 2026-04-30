// shared.js — inject navbar and footer
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

function isActive(page) {
  return currentPage === page ? 'active' : '';
}

document.addEventListener('DOMContentLoaded', function() {
  // Inject topbar + navbar
  const navContainer = document.getElementById('navbar-container');
  if (navContainer) {
    navContainer.innerHTML = `
    <div class="topbar">
      <div class="container d-flex justify-content-between align-items-center">
        <div>
          <i class="bi bi-geo-alt-fill me-1"></i> Mairie de Douala — République du Cameroun
          <span class="sep">|</span>
          <a href="#"><i class="bi bi-telephone-fill me-1"></i>+237 233 42 10 00</a>
          <span class="sep">|</span>
          <a href="#">contact@mairie-douala.cm</a>
        </div>
        <div>
          <a href="#" class="me-3"><i class="bi bi-translate me-1"></i>Français</a>
          <a href="#"><i class="bi bi-universal-access me-1"></i>Accessibilité</a>
        </div>
      </div>
    </div>
    <nav class="navbar-main">
      <div class="container">
        <a class="navbar-brand-wrap" href="index.html" style="text-decoration:none">
          <div class="navbar-logo">M</div>
          <div class="navbar-brand-text">
            <strong>Mairie de Douala</strong>
            <small>e-Gouvernance / GED</small>
          </div>
        </a>
        <ul class="navbar-nav-links">
          <li><a href="index.html" class="${isActive('index.html')}">Accueil</a></li>
          <li><a href="etat-civil.html" class="${isActive('etat-civil.html')}">État Civil</a></li>
          <li><a href="permis.html" class="${isActive('permis.html')}">Permis de Bâtir</a></li>
          <li><a href="rdv.html" class="${isActive('rdv.html')}">Rendez-vous</a></li>
          <li><a href="contact.html" class="${isActive('contact.html')}">Contact</a></li>
          <li><a href="login.html" class="btn-login"><i class="bi bi-person-fill"></i>Mon Espace</a></li>
        </ul>
        <button class="d-lg-none btn" style="font-size:24px;color:var(--primary);border:none" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
          <i class="bi bi-list"></i>
        </button>
      </div>
    </nav>
    <!-- Mobile Menu -->
    <div class="offcanvas offcanvas-end" id="mobileMenu" tabindex="-1">
      <div class="offcanvas-header" style="border-bottom:2px solid var(--accent)">
        <h5 class="offcanvas-title" style="font-family:'Playfair Display',serif;color:var(--primary)">Mairie de Douala</h5>
        <button class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body">
        <ul class="list-unstyled" style="font-size:16px">
          <li class="mb-2"><a href="index.html" class="d-block py-2 px-3 rounded" style="color:var(--text-dark);font-weight:600"><i class="bi bi-house me-2" style="color:var(--primary)"></i>Accueil</a></li>
          <li class="mb-2"><a href="etat-civil.html" class="d-block py-2 px-3 rounded" style="color:var(--text-dark);font-weight:600"><i class="bi bi-file-text me-2" style="color:var(--primary)"></i>État Civil</a></li>
          <li class="mb-2"><a href="permis.html" class="d-block py-2 px-3 rounded" style="color:var(--text-dark);font-weight:600"><i class="bi bi-building me-2" style="color:var(--primary)"></i>Permis de Bâtir</a></li>
          <li class="mb-2"><a href="rdv.html" class="d-block py-2 px-3 rounded" style="color:var(--text-dark);font-weight:600"><i class="bi bi-calendar3 me-2" style="color:var(--primary)"></i>Rendez-vous</a></li>
          <li class="mb-2"><a href="contact.html" class="d-block py-2 px-3 rounded" style="color:var(--text-dark);font-weight:600"><i class="bi bi-telephone me-2" style="color:var(--primary)"></i>Contact</a></li>
          <li class="mt-4"><a href="login.html" class="btn w-100" style="background:var(--primary);color:white;font-weight:700;padding:12px"><i class="bi bi-person-fill me-2"></i>Mon Espace Citoyen</a></li>
        </ul>
      </div>
    </div>`;
  }

  // Inject footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = `
    <footer>
      <div class="container">
        <div class="row g-5">
          <div class="col-lg-4">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="navbar-logo">M</div>
              <div>
                <strong style="color:white;font-family:'Playfair Display',serif;font-size:18px">Mairie de Douala</strong>
                <div style="font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:1px">e-Gouvernance</div>
              </div>
            </div>
            <p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,0.6)">
              La Mairie de Douala s'engage pour un service public numérique, accessible et transparent. 
              Vos démarches en ligne, 24h/24 et 7j/7.
            </p>
            <div class="social-links">
              <a href="#" class="social-link"><i class="bi bi-facebook"></i></a>
              <a href="#" class="social-link"><i class="bi bi-twitter-x"></i></a>
              <a href="#" class="social-link"><i class="bi bi-youtube"></i></a>
              <a href="#" class="social-link"><i class="bi bi-whatsapp"></i></a>
            </div>
          </div>
          <div class="col-lg-2 col-md-4">
            <h6>Services</h6>
            <ul>
              <li><a href="etat-civil.html"><i class="bi bi-chevron-right"></i>État Civil</a></li>
              <li><a href="permis.html"><i class="bi bi-chevron-right"></i>Permis de Bâtir</a></li>
              <li><a href="rdv.html"><i class="bi bi-chevron-right"></i>Rendez-vous</a></li>
              <li><a href="#"><i class="bi bi-chevron-right"></i>Paiements en ligne</a></li>
              <li><a href="#"><i class="bi bi-chevron-right"></i>Suivi de dossier</a></li>
            </ul>
          </div>
          <div class="col-lg-2 col-md-4">
            <h6>La Mairie</h6>
            <ul>
              <li><a href="#"><i class="bi bi-chevron-right"></i>Le Maire</a></li>
              <li><a href="#"><i class="bi bi-chevron-right"></i>Conseil municipal</a></li>
              <li><a href="#"><i class="bi bi-chevron-right"></i>Budget</a></li>
              <li><a href="#"><i class="bi bi-chevron-right"></i>Délibérations</a></li>
              <li><a href="#"><i class="bi bi-chevron-right"></i>Marchés publics</a></li>
            </ul>
          </div>
          <div class="col-lg-4 col-md-4">
            <h6>Contact & Horaires</h6>
            <ul>
              <li><a href="#"><i class="bi bi-geo-alt"></i>Avenue de l'Indépendance, Douala</a></li>
              <li><a href="tel:+237233421000"><i class="bi bi-telephone"></i>+237 233 42 10 00</a></li>
              <li><a href="mailto:contact@mairie-douala.cm"><i class="bi bi-envelope"></i>contact@mairie-douala.cm</a></li>
            </ul>
            <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:14px;margin-top:16px;font-size:13px">
              <div style="color:var(--gold);font-weight:700;margin-bottom:8px"><i class="bi bi-clock me-1"></i>Horaires d'ouverture</div>
              <div style="color:rgba(255,255,255,0.65)">Lun–Ven : 07h30 – 15h30<br>Samedi : 08h00 – 12h00<br>Fermé le dimanche</div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container d-flex justify-content-between flex-wrap gap-2">
          <span>© 2026 Mairie de Douala. Tous droits réservés.</span>
          <span>
            <a href="#" style="color:rgba(255,255,255,0.4);margin:0 10px">Mentions légales</a>
            <a href="#" style="color:rgba(255,255,255,0.4);margin:0 10px">Politique de confidentialité</a>
            <a href="#" style="color:rgba(255,255,255,0.4);margin:0 10px">Accessibilité</a>
          </span>
        </div>
      </div>
    </footer>`;
  }

  // Scroll animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
});

function showSection(name, el) {
  event.preventDefault();
  ['naissance','mariage','deces'].forEach(s => {
    document.getElementById('section-'+s).style.display = s===name ? 'block' : 'none';
    document.getElementById('tab-'+s).classList.toggle('active', s===name);
  });
  document.getElementById('section-'+name).scrollIntoView({behavior:'smooth',block:'start'});
}

// Handle hash
const hash = window.location.hash.replace('#','');
if (['naissance','mariage','deces'].includes(hash)) {
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('tab-'+hash);
    if(el) showSection(hash, el);
  });
}

// Elegant file input label update
  document.getElementById('cniFile').addEventListener('change', function() {
    const wrap = this.closest('.file-input-wrap');
    const btn = wrap.querySelector('.file-btn');
    const text = wrap.querySelector('.file-text strong');
    if (this.files && this.files[0]) {
      text.textContent = this.files[0].name;
      btn.innerHTML = '<i class="bi bi-check-circle me-1" style="color:#198754"></i>Chargé';
      wrap.style.borderColor = '#198754';
    }
  });
  // Filter pills
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.table-toolbar, .d-flex')?.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  let currentRole = 'citoyen';

function setRole(el, role) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  currentRole = role;
}

function togglePass() {
  const pass = document.getElementById('passInput');
  const icon = document.getElementById('eyeIcon');
  if (pass.type === 'password') {
    pass.type = 'text';
    icon.className = 'bi bi-eye-slash';
  } else {
    pass.type = 'password';
    icon.className = 'bi bi-eye';
  }
}

function handleLogin() {
  const login = document.getElementById('loginInput').value;
  const pass = document.getElementById('passInput').value;
  
  if (!login || !pass) {
    const card = document.getElementById('loginCard');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.border = '2px solid var(--accent)';
    setTimeout(() => card.style.border = '', 1500);
    return;
  }
  
  if (currentRole === 'agent' || currentRole === 'hopital') {
    new bootstrap.Modal(document.getElementById('twoFAModal')).show();
  } else {
    window.location.href = '../index.html';
  }
}

// OTP input auto-focus
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#twoFAModal input[maxlength="1"]').forEach((input, i, inputs) => {
    input.addEventListener('input', () => {
      if (input.value && i < inputs.length - 1) inputs[i+1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) inputs[i-1].focus();
    });
  });
});



 const sidebarItems = document.querySelectorAll('.sidebar-item[data-panel]');
  const panels = document.querySelectorAll('.portal-panel');

  sidebarItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.dataset.panel;
      // Update sidebar active
      sidebarItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      // Show panel
      panels.forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + target)?.classList.add('active');
      // Close mobile sidebar
      document.getElementById('sidebarEl').classList.remove('open');
    });
  });

  // File input label updates
  document.querySelectorAll('.file-input-wrap input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
      const wrap = this.closest('.file-input-wrap');
      const btn = wrap.querySelector('.file-btn-sm');
      const strong = wrap.querySelector('strong');
      if (this.files && this.files[0]) {
        const name = this.files[0].name.length > 20 ? this.files[0].name.substring(0, 18) + '…' : this.files[0].name;
        strong.textContent = name;
        if (btn) { btn.innerHTML = '<i class="bi bi-check-circle" style="color:#198754"></i>'; }
        wrap.style.borderColor = '#198754';
      }
    });
  });