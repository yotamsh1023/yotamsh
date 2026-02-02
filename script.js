document.addEventListener('DOMContentLoaded', () => {
    // Accordion Logic (נגישות: aria-expanded)
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isActive = header.classList.contains('active');

            accordionHeaders.forEach(h => {
                h.classList.remove('active');
                h.setAttribute('aria-expanded', 'false');
                h.nextElementSibling.style.maxHeight = null;
            });

            if (!isActive) {
                header.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Smooth Scroll for Anchor Links (נגישות: העברת פוקוס ליעד אחרי גלילה)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.setAttribute('tabindex', '-1');
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => target.focus({ preventScroll: true }), 400);
        });
    });

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation class to sections
    document.querySelectorAll('section, .hero-content, .hero-image').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Add class for CSS transition
    const style = document.createElement('style');
    style.innerHTML = `
        .fade-in-up {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // ---// Spotlight Effect (Mighty Style)
    const spotlightCards = document.querySelectorAll('.problem-card, .testimonial-card, .why-card, .feature-card, .sec-card');

    document.addEventListener('mousemove', e => {
        spotlightCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Before/After Lightbox
    const lightbox = document.getElementById('before-after-lightbox');
    const lightboxImage = lightbox?.querySelector('.lightbox-image');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');
    const zoomButtons = document.querySelectorAll('.before-after-zoom');

    const openLightbox = (src, alt) => {
        if (!lightbox || !lightboxImage) return;
        lightboxImage.src = src;
        lightboxImage.alt = alt || '';
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
    };

    const closeLightbox = () => {
        if (!lightbox || !lightboxImage) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        lightboxImage.src = '';
        lightboxImage.alt = '';
    };

    zoomButtons.forEach(button => {
        button.addEventListener('click', () => {
            const img = button.querySelector('img');
            const src = button.getAttribute('data-full') || img?.getAttribute('src');
            if (!src) return;
            openLightbox(src, img?.getAttribute('alt') || '');
        });
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (event) => {
        if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeLightbox();
    });

    // Process Tabs (נגישות: ARIA + מקלדת חצים ב-RTL)
    const tabs = Array.from(document.querySelectorAll('.tab-item'));
    const contents = document.querySelectorAll('.tab-content');

    if (tabs.length > 0) {
        function activateTab(tab) {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            tab.setAttribute('tabindex', '0');
            const tabId = tab.getAttribute('data-tab');
            const panel = document.getElementById('tab-' + tabId);
            if (panel) panel.classList.add('active');
        }

        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => activateTab(tab));
            tab.addEventListener('keydown', (e) => {
                let next = null;
                if (e.key === 'ArrowLeft') next = tabs[i + 1];  // RTL: שמאלה = הבא
                if (e.key === 'ArrowRight') next = tabs[i - 1]; // RTL: ימינה = הקודם
                if (e.key === 'Home') next = tabs[0];
                if (e.key === 'End') next = tabs[tabs.length - 1];
                if (next) {
                    e.preventDefault();
                    activateTab(next);
                    next.focus();
                }
            });
        });

        // Mobile only: auto-advance process steps based on scroll position in section
        const processSection = document.getElementById('how-it-works');
        const mobileQuery = window.matchMedia('(max-width: 768px)');
        let scrollRaf = 0;
        let lastActiveIndex = 0;

        function updateProcessStepFromScroll() {
            if (!processSection || !mobileQuery.matches || tabs.length === 0) return;
            const rect = processSection.getBoundingClientRect();
            const viewportH = window.innerHeight;
            const sectionH = rect.height;
            // Progress 0 = section top at viewport top, 1 = section bottom at viewport bottom
            const scrollRange = viewportH - sectionH;
            const scrollProgress = scrollRange === 0 ? 0.5 : Math.max(0, Math.min(1, -rect.top / scrollRange));
            const index = Math.min(tabs.length - 1, Math.floor(scrollProgress * tabs.length));
            if (index !== lastActiveIndex) {
                lastActiveIndex = index;
                activateTab(tabs[index]);
            }
        }

        function onProcessScroll() {
            if (!mobileQuery.matches) return;
            if (scrollRaf) cancelAnimationFrame(scrollRaf);
            scrollRaf = requestAnimationFrame(() => {
                scrollRaf = 0;
                updateProcessStepFromScroll();
            });
        }

        window.addEventListener('scroll', onProcessScroll, { passive: true });
        window.addEventListener('resize', () => {
            if (!mobileQuery.matches) lastActiveIndex = -1;
            onProcessScroll();
        });
        // Initial run in case section is already in view (e.g. on load)
        setTimeout(updateProcessStepFromScroll, 100);
    }

    // --- 3D Tilt Effect (Subtler) ---
    const cards = document.querySelectorAll('.problem-card, .why-card, .testimonial-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // --- Flowing Background (interactive, gentle) ---
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas?.getContext?.('2d');
    if (canvas && ctx) {
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        const isA11yReduceMotion = () => document.body.classList.contains('a11y-reduce-motion');
        if (!prefersReducedMotion && !isA11yReduceMotion()) {
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            let w = 0;
            let h = 0;

            const mouse = { x: 0, y: 0, active: false };
            window.addEventListener('mousemove', (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
                mouse.active = true;
            }, { passive: true });
            window.addEventListener('mouseleave', () => {
                mouse.active = false;
            }, { passive: true });

            function resize() {
                w = window.innerWidth;
                h = window.innerHeight;
                canvas.width = Math.floor(w * dpr);
                canvas.height = Math.floor(h * dpr);
                canvas.style.width = `${w}px`;
                canvas.style.height = `${h}px`;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
            resize();

            // "Automation pipes" – smooth tubes flowing across the page
            const pipes = [];
            function rand(min, max) { return min + Math.random() * (max - min); }
            function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

            function buildPipes() {
                pipes.length = 0;
                const count = clamp(Math.floor(h / 220), 4, 7);
                for (let i = 0; i < count; i++) {
                    const y = (h * (i + 1)) / (count + 1);
                    pipes.push({
                        baseY: y,
                        amp: rand(18, 42),
                        freq: rand(0.0012, 0.0022),
                        phase: rand(0, Math.PI * 2),
                        thickness: rand(8, 14),
                        hue: rand(205, 245), // blue-ish
                        speed: rand(0.06, 0.12),
                    });
                }
            }
            buildPipes();

            let t = 0;
            let raf = 0;
            let last = performance.now();

            function pipeY(pipe, x, tt, mouseShift) {
                return pipe.baseY
                    + Math.sin(x * pipe.freq + tt * pipe.speed + pipe.phase) * pipe.amp
                    + Math.sin(x * pipe.freq * 0.55 - tt * pipe.speed * 0.7) * (pipe.amp * 0.35)
                    + mouseShift;
            }

            function step(now) {
                // Stop if user toggles reduce motion in widget
                if (isA11yReduceMotion()) {
                    cancelAnimationFrame(raf);
                    ctx.clearRect(0, 0, w, h);
                    return;
                }

                const dt = Math.min(0.033, (now - last) / 1000);
                last = now;
                t += now;

                // Gentle clear (no trails for pipes; keeps it clean)
                ctx.clearRect(0, 0, w, h);

                // Very subtle interaction: mouse shifts nearby pipes a tiny bit
                const mouseShift = mouse.active ? (mouse.y - h / 2) * 0.01 : 0;

                for (let i = 0; i < pipes.length; i++) {
                    const p = pipes[i];
                    const hue = p.hue;

                    // Base tube stroke (soft)
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.lineWidth = p.thickness;
                    ctx.strokeStyle = `hsla(${hue}, 80%, 55%, 0.10)`;

                    ctx.beginPath();
                    for (let x = -40; x <= w + 40; x += 24) {
                        const y = pipeY(p, x, t, mouseShift * (0.35 + i * 0.08));
                        if (x === -40) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    // Inner highlight (makes it feel like a pipe)
                    ctx.lineWidth = Math.max(2, p.thickness * 0.35);
                    ctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.10)`;
                    ctx.stroke();

                    // Flow "packet" highlight traveling along the pipe
                    const flowX = ((t * 0.08 * 60) % (w + 400)) - 200; // move across
                    const yFlow = pipeY(p, flowX, t, mouseShift * (0.35 + i * 0.08));
                    const grd = ctx.createRadialGradient(flowX, yFlow, 0, flowX, yFlow, p.thickness * 1.8);
                    grd.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.18)`);
                    grd.addColorStop(1, `hsla(${hue}, 90%, 70%, 0)`);
                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.arc(flowX, yFlow, p.thickness * 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }

                raf = requestAnimationFrame(step);
            }

            raf = requestAnimationFrame(step);
            window.addEventListener('resize', () => {
                resize();
                buildPipes();
            }, { passive: true });
        }
    }

    // --- Hero Blob Animation ---
    const blob = document.querySelector('.blob');
    if (blob) {
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            blob.animate({
                transform: `translate(${x * 30}px, ${y * 30}px) scale(1.1)`
            }, { duration: 3000, fill: "forwards" });
        });
    }

    // --- Testimonial Slider - Infinite Marquee (true endless, no jump) ---
    (function initTestimonialMarquee() {
        const marquee = document.querySelector('.testimonial-slider');
        const track = marquee?.querySelector('.testimonial-slider-track');
        if (!marquee || !track) return;

        // Respect reduced motion
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        if (prefersReducedMotion) return;

        // Prevent double-init (e.g. hot reload / repeated DOMContentLoaded)
        if (track.dataset.marqueeInit === '1') return;
        track.dataset.marqueeInit = '1';

        const speed = 75; // px/sec
        let rafId = 0;
        let last = performance.now();
        let x = 0;
        let setWidth = 0;
        let paused = false;
        let lastViewportWidth = window.innerWidth;

        function parseGapPx(trackEl) {
            const cs = getComputedStyle(trackEl);
            const raw = (cs.columnGap || cs.gap || '0').toString().trim().split(' ')[0];
            const n = parseFloat(raw);
            return Number.isFinite(n) ? n : 0;
        }

        function appendSet(uniqueEls) {
            const frag = document.createDocumentFragment();
            uniqueEls.forEach((el) => frag.appendChild(el.cloneNode(true)));
            track.appendChild(frag);
        }

        function prepareTrack() {
            const originals = Array.from(track.querySelectorAll('.hero-testimonial-card'));
            if (originals.length === 0) return false;

            // Keep exactly 3 testimonials
            const unique = originals.slice(0, 3);

            track.innerHTML = '';
            unique.forEach((el) => track.appendChild(el));

            // Ensure at least two sets exist
            appendSet(unique);

            const gapPx = parseGapPx(track);
            const firstSet = Array.from(track.children).slice(0, unique.length);
            const widthsSum = firstSet.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
            setWidth = widthsSum + gapPx * Math.max(0, firstSet.length - 1);

            // Add more sets so we never “run out” visually
            const targetWidth = setWidth + marquee.clientWidth + 200;
            let safety = 0;
            while (track.scrollWidth < targetWidth && safety < 20) {
                appendSet(unique);
                safety += 1;
            }

            x = 0;
            track.style.transform = 'translate3d(0px, 0px, 0px)';
            return setWidth > 0;
        }

        function tick(now) {
            // iOS may pause rAF while scrolling; cap dt to avoid “jump” on resume
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            if (!paused) {
                x -= speed * dt;
                // Wrap without losing fractional remainder (prevents “pop”)
                while (setWidth > 0 && x <= -setWidth) x += setWidth;
                track.style.transform = `translate3d(${x}px, 0px, 0px)`;
            }

            rafId = requestAnimationFrame(tick);
        }

        function start() {
            cancelAnimationFrame(rafId);
            last = performance.now();
            rafId = requestAnimationFrame(tick);
        }

        const run = () => {
            if (!prepareTrack()) return;
            start();
        };

        if (document.readyState === 'complete') run();
        else window.addEventListener('load', run, { once: true });

        // Pause on hover only for real mouse pointers (avoid touch causing stuck pause)
        const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches;
        if (canHover) {
            marquee.addEventListener('mouseenter', () => { paused = true; });
            marquee.addEventListener('mouseleave', () => { paused = false; last = performance.now(); });
        }

        // iOS Safari triggers resize on scroll (address bar). Only rebuild when WIDTH changes.
        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            if (Math.abs(w - lastViewportWidth) < 2) return;
            lastViewportWidth = w;
            run();
        });
    })();
});
