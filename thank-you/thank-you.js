(function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.getElementById('celebration-canvas');
    if (!canvas) return;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrame = 0;
    let popTimer = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticles() {
        const colors = ['#4462b5', '#8db0ff', '#ffd166', '#06d6a0', '#ef476f'];
        particles = Array.from({ length: 120 }, () => ({
            x: Math.random() * width,
            y: height + Math.random() * height * 0.4,
            r: 3 + Math.random() * 4,
            speed: 0.6 + Math.random() * 1.4,
            drift: (Math.random() - 0.5) * 0.8,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 0.6 + Math.random() * 0.4
        }));
    }

    function step() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.y -= p.speed;
            p.x += p.drift;
            if (p.y < -10) {
                p.y = height + Math.random() * 100;
                p.x = Math.random() * width;
            }
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        animationFrame = requestAnimationFrame(step);
    }

    function createPopLayer() {
        const layer = document.createElement('div');
        layer.className = 'pop-layer';
        document.body.appendChild(layer);
        return layer;
    }

    function spawnPop(layer) {
        const types = ['bubble', 'ring'];
        const type = types[Math.floor(Math.random() * types.length)];
        const el = document.createElement('div');
        el.className = `popper popper--${type}`;
        const x = 10 + Math.random() * 80;
        const y = 20 + Math.random() * 60;
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.animationDuration = `${2 + Math.random() * 1.2}s`;
        el.style.animationDelay = `${Math.random() * 0.2}s`;
        layer.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }

    function burstPoppers(layer, count) {
        for (let i = 0; i < count; i++) {
            spawnPop(layer);
        }
    }

    function schedulePoppers(layer) {
        burstPoppers(layer, 10);
        const loop = () => {
            burstPoppers(layer, 4 + Math.floor(Math.random() * 3));
            popTimer = window.setTimeout(loop, 1200 + Math.random() * 900);
        };
        popTimer = window.setTimeout(loop, 900);
    }

    resize();
    createParticles();
    step();
    const popLayer = createPopLayer();
    schedulePoppers(popLayer);

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });

    window.addEventListener('beforeunload', () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        if (popTimer) clearTimeout(popTimer);
    });
})();
