/**
 * tool-whr.js - Waist-to-Hip Ratio (WHR) Calculator
 * Namespace: Companion.UI.Tools.WHR
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.WHR = (function ($) {
    const STORAGE_KEY = 'tool_whr_data';

    const modalHtml = `
        <div class="modal fade" id="tool-whr-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-emerald text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-person-bounding-box me-2"></i>WHR Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Measure your waist and hip circumference to assess body fat distribution and associated health risks.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block text-center">Gender</label>
                                        <div class="d-flex gap-2">
                                            <input type="radio" class="btn-check" name="whr-gender" id="whr-female" value="female" checked>
                                            <label class="btn btn-outline-emerald flex-grow-1 rounded-pill small fw-bold" for="whr-female">Female</label>
                                            <input type="radio" class="btn-check" name="whr-gender" id="whr-male" value="male">
                                            <label class="btn btn-outline-emerald flex-grow-1 rounded-pill small fw-bold" for="whr-male">Male</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Waist</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill py-2" id="whr-waist" placeholder="cm">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">cm</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Hip</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill py-2" id="whr-hip" placeholder="cm">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">cm</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn btn-emerald w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button mt-4" onclick="Companion.UI.Tools.WHR.calculate()">
                                Calculate My Ratio
                            </button>
                        </div>

                        <div id="whr-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center mb-0">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Your WHR Ratio is</div>
                                    <h1 class="display-3 fw-bold text-emerald mb-0 text-gradient-emerald" id="whr-value-display">0.00</h1>
                                    <div id="whr-status-badge" class="badge rounded-pill px-4 py-2 fw-bold mt-2" style="font-size: 0.85rem;">--</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <div class="p-3 bg-light rounded-4">
                                        <div class="d-flex align-items-center gap-3">
                                            <div class="fs-4 text-emerald"><i class="bi bi-heart-pulse"></i></div>
                                            <div class="small text-muted" id="whr-note">
                                                Enter your measurements to see health risk interpretation.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.WHR.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-emerald rounded-pill px-3" onclick="Companion.UI.Tools.WHR.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-3 rounded-4 bg-soft-secondary x-small text-muted shadow-sm border-0">
                            <i class="bi bi-info-circle-fill me-1 text-emerald"></i> 
                            A higher waist-to-hip ratio indicates more abdominal fat, which is linked to increased risks for cardiovascular disease and type 2 diabetes.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-emerald { background: linear-gradient(135deg, #10b981, #059669) !important; }
            .text-emerald { color: #10b981 !important; }
            .btn-emerald { background-color: #10b981 !important; border-color: #10b981 !important; }
            .btn-outline-emerald { color: #059669; border-color: #059669; }
            .btn-outline-emerald:hover, .btn-check:checked + .btn-outline-emerald { background-color: #059669; color: white; border-color: #059669; }
            .text-gradient-emerald {
                background: linear-gradient(135deg, #10b981, #059669);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .bg-soft-emerald { background-color: rgba(16, 185, 129, 0.1) !important; }
            .btn-soft-emerald { background-color: rgba(16, 185, 129, 0.1) !important; color: #10b981 !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-whr-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-whr-modal'));
            modal.show();
        },

        calculate: function () {
            const waist = parseFloat($('#whr-waist').val());
            const hip = parseFloat($('#whr-hip').val());
            const gender = $('input[name="whr-gender"]:checked').val();

            if (!waist || !hip) {
                if (!waist) $('#whr-waist').addClass('is-invalid');
                if (!hip) $('#whr-hip').addClass('is-invalid');
                return;
            }
            $('.calculator-inputs input').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ waist, hip, gender }));

            const ratio = (waist / hip).toFixed(2);
            $('#whr-value-display').text(ratio);

            let status = "";
            let badgeClass = "";
            let note = "";

            if (gender === 'female') {
                if (ratio <= 0.80) {
                    status = "Low Risk";
                    badgeClass = "bg-success";
                    note = "Your ratio indicates a healthy distribution of body fat.";
                } else if (ratio <= 0.85) {
                    status = "Moderate Risk";
                    badgeClass = "bg-warning text-dark";
                    note = "Your ratio indicates a moderate amount of abdominal fat.";
                } else {
                    status = "High Risk";
                    badgeClass = "bg-danger";
                    note = "A ratio above 0.85 in women indicates a higher risk for health issues like diabetes and heart disease.";
                }
            } else {
                if (ratio <= 0.95) {
                    status = "Low Risk";
                    badgeClass = "bg-success";
                    note = "Your ratio indicates a healthy distribution of body fat.";
                } else if (ratio <= 1.0) {
                    status = "Moderate Risk";
                    badgeClass = "bg-warning text-dark";
                    note = "Your ratio indicates a moderate amount of abdominal fat.";
                } else {
                    status = "High Risk";
                    badgeClass = "bg-danger";
                    note = "A ratio above 1.0 in men indicates a higher risk for health issues like diabetes and heart disease.";
                }
            }

            $('#whr-status-badge').text(status).removeClass().addClass(`badge rounded-pill px-4 py-2 fw-bold mt-2 ${badgeClass}`);
            $('#whr-note').text(note);

            $('#whr-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#whr-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#whr-waist, #whr-hip').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const val = $('#whr-value-display').text();
            const status = $('#whr-status-badge').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My WHR Results',
                    text: `I just checked my Waist-to-Hip Ratio on PregCal. My ratio is ${val} (${status}). Tracking my metabolic health!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#whr-waist').val(data.waist);
                $('#whr-hip').val(data.hip);
                if (data.gender) {
                    $(`#whr-${data.gender}`).prop('checked', true);
                }
            }
        }
    };
})(jQuery);
