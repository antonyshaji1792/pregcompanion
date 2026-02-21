/**
 * tool-tdee.js - Total Daily Energy Expenditure (TDEE) Calculator
 * Namespace: Companion.UI.Tools.TDEE
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.TDEE = (function ($) {
    const STORAGE_KEY = 'tool_tdee_data';

    const modalHtml = `
        <div class="modal fade" id="tool-tdee-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-sunset text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-lightning-charge me-2"></i>TDEE Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Determine your total daily energy expenditure based on your BMR and activity level.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="p-4 bg-white rounded-4 shadow-sm mb-4">
                                <div class="mb-4">
                                    <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Your BMR</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill py-2" id="tdee-bmr" placeholder="Enter BMR">
                                        <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">kcal</span>
                                    </div>
                                    <div class="x-small text-muted mt-2 text-center">Don't know your BMR? Use our <a href="#" onclick="Companion.UI.Tools.BMR.open(); return false;" class="text-sunset fw-bold text-decoration-none">BMR Tool</a></div>
                                </div>
                                
                                <div class="mb-0">
                                    <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Physical Activity Level</label>
                                    <select class="form-select border-0 bg-light rounded-pill" id="tdee-activity">
                                        <option value="1.2">Sedentary (Little or no exercise)</option>
                                        <option value="1.375">Lightly Active (Exercise 1-3 days/week)</option>
                                        <option value="1.55">Moderately Active (Exercise 3-5 days/week)</option>
                                        <option value="1.725">Very Active (Hard exercise 6-7 days/week)</option>
                                        <option value="1.9">Extra Active (Very hard exercise & physical job)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button class="btn btn-sunset w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button" onclick="Companion.UI.Tools.TDEE.calculate()">
                                Calculate TDEE
                            </button>
                        </div>

                        <div id="tdee-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Your Daily TDEE is</div>
                                    <h1 class="display-3 fw-bold text-sunset mb-0 text-gradient-sunset" id="tdee-value-display">0</h1>
                                    <div class="text-muted small fw-bold mt-1">Maintenance Calories / Day</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <div class="p-3 bg-soft-sunset rounded-4">
                                        <div class="d-flex align-items-center gap-3">
                                            <div class="fs-4 text-sunset"><i class="bi bi-info-circle"></i></div>
                                            <div class="x-small text-muted">
                                                This value represents the number of calories you burn per day. Consuming this amount will maintain your current weight.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.TDEE.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-sunset rounded-pill px-3" onclick="Companion.UI.Tools.TDEE.share()">
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
            .bg-gradient-sunset { background: linear-gradient(135deg, #ff5722, #ff9800) !important; }
            .text-sunset { color: #ff5722 !important; }
            .btn-sunset { background-color: #ff5722 !important; border-color: #ff5722 !important; }
            .text-gradient-sunset {
                background: linear-gradient(135deg, #ff5722, #ff9800);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .bg-soft-sunset { background-color: rgba(255, 87, 34, 0.1) !important; }
            .btn-soft-sunset { background-color: rgba(255, 87, 34, 0.1) !important; color: #ff5722 !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-tdee-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-tdee-modal'));
            modal.show();
        },

        calculate: function () {
            const bmr = parseFloat($('#tdee-bmr').val());
            const activity = parseFloat($('#tdee-activity').val());

            if (!bmr) {
                $('#tdee-bmr').addClass('is-invalid');
                return;
            }
            $('#tdee-bmr').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ bmr, activity }));

            const tdee = Math.round(bmr * activity);
            $('#tdee-value-display').text(tdee);

            $('#tdee-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#tdee-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#tdee-bmr').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const val = $('#tdee-value-display').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My TDEE Profile',
                    text: `My Total Daily Energy Expenditure is ${val} calories. Tracking my lifestyle needs with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#tdee-bmr').val(data.bmr);
                $('#tdee-activity').val(data.activity);
            }
        }
    };
})(jQuery);
