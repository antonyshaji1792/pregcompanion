/**
 * navigation-handler.js - Manages browser history and back button behavior
 * Ensures mobile back button works predictably without exiting the app
 */
window.Companion = window.Companion || {};

Companion.Navigation = (function ($) {
    let _isTransitioning = false;
    let _lastState = null;

    return {
        init: function () {
            console.log("[Navigation] Initializing State Management...");

            // 1. Set Initial State based on current visibility
            const isOnboarding = $('#onboarding-host').length > 0 && !$('#onboarding-host').hasClass('d-none');

            if (isOnboarding) {
                // Identify which onboarding step is currently visible (default to 1)
                let currentStep = 1;
                $('.onboarding-step').each(function () {
                    if (!$(this).hasClass('d-none')) {
                        const id = $(this).attr('id');
                        if (id && id.startsWith('ob-step-')) {
                            currentStep = parseInt(id.replace('ob-step-', ''));
                        }
                    }
                });
                history.replaceState({ type: 'onboarding', step: currentStep }, '');
            } else {
                const initialPage = $('.site-page.active').attr('id')?.replace('page-', '') || 'home';
                history.replaceState({ type: 'page', page: initialPage }, '');
            }

            // 2. Popstate Listener
            window.addEventListener('popstate', (event) => {
                if (!event.state) return;

                console.log("[Navigation] Popstate detected:", event.state);
                _isTransitioning = true;
                const state = event.state;

                try {
                    if (state.type === 'onboarding') {
                        if (window.obNext) window.obNext(state.step, true);
                    } else if (state.type === 'page') {
                        this.switchToPage(state.page, true);
                    } else if (state.type === 'module') {
                        if (Companion.UI && Companion.UI.showModule) {
                            Companion.UI.showModule(state.module, true);
                        }
                    }
                } catch (e) {
                    console.error("[Navigation] Error handling popstate:", e);
                }

                _isTransitioning = false;
            });

            // 3. Hijack Core UI Module Transitions
            if (Companion.UI && Companion.UI.showModule) {
                const oldShowModule = Companion.UI.showModule;
                Companion.UI.showModule = function (moduleName, fromPop = false) {
                    if (!fromPop && !_isTransitioning) {
                        // Check if we're already on this module/page to avoid duplicate history
                        if (history.state && history.state.type === 'module' && history.state.module === moduleName) {
                            // Already there
                        } else {
                            history.pushState({ type: 'module', module: moduleName }, '');
                        }
                    }
                    oldShowModule.call(Companion.UI, moduleName);
                };
            }

            // 4. Hijack Onboarding
            const oldObNext = window.obNext;
            if (oldObNext) {
                window.obNext = function (step, fromPop = false) {
                    if (!fromPop && !_isTransitioning) {
                        history.pushState({ type: 'onboarding', step: step }, '');
                    }
                    oldObNext(step);
                };
            }

            // 5. Handle Global Navigation Links (site-nav-link)
            // We use a capture phase or unbind/rebind to ensure we manage history here
            $(document).off('click', '.site-nav-link').on('click', '.site-nav-link', (e) => {
                // e.preventDefault(); // The original handler also does this
                const pageId = $(e.currentTarget).data('page');
                if (!pageId) return;

                if (!_isTransitioning) {
                    // Avoid duplicate push for same page
                    if (history.state && history.state.type === 'page' && history.state.page === pageId) {
                        // Same page, do nothing or just scroll
                    } else {
                        history.pushState({ type: 'page', page: pageId }, '');
                    }
                }
                this.switchToPage(pageId, false);
            });

            // 6. Handle "Back" buttons in UI to use browser history instead of forcing modules
            $(document).on('click', '#close-module-overlay, #close-resources-overlay, .back-to-dashboard', (e) => {
                e.preventDefault();
                e.stopPropagation();
                history.back();
            });
        },

        /**
         * Logic to switch between main pages (home, calendar, etc.)
         * Replicates the logic in index.html but makes it callable from here
         */
        switchToPage: function (pageId, fromPop) {
            console.log(`[Navigation] Switching to Page: ${pageId}`);

            // Switch active classes in nav
            $('.site-nav-link').removeClass('active');
            $(`.site-nav-link[data-page="${pageId}"]`).addClass('active');

            // Switch active pages
            $('.site-page').removeClass('active');
            $(`#page-${pageId}`).addClass('active').addClass('reveal-up');

            // Reset Sub-module overlays if we are switching major pages
            $('#module-overlay').addClass('d-none');
            $('#tracker-hub-grid').removeClass('d-none');
            $('#resources-module-overlay').addClass('d-none');
            $('#resources-hub-grid').removeClass('d-none');

            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Close mobile navbar if open
            const navCollapse = document.getElementById('navbarSupportedContent');
            if (navCollapse && navCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navCollapse) || new bootstrap.Collapse(navCollapse);
                bsCollapse.hide();
            }

            // Trigger specific module logic
            if (pageId === 'calendar' && Companion.Calendar) Companion.Calendar.render();
            if (pageId === 'profile' && window.initProfilePage) window.initProfilePage();

            // If going back to home, make sure onboarding is hidden
            if (pageId === 'home') {
                $('#onboarding-host').addClass('d-none');
                $('#main-content').removeClass('d-none');
                $('#mainNavbar').removeClass('d-none');
            }
        },

        /**
         * Utility to force a state push if needed by external modules
         */
        pushModule: function (moduleName) {
            history.pushState({ type: 'module', module: moduleName }, '');
        }
    };
})(jQuery);
