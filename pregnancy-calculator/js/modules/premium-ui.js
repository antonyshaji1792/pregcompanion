/**
 * premium-ui.js - Core UI Controller for the Premium Experience
 * Handles: Dark Mode, Navbar Blur, Toasts, Micro-interactions
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};

Companion.UI.Premium = (function ($) {
    const THEME_KEY = 'pref_theme_mode';

    return {
        init: function () {
            this.initTheme();
            this.initNavbar();
            this.initMicroInteractions();
            this.initAutoSave();
        },

        // --- Theme Management ---
        initTheme: function () {
            const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
            this.setTheme(savedTheme);

            $(document).on('click', '.theme-toggle', () => {
                const current = $('html').attr('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                this.setTheme(next);
            });
        },

        setTheme: function (theme) {
            $('html').attr('data-theme', theme);
            localStorage.setItem(THEME_KEY, theme);

            // Update icons if present
            const icon = theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill';
            $('.theme-toggle i').attr('class', `bi ${icon}`);
        },

        // --- Navbar Scroll Logic ---
        initNavbar: function () {
            const $nav = $('.navbar-premium');
            $(window).scroll(function () {
                if ($(window).scrollTop() > 50) {
                    $nav.addClass('scrolled');
                } else {
                    $nav.removeClass('scrolled');
                }
            });
        },

        // --- Toast System ---
        showToast: function (message, type = 'success') {
            if (!$('#toast-container').length) {
                $('body').append('<div id="toast-container"></div>');
            }

            const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
            const color = type === 'success' ? 'var(--success)' : 'var(--danger)';

            const $toast = $(`
                <div class="toast-premium reveal-up">
                    <i class="bi ${icon}" style="color: ${color}"></i>
                    <span>${message}</span>
                </div>
            `);

            $('#toast-container').append($toast);

            setTimeout(() => {
                $toast.fadeOut(400, function () { $(this).remove(); });
            }, 3000);
        },

        // --- Micro-interactions ---
        initMicroInteractions: function () {
            // Ripple Effect
            $(document).on('click', '.btn-premium, .tile-btn', function (e) {
                const $btn = $(this);
                const $ripple = $('<span class="ripple"></span>');
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                $ripple.css({ top: y + 'px', left: x + 'px' });
                $btn.append($ripple);

                setTimeout(() => $ripple.remove(), 600);
            });

            // Smooth Progress Bar
            this.animateProgress = (selector, value) => {
                $(selector).css('width', '0%').animate({ width: value + '%' }, 1000);
            };
        },

        // --- Auto-Save Form Logic ---
        initAutoSave: function () {
            $(document).on('change', 'input, select, textarea', function () {
                const $el = $(this);
                const id = $el.attr('id');
                if (id && !$el.hasClass('no-save')) {
                    localStorage.setItem(`autosave_${id}`, $el.val());
                }
            });

            // Restore
            $('input, select, textarea').each(function () {
                const id = $(this).attr('id');
                const saved = localStorage.getItem(`autosave_${id}`);
                if (saved && !$(this).val()) {
                    $(this).val(saved);
                }
            });
        },

        // --- Confetti Lite ---
        celebrate: function () {
            if (window.confetti) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FF9FB2', '#FFC3A0', '#C3A6FF']
                });
            } else {
                // Haptic feedback fallback
                if ("vibrate" in navigator) navigator.vibrate(100);
                this.showToast("Milestone Achieved! 🎉");
            }
        }
    };
})(jQuery);
