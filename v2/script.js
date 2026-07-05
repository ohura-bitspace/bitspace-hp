// ============================================================
// bitSpace v2
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------
// スクロールで要素をフェードイン
// ------------------------------------------------------------
const reveals = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
} else {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '-80px 0px' });

    reveals.forEach(el => revealObserver.observe(el));
}

// ------------------------------------------------------------
// ヘッダー:スクロール時の見た目 + トップへ戻るボタン
// ------------------------------------------------------------
const header = document.querySelector('.header');
const backToTop = document.querySelector('.back-to-top');

const onScroll = () => {
    const scrolled = window.scrollY > 10;
    header.classList.toggle('is-scrolled', scrolled);
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ------------------------------------------------------------
// モバイルナビゲーション
// ------------------------------------------------------------
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.header-nav');

navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

// メニュー内リンクを押したら閉じる
nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

// ------------------------------------------------------------
// ナビの現在地ハイライト
// ------------------------------------------------------------
const navLinks = document.querySelectorAll('.header-nav a[data-nav]');
const sectionsById = new Map();

navLinks.forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionsById.set(section, link);
});

if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const link = sectionsById.get(entry.target);
            if (!link) return;
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('is-active'));
                link.classList.add('is-active');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sectionsById.forEach((_, section) => navObserver.observe(section));
}

// ------------------------------------------------------------
// ヒーローの星空(Canvas)
// ------------------------------------------------------------
const canvas = document.querySelector('.starfield');

if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let rafId = null;

    const setup = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.floor((rect.width * rect.height) / 6500);
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            r: Math.random() * 1.3 + 0.3,
            baseAlpha: Math.random() * 0.5 + 0.2,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.9 + 0.4,
            drift: Math.random() * 0.016 + 0.004
        }));
    };

    const draw = (time) => {
        const rect = canvas.parentElement.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);

        stars.forEach(star => {
            const twinkle = prefersReducedMotion
                ? 1
                : 0.65 + 0.35 * Math.sin(star.phase + time * 0.001 * star.speed);

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 222, 255, ${star.baseAlpha * twinkle})`;
            ctx.fill();

            if (!prefersReducedMotion) {
                star.x -= star.drift;
                if (star.x < -2) star.x = rect.width + 2;
            }
        });

        if (!prefersReducedMotion) {
            rafId = requestAnimationFrame(draw);
        }
    };

    const start = () => {
        if (rafId) cancelAnimationFrame(rafId);
        setup();
        if (prefersReducedMotion) {
            draw(0);
        } else {
            rafId = requestAnimationFrame(draw);
        }
    };

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(start, 200);
    });

    // タブが非表示のときはアニメーションを止める
    document.addEventListener('visibilitychange', () => {
        if (prefersReducedMotion) return;
        if (document.hidden) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        } else if (!rafId) {
            rafId = requestAnimationFrame(draw);
        }
    });

    start();
}
