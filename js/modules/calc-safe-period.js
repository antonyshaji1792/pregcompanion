/**
 * calc-safe-period.js - Safe Period Calculator Module
 * Namespace: Companion.UI.Calculators.SafePeriod
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.SafePeriod = (function ($) {
    const STORAGE_KEY = 'calc_safe_period_data';

    const modalHtml = `
        <div class="modal fade" id="calc-safe-period-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-success text-white p-4" style="background: linear-gradient(135deg, #43a047 0%, #1b5e20 100%);">
                        <h5 class="modal-title fw-bold"><i class="bi bi-shield-check me-2"></i>Safe Period Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="calculator-inputs mb-4">
                            <p class="small text-muted mb-4">The Standard Days Method identifies days 8 through 19 of the cycle as the fertile window. Other days are generally considered "safe" for those with regular cycles (26-32 days).</p>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Last Period Start Date</label>
                                    <input type="date" required class="form-control rounded-3 border-0 shadow-sm" id="calc-safe-lmp">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Cycle Length (Days)</label>
                                    <input type="number" class="form-control rounded-3 border-0 shadow-sm" id="calc-safe-cycle" value="28" min="26" max="32">
                                </div>
                            </div>
                            <button class="btn btn-success w-100 rounded-pill py-3 fw-bold shadow-lg mt-4 animate-button" style="background: #2e7d32; border: none;" onclick="Companion.UI.Calculators.SafePeriod.calculate()">
                                Calculate Safe Days
                            </button>
                        </div>
                        
                        <div id="calc-safe-result" class="d-none">
                            <div class="row g-4">
                                <div class="col-lg-6">
                                    <div class="vstack gap-2">
                                        <div class="p-3 rounded-4 bg-white shadow-sm border-start border-success border-4 animate-reveal" style="--delay: 0.1s">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="bg-soft-success p-2 rounded-circle text-success"><i class="bi bi-check-circle-fill"></i></div>
                                                    <span class="fw-bold small">Current Safe Period</span>
                                                </div>
                                                <span class="fw-bold text-dark" id="safe-res-current">-</span>
                                            </div>
                                        </div>
                                        <div class="p-3 rounded-4 bg-white shadow-sm border-start border-danger border-4 animate-reveal" style="--delay: 0.2s">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="bg-soft-danger p-2 rounded-circle text-danger"><i class="bi bi-exclamation-triangle-fill"></i></div>
                                                    <span class="fw-bold small">Fertile Window (Unsafe)</span>
                                                </div>
                                                <span class="fw-bold text-dark" id="safe-res-unsafe">-</span>
                                            </div>
                                        </div>
                                        <div class="p-3 rounded-4 bg-white shadow-sm border-start border-primary border-4 animate-reveal" style="--delay: 0.3s">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="bg-soft-primary p-2 rounded-circle text-primary"><i class="bi bi-calendar-event"></i></div>
                                                    <span class="fw-bold small">Next Safe Period</span>
                                                </div>
                                                <span class="fw-bold text-dark" id="safe-res-next">-</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="d-flex gap-2 mt-4">
                                        <button class="btn btn-sm btn-outline-secondary rounded-pill flex-grow-1" onclick="Companion.UI.Calculators.SafePeriod.reset()">Reset</button>
                                        <button class="btn btn-sm btn-soft-success rounded-pill flex-grow-1" onclick="Companion.UI.Calculators.SafePeriod.share()">Share</button>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="bg-white p-3 rounded-4 shadow-sm border h-100 animate-reveal" style="--delay: 0.5s">
                                        <div class="row g-2 justify-content-center custom-scrollbar" id="safe-cal-container" style="max-height: 280px; overflow-y: auto; overflow-x: hidden; padding-right: 5px;">
                                            <!-- Calendars will be injected here -->
                                        </div>
                                        <div class="mt-4 pt-2 border-top x-small d-flex flex-wrap gap-2 justify-content-center text-muted">
                                            <span><span class="legend-dot bg-soft-success border-success border"></span> Safe</span>
                                            <span><span class="legend-dot bg-soft-danger border-danger border"></span> Unsafe</span>
                                            <span><span class="legend-dot bg-soft-primary border-primary border"></span> Period</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4 p-3 rounded-3 bg-soft-warning x-small text-dark text-center border border-warning border-opacity-25">
                                <strong>Medical Alert:</strong> No method of birth control is 100% effective. The Standard Days Method is only suitable for women with very regular cycles between 26 and 32 days long.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        init: function () {
            if ($('#calc-safe-period-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-safe-period-modal'));
            modal.show();
        },

        calculate: function () {
            const lmpVal = $('#calc-safe-lmp').val();
            const cycle = parseInt($('#calc-safe-cycle').val()) || 28;

            if (!lmpVal) {
                $('#calc-safe-lmp').addClass('is-invalid').focus();
                return;
            }
            $('#calc-safe-lmp').removeClass('is-invalid');

            if (cycle < 26 || cycle > 32) {
                Companion.UI.showAlert('Standard Days Method is most effective for cycles between 26-32 days.', 'warning');
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ lmp: lmpVal, cycle }));

            const lmp = dayjs(lmpVal);
            const unsafeStart = lmp.add(7, 'day'); // Day 8
            const unsafeEnd = lmp.add(18, 'day');  // Day 19
            const nextLmp = lmp.add(cycle, 'day');

            const currentSafeStart1 = lmp;
            const currentSafeEnd1 = lmp.add(6, 'day'); // Day 1-7

            const currentSafeStart2 = lmp.add(19, 'day'); // Day 20 onwards
            const currentSafeEnd2 = nextLmp.subtract(1, 'day');

            $('#safe-res-current').text(`${currentSafeStart1.format('MMM D')} - ${currentSafeEnd1.format('D')}`);
            $('#safe-res-unsafe').text(`${unsafeStart.format('MMM D')} - ${unsafeEnd.format('D')}`);
            $('#safe-res-next').text(`${currentSafeStart2.format('MMM D')} - ${currentSafeEnd2.format('MMM D')}`);

            this.renderCalendar(lmp, unsafeStart, unsafeEnd, nextLmp);

            $('#calc-safe-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        renderCalendar: function (lmp, unsafeStart, unsafeEnd, nextLmp) {
            const monthsToRender = [];
            const lmpMonth = lmp.startOf('month');
            const nextMonth = nextLmp.startOf('month');

            monthsToRender.push(lmpMonth);
            // Only add next month if it's different from the LMP month
            if (!lmpMonth.isSame(nextMonth, 'month')) {
                monthsToRender.push(nextMonth);
            }

            let containerHtml = '';

            monthsToRender.forEach(calMonth => {
                const daysInMonth = calMonth.daysInMonth();
                const startDay = calMonth.day();
                let gridHtml = '';

                for (let i = 0; i < startDay; i++) {
                    gridHtml += `<div style="width:14.28%; height:32px;"></div>`;
                }

                for (let d = 1; d <= daysInMonth; d++) {
                    const date = calMonth.date(d);
                    let classes = 'd-flex align-items-center justify-content-center';
                    let style = 'width:14.28%; height:32px; cursor:default;';

                    const cycleDay = date.diff(lmp, 'day') + 1;

                    if (date.isSame(lmp, 'day') || date.isSame(nextLmp, 'day')) {
                        classes += ' bg-primary-subtle text-primary fw-bold rounded-circle border border-primary';
                    } else if (date.isBetween(unsafeStart, unsafeEnd, 'day', '[]')) {
                        classes += ' bg-danger-subtle text-danger fw-bold';
                        if (date.isSame(unsafeStart, 'day')) classes += ' rounded-start-pill';
                        if (date.isSame(unsafeEnd, 'day')) classes += ' rounded-end-pill';
                    } else if (cycleDay >= 1 && cycleDay <= parseInt($('#calc-safe-cycle').val())) {
                        // Inside the current calculated cycle
                        if ((cycleDay >= 1 && cycleDay <= 7) || (cycleDay >= 20)) {
                            classes += ' bg-success-subtle text-success fw-bold';
                            if (cycleDay === 1 || cycleDay === 20) classes += ' rounded-start-pill text-white bg-success';
                        }
                    }

                    gridHtml += `<div class="${classes}" style="${style}">${d}</div>`;
                }

                containerHtml += `
                    <div class="col-12 mb-3">
                        <div class="text-center mb-3">
                            <h6 class="fw-bold mb-0 text-success">${calMonth.format('MMMM YYYY')}</h6>
                        </div>
                        <div class="d-flex justify-content-between text-muted x-small fw-bold mb-2">
                            <div class="text-center w-100">S</div><div class="text-center w-100">M</div><div class="text-center w-100">T</div><div class="text-center w-100">W</div><div class="text-center w-100">T</div><div class="text-center w-100">F</div><div class="text-center w-100">S</div>
                        </div>
                        <div class="d-flex flex-wrap text-center small">${gridHtml}</div>
                    </div>
                `;
            });

            $('#safe-cal-container').html(containerHtml);
        },

        reset: function () {
            $('#calc-safe-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#calc-safe-lmp').val('');
                $('#calc-safe-cycle').val(28);
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const unsafe = $('#safe-res-unsafe').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Safe Period Tracking',
                    text: `I'm tracking my safe days with PregCompanion. My fertile window is estimated to be ${unsafe}.`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#calc-safe-lmp').val(data.lmp);
                $('#calc-safe-cycle').val(data.cycle);
            }
        }
    };
})(jQuery);
