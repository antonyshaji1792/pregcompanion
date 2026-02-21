/**
 * calc-conception.js - Conception Date Calculator Module
 * Namespace: Companion.UI.Calculators.Conception
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.Conception = (function ($) {
    const STORAGE_KEY = 'calc_conception_data';

    const modalHtml = `
        <div class="modal fade" id="calc-conception-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-teal text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-stars me-2"></i>Conception Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="calculator-inputs mb-4">
                            <div class="mb-3">
                                <label class="form-label fw-bold small text-muted text-uppercase">Calculate By</label>
                                <select class="form-select rounded-3 border-0 shadow-sm" id="calc-conc-type">
                                    <option value="edd">Due Date (EDD)</option>
                                    <option value="lmp">Last Period (LMP)</option>
                                </select>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted text-uppercase" id="calc-conc-date-label">Due Date</label>
                                <input type="date" class="form-control form-control-lg rounded-3 border-0 shadow-sm" id="calc-conc-date">
                            </div>
                            <button class="btn btn-teal w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button" onclick="Companion.UI.Calculators.Conception.calculate()">
                                Find Conception Date
                            </button>
                        </div>
                        
                        <div id="calc-conc-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm mb-4 animate-reveal">
                                <div class="text-center">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Estimated Conception Date</div>
                                    <h2 class="fw-bold text-teal mb-2" id="calc-conc-result-date">-- -- ----</h2>
                                    <div class="badge bg-soft-teal text-teal px-3 py-2 rounded-pill mb-3">Approximate Window</div>
                                </div>

                                <div class="mt-4 p-3 bg-light rounded-4">
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="fs-3 text-teal"><i class="bi bi-calendar-range"></i></div>
                                        <div>
                                            <div class="x-small text-muted fw-bold text-uppercase">Fertile Window</div>
                                            <div class="fw-bold text-dark" id="calc-conc-window">-- - -- -- ----</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Calculators.Conception.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-teal rounded-pill px-3" onclick="Companion.UI.Calculators.Conception.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>

                            <div class="mt-4 p-3 rounded-4 bg-white border-0 shadow-xs animate-reveal" style="--delay: 0.1s">
                                <div class="d-flex gap-3">
                                    <div class="text-teal fs-4"><i class="bi bi-info-circle"></i></div>
                                    <div class="small text-muted">
                                        Most women conceive within 11 to 21 days after the first day of their last period. This tool estimated your "magic moment" based on standard biological averages.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-teal { background: linear-gradient(135deg, #20c997, #009688) !important; }
            .text-teal { color: #009688 !important; }
            .btn-teal { background-color: #009688 !important; border-color: #009688 !important; }
            .bg-soft-teal { background-color: rgba(32, 201, 151, 0.1) !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#calc-conception-modal').length === 0) {
                $('body').append(modalHtml);
                this.bindEvents();
                this.loadSavedData();
            }
        },

        bindEvents: function () {
            $('#calc-conc-type').on('change', function () {
                const label = $(this).val() === 'edd' ? 'Due Date' : 'Last Period Date';
                $('#calc-conc-date-label').text(label);
            });
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-conception-modal'));
            modal.show();
        },

        calculate: function () {
            const dateStr = $('#calc-conc-date').val();
            const type = $('#calc-conc-type').val();

            if (!dateStr) {
                $('#calc-conc-date').addClass('is-invalid').focus();
                return;
            }
            $('#calc-conc-date').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: dateStr, type: type }));

            const inputDate = dayjs(dateStr);
            let conceptionDate;

            if (type === 'edd') {
                // Formula: Conception = Due Date - 266 days
                conceptionDate = inputDate.subtract(266, 'day');
            } else {
                // Formula: Conception is roughly 14 days after LMP
                conceptionDate = inputDate.add(14, 'day');
            }

            const winStart = conceptionDate.subtract(3, 'day');
            const winEnd = conceptionDate.add(1, 'day');

            // Format UI
            $('#calc-conc-result-date').text(conceptionDate.format('MMMM D, YYYY'));
            $('#calc-conc-window').text(`${winStart.format('MMM D')} - ${winEnd.format('MMM D, YYYY')}`);

            // Show result
            $('#calc-conc-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#calc-conc-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#calc-conc-date').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const date = $('#calc-conc-result-date').text();
            if (navigator.share) {
                navigator.share({
                    title: 'Our Special Moment',
                    text: `Based on our journey, our estimated conception date was around ${date}. Tracking with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#calc-conc-date').val(data.date);
                $('#calc-conc-type').val(data.type).trigger('change');
            }
        }
    };
})(jQuery);
