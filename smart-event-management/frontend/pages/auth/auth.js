/* ============================================
   PLANORA AUTH — auth.js
   Shared by signin.html & signup.html
============================================ */

'use strict';

/* ============================================
   STARFIELD
============================================ */
(function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    const COUNT = 120;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    function makeStar() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.0 + 0.2,
            alpha: Math.random() * 0.5 + 0.1,
            speed: Math.random() * 0.003 + 0.001,
            phase: Math.random() * Math.PI * 2,
        };
    }
    function draw(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => {
            const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210,200,255,${a})`;
            ctx.fill();
        });
    }
    function loop(t) { draw(t); requestAnimationFrame(loop); }
    resize();
    stars = Array.from({ length: COUNT }, makeStar);
    requestAnimationFrame(loop);
    window.addEventListener('resize', () => { resize(); stars = Array.from({ length: COUNT }, makeStar); });
})();


/* ============================================
   PASSWORD TOGGLE
============================================ */
(function initPasswordToggle() {
    const btn = document.getElementById('togglePw');
    const input = document.getElementById('password');
    if (!btn || !input) return;

    const eyeShow = btn.querySelector('.eye-show');
    const eyeHide = btn.querySelector('.eye-hide');

    btn.addEventListener('click', () => {
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        eyeShow.style.display = isText ? 'block' : 'none';
        eyeHide.style.display = isText ? 'none' : 'block';
        btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
    });
})();


/* ============================================
   PASSWORD STRENGTH (signup only)
============================================ */
(function initPasswordStrength() {
    const input = document.getElementById('password');
    const fill = document.getElementById('pwFill');
    const label = document.getElementById('pwLabel');
    if (!input || !fill || !label) return;

    const levels = [
        { score: 0,  pct: '0%',   color: 'transparent',                  text: 'Too short',  textColor: 'var(--text-dim)' },
        { score: 1,  pct: '25%',  color: '#ef4444',                       text: 'Weak',       textColor: '#f87171' },
        { score: 2,  pct: '50%',  color: '#f97316',                       text: 'Fair',       textColor: '#fb923c' },
        { score: 3,  pct: '75%',  color: '#eab308',                       text: 'Good',       textColor: '#fbbf24' },
        { score: 4,  pct: '100%', color: 'var(--purple-light)',            text: 'Strong',     textColor: 'var(--purple-light)' },
    ];

    function scorePassword(pw) {
        if (pw.length < 6) return 0;
        let score = 1;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score = Math.min(score + 1, 4);
        return Math.min(score, 4);
    }

    input.addEventListener('input', () => {
        const s = scorePassword(input.value);
        const lvl = levels[s];
        fill.style.width = lvl.pct;
        fill.style.background = lvl.color;
        label.textContent = lvl.text;
        label.style.color = lvl.textColor;
    });
})();


/* ============================================
   ROLE SELECTOR (signup only)
============================================ */
(function initRoleSelector() {
    const selector = document.getElementById('roleSelector');
    const hiddenInput = document.getElementById('role');
    if (!selector || !hiddenInput) return;

    selector.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selector.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            hiddenInput.value = btn.dataset.role;
        });
    });
})();


/* ============================================
   FIELD VALIDATION HELPERS
============================================ */
function setFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('input-error');
    if (error) error.textContent = message;
}
function clearFieldError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.remove('input-error');
    if (error) error.textContent = '';
}
function setFieldSuccess(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Live validation: clear error on input
function attachLiveValidation(inputId, errorId, validator) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', () => {
        if (validator(input.value)) {
            clearFieldError(inputId, errorId);
            setFieldSuccess(inputId);
        } else {
            input.classList.remove('input-success');
        }
    });
    input.addEventListener('blur', () => {
        if (!validator(input.value) && input.value) {
            // show inline error on blur if value present
        }
    });
}


/* ============================================
   SIGN IN FORM
============================================ */
(function initSignin() {
    const form = document.getElementById('signinForm');
    if (!form) return;

    // Live validation
    attachLiveValidation('email', 'emailError', v => isValidEmail(v));
    attachLiveValidation('password', 'passwordError', v => v.length >= 6);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Reset
        ['email', 'password'].forEach(id => clearFieldError(id, id + 'Error'));

        // Validate
        if (!email || !isValidEmail(email)) {
            setFieldError('email', 'emailError', 'Please enter a valid email address.');
            valid = false;
        }
        if (!password || password.length < 6) {
            setFieldError('password', 'passwordError', 'Password must be at least 6 characters.');
            valid = false;
        }
        if (!valid) return;

        // Loading state
        const btn = document.getElementById('submitBtn');
        const msg = document.getElementById('formMessage');
        btn.classList.add('loading');
        btn.disabled = true;
        msg.className = 'form-message';
        msg.textContent = '';

        try {
            // TODO: replace with real API call e.g. await api.signin({ email, password })
            await simulateRequest(1400);

            msg.className = 'form-message success';
            msg.textContent = '✓ Signed in! Redirecting to your dashboard…';

            setTimeout(() => {
                // Redirect to main app home (role-aware dashboard is accessible from sidebar)
                window.location.href = '../../pages/home/home.html';
            }, 1000);

        } catch (err) {
            msg.className = 'form-message error';
            msg.textContent = err.message || 'Invalid email or password. Please try again.';
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    });
})();


/* ============================================
   SIGN UP FORM
============================================ */
(function initSignup() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    // Live validation
    attachLiveValidation('firstName', 'firstNameError', v => v.trim().length >= 2);
    attachLiveValidation('lastName', 'lastNameError', v => v.trim().length >= 2);
    attachLiveValidation('email', 'emailError', v => isValidEmail(v));
    attachLiveValidation('password', 'passwordError', v => v.length >= 8);

    // Confirm password live match
    const confirmInput = document.getElementById('confirmPassword');
    const passwordInput = document.getElementById('password');
    if (confirmInput && passwordInput) {
        confirmInput.addEventListener('input', () => {
            if (confirmInput.value && confirmInput.value !== passwordInput.value) {
                setFieldError('confirmPassword', 'confirmPasswordError', 'Passwords do not match.');
                confirmInput.classList.add('input-error');
                confirmInput.classList.remove('input-success');
            } else if (confirmInput.value === passwordInput.value && confirmInput.value.length > 0) {
                clearFieldError('confirmPassword', 'confirmPasswordError');
                confirmInput.classList.remove('input-error');
                confirmInput.classList.add('input-success');
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Reset errors
        ['firstName', 'lastName', 'email', 'password', 'confirmPassword'].forEach(id => {
            clearFieldError(id, id + 'Error');
        });

        // Validate
        if (!firstName || firstName.length < 2) {
            setFieldError('firstName', 'firstNameError', 'First name is required.');
            valid = false;
        }
        if (!lastName || lastName.length < 2) {
            setFieldError('lastName', 'lastNameError', 'Last name is required.');
            valid = false;
        }
        if (!email || !isValidEmail(email)) {
            setFieldError('email', 'emailError', 'Please enter a valid email address.');
            valid = false;
        }
        if (!password || password.length < 8) {
            setFieldError('password', 'passwordError', 'Password must be at least 8 characters.');
            valid = false;
        }
        if (password !== confirmPassword) {
            setFieldError('confirmPassword', 'confirmPasswordError', 'Passwords do not match.');
            valid = false;
        }
        if (!agreeTerms) {
            const msg = document.getElementById('formMessage');
            msg.className = 'form-message error';
            msg.textContent = 'Please accept the Terms and Privacy Policy to continue.';
            valid = false;
        }
        if (!valid) return;

        // Loading state
        const btn = document.getElementById('submitBtn');
        const msg = document.getElementById('formMessage');
        btn.classList.add('loading');
        btn.disabled = true;
        msg.className = 'form-message';
        msg.textContent = '';

        try {
            // TODO: replace with real API call e.g. await api.signup({ firstName, lastName, email, password, role })
            await simulateRequest(1600);

            msg.className = 'form-message success';
            msg.textContent = `✓ Account created! Welcome to Planora, ${firstName}.`;

            setTimeout(() => {
                // Redirect based on chosen role
                const redirectMap = {
                    organizer: '../../pages/organizer/overview/overview.html',
                    participant: '../../pages/participant/overview/overview.html',
                    volunteer: '../../pages/volunteer/overview/overview.html',
                };
                window.location.href = redirectMap[role] || '../../pages/home/home.html';
            }, 1200);

        } catch (err) {
            msg.className = 'form-message error';
            msg.textContent = err.message || 'Something went wrong. Please try again.';
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    });
})();


/* ============================================
   GOOGLE OAUTH BUTTON
============================================ */
(function initGoogleAuth() {
    const btn = document.getElementById('googleBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        // TODO: trigger Firebase Google auth popup
        // e.g. firebase.auth().signInWithPopup(googleProvider)
        console.log('[Planora] Google OAuth triggered');
    });
})();


/* ============================================
   SIMULATE API REQUEST (remove in production)
============================================ */
function simulateRequest(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate occasional error for testing: uncomment to test error state
            // if (Math.random() < 0.3) { reject(new Error('Invalid email or password.')); return; }
            resolve();
        }, ms);
    });
}


/* ============================================
   INPUT FOCUS GLOW EFFECT
============================================ */
(function initInputEffects() {
    document.querySelectorAll('.input-wrap input').forEach(input => {
        input.addEventListener('focus', () => {
            input.closest('.field-group')?.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.closest('.field-group')?.classList.remove('focused');
        });
    });
})();