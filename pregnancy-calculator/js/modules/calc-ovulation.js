/**
 * calc-ovulation.js - Ovulation Calculator Module
 * Namespace: Companion.UI.Calculators.Ovulation
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.Ovulation = (function ($) {
    const STORAGE_KEY = 'calc_ovulation_data';

    const modalHtml = `
        <div class="modal fade" id="calc-ovulation-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-purple text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-flower1 me-2"></i>Ovulation Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">First Day of Last Period</label>
                                    <input type="date" class="form-control rounded-3 border-0 shadow-sm" id="calc-ov-lmp">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Cycle Length (Days)</label>
                                    <input type="number" class="form-control rounded-3 border-0 shadow-sm" id="calc-ov-cycle" value="28">
                                </div>
                            </div>
                            <button class="btn btn-primary bg-purple border-0 w-100 rounded-pill py-3 fw-bold shadow-lg mt-4 animate-button" onclick="Companion.UI.Calculators.Ovulation.calculate()">
                                Calculate Fertile Window
                            </button>
                        </div>
                        
                        <div id="calc-ov-result" class="d-none">
                            <div class="row g-4">
                                <!-- List -->
                                <div class="col-lg-6">
                                    <div class="vstack gap-2">
                                        <div class="p-3 rounded-4 bg-white shadow-sm border-start border-primary border-4 animate-reveal" style="--delay: 0.1s">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="bg-soft-primary p-2 rounded-circle text-primary"><i class="bi bi-moisture"></i></div>
                                                    <span class="fw-bold small">Fertile Window</span>
                                                </div>
                                                <span class="fw-bold text-dark" id="ov-res-fertile">-</span>
                                            </div>
                                        </div>
                                        <div class="p-3 rounded-4 bg-white shadow-sm border-start border-success border-4 animate-reveal" style="--delay: 0.2s">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="bg-soft-success p-2 rounded-circle text-success"><i class="bi bi-bullseye"></i></div>
                                                    <span class="fw-bold small">Ovulation</span>
                                                </div>
                                                <span class="fw-bold text-dark" id="ov-res-ovulation">-</span>
                                            </div>
                                        </div>
                                        <div class="p-3 rounded-4 bg-white shadow-sm border-start border-danger border-4 animate-reveal" style="--delay: 0.3s">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="bg-soft-danger p-2 rounded-circle text-danger"><i class="bi bi-droplet-fill"></i></div>
                                                    <span class="fw-bold small">Next Period</span>
                                                </div>
                                                <span class="fw-bold text-dark" id="ov-res-period">-</span>
                                            </div>
                                        </div>
                                        <div class="p-3 rounded-4 bg-white shadow-sm border-start border-warning border-4 animate-reveal" style="--delay: 0.4s">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="bg-soft-warning p-2 rounded-circle text-warning"><i class="bi bi-capsule"></i></div>
                                                    <span class="fw-bold small">Pregnancy Test</span>
                                                </div>
                                                <span class="fw-bold text-dark" id="ov-res-test">-</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="d-flex gap-2 mt-4">
                                        <button class="btn btn-sm btn-outline-secondary rounded-pill flex-grow-1" onclick="Companion.UI.Calculators.Ovulation.reset()">Reset</button>
                                        <button class="btn btn-sm btn-soft-primary rounded-pill flex-grow-1" onclick="Companion.UI.Calculators.Ovulation.share()">Share</button>
                                    </div>
                                </div>

                                <!-- Calendar -->
                                <div class="col-lg-6">
                                    <div class="bg-white p-3 rounded-4 shadow-sm border h-100 animate-reveal" style="--delay: 0.5s">
                                        <div class="text-center mb-3">
                                            <h6 class="fw-bold mb-0 text-primary" id="ov-cal-month">Month Year</h6>
                                        </div>
                                        <div class="d-flex justify-content-between text-muted x-small fw-bold mb-2">
                                            <div class="text-center w-100">S</div><div class="text-center w-100">M</div><div class="text-center w-100">T</div><div class="text-center w-100">W</div><div class="text-center w-100">T</div><div class="text-center w-100">F</div><div class="text-center w-100">S</div>
                                        </div>
                                        <div id="ov-cal-grid" class="d-flex flex-wrap text-center small"></div>
                                        <div class="mt-4 pt-2 border-top x-small d-flex flex-wrap gap-2 justify-content-center text-muted">
                                            <span><span class="legend-dot bg-soft-primary border-primary border"></span> Fertile</span>
                                            <span><span class="legend-dot bg-soft-success border-success border"></span> Peak</span>
                                            <span><span class="legend-dot bg-soft-danger border-danger border"></span> Period</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Related Tools Suggestion -->
                            <div class="mt-4 p-3 rounded-4 bg-white shadow-sm border">
                                <h6 class="fw-bold x-small text-muted mb-2 text-uppercase">Related Tool</h6>
                                <div class="d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="bg-soft-rose p-2 rounded-3 text-accent"><i class="bi bi-calendar-check"></i></div>
                                        <div>
                                            <div class="fw-bold small">Due Date Calculator</div>
                                            <div class="x-small text-muted">Estimate your baby's arrival</div>
                                        </div>
                                    </div>
                                    <button class="btn btn-sm btn-primary rounded-pill" onclick="Companion.UI.Calculators.DueDate.open()">Open</button>
                                </div>
                            </div>

                            <!-- Medical Disclaimer -->
                            <div class="mt-4 p-3 rounded-3 bg-soft-secondary x-small text-muted text-center">
                                <strong>Note:</strong> Sperm can live inside the body for up to 5 days. This window is an estimate based on your cycle inputs.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        init: function () {
            if ($('#calc-ovulation-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-ovulation-modal'));
            modal.show();
        },

        calculate: function () {
            const lmp = $('#calc-ov-lmp').val();
            const cycle = parseInt($('#calc-ov-cycle').val()) || 28;

            if (!lmp) {
                $('#calc-ov-lmp').addClass('is-invalid').focus();
                return;
            }
            $('#calc-ov-lmp').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ lmp, cycle }));

            const lastPeriod = dayjs(lmp);
            const nextPeriod = lastPeriod.add(cycle, 'day');
            const ovulationDay = nextPeriod.subtract(14, 'day');
            const fertileStart = ovulationDay.subtract(5, 'day');
            const fertileEnd = ovulationDay;
            const testDay = nextPeriod.add(1, 'day');
            const edd = Calculator.calculateDueDate(lmp, cycle);

            $('#ov-res-fertile').text(`${fertileStart.format('MMM D')} - ${fertileEnd.format('D')}`);
            $('#ov-res-ovulation').text(ovulationDay.format('MMMM D'));
            $('#ov-res-period').text(nextPeriod.format('MMMM D'));
            $('#ov-res-test').text(testDay.format('MMMM D'));

            this.renderCalendar(ovulationDay, fertileStart, fertileEnd, nextPeriod, testDay);

            $('#calc-ov-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        renderCalendar: function (ovulationDay, fertileStart, fertileEnd, nextPeriod, testDay) {
            const calMonth = ovulationDay.startOf('month');
            $('#ov-cal-month').text(calMonth.format('MMMM YYYY'));

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

                if (date.isSame(ovulationDay, 'day')) {
                    classes += ' bg-success-subtle text-success fw-bold rounded-circle border border-success';
                } else if (date.isBetween(fertileStart, fertileEnd, 'day', '[]')) {
                    classes += ' bg-primary-subtle text-primary fw-bold';
                    if (date.isSame(fertileStart, 'day')) classes += ' rounded-start-pill';
                    if (date.isSame(fertileEnd, 'day')) classes += ' rounded-end-pill';
                } else if (date.isSame(nextPeriod, 'day')) {
                    classes += ' bg-danger-subtle text-danger rounded-circle';
                } else if (date.isSame(testDay, 'day')) {
                    classes += ' bg-warning-subtle text-warning rounded-circle';
                }

                gridHtml += `<div class="${classes}" style="${style}">${d}</div>`;
            }
            $('#ov-cal-grid').html(gridHtml);
        },

        reset: function () {
            $('#calc-ov-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#calc-ov-lmp').val('');
                $('#calc-ov-cycle').val(28);
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const fertile = $('#ov-res-fertile').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Fertile Window',
                    text: `Based on my cycle, my most fertile window is ${fertile}. Tracking with PregCompanion!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#calc-ov-lmp').val(data.lmp);
                $('#calc-ov-cycle').val(data.cycle);
            }
        }
    };
})(jQuery);
