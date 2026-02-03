(function () {
    const STORAGE_KEY = 'cookieConsent';

    function getConsent() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (err) {
            return null;
        }
    }

    function setConsent(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (err) {
            // Ignore write errors (private mode, blocked storage)
        }
    }

    function hideBanner(banner) {
        if (!banner) return;
        banner.remove();
        document.body.classList.remove('cookie-consent-open');
    }

    function buildBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-live', 'polite');
        banner.setAttribute('aria-label', 'התראת עוגיות');

        const content = document.createElement('div');
        content.className = 'cookie-consent__content';

        const text = document.createElement('p');
        text.className = 'cookie-consent__text';
        text.innerHTML = 'האתר משתמש בעוגיות כדי לשפר את החוויה. ניתן לקרוא עוד ב-<a href="/privacy/#cookies">מדיניות הפרטיות</a>.';

        const actions = document.createElement('div');
        actions.className = 'cookie-consent__actions';

        const acceptBtn = document.createElement('button');
        acceptBtn.type = 'button';
        acceptBtn.className = 'cookie-consent__btn cookie-consent__btn--primary';
        acceptBtn.textContent = 'אישור';

        const declineBtn = document.createElement('button');
        declineBtn.type = 'button';
        declineBtn.className = 'cookie-consent__btn';
        declineBtn.textContent = 'לא אישור';

        acceptBtn.addEventListener('click', () => {
            setConsent('accepted');
            hideBanner(banner);
        });

        declineBtn.addEventListener('click', () => {
            setConsent('declined');
            hideBanner(banner);
        });

        actions.appendChild(acceptBtn);
        actions.appendChild(declineBtn);
        content.appendChild(text);
        content.appendChild(actions);
        banner.appendChild(content);

        return banner;
    }

    function init() {
        if (getConsent()) return;
        const banner = buildBanner();
        document.body.appendChild(banner);
        document.body.classList.add('cookie-consent-open');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
