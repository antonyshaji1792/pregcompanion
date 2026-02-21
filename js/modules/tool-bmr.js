/**
 * tool-bmr.js - Basal Metabolic Rate (BMR) Calculator using Mifflin-St Jeor
 * Namespace: Companion.UI.Tools.BMR
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.BMR = (function ($) {
    const STORAGE_KEY = 'tool_bmr_data';

    const modalHtml = `
        <div class="modal fade" id="tool-bmr-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-orange text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-fire me-2"></i>BMR Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Estimate your Basal Metabolic Rate (BMR) — the calories your body burns at rest.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block text-center">Gender</label>
                                        <div class="d-flex gap-2">
                                            <input type="radio" class="btn-check" name="bmr-gender" id="bmr-female" value="female" checked>
                                            <label class="btn btn-outline-orange flex-grow-1 rounded-pill small fw-bold" for="bmr-female">Female</label>
                                            <input type="radio" class="btn-check" name="bmr-gender" id="bmr-male" value="male">
                                            <label class="btn btn-outline-orange flex-grow-1 rounded-pill small fw-bold" for="bmr-male">Male</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100 text-center">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Age</label>
                                        <input type="number" class="form-control text-center border-0 bg-light rounded-pill" id="bmr-age" placeholder="Years">
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Height</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill" id="bmr-height" placeholder="cm">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">cm</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Weight</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill" id="bmr-weight" placeholder="kg">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">kg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-orange w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button mt-4" onclick="Companion.UI.Tools.BMR.calculate()">
                                Calculate BMR
                            </button>
                        </div>

                        <div id="bmr-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center mb-0">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Your Daily BMR is</div>
                                    <h1 class="display-3 fw-bold text-orange mb-0 text-gradient-orange" id="bmr-value-display">0</h1>
                                    <div class="text-muted small fw-bold mt-1">Calories / Day</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <h6 class="fw-bold x-small text-muted text-uppercase mb-3">Calories by Activity Level</h6>
                                    <div class="vstack gap-2" id="bmr-activity-list">
                                        <!-- Activity levels (TDEE) injected here -->
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.BMR.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-orange rounded-pill px-3" onclick="Companion.UI.Tools.BMR.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-3 rounded-4 bg-soft-secondary x-small text-muted">
                            <i class="bi bi-info-circle me-1"></i> BMR is calculated using the <strong>Mifflin-St Jeor Formula</strong>. This represents the energy required for vital organs to function at rest.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-orange { background: linear-gradient(135deg, #ff9800, #f57c00) !important; }
            .text-orange { color: #ff9800 !important; }
            .btn-orange { background-color: #ff9800 !important; border-color: #ff9800 !important; }
            .btn-outline-orange { color: #f57c00; border-color: #f57c00; }
            .btn-outline-orange:hover, .btn-check:checked + .btn-outline-orange { background-color: #f57c00; color: white; border-color: #f57c00; }
            .text-gradient-orange {
                background: linear-gradient(135deg, #ff9800, #f57c00);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .bg-soft-orange { background-color: rgba(255, 152, 0, 0.1) !important; }
            .btn-soft-orange { background-color: rgba(255, 152, 0, 0.1) !important; color: #ff9800 !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-bmr-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-bmr-modal'));
            modal.show();
        },

        calculate: function () {
            const age = parseInt($('#bmr-age').val());
            const gender = $('input[name="bmr-gender"]:checked').val();
            const h = parseFloat($('#bmr-height').val());
            const w = parseFloat($('#bmr-weight').val());

            if (!age || !h || !w) {
                if (!age) $('#bmr-age').addClass('is-invalid');
                if (!h) $('#bmr-height').addClass('is-invalid');
                if (!w) $('#bmr-weight').addClass('is-invalid');
                return;
            }
            $('.calculator-inputs input').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ age, h, w, gender }));

            // Mifflin-St Jeor
            // BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + s
            // s = +5 for males and -161 for females
            let bmr = (10 * w) + (6.25 * h) - (5 * age);
            bmr += (gender === 'male' ? 5 : -161);

            const finalBmr = Math.round(bmr);
            $('#bmr-value-display').text(finalBmr);

            // Generate TDEE (Total Daily Energy Expenditure) List
            const activityLevels = [
                { label: 'Sedentary (Office job)', mult: 1.2 },
                { label: 'Light Exercise (1-3 days/wk)', mult: 1.375 },
                { label: 'Moderate (3-5 days/wk)', mult: 1.55 },
                { label: 'Active (6-7 days/wk)', mult: 1.725 },
                { label: 'Very Active (Hard labor/Training)', mult: 1.9 }
            ];

            const $list = $('#bmr-activity-list');
            $list.empty();
            activityLevels.forEach(level => {
                const cals = Math.round(finalBmr * level.mult);
                $list.append(`
                    <div class="d-flex justify-content-between align-items-center p-2 border-bottom border-light">
                        <span class="x-small text-muted">${level.label}</span>
                        <span class="small fw-bold text-dark">${cals} kcal</span>
                    </div>
                `);
            });

            $('#bmr-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#bmr-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#bmr-age, #bmr-height, #bmr-weight').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const val = $('#bmr-value-display').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My BMR Profile',
                    text: `My daily Basal Metabolic Rate is ${val} calories. Tracking my energy needs with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#bmr-age').val(data.age);
                $('#bmr-height').val(data.h);
                $('#bmr-weight').val(data.w);
                if (data.gender) {
                    $(`#bmr-${data.gender}`).prop('checked', true);
                }
            }
        }
    };
})(jQuery);
