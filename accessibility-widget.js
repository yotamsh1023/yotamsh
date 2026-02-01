/**
 * וידג'ט נגישות - ת"י 5568
 * טעינת העדפות מ-localStorage והחלת אפשרויות על body
 */
(function () {
    const STORAGE_KEY = 'yotamsh-a11y';

    function getSaved() {
        try {
            const s = localStorage.getItem(STORAGE_KEY);
            return s ? JSON.parse(s) : {};
        } catch (_) {
            return {};
        }
    }

    function save(opts) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
        } catch (_) {}
    }

    function apply(opts) {
        const c = document.body.classList;
        c.remove('a11y-active', 'a11y-larger-text', 'a11y-high-contrast', 'a11y-links-underline', 'a11y-reduce-motion');
        if (!opts.enabled) return;
        c.add('a11y-active');
        if (opts.largerText) c.add('a11y-larger-text');
        if (opts.highContrast) c.add('a11y-high-contrast');
        if (opts.linksUnderline) c.add('a11y-links-underline');
        if (opts.reduceMotion) c.add('a11y-reduce-motion');
    }

    function init() {
        const panel = document.getElementById('a11y-panel');
        const toggle = document.getElementById('a11y-toggle');
        if (!panel || !toggle) return;

        function getFocusables(container) {
            var sel = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
            return Array.from(container.querySelectorAll(sel)).filter(function (el) {
                return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
            });
        }

        function closePanel() {
            panel.classList.remove('open');
            panel.removeAttribute('aria-modal');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'פתיחת תפריט נגישות');
            toggle.focus();
        }

        const opts = getSaved();
        /* בטעינת הדף – האתר תמיד מתחיל במצב רגיל. נגישות תוחל רק כשהמשתמש מסמן "נגישות" בסשן הנוכחי */
        apply(Object.assign({}, opts, { enabled: false }));

        toggle.addEventListener('click', function () {
            const isOpen = panel.classList.contains('open');
            if (isOpen) {
                closePanel();
                return;
            }
            panel.classList.add('open');
            panel.setAttribute('aria-modal', 'true');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'סגירת תפריט נגישות');
            var first = document.getElementById('a11y-enabled') || document.getElementById('a11y-larger');
            if (first) first.focus();
        });

        document.addEventListener('click', function (e) {
            if (panel.classList.contains('open') && !panel.contains(e.target) && !toggle.contains(e.target)) {
                closePanel();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (!panel.classList.contains('open')) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                closePanel();
                return;
            }
            if (e.key !== 'Tab') return;
            var focusables = getFocusables(panel);
            if (focusables.length === 0) return;
            var current = document.activeElement;
            var idx = focusables.indexOf(current);
            if (idx === -1) return;
            if (e.shiftKey) {
                if (idx === 0) {
                    e.preventDefault();
                    focusables[focusables.length - 1].focus();
                }
            } else {
                if (idx === focusables.length - 1) {
                    e.preventDefault();
                    focusables[0].focus();
                }
            }
        });

        function setOption(key, value) {
            opts[key] = value;
            save(opts);
            apply(opts);
        }

        const enabled = document.getElementById('a11y-enabled');
        const larger = document.getElementById('a11y-larger');
        const contrast = document.getElementById('a11y-contrast');
        const underline = document.getElementById('a11y-underline');
        const motion = document.getElementById('a11y-motion');
        const reset = document.getElementById('a11y-reset');

        if (enabled) {
            enabled.checked = false;
            enabled.addEventListener('change', function () {
                setOption('enabled', enabled.checked);
            });
        }

        if (larger) {
            larger.checked = !!opts.largerText;
            larger.addEventListener('change', function () {
                setOption('largerText', larger.checked);
            });
        }
        if (contrast) {
            contrast.checked = !!opts.highContrast;
            contrast.addEventListener('change', function () {
                setOption('highContrast', contrast.checked);
            });
        }
        if (underline) {
            underline.checked = !!opts.linksUnderline;
            underline.addEventListener('change', function () {
                setOption('linksUnderline', underline.checked);
            });
        }
        if (motion) {
            motion.checked = !!opts.reduceMotion;
            motion.addEventListener('change', function () {
                setOption('reduceMotion', motion.checked);
            });
        }
        if (reset) {
            reset.addEventListener('click', function () {
                opts.enabled = false;
                opts.largerText = false;
                opts.highContrast = false;
                opts.linksUnderline = false;
                opts.reduceMotion = false;
                save(opts);
                apply(opts);
                if (enabled) enabled.checked = false;
                if (larger) larger.checked = false;
                if (contrast) contrast.checked = false;
                if (underline) underline.checked = false;
                if (motion) motion.checked = false;
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
