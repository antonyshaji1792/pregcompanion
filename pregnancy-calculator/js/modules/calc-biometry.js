/**
 * calc-biometry.js - Fetal Biometry (Hadlock) Calculator Module
 * Namespace: Companion.UI.Calculators.Biometry
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.Biometry = (function ($) {
    const STORAGE_KEY = 'calc_biometry_data';

    const modalHtml = `
        <div class="modal fade" id="calc-biometry-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-indigo text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-rulers me-2"></i>Fetal Biometry Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Estimate Fetal Weight (EFW) using the <strong>Hadlock 4-Parameter Formula</strong>. Use measurements from your ultrasound report (in mm).</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <div class="col-md-6 text-center">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase d-block mb-2">BPD (Head Diameter)</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill" id="biom-bpd" placeholder="mm">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill text-muted small">mm</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 text-center">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase d-block mb-2">HC (Head Circ.)</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill" id="biom-hc" placeholder="mm">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill text-muted small">mm</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 text-center">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase d-block mb-2">AC (Abdom. Circ.)</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill" id="biom-ac" placeholder="mm">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill text-muted small">mm</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 text-center">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase d-block mb-2">FL (Femur Length)</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill" id="biom-fl" placeholder="mm">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill text-muted small">mm</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn btn-indigo w-100 rounded-pill py-3 fw-bold shadow-lg animate-button mt-4 text-white" onclick="Companion.UI.Calculators.Biometry.calculate()">
                                Estimate Weight & Growth
                            </button>
                        </div>
                        
                        <div id="biom-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm mb-4 animate-reveal">
                                <div class="text-center">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Estimated Fetal Weight (EFW)</div>
                                    <h2 class="fw-bold text-indigo mb-1" id="biom-weight-g">0 g</h2>
                                    <div class="text-muted small fw-bold mb-3" id="biom-weight-lb">0 lb 0 oz</div>
                                    <div id="biom-cat" class="badge px-4 py-2 rounded-pill fw-bold bg-soft-indigo text-indigo">Calculated via Hadlock IV</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span class="small text-muted fw-bold">FORMULA CONFIDENCE</span>
                                        <span class="badge bg-success x-small rounded-pill">HIGH</span>
                                    </div>
                                    <div class="progress rounded-pill bg-light" style="height: 10px;">
                                        <div class="progress-bar bg-indigo rounded-pill progress-bar-striped progress-bar-animated" style="width: 100%"></div>
                                    </div>
                                    <p class="x-small text-muted mb-0 mt-3 text-center">
                                        Hadlock's formula has a +/- 15% variation. Ultrasound weight estimates are best used to track <strong>growth trends</strong> over time.
                                    </p>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mt-4 pt-4 border-top border-light">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Calculators.Biometry.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-indigo rounded-pill px-3" onclick="Companion.UI.Calculators.Biometry.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Medical Disclaimer -->
                        <div class="mt-4 p-3 rounded-3 bg-soft-secondary x-small text-muted line-height-sm shadow-sm border-0">
                            <i class="bi bi-exclamation-triangle-fill me-1 text-warning"></i> 
                            <strong>Disclaimer:</strong> This tool is for informational purposes only. Weight estimates from ultrasound can vary significantly from actual birth weight. Always refer to your obstetrician's official medical report.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-indigo { background: linear-gradient(135deg, #6610f2, #6f42c1) !important; }
            .text-indigo { color: #6610f2 !important; }
            .btn-indigo { background-color: #6610f2 !important; border-color: #6610f2 !important; }
            .bg-soft-indigo { background-color: rgba(102, 16, 242, 0.1) !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#calc-biometry-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-biometry-modal'));
            modal.show();
        },

        calculate: function () {
            const bpd = parseFloat($('#biom-bpd').val()); // mm
            const hc = parseFloat($('#biom-hc').val()); // mm
            const ac = parseFloat($('#biom-ac').val()); // mm
            const fl = parseFloat($('#biom-fl').val()); // mm

            if (!bpd || !hc || !ac || !fl) {
                $('.calculator-inputs input').each(function () {
                    if (!$(this).val()) $(this).addClass('is-invalid');
                    else $(this).removeClass('is-invalid');
                });
                return;
            }
            $('.calculator-inputs input').removeClass('is-invalid');

            // Save to local storage
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ bpd, hc, ac, fl }));

            // Hadlock 4 (Convert mm to cm)
            const b = bpd / 10;
            const h = hc / 10;
            const a = ac / 10;
            const f = fl / 10;

            /**
             * Formula: Log10 Weight = 1.3596 + (0.00061 * BPD * AC) + (0.0424 * AC) + (0.174 * FL) + (0.00647 * HC) - (0.00386 * AC * HC)
             */
            const log10Weight = 1.3596 + (0.00061 * b * a) + (0.0424 * a) + (0.174 * f) + (0.00647 * h) - (0.00386 * a * h);
            const weightG = Math.pow(10, log10Weight);

            // Display Results
            $('#biom-weight-g').text(`${Math.round(weightG)} g`);

            // Convert to lb/oz
            const totalOz = weightG * 0.035274;
            const lb = Math.floor(totalOz / 16);
            const oz = Math.round(totalOz % 16);
            $('#biom-weight-lb').text(`${lb} lb ${oz} oz`);

            // Category logic (Generic Hadlock category)
            let cat = "Standard Growth Profile";
            if (weightG < 500) cat = "Early Development Stage";
            else if (weightG > 4000) cat = "Macrosomia Suspected";
            else cat = "Growth Trend Recorded";

            $('#biom-cat').text(cat);

            // Show result
            $('#biom-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#biom-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('.calculator-inputs input').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const grams = $('#biom-weight-g').text();
            const imperial = $('#biom-weight-lb').text();
            if (navigator.share) {
                navigator.share({
                    title: 'Fetal Weight Estimate',
                    text: `Our baby's estimated fetal weight is ${grams} (${imperial}). Tracking development with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#biom-bpd').val(data.bpd);
                $('#biom-hc').val(data.hc);
                $('#biom-ac').val(data.ac);
                $('#biom-fl').val(data.fl);
            }
        }
    };
})(jQuery);
