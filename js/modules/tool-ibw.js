/**
 * tool-ibw.js - Ideal Body Weight (IBW) Calculator using Devine Formula
 * Namespace: Companion.UI.Tools.IBW
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.IBW = (function ($) {
    const STORAGE_KEY = 'tool_ibw_data';

    const modalHtml = `
        <div class="modal fade" id="tool-ibw-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-indigo text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-person-check me-2"></i>Ideal Weight Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Estimate your Ideal Body Weight (IBW) based on your height and gender using the Devine formula.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block text-center">Gender</label>
                                        <div class="d-flex gap-2">
                                            <input type="radio" class="btn-check" name="ibw-gender" id="ibw-female" value="female" checked>
                                            <label class="btn btn-outline-indigo flex-grow-1 rounded-pill small fw-bold" for="ibw-female">Female</label>
                                            <input type="radio" class="btn-check" name="ibw-gender" id="ibw-male" value="male">
                                            <label class="btn btn-outline-indigo flex-grow-1 rounded-pill small fw-bold" for="ibw-male">Male</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Height</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill" id="ibw-height" placeholder="e.g. 165">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">cm</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-indigo text-white w-100 rounded-pill py-3 fw-bold shadow-lg animate-button mt-4" onclick="Companion.UI.Tools.IBW.calculate()">
                                Calculate Ideal Weight
                            </button>
                        </div>

                        <div id="ibw-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Your Ideal Weight is</div>
                                    <h1 class="display-3 fw-bold text-indigo mb-0 text-gradient-indigo" id="ibw-value-display">0</h1>
                                    <div class="text-muted small fw-bold mt-1">Kilograms (kg)</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <div class="p-3 bg-soft-indigo rounded-4">
                                        <div class="d-flex align-items-center gap-3">
                                            <div class="fs-4 text-indigo"><i class="bi bi-info-circle"></i></div>
                                            <div class="x-small text-muted">
                                                The Devine formula is a common clinical tool used to determine lean body mass for medication dosing and nutritional goals.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.IBW.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-indigo rounded-pill px-3" onclick="Companion.UI.Tools.IBW.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-indigo { background: linear-gradient(135deg, #3f51b5, #5c6bc0) !important; }
            .text-indigo { color: #3f51b5 !important; }
            .btn-indigo { background-color: #3f51b5 !important; border-color: #3f51b5 !important; }
            .btn-outline-indigo { color: #3f51b5; border-color: #3f51b5; }
            .btn-outline-indigo:hover, .btn-check:checked + .btn-outline-indigo { background-color: #3f51b5; color: white; border-color: #3f51b5; }
            .text-gradient-indigo {
                background: linear-gradient(135deg, #3f51b5, #5c6bc0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .bg-soft-indigo { background-color: rgba(63, 81, 181, 0.1) !important; }
            .btn-soft-indigo { background-color: rgba(63, 81, 181, 0.1) !important; color: #3f51b5 !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-ibw-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-ibw-modal'));
            modal.show();
        },

        calculate: function () {
            const hCm = parseFloat($('#ibw-height').val());
            const gender = $('input[name="ibw-gender"]:checked').val();

            if (!hCm) {
                $('#ibw-height').addClass('is-invalid');
                return;
            }
            $('#ibw-height').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ hCm, gender }));

            // Convert cm to inches
            const hInches = hCm / 2.54;
            const inchesOver5Feet = hInches - 60;

            let ibw = 0;
            if (gender === 'male') {
                ibw = 50 + (2.3 * Math.max(0, inchesOver5Feet));
            } else {
                ibw = 45.5 + (2.3 * Math.max(0, inchesOver5Feet));
            }

            // Handle height less than 5 feet (formula technically for > 5ft, but we cap at baseline)
            if (inchesOver5Feet < 0) {
                // Some variants subtract, some cap. We use the baseline for < 5ft.
                ibw = (gender === 'male' ? 50 : 45.5);
            }

            const finalIbw = ibw.toFixed(1);
            $('#ibw-value-display').text(finalIbw);

            $('#ibw-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#ibw-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#ibw-height').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const val = $('#ibw-value-display').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Ideal Body Weight',
                    text: `My ideal weight is calculated as ${val} kg using the Devine formula. Checking my health goals with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#ibw-height').val(data.hCm);
                if (data.gender) {
                    $(`#ibw-${data.gender}`).prop('checked', true);
                }
            }
        }
    };
})(jQuery);
