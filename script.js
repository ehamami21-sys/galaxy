// ==============================================
// COSMIC MUSEUM - Main Script
// ==============================================

const API_URL = 'http://localhost:3001';

let currentLang = localStorage.getItem('cosmic-lang') || 'fa';
let currentTheme = localStorage.getItem('cosmic-theme') || 'dark';
let projects = [];
let settings = {};

// ==============================================
// DOM Elements
// ==============================================
const langToggle = document.getElementById('langToggle');
const themeToggle = document.getElementById('themeToggle');
const projectsGrid = document.getElementById('projectsGrid');
const projectModal = document.getElementById('projectModal');
const navbar = document.getElementById('navbar');
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const yearSpan = document.getElementById('year');

// ==============================================
// API Functions
// ==============================================
async function fetchProjects() {
    try {
        const res = await fetch(`${API_URL}/projects`);
        projects = await res.json();
        renderProjects();
    } catch (err) {
        console.error('Error fetching projects:', err);
        projects = [];
        renderProjects();
    }
}

async function fetchSettings() {
    try {
        const res = await fetch(`${API_URL}/settings`);
        settings = await res.json();
        updateSiteInfo();
    } catch (err) {
        console.error('Error fetching settings:', err);
        settings = {
            siteName: { fa: 'موزه کهکشانی', en: 'Cosmic Museum' },
            tagline: { fa: 'ما ایده‌ها را به کهکشان تبدیل می‌کنیم', en: 'We transform ideas into galaxies' }
        };
        updateSiteInfo();
    }
}

// ==============================================
// Initialize
// ==============================================
async function init() {
    showLoader();
    applyTheme(currentTheme);
    applyLanguage(currentLang);
    await Promise.all([fetchProjects(), fetchSettings()]);
    createStars();
    initCustomCursor();
    initScrollEvents();
    initContactForm();
    yearSpan.textContent = new Date().getFullYear();
    hideLoader();
}

function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.id = 'pageLoader';
    loader.innerHTML = '<div class="loader-ring"></div>';
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
}

// ==============================================
// Create CSS Stars
// ==============================================
function createStars() {
    const hero = document.getElementById('hero');
    const oldCanvas = hero.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();
    
    const oldStars = hero.querySelector('.stars-container');
    if (oldStars) oldStars.remove();
    
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 3 + 1;
        star.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${Math.random() > 0.3 ? '#ffffff' : '#D4AF37'};
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: twinkle ${Math.random() * 4 + 2}s ease-in-out infinite;
            animation-delay: ${Math.random() * 3}s;
            opacity: ${Math.random() * 0.8 + 0.2};
            box-shadow: 0 0 ${size * 2}px ${Math.random() > 0.3 ? '#ffffff' : '#D4AF37'};
        `;
        starsContainer.appendChild(star);
    }
    
    hero.insertBefore(starsContainer, hero.firstChild);
}

// ==============================================
// Theme Management
// ==============================================
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.innerHTML = theme === 'dark' ? '<span>☀️</span>' : '<span>🌙</span>';
    localStorage.setItem('cosmic-theme', theme);
    currentTheme = theme;
}

themeToggle.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// ==============================================
// Language Management
// ==============================================
function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    langToggle.innerHTML = lang === 'fa' ? '<span>EN</span>' : '<span>فا</span>';
    localStorage.setItem('cosmic-lang', lang);
    currentLang = lang;
    updateAllTexts();
}

langToggle.addEventListener('click', () => {
    applyLanguage(currentLang === 'fa' ? 'en' : 'fa');
});

function updateAllTexts() {
    document.querySelectorAll('[data-fa]').forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) el.textContent = text;
    });
    renderProjects();
}

function t(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj['fa'] || '';
}

// ==============================================
// Update Site Info from API
// ==============================================
function updateSiteInfo() {
    document.querySelectorAll('.site-name').forEach(el => {
        el.textContent = t(settings.siteName);
    });
    document.querySelector('.hero-subtitle').textContent = t(settings.tagline);
    document.querySelector('.hero-subtitle').setAttribute('data-fa', settings.tagline?.fa || '');
    document.querySelector('.hero-subtitle').setAttribute('data-en', settings.tagline?.en || '');
}

// ==============================================
// Render Projects
// ==============================================
function renderProjects() {
    if (!projects.length) {
        projectsGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">پروژه‌ای یافت نشد</div>';
        return;
    }
    
    const sorted = [...projects].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    projectsGrid.innerHTML = sorted.map(project => `
        <div class="project-card" onclick="openProject(${project.id})">
            ${project.featured ? `<span class="featured-badge">${t({fa: 'ویژه', en: 'Featured'})}</span>` : ''}
            <img src="${project.images?.[0] || 'https://picsum.photos/800/500?random=1'}" alt="${t(project.title)}" loading="lazy">
            <div class="project-card-body">
                <h3>${t(project.title)}</h3>
                <p>${t(project.description)}</p>
                <div class="project-tags">
                    ${(project.tags || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${(project.tags || []).length > 3 ? `<span class="tag">+${project.tags.length - 3}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ==============================================
// Project Modal
// ==============================================
window.openProject = function(projectId) {
    const project = projects.find(p => p.id == projectId);
    if (!project) return;
    
    document.getElementById('modalImage').src = project.images?.[0] || 'https://picsum.photos/800/500';
    document.getElementById('modalTitle').textContent = t(project.title);
    document.getElementById('modalDescription').textContent = t(project.description);
    
    document.getElementById('modalTags').innerHTML = (project.tags || []).map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    document.getElementById('modalLinks').innerHTML = `
        ${project.links?.live ? `<a href="${project.links.live}" target="_blank" class="btn-gold">${t({fa: 'مشاهده آنلاین', en: 'View Live'})}</a>` : ''}
        ${project.links?.source ? `<a href="${project.links.source}" target="_blank" class="btn-outline">${t({fa: 'سورس کد', en: 'Source Code'})}</a>` : ''}
    `;
    
    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
    projectModal.classList.remove('active');
    document.body.style.overflow = '';
};

projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) closeModal();
});

// ==============================================
// Custom Cursor
// ==============================================
function initCustomCursor() {
    if (window.innerWidth < 768) {
        if (cursor) cursor.style.display = 'none';
        if (cursorDot) cursorDot.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorDot) {
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        }
    });
    
    document.querySelectorAll('a, button, .project-card, .btn-gold, .btn-outline').forEach(el => {
        el.addEventListener('mouseenter', () => cursor && cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('cursor-hover'));
    });
    
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

// ==============================================
// Scroll Events
// ==============================================
function initScrollEvents() {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

window.scrollToProjects = function() {
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
};

// ==============================================
// Contact Form
// ==============================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = currentLang === 'fa' ? '✅ ارسال شد!' : '✅ Sent!';
        btn.style.background = '#22c55e';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            this.reset();
        }, 2000);
    });
}

// ==============================================
// Keyboard Shortcuts
// ==============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey) {
        applyLanguage(currentLang === 'fa' ? 'en' : 'fa');
    }
    if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey) {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }
});

// ==============================================
// Start
// ==============================================
init();