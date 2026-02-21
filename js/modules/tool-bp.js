/**
 * tool-bp.js - Blood Pressure (BP) Category Tool
 * Namespace: Companion.UI.Tools.BP
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.BP = (function ($) {
    const STORAGE_KEY = 'tool_bp_data';

    const modalHtml = `
        <div class="modal fade" id="tool-bp-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-blood text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-heart-pulse-fill me-2"></i>BP Category Tool</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Check your blood pressure category based on American Heart Association (AHA) guidelines.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Systolic</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill py-2 h4 mb-0 fw-bold" id="bp-systolic" placeholder="120">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">top</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Diastolic</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill py-2 h4 mb-0 fw-bold" id="bp-diastolic" placeholder="80">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">bottom</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn btn-blood w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button mt-4" onclick="Companion.UI.Tools.BP.calculate()">
                                Check Category
                            </button>
                        </div>

                        <div id="bp-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center mb-0">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Your Classification is</div>
                                    <div id="bp-status-badge" class="badge rounded-pill px-4 py-2 fw-bold" style="font-size: 1.1rem;">--</div>
                                    <div class="h1 fw-bold text-dark mt-3 mb-0" id="bp-value-display">0/0</div>
                                    <div class="text-muted small fw-bold">mmHg</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <h6 class="fw-bold x-small text-muted text-uppercase mb-2">Clinical Advice</h6>
                                    <div class="p-3 rounded-4 bg-light small text-muted border-start border-4" id="bp-advice-border">
                                        <div id="bp-advice-text">Enter your readings to see specialist advice.</div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.BP.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-blood rounded-pill px-3" onclick="Companion.UI.Tools.BP.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-3 rounded-4 bg-soft-danger x-small text-muted border-0">
                            <i class="bi bi-exclamation-triangle-fill me-1 text-danger"></i> 
                            <strong>Important:</strong> BP readings can vary. For an accurate diagnosis, consult a healthcare provider. High readings during pregnancy (especially 140/90+) require <strong>immediate</strong> medical attention.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-blood { background: linear-gradient(135deg, #d32f2f, #b71c1c) !important; }
            .text-blood { color: #d32f2f !important; }
            .btn-blood { background-color: #d32f2f !important; border-color: #d32f2f !important; }
            .bg-soft-blood { background-color: rgba(211, 47, 47, 0.1) !important; }
            .btn-soft-blood { background-color: rgba(211, 47, 47, 0.1) !important; color: #d32f2f !important; }
            #bp-advice-border.border-success { border-color: #2e7d32 !important; }
            #bp-advice-border.border-warning { border-color: #f9a825 !important; }
            #bp-advice-border.border-danger { border-color: #c62828 !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-bp-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-bp-modal'));
            modal.show();
        },

        calculate: function () {
            const s = parseInt($('#bp-systolic').val());
            const d = parseInt($('#bp-diastolic').val());

            if (!s || !d) {
                if (!s) $('#bp-systolic').addClass('is-invalid');
                if (!d) $('#bp-diastolic').addClass('is-invalid');
                return;
            }
            $('.calculator-inputs input').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ s, d }));

            $('#bp-value-display').text(`${s}/${d}`);

            let cat = "";
            let bClass = "";
            let advice = "";
            let borderColor = "";

            if (s >= 180 || d >= 120) {
                cat = "Hypertensive Crisis";
                bClass = "bg-danger shadow-sm";
                advice = "Urgent: Consult your doctor immediately or seek emergency care if you feel any symptoms.";
                borderColor = "border-danger";
            } else if (s >= 140 || d >= 90) {
                cat = "Hypertension Stage 2";
                bClass = "bg-danger";
                advice = "Your BP is consistently high. Professional medical intervention is usually required.";
                borderColor = "border-danger";
            } else if (s >= 130 || d >= 80) {
                cat = "Hypertension Stage 1";
                bClass = "bg-warning text-dark";
                advice = "Blood pressure is high. Doctors may recommend lifestyle changes or medication.";
                borderColor = "border-warning";
            } else if (s >= 120 && d < 80) {
                cat = "Elevated";
                bClass = "bg-warning text-dark";
                advice = "You are likely to develop high blood pressure unless steps are taken to control it.";
                borderColor = "border-warning";
            } else {
                cat = "Normal";
                bClass = "bg-success";
                advice = "Your blood pressure is within a healthy range. Continue with your healthy lifestyle.";
                borderColor = "border-success";
            }

            $('#bp-status-badge').text(cat).removeClass().addClass(`badge rounded-pill px-4 py-2 fw-bold ${bClass}`);
            $('#bp-advice-text').text(advice);
            $('#bp-advice-border').removeClass('border-success border-warning border-danger').addClass(borderColor);

            $('#bp-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#bp-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#bp-systolic, #bp-diastolic').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const val = $('#bp-value-display').text();
            const cat = $('#bp-status-badge').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My BP Readiness Check',
                    text: `My blood pressure is ${val} (${cat}). Monitoring my health with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#bp-systolic').val(data.s);
                $('#bp-diastolic').val(data.d);
            }
        }
    };
})(jQuery);
