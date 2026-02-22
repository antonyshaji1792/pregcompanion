/**
 * calc-ivf.js - IVF Due Date Calculator Module
 * Namespace: Companion.UI.Calculators.IVF
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.IVF = (function ($) {
    const STORAGE_KEY = 'calc_ivf_data';

    const modalHtml = `
        <div class="modal fade" id="calc-ivf-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-cyan text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-magic me-2"></i>IVF Due Date Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="calculator-inputs">
                            <div class="mb-3">
                                <label class="form-label fw-bold small text-muted text-uppercase">Embryo Transfer Date</label>
                                <input type="date" required class="form-control form-control-lg rounded-3 border-0 shadow-sm" id="calc-ivf-transfer">
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted text-uppercase">Embryo Age</label>
                                <select class="form-select form-select-lg rounded-3 border-0 shadow-sm" id="calc-ivf-age">
                                    <option value="3">3-Day Embryo</option>
                                    <option value="5" selected>5-Day Embryo (Blastocyst)</option>
                                </select>
                            </div>
                            <button class="btn btn-cyan w-100 rounded-pill py-3 fw-bold shadow-lg animate-button text-white" onclick="Companion.UI.Calculators.IVF.calculate()">
                                Calculate IVF Due Date
                            </button>
                        </div>
                        
                        <div id="calc-ivf-result" class="mt-4 d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm border-start border-cyan border-5 animate-reveal">
                                <div class="text-center mb-4">
                                    <div class="small text-muted mb-1 text-uppercase fw-bold letter-spacing-1">Estimated Arrival</div>
                                    <h2 class="fw-bold text-gradient-cyan mb-0" id="calc-ivf-val"></h2>
                                    <div id="calc-ivf-trimester-badge" class="badge mt-2 px-3 py-2 rounded-pill"></div>
                                </div>
                                
                                <div class="p-3 bg-light rounded-4 text-center mb-4">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Current Gestation</div>
                                    <h4 class="fw-bold text-dark mb-0" id="calc-ivf-weeks">--</h4>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Calculators.IVF.reset()">
                                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-cyan rounded-pill px-3" onclick="Companion.UI.Calculators.IVF.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>

                            <!-- Medical Disclaimer -->
                            <div class="mt-4 p-3 rounded-3 bg-soft-secondary x-small text-muted line-height-sm">
                                <i class="bi bi-info-circle-fill me-1"></i> 
                                <strong>Note:</strong> IVF due dates are generally more accurate than LMP-based dates. However, this is still an estimate. Always follow your fertility clinic's official milestones.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        init: function () {
            if ($('#calc-ivf-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-ivf-modal'));
            modal.show();
        },

        calculate: function () {
            const transferDateStr = $('#calc-ivf-transfer').val();
            const embryoAge = parseInt($('#calc-ivf-age').val());

            if (!transferDateStr) {
                $('#calc-ivf-transfer').addClass('is-invalid').focus();
                return;
            }
            $('#calc-ivf-transfer').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ transferDate: transferDateStr, age: embryoAge }));

            const transferDate = dayjs(transferDateStr);
            // IVF EDD = transferDate + (266 - embryoAge) days
            const edd = transferDate.add(266 - embryoAge, 'day');

            // To calculate gestation for IVF: 
            // Pregnancy is dated as if the transfer date was "2 weeks + embryoAge" days along.
            // Equivalent LMP = transferDate - (14 + embryoAge) days
            const equivalentLmp = transferDate.subtract(14 + embryoAge, 'day');
            const today = dayjs().startOf('day');
            const totalDays = today.diff(equivalentLmp, 'day');
            const weeks = Math.floor(totalDays / 7);
            const days = totalDays % 7;

            // Update UI
            $('#calc-ivf-val').text(edd.format('dddd, MMMM D, YYYY'));
            $('#calc-ivf-weeks').text(`${weeks} Weeks ${days} Days along`);

            // Trimester
            let trimester = "First";
            let badgeClass = "bg-soft-primary text-primary";
            if (weeks >= 28) { trimester = "Third"; badgeClass = "bg-soft-danger text-danger"; }
            else if (weeks >= 14) { trimester = "Second"; badgeClass = "bg-soft-success text-success"; }

            $('#calc-ivf-trimester-badge').text(`${trimester} Trimester`).removeClass().addClass(`badge mt-2 px-3 py-2 rounded-pill ${badgeClass}`);

            // Animate reveal
            $('#calc-ivf-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#calc-ivf-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#calc-ivf-transfer').val('');
                $('#calc-ivf-age').val('5');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const edd = $('#calc-ivf-val').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My IVF Due Date',
                    text: `Calculated my IVF baby's due date: ${edd}! So excited!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#calc-ivf-transfer').val(data.transferDate);
                $('#calc-ivf-age').val(data.age);
            }
        }
    };
})(jQuery);
