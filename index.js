/* ============================================
   Услуги Бензо — JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Particles (Enhanced: яркие линии-паутинки) ----
    (function particles() {
        const canvas = document.getElementById('particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];
        const COUNT = 90;
        const CONNECT_DIST = 180;
        const SPEED = 0.3;
        const LINE_OPACITY = 0.15;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * SPEED + (Math.random() - 0.5) * SPEED * 0.5;
                this.vy = Math.sin(angle) * SPEED + (Math.random() - 0.5) * SPEED * 0.5;
                this.size = Math.random() * 3 + 1.5;
                this.brightness = Math.random() * 0.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${this.brightness})`;
                ctx.fill();
                ctx.shadowColor = 'rgba(139, 92, 246, 0.4)';
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        for (let i = 0; i < COUNT; i++) particles.push(new Particle());

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECT_DIST) {
                        const opacity = (1 - dist / CONNECT_DIST) * LINE_OPACITY;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            for (const p of particles) { p.update(); p.draw(); }
            drawLines();
            requestAnimationFrame(animate);
        }
        animate();
    })();

    // ---- Mobile menu toggle ----
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('open');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('open');
            });
        });
    }

    // ---- Header scroll state ----
    const header = document.querySelector('.header');
    if (header) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ---- Scroll reveal animations ----
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => observer.observe(el));
    }

    // ---- Greeting banner (auto-hide after 6s) ----
    const greetingBanner = document.getElementById('greeting-banner');
    if (greetingBanner) {
        const showDuration = parseInt(greetingBanner.dataset.duration) || 6000;
        setTimeout(() => {
            greetingBanner.classList.add('show');
        }, 2000);
        setTimeout(() => {
            greetingBanner.classList.remove('show');
        }, 2000 + showDuration);
    }

    // ---- Toast notifications ----
    window.showToast = function (message, duration) {
        duration = duration || 3000;
        const container = document.querySelector('.toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    };

    // ---- Admin panel toggle ----
    const adminBtn = document.getElementById('adminToggle');
    const adminPanel = document.getElementById('adminPanel');
    if (adminBtn && adminPanel) {
        adminBtn.addEventListener('click', () => {
            adminPanel.classList.toggle('open');
            adminBtn.textContent = adminPanel.classList.contains('open') ? '✕' : '⚙';
        });
    }

    // ---- Admin panel: load & save config ----
    const adminStates = {};
    let adminConfig = {};

    const adminSections = document.querySelectorAll('.admin-section[data-config]');
    adminSections.forEach(section => {
        const key = section.dataset.config;
        adminConfig[key] = {};
        section.querySelectorAll('[data-config-key]').forEach(el => {
            const fieldKey = el.dataset.configKey;
            adminConfig[key][fieldKey] = el.value || el.textContent;
        });
    });

    // Load from localStorage if available
    const savedConfig = localStorage.getItem('benzo_admin_config');
    if (savedConfig) {
        try {
            const parsed = JSON.parse(savedConfig);
            Object.keys(parsed).forEach(sectionKey => {
                if (adminConfig[sectionKey]) {
                    Object.assign(adminConfig[sectionKey], parsed[sectionKey]);
                }
            });
        } catch (e) { /* ignore */ }
    }

    function applyAdminConfig() {
        document.querySelectorAll('[data-config-key]').forEach(el => {
            const sectionKey = el.closest('[data-config]')?.dataset.config;
            const fieldKey = el.dataset.configKey;
            if (sectionKey && adminConfig[sectionKey] && adminConfig[sectionKey][fieldKey] !== undefined) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.value = adminConfig[sectionKey][fieldKey];
                } else {
                    el.textContent = adminConfig[sectionKey][fieldKey];
                }
            }
        });
    }
    applyAdminConfig();

    // Apply config to live fields on save
    document.querySelectorAll('.admin-save').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.closest('.admin-section');
            if (!section) return;
            const sectionKey = section.dataset.config;
            if (!sectionKey) return;

            section.querySelectorAll('[data-config-key]').forEach(el => {
                const fieldKey = el.dataset.configKey;
                const val = el.value || el.textContent;
                if (adminConfig[sectionKey]) {
                    adminConfig[sectionKey][fieldKey] = val;
                }
            // Update live DOM
            const liveEl = document.querySelector(`[data-live="${fieldKey}"]`);
            if (liveEl) {
                if (fieldKey === 'greeting_text') {
                    liveEl.innerHTML = val.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                } else if (fieldKey === 'telegram' || fieldKey === 'channel') {
                    const username = val.replace('@', '');
                    liveEl.textContent = val;
                    liveEl.setAttribute('data-copy', val);
                    if (fieldKey === 'telegram') {
                        liveEl.href = `https://t.me/${username}`;
                    } else if (fieldKey === 'channel') {
                        liveEl.href = `https://t.me/${username}`;
                    }
                } else {
                    liveEl.textContent = val;
                }
            }
            });

            localStorage.setItem('benzo_admin_config', JSON.stringify(adminConfig));
            showToast('✅ Настройки сохранены');
        });
    });

    // ---- Copy to clipboard ----
    document.querySelectorAll('.contact-value').forEach(el => {
        el.addEventListener('click', async () => {
            const text = el.dataset.copy || el.textContent;
            try {
                await navigator.clipboard.writeText(text);
                const original = el.textContent;
                el.textContent = '✓ Скопировано!';
                setTimeout(() => { el.textContent = original; }, 1500);
            } catch {
                showToast('❌ Не удалось скопировать');
            }
        });
    });

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    console.log('%c Услуги Бензо 🚀', 'font-size:24px; font-weight:bold; color:#8b5cf6');
    console.log('%c Связь: @murderirl | Канал: @god_benzo', 'font-size:14px; color:#9090a8');

});
