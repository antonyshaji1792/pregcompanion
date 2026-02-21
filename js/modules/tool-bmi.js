/**
 * tool-bmi.js - General Body Mass Index (BMI) Calculator
 * Namespace: Companion.UI.Tools.BMI
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.BMI = (function ($) {
    const STORAGE_KEY = 'tool_bmi_data';

    const modalHtml = `
        <div class="modal fade" id="tool-bmi-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-mint text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-activity me-2"></i>BMI Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4">Calculate your body mass index to assess healthy weight ranges.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Height</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill" id="bmi-height" placeholder="cm">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">cm</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Weight</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill" id="bmi-weight" placeholder="kg">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">kg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-mint w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button mt-4" onclick="Companion.UI.Tools.BMI.calculate()">
                                Calculate My BMI
                            </button>
                        </div>

                        <div id="bmi-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center mb-4">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Your BMI is</div>
                                    <h1 class="display-3 fw-bold text-mint mb-0 text-gradient-mint" id="bmi-value-display">0.0</h1>
                                    <div id="bmi-category-badge" class="badge rounded-pill px-4 py-2 fw-bold mt-2" style="font-size: 0.85rem;">--</div>
                                </div>

                                <div class="p-3 bg-light rounded-4 mb-4">
                                    <div class="d-flex justify-content-between x-small text-muted fw-bold mb-2">
                                        <span>Underweight</span>
                                        <span>Normal</span>
                                        <span>Overweight</span>
                                        <span>Obese</span>
                                    </div>
                                    <div class="progress rounded-pill bg-white" style="height: 12px; padding: 2px;">
                                        <div id="bmi-gauge" class="progress-bar rounded-pill" role="progressbar" style="width: 0%; transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);"></div>
                                    </div>
                                    <div class="d-flex justify-content-between x-small text-muted mt-2">
                                        <span>< 18.5</span>
                                        <span>18.5 - 24.9</span>
                                        <span>25 - 29.9</span>
                                        <span>30+</span>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.BMI.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-mint rounded-pill px-3" onclick="Companion.UI.Tools.BMI.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-3 rounded-4 bg-soft-secondary x-small text-muted">
                            <i class="bi bi-info-circle me-1"></i> Body Mass Index (BMI) is a simple index of weight-for-height that is commonly used to classify underweight, overweight and obesity.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-mint { background: linear-gradient(135deg, #26a69a, #4db6ac) !important; }
            .text-mint { color: #26a69a !important; }
            .btn-mint { background-color: #26a69a !important; border-color: #26a69a !important; }
            .text-gradient-mint {
                background: linear-gradient(135deg, #26a69a, #4db6ac);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .bg-soft-mint { background-color: rgba(38, 166, 154, 0.1) !important; }
            .btn-soft-mint { background-color: rgba(38, 166, 154, 0.1) !important; color: #26a69a !important; }
            .progress-bar.bg-underweight { background-color: #ffca28 !important; }
            .progress-bar.bg-normal { background-color: #66bb6a !important; }
            .progress-bar.bg-overweight { background-color: #ffa726 !important; }
            .progress-bar.bg-obese { background-color: #ef5350 !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-bmi-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-bmi-modal'));
            modal.show();
        },

        calculate: function () {
            const h = parseFloat($('#bmi-height').val());
            const w = parseFloat($('#bmi-weight').val());

            if (!h || !w) {
                if (!h) $('#bmi-height').addClass('is-invalid');
                if (!w) $('#bmi-weight').addClass('is-invalid');
                return;
            }
            $('.calculator-inputs input').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ h, w }));

            const bmi = (w / ((h / 100) ** 2)).toFixed(1);
            $('#bmi-value-display').text(bmi);

            let category = "";
            let badgeClass = "";
            let barClass = "";
            let percentage = 0;

            if (bmi < 18.5) {
                category = "Underweight";
                badgeClass = "bg-warning text-dark";
                barClass = "bg-underweight";
                percentage = (bmi / 18.5) * 25;
            } else if (bmi < 25) {
                category = "Healthy Weight";
                badgeClass = "bg-success";
                barClass = "bg-normal";
                percentage = 25 + ((bmi - 18.5) / 6.5) * 25;
            } else if (bmi < 30) {
                category = "Overweight";
                badgeClass = "bg-warning text-dark";
                barClass = "bg-overweight";
                percentage = 50 + ((bmi - 25) / 5) * 25;
            } else {
                category = "Obese";
                badgeClass = "bg-danger";
                barClass = "bg-obese";
                percentage = 75 + Math.min(((bmi - 30) / 10) * 25, 25);
            }

            $('#bmi-category-badge').text(category).removeClass().addClass(`badge rounded-pill px-4 py-2 fw-bold mt-2 ${badgeClass}`);
            $('#bmi-gauge').removeClass('bg-underweight bg-normal bg-overweight bg-obese').addClass(barClass);

            $('#bmi-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');

            setTimeout(() => {
                $('#bmi-gauge').css('width', percentage + '%');
            }, 300);
        },

        reset: function () {
            $('#bmi-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#bmi-height, #bmi-weight').val('');
                $('#bmi-gauge').css('width', '0%');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const val = $('#bmi-value-display').text();
            const cat = $('#bmi-category-badge').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My BMI Profile',
                    text: `I just checked my BMI on PregCal. My BMI is ${val} (${cat}). Tracking my health goals!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#bmi-height').val(data.h);
                $('#bmi-weight').val(data.w);
            }
        }
    };
})(jQuery);
