/* ─────────────────────────────────────
   SONAL KAMBLE · PORTFOLIO · SCRIPT
   Professional Theme · 2026
───────────────────────────────────── */

/* ── Navbar scroll behaviour ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ── Mobile burger menu ── */
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    const spans = burger.querySelectorAll('span');
    if (open) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
});

/* ── Active nav link (IntersectionObserver) ── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navAnchors.forEach(a => a.classList.remove('active'));
            const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (active) active.classList.add('active');
        }
    });
}, { threshold: 0.35 });

sections.forEach(s => sectionObs.observe(s));

/* ── Scroll reveal ── */
const revealTargets = document.querySelectorAll(
    '.project-card, .skill-group, .contact-info-col, .contact-form-col, ' +
    '.about-stats, .section-title, .section-sub, .reach-item, .exp-item, .skill-dist-container'
);

revealTargets.forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
});

const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const siblings = [...entry.target.parentElement.children];
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 70, 350);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObs.unobserve(entry.target);
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => revealObs.observe(el));

/* ── Animated stat counters ── */
function animateCount(el, target, suffix = '+', duration = 1000) {
    let start = null;
    const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
}

const statsObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    const statExp = document.getElementById('stat-exp');
    const statProjects = document.getElementById('stat-projects');
    const statLc = document.getElementById('stat-lc');
    if (statExp) animateCount(statExp, 3, '+');
    if (statProjects) animateCount(statProjects, 6, '+');
    if (statLc) animateCount(statLc, 321, '+');
    statsObs.disconnect();
}, { threshold: 0.6 });

const heroCard = document.querySelector('.hero-card');
if (heroCard) statsObs.observe(heroCard);

/* ── Contact form — AJAX submission ── */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('form-submit-btn');
const btnText = document.getElementById('btn-text');
const msgSuccess = document.getElementById('form-success');
const msgError = document.getElementById('form-error');

if (form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // Basic client-side validation
        const required = form.querySelectorAll('[required]');
        let valid = true;
        required.forEach(field => {
            field.style.borderColor = '';
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                valid = false;
            }
        });
        if (!valid) return;

        // Loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Sending…';
        msgSuccess.style.display = 'none';
        msgError.style.display = 'none';

        try {
            const data = new FormData(form);
            const name = data.get('name') || '';
            const company = data.get('company') ? `\nCompany: ${data.get('company')}` : '';
            const email = data.get('email') || '';
            const subject = data.get('subject') || 'other';
            const message = data.get('message') || '';

            const subjectMap = {
                'job': 'Job / Internship Opportunity',
                'collaboration': 'Collaboration or Project',
                'question': 'General Question',
                'other': 'Other'
            };
            const subjectLabel = subjectMap[subject] || 'Portfolio Contact';

            const mailtoSubject = encodeURIComponent(`[Portfolio] ${subjectLabel} - ${name}`);
            const mailtoBody = encodeURIComponent(`Name: ${name}${company}\nEmail: ${email}\n\nMessage:\n${message}`);

            window.location.href = `mailto:sonal@sonalkamble.dev?subject=${mailtoSubject}&body=${mailtoBody}`;

            setTimeout(() => {
                msgSuccess.style.display = 'flex';
                msgSuccess.textContent = '✓ Email client opened! Looking forward to your message.';
                form.reset();
                submitBtn.disabled = false;
                btnText.textContent = 'Send Message →';
            }, 1000);
        } catch (error) {
            msgError.textContent = '✕ Could not prepare email. Please email sonal@sonalkamble.dev directly.';
            msgError.style.display = 'flex';
            submitBtn.disabled = false;
            btnText.textContent = 'Send Message →';
        }
    });

    // Remove red border on input
    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', () => { field.style.borderColor = ''; });
    });
}

/* ── URL status param (non-AJAX fallback from PHP redirect) ── */
(function checkStatus() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success' && msgSuccess) msgSuccess.style.display = 'flex';
    if (status === 'error' && msgError) msgError.style.display = 'flex';
    if (status) {
        history.replaceState(null, '', window.location.pathname + '#contact');
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
})();

/* ── Console branding ── */
console.log('%c Sonal Kamble · Portfolio ', 'background:#4f46e5;color:#fff;font-size:14px;font-weight:700;padding:6px 14px;border-radius:6px;');
console.log('%c✦ Full-Stack Software Engineer · SUNY New Paltz', 'color:#4f46e5;font-size:11px;');
