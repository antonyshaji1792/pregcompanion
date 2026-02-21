/**
 * calc-due-date.js - Due Date Calculator Module
 * Namespace: Companion.UI.Calculators.DueDate
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.DueDate = (function ($) {
    const STORAGE_KEY = 'calc_due_date_data';

    const modalHtml = `
        <div class="modal fade" id="calc-dueDate-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-primary text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-calendar-event me-2"></i>Due Date Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="calculator-inputs">
                            <div class="mb-3">
                                <label class="form-label fw-bold small text-muted text-uppercase">First Day of Last Period</label>
                                <input type="date" class="form-control form-control-lg rounded-3 border-0 shadow-sm" id="calc-dd-lmp">
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted text-uppercase">Average Cycle Length (Days)</label>
                                <div class="d-flex align-items-center gap-3">
                                    <input type="range" class="form-range flex-grow-1" id="calc-dd-cycle-range" min="20" max="45" value="28">
                                    <span class="fw-bold text-primary" id="calc-dd-cycle-val" style="min-width: 30px;">28</span>
                                </div>
                            </div>
                            <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg animate-button" onclick="Companion.UI.Calculators.DueDate.calculate()">
                                Calculate My Due Date
                            </button>
                        </div>
                        
                        <div id="calc-dd-result" class="mt-4 d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm border-start border-primary border-5 animate-reveal">
                                <div class="text-center mb-4">
                                    <div class="small text-muted mb-1 text-uppercase fw-bold letter-spacing-1">Estimated Due Date</div>
                                    <h2 class="fw-bold text-gradient-primary mb-0" id="calc-dd-val"></h2>
                                    <div class="badge bg-soft-primary text-primary mt-2 px-3 py-2 rounded-pill" id="calc-dd-weeks"></div>
                                </div>
                                
                                <div class="row g-2 text-center mb-4" id="calc-dd-breakdown">
                                    <div class="col-4">
                                        <div class="p-2 border rounded-3 bg-light">
                                            <div class="fw-bold h4 mb-0 text-primary" id="calc-dd-rem-months">-</div>
                                            <div class="x-small text-muted text-uppercase">Months</div>
                                        </div>
                                    </div>
                                    <div class="col-4">
                                         <div class="p-2 border rounded-3 bg-light">
                                            <div class="fw-bold h4 mb-0 text-primary" id="calc-dd-rem-weeks">-</div>
                                            <div class="x-small text-muted text-uppercase">Weeks</div>
                                        </div>
                                    </div>
                                    <div class="col-4">
                                         <div class="p-2 border rounded-3 bg-light">
                                            <div class="fw-bold h4 mb-0 text-primary" id="calc-dd-rem-days">-</div>
                                            <div class="x-small text-muted text-uppercase">Days</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Calculators.DueDate.reset()">
                                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-primary rounded-pill px-3" onclick="Companion.UI.Calculators.DueDate.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Related Tools -->
                            <div class="mt-4 pt-2">
                                <h6 class="fw-bold small text-muted mb-3 text-uppercase">Related Tools</h6>
                                <div class="row g-2">
                                    <div class="col-6">
                                        <button class="btn btn-outline-light text-dark shadow-sm w-100 text-start small p-2 rounded-3 border-0 bg-white" onclick="Companion.UI.Calculators.Ovulation.open()">
                                            <i class="bi bi-flower1 text-primary me-2"></i>Ovulation
                                        </button>
                                    </div>
                                    <div class="col-6">
                                        <button class="btn btn-outline-light text-dark shadow-sm w-100 text-start small p-2 rounded-3 border-0 bg-white" onclick="Companion.UI.Calculators.Weight.open()">
                                            <i class="bi bi-speedometer2 text-success me-2"></i>Weight Gain
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Medical Disclaimer -->
                            <div class="mt-4 p-3 rounded-3 bg-soft-secondary x-small text-muted line-height-sm">
                                <i class="bi bi-info-circle-fill me-1"></i> 
                                <strong>Medical Disclaimer:</strong> This calculator provides estimated dates based on average cycles. It is for educational purposes and should not replace professional medical advice from your OB-GYN.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        init: function () {
            if ($('#calc-dueDate-modal').length === 0) {
                $('body').append(modalHtml);
                this.bindEvents();
                this.loadSavedData();
            }
        },

        bindEvents: function () {
            $('#calc-dd-cycle-range').on('input', function () {
                $('#calc-dd-cycle-val').text($(this).val());
            });
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-dueDate-modal'));
            modal.show();
        },

        calculate: function () {
            const lmp = $('#calc-dd-lmp').val();
            const cycle = parseInt($('#calc-dd-cycle-range').val()) || 28;

            if (!lmp) {
                $('#calc-dd-lmp').addClass('is-invalid').focus();
                return;
            }
            $('#calc-dd-lmp').removeClass('is-invalid');

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ lmp, cycle }));

            // Perform calculation
            const edd = Calculator.calculateDueDate(lmp, cycle);
            const gestation = Calculator.calculateGestation(lmp);

            // Update UI
            $('#calc-dd-val').text(edd.format('dddd, MMMM D, YYYY'));
            $('#calc-dd-weeks').html(`<i class="bi bi-info-circle me-1"></i> ${gestation.totalWeeks} Weeks ${gestation.days} Days pregnant`);

            // Detailed Breakdown
            const now = dayjs();
            const diffMs = edd.diff(now);

            if (diffMs <= 0) {
                $('#calc-dd-breakdown').parent().find('.h4').text('0');
            } else {
                let remMs = diffMs;
                const msPerDay = 24 * 60 * 60 * 1000;
                const msPerWeek = 7 * msPerDay;
                const msPerMonth = 30.44 * msPerDay;

                const months = Math.floor(remMs / msPerMonth);
                remMs %= msPerMonth;
                const weeks = Math.floor(remMs / msPerWeek);
                remMs %= msPerWeek;
                const days = Math.floor(remMs / msPerDay);

                $('#calc-dd-rem-months').text(months);
                $('#calc-dd-rem-weeks').text(weeks);
                $('#calc-dd-rem-days').text(days);
            }

            // Animate reveal
            $('#calc-dd-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#calc-dd-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#calc-dd-lmp').val('');
                $('#calc-dd-cycle-range').val(28);
                $('#calc-dd-cycle-val').text(28);
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const edd = $('#calc-dd-val').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Pregnancy Due Date',
                    text: `I just calculated my due date with PregCompanion! My estimated due date is ${edd}.`,
                    url: window.location.href
                });
            } else {
                alert(`My estimated due date is ${edd}!`);
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#calc-dd-lmp').val(data.lmp);
                $('#calc-dd-cycle-range').val(data.cycle);
                $('#calc-dd-cycle-val').text(data.cycle);
            }
        }
    };
})(jQuery);
