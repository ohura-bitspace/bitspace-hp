// スクロールで要素をフェードインさせる
const sections = document.querySelectorAll('.section');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, {
    rootMargin: "-100px 0px" // 少し早めに表示を開始
});

sections.forEach(section => {
    observer.observe(section);
});