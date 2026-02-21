/**
 * calc-week-tracker.js - Week-by-Week Pregnancy Tracker Module
 * Namespace: Companion.UI.Calculators.WeekTracker
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.WeekTracker = (function ($) {
    const STORAGE_KEY = 'calc_week_tracker_data';

    const modalHtml = `
        <div class="modal fade" id="calc-week-tracker-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-purple text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-clock-history me-2"></i>Week-by-Week Tracker</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3 align-items-end">
                                <div class="col-md-5">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Calculate By</label>
                                    <select class="form-select rounded-3 border-0 shadow-sm" id="calc-wt-type">
                                        <option value="lmp">Last Period Date (LMP)</option>
                                        <option value="edd">Due Date (EDD)</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold small text-muted text-uppercase" id="calc-wt-date-label">LMP Date</label>
                                    <input type="date" class="form-control rounded-3 border-0 shadow-sm" id="calc-wt-date">
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-purple w-100 rounded-pill fw-bold text-white shadow-sm animate-button" onclick="Companion.UI.Calculators.WeekTracker.calculate()">
                                        Track Week
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div id="calc-week-tracker-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm mb-4 animate-reveal">
                                <div class="row align-items-center">
                                    <div class="col-md-6 text-center border-end border-light">
                                        <div class="display-3 fw-bold text-gradient-purple mb-0" id="calc-wt-week-num">--</div>
                                        <div class="h5 fw-bold text-dark mb-2">Weeks Pregnant</div>
                                        <div id="calc-wt-trimester-badge" class="badge px-3 py-2 rounded-pill"></div>
                                    </div>
                                    <div class="col-md-6 text-center mt-3 mt-md-0">
                                        <div class="small text-muted text-uppercase fw-bold mb-2">Baby is as big as a...</div>
                                        <div class="display-4 mb-2" id="calc-wt-baby-emoji">👶</div>
                                        <h4 class="fw-bold text-purple mb-0" id="calc-wt-baby-size">--</h4>
                                    </div>
                                </div>

                                <div class="mt-5 px-2">
                                    <div class="d-flex justify-content-between small fw-bold text-muted mb-2 text-uppercase letter-spacing-1">
                                        <span>Conception</span>
                                        <span>Birth</span>
                                    </div>
                                    <div class="progress rounded-pill bg-light shadow-inner" style="height: 12px; overflow: visible;">
                                        <div id="calc-wt-progress" class="progress-bar bg-gradient-purple rounded-pill position-relative" role="progressbar" style="width: 0%; transition: width 1.5s cubic-bezier(0.1, 0.5, 0.5, 1);">
                                            <div class="position-absolute end-0 top-50 translate-middle-y bg-white border border-purple border-3 rounded-circle shadow-sm" style="width: 20px; height: 20px; margin-right: -10px;"></div>
                                        </div>
                                    </div>
                                    <div class="mt-4 p-3 bg-soft-purple rounded-4">
                                        <p class="mb-0 text-dark italic" id="calc-wt-note"></p>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Calculators.WeekTracker.reset()">
                                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                                    </button>
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-soft-purple rounded-pill px-3" onclick="Companion.UI.Calculators.WeekTracker.share()">
                                            <i class="bi bi-share me-1"></i>Share
                                        </button>
                                        <button class="btn btn-sm btn-primary rounded-pill px-3" onclick="Companion.UI.Calculators.WeekTracker.goToDueDate()">
                                            View EDD <i class="bi bi-arrow-right list ms-1"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Suggestion Section -->
                            <div class="related-tools mt-4">
                                <h6 class="fw-bold mb-3 small text-muted text-uppercase letter-spacing-1">Join the journey</h6>
                                <div class="row g-2">
                                    <div class="col-6">
                                        <div class="p-2 bg-white rounded-3 shadow-xs border d-flex align-items-center gap-2 cursor-pointer invite-tool" onclick="Companion.UI.Calculators.Weight.open()">
                                            <div class="bg-soft-success p-2 rounded-circle text-success"><i class="bi bi-speedometer2"></i></div>
                                            <span class="small fw-bold">Weight Gain</span>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="p-2 bg-white rounded-3 shadow-xs border d-flex align-items-center gap-2 cursor-pointer invite-tool" onclick="Companion.UI.Calculators.DueDate.open()">
                                            <div class="bg-soft-primary p-2 rounded-circle text-primary"><i class="bi bi-calendar-check"></i></div>
                                            <span class="small fw-bold">Due Date</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        init: function () {
            if ($('#calc-week-tracker-modal').length === 0) {
                $('body').append(modalHtml);
                this.bindEvents();
                this.loadSavedData();
            }
        },

        bindEvents: function () {
            $('#calc-wt-type').on('change', function () {
                const label = $(this).val() === 'lmp' ? 'LMP Date' : 'Due Date';
                $('#calc-wt-date-label').text(label);
            });
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-week-tracker-modal'));
            modal.show();
        },

        calculate: function () {
            const dateStr = $('#calc-wt-date').val();
            const type = $('#calc-wt-type').val();

            if (!dateStr) {
                $('#calc-wt-date').addClass('is-invalid').focus();
                return;
            }
            $('#calc-wt-date').removeClass('is-invalid');

            const date = dayjs(dateStr);
            let lmpDate;

            if (type === 'edd') {
                lmpDate = date.subtract(280, 'day');
            } else {
                lmpDate = date;
            }

            const today = dayjs().startOf('day');
            const totalDays = today.diff(lmpDate, 'day');
            const weeks = Math.floor(totalDays / 7);

            if (weeks < 1 || weeks > 42) {
                // Out of range?
            }

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: dateStr, type: type }));

            // Update UI
            $('#calc-wt-week-num').text(weeks);

            // Trimester
            let trimester = "First";
            let badgeClass = "bg-soft-primary text-primary";
            if (weeks >= 28) { trimester = "Third"; badgeClass = "bg-soft-danger text-danger"; }
            else if (weeks >= 14) { trimester = "Second"; badgeClass = "bg-soft-success text-success"; }
            $('#calc-wt-trimester-badge').text(`${trimester} Trimester`).removeClass().addClass(`badge px-3 py-2 rounded-pill ${badgeClass}`);

            // Baby Data
            if (window.Companion && window.Companion.Development) {
                const data = window.Companion.Development.getData(weeks);
                $('#calc-wt-baby-emoji').text(data.emoji || '👶');
                $('#calc-wt-baby-size').text(data.size || '—');
                $('#calc-wt-note').text(data.note || '');
            }

            // Progress Bar
            const progress = Math.min(100, (weeks / 40) * 100);
            $('#calc-wt-progress').css('width', '0%'); // Reset for animation

            // Show result
            $('#calc-week-tracker-result').hide().removeClass('d-none').fadeIn(600);
            const $card = $('#calc-week-tracker-result .result-card');
            $card.removeClass('animate-reveal slide-up-fade-in');
            void $card[0].offsetWidth; // force reflow to restart animation
            $card.css('opacity', '1').addClass('slide-up-fade-in');

            setTimeout(() => {
                $('#calc-wt-progress').css('width', progress + '%');
            }, 300);
        },

        reset: function () {
            $('#calc-week-tracker-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#calc-wt-date').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const week = $('#calc-wt-week-num').text();
            const size = $('#calc-wt-baby-size').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Pregnancy Progress',
                    text: `I'm ${week} weeks pregnant! My baby is the size of a ${size}. Tracking with PregCal!`,
                    url: window.location.href
                });
            }
        },

        goToDueDate: function () {
            const modal = bootstrap.Modal.getInstance(document.getElementById('calc-week-tracker-modal'));
            modal.hide();
            setTimeout(() => {
                if (window.Companion.UI.Calculators.DueDate) {
                    window.Companion.UI.Calculators.DueDate.open();
                }
            }, 400);
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#calc-wt-date').val(data.date);
                $('#calc-wt-type').val(data.type || 'lmp').trigger('change');
            }
        }
    };
})(jQuery);
