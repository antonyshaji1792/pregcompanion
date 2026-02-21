/**
 * tool-hydration.js - Daily Water Intake & Hydration Calculator
 * Namespace: Companion.UI.Tools.Hydration
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.Hydration = (function ($) {
    const STORAGE_KEY = 'tool_hydration_data';

    const modalHtml = `
        <div class="modal fade" id="tool-hydration-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-blue text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-droplet-half me-2"></i>Hydration Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Estimate your daily water requirements based on your body weight, activity levels, and local climate.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="p-4 bg-white rounded-4 shadow-sm mb-4">
                                <div class="mb-3">
                                    <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Current Weight</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill py-2" id="hydration-weight" placeholder="e.g. 65">
                                        <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">kg</span>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Daily Activity</label>
                                    <select class="form-select border-0 bg-light rounded-pill" id="hydration-activity">
                                        <option value="0" selected>Sedentary (Low movement)</option>
                                        <option value="350">Moderate (30-60 mins exercise)</option>
                                        <option value="700">Active (60-90 mins exercise)</option>
                                        <option value="1000">Athlete (Hard training session)</option>
                                    </select>
                                </div>

                                <div class="mb-0">
                                    <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Climate Condition</label>
                                    <select class="form-select border-0 bg-light rounded-pill" id="hydration-climate">
                                        <option value="0" selected>Moderate (Room Temp)</option>
                                        <option value="400">Hot / Dry (Sun exposure)</option>
                                        <option value="600">Hot & Humid (Sweaty)</option>
                                        <option value="-200">Cold (Winter)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button class="btn btn-blue w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button" onclick="Companion.UI.Tools.Hydration.calculate()">
                                Calculate Intake
                            </button>
                        </div>

                        <div id="hydration-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Recommended Daily Intake</div>
                                    <h1 class="display-3 fw-bold text-blue mb-0 text-gradient-blue" id="hydration-value-display">0.0</h1>
                                    <div class="text-muted small fw-bold mt-1">Liters / day</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <div class="row g-2 text-center">
                                        <div class="col-6">
                                            <div class="p-2 rounded-3 bg-light">
                                                <div class="fw-bold text-dark h5 mb-0" id="hydration-glasses">0</div>
                                                <div class="x-small text-muted">250ml Glasses</div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="p-2 rounded-3 bg-light">
                                                <div class="fw-bold text-dark h5 mb-0" id="hydration-bottles">0</div>
                                                <div class="x-small text-muted">500ml Bottles</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.Hydration.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-blue rounded-pill px-3" onclick="Companion.UI.Tools.Hydration.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-3 rounded-4 bg-soft-blue x-small text-muted shadow-sm border-0">
                            <i class="bi bi-info-circle-fill me-1 text-blue"></i> 
                            <strong>Pregnancy Note:</strong> During pregnancy, we recommend adding an extra 300ml per day to your baseline for fetal development and amniotic fluid maintenance.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-blue { background: linear-gradient(135deg, #2196f3, #1976d2) !important; }
            .text-blue { color: #2196f3 !important; }
            .btn-blue { background-color: #2196f3 !important; border-color: #2196f3 !important; }
            .text-gradient-blue {
                background: linear-gradient(135deg, #2196f3, #1976d2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .bg-soft-blue { background-color: rgba(33, 150, 243, 0.1) !important; }
            .btn-soft-blue { background-color: rgba(33, 150, 243, 0.1) !important; color: #2196f3 !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-hydration-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-hydration-modal'));
            modal.show();
        },

        calculate: function () {
            const weight = parseFloat($('#hydration-weight').val());
            const activity = parseFloat($('#hydration-activity').val());
            const climate = parseFloat($('#hydration-climate').val());

            if (!weight) {
                $('#hydration-weight').addClass('is-invalid');
                return;
            }
            $('#hydration-weight').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ weight, activity, climate }));

            // Base: 35ml per kg
            let totalMl = weight * 35;

            // Add activity and climate adjustments
            totalMl += activity;
            totalMl += climate;

            const liters = (totalMl / 1000).toFixed(1);
            $('#hydration-value-display').text(liters);

            // Breakdown
            const glasses = Math.round(totalMl / 250);
            const bottles = Math.round(totalMl / 500);
            $('#hydration-glasses').text(glasses);
            $('#hydration-bottles').text(bottles);

            $('#hydration-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#hydration-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#hydration-weight').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const val = $('#hydration-value-display').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Daily Hydration Goal',
                    text: `My recommended daily water intake is ${val} liters. Staying hydrated with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#hydration-weight').val(data.weight);
                $('#hydration-activity').val(data.activity);
                $('#hydration-climate').val(data.climate);
            }
        }
    };
})(jQuery);
