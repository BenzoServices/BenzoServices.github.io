/* ============================================
   BenzoServices — скрипты
   ============================================ */

// ---- Конфигурация (редактируется через админку) ----
let config = {
    telegram: '@benzo_services',
    support: '@benzo_support',
    status: 'Принимаем заказы'
};

// Загружаем из localStorage
try {
    const saved = localStorage.getItem('benzoConfig');
    if (saved) {
        const parsed = JSON.parse(saved);
        config = { ...config, ...parsed };
    }
} catch (e) {}

// Счётчик посещений
let visitCount = parseInt(localStorage.getItem('benzoVisits') || '0', 10);
visitCount++;
localStorage.setItem('benzoVisits', String(visitCount));

// ---- DOM-элементы ----
const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const popup = document.getElementById('welcomePopup');
const popupClose = document.getElementById('popupClose');
const popupConfirm = document.getElementById('popupConfirm');
const toastContainer = document.getElementById('toastContainer');

// ---- Частицы ----
(function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const PARTICLE_COUNT = 80;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 0.5;
            this.alpha = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 92, 246, ${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        requestAnimationFrame(animate);
    }
    animate();
})();

// ---- Хедер (scroll effect) ----
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ---- Меню (мобильное) ----
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('open');
});
nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        nav.classList.remove('open');
    });
});

// ---- Welcome Popup ----
const popupShown = localStorage.getItem('benzoPopupShown');
if (!popupShown) {
    setTimeout(() => {
        popup.classList.add('active');
    }, 600);
}

function closePopup() {
    popup.classList.remove('active');
    localStorage.setItem('benzoPopupShown', 'true');
}

popupClose.addEventListener('click', closePopup);
popupConfirm.addEventListener('click', closePopup);
popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
});

// ---- Toast ----
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---- Обновление контактов из конфига ----
function updateContacts() {
    const tg = document.getElementById('contactTelegram');
    const sup = document.getElementById('supportLink');
    if (tg) {
        tg.textContent = config.telegram;
        tg.href = 'https://t.me/' + config.telegram.replace('@', '');
    }
    if (sup) {
        sup.textContent = config.support;
        sup.href = 'https://t.me/' + config.support.replace('@', '');
    }
}
updateContacts();

// ---- Scroll Reveal ----
(function initReveal() {
    const revealElements = document.querySelectorAll('.service-card, .boost-card, .feature-item, .contact-card, .section-header');
    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));
})();

// ---- Админ-панель ----
// Доступ: нажать 5 раз на логотип
let logoClickCount = 0;
const logo = document.querySelector('.logo');
let adminPanel = null;

logo.addEventListener('click', () => {
    logoClickCount++;
    if (logoClickCount >= 5) {
        logoClickCount = 0;
        toggleAdmin();
    }
});

function toggleAdmin() {
    if (adminPanel) {
        adminPanel.remove();
        adminPanel = null;
        document.querySelector('.admin-toggle')?.remove();
        return;
    }

    // Создаём админ-панель
    const panel = document.createElement('div');
    panel.className = 'admin-panel open';
    panel.innerHTML = `
        <h2>🔧 Админ-панель</h2>

        <div class="admin-section">
            <h3>📊 Статистика</h3>
            <div class="admin-stat">
                <span>Посещений сайта</span>
                <span>${visitCount}</span>
            </div>
            <div class="admin-stat">
                <span>Версия</span>
                <span>1.0</span>
            </div>
        </div>

        <div class="admin-section">
            <h3>✉️ Telegram (контакт)</h3>
            <input class="admin-field" id="adminTelegram" value="${config.telegram}" placeholder="@username">
            <button class="admin-save" data-field="telegram">Сохранить</button>
        </div>

        <div class="admin-section">
            <h3>💬 Telegram (поддержка)</h3>
            <input class="admin-field" id="adminSupport" value="${config.support}" placeholder="@username">
            <button class="admin-save" data-field="support">Сохранить</button>
        </div>

        <div class="admin-section">
            <h3>📋 Дополнительно</h3>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:12px;">
                Для изменения других данных — напишите разработчику.
            </p>
            <button class="admin-save" id="adminResetPopup" style="background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid rgba(239,68,68,0.3);">
                🔄 Сбросить приветственный попап
            </button>
        </div>
    `;

    panel.querySelectorAll('.admin-save').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            if (field === 'telegram') {
                const val = document.getElementById('adminTelegram').value.trim();
                if (val) {
                    config.telegram = val;
                    localStorage.setItem('benzoConfig', JSON.stringify(config));
                    updateContacts();
                    showToast('Telegram (контакт) обновлён!', 'success');
                }
            } else if (field === 'support') {
                const val = document.getElementById('adminSupport').value.trim();
                if (val) {
                    config.support = val;
                    localStorage.setItem('benzoConfig', JSON.stringify(config));
                    updateContacts();
                    showToast('Telegram (поддержка) обновлён!', 'success');
                }
            }
        });
    });

    document.getElementById('adminResetPopup')?.addEventListener('click', () => {
        localStorage.removeItem('benzoPopupShown');
        showToast('Приветственный попап будет показан снова при следующем входе', 'info');
    });

    document.body.appendChild(panel);
    adminPanel = panel;

    // Кнопка закрытия
    const toggle = document.createElement('button');
    toggle.className = 'admin-toggle';
    toggle.textContent = '⚙️';
    toggle.title = 'Закрыть админ-панель';
    toggle.addEventListener('click', toggleAdmin);
    document.body.appendChild(toggle);

    showToast('Админ-панель открыта', 'info');
}

// ---- Обработка навигационных ссылок с тостом ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = link.getAttribute('href');
        if (target && target.startsWith('#')) {
            const section = document.querySelector(target);
            if (section) {
                // Плавный скролл уже есть через scroll-behavior
                const sectionName = section.querySelector('.section-title, h2');
                if (sectionName) {
                    showToast(`➜ ${sectionName.textContent.trim()}`, 'info');
                }
            }
        }
    });
});

console.log('%c🛡️ BenzoServices v1.0', 'font-size:24px;font-weight:bold;color:#8b5cf6;');
console.log('%c5 кликов по логотипу — админ-панель', 'font-size:12px;color:#666;');
