// スクロールで要素をフェードインさせる
const sections = document.querySelectorAll('.section');

if (!('IntersectionObserver' in window)) {
    sections.forEach(section => section.classList.add('is-visible'));
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: "-100px 0px"
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}
