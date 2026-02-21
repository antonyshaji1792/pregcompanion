/**
 * tool-calorie-goal.js - Calorie Goal & Weight Management Calculator
 * Namespace: Companion.UI.Tools.CalorieGoal
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.CalorieGoal = (function ($) {
    const STORAGE_KEY = 'tool_calorie_goal_data';

    const modalHtml = `
        <div class="modal fade" id="tool-calorie-goal-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-teal text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-bullseye me-2"></i>Calorie Goal Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Set your daily calorie target based on your current weight, activity level, and fitness goals.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <!-- Biometrics Section -->
                                <div class="col-md-3 col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Weight</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill py-2" id="goal-weight" placeholder="kg">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">kg</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Height</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill py-2" id="goal-height" placeholder="cm">
                                            <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">cm</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Age</label>
                                        <input type="number" class="form-control text-center border-0 bg-light rounded-pill py-2" id="goal-age" placeholder="Age">
                                    </div>
                                </div>
                                <div class="col-md-3 col-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm text-center h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Gender</label>
                                        <select class="form-select border-0 bg-light rounded-pill py-2" id="goal-gender">
                                            <option value="female">Female</option>
                                            <option value="male">Male</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Activity & Goal Section -->
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Activity Level</label>
                                        <select class="form-select border-0 bg-light rounded-pill" id="goal-activity">
                                            <option value="1.2">Sedentary (No exercise)</option>
                                            <option value="1.375">Light (1-3 days/wk)</option>
                                            <option value="1.55">Moderate (3-5 days/wk)</option>
                                            <option value="1.725">Active (6-7 days/wk)</option>
                                            <option value="1.9">Extra Active (Hard labor)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Your Goal</label>
                                        <select class="form-select border-0 bg-light rounded-pill" id="goal-plan">
                                            <option value="-500">Lose Weight (0.5kg/week)</option>
                                            <option value="0" selected>Maintain Weight</option>
                                            <option value="500">Gain Weight (0.5kg/week)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn btn-teal w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button mt-4" onclick="Companion.UI.Tools.CalorieGoal.calculate()">
                                Set My Calorie Target
                            </button>
                        </div>

                        <div id="goal-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="row g-4 align-items-center mb-4">
                                    <div class="col-md-7 text-center text-md-start border-md-end">
                                        <div class="small text-muted text-uppercase fw-bold mb-1">Target Daily Intake</div>
                                        <h1 class="display-3 fw-bold text-teal mb-0 text-gradient-teal" id="goal-target-display">0</h1>
                                        <div class="text-muted small fw-bold mt-1">Calories / Day</div>
                                    </div>
                                    <div class="col-md-5 text-center">
                                        <div class="small text-muted text-uppercase fw-bold mb-2">Estimated Change</div>
                                        <div class="p-3 rounded-4 bg-soft-teal">
                                            <h4 class="fw-bold text-teal mb-1" id="goal-weekly-change">0 kg</h4>
                                            <div class="x-small text-muted fw-bold">Per Week</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="p-3 bg-light rounded-4 mb-4">
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="fs-4 text-teal"><i class="bi bi-info-circle-fill"></i></div>
                                        <div class="small text-muted">
                                            Based on your data, your Maintenance TDEE is <strong id="goal-maintenance-text">--</strong> kcal. To reach your goal, we adjusted it by <strong id="goal-adjustment-text">0</strong> kcal.
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.CalorieGoal.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-teal rounded-pill px-3" onclick="Companion.UI.Tools.CalorieGoal.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-3 rounded-4 bg-soft-secondary x-small text-muted shadow-sm border-0">
                            <i class="bi bi-shield-check-fill me-1 text-teal"></i> 
                            <strong>Balanced Approach:</strong> For the most sustainable results, combine this calorie target with balanced nutrition and regular physical activity. Consult a dietitian for a personalized meal plan.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-teal { background: linear-gradient(135deg, #00bfa5, #0097a7) !important; }
            .text-teal { color: #009688 !important; }
            .btn-teal { background-color: #009688 !important; border-color: #009688 !important; }
            .text-gradient-teal {
                background: linear-gradient(135deg, #00bfa5, #0097a7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .bg-soft-teal { background-color: rgba(0, 150, 136, 0.1) !important; }
            .btn-soft-teal { background-color: rgba(0, 150, 136, 0.1) !important; color: #009688 !important; }
            @media (min-width: 768px) {
                .border-md-end { border-right: 1px solid #dee2e6 !important; }
            }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-calorie-goal-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-calorie-goal-modal'));
            modal.show();
        },

        calculate: function () {
            const w = parseFloat($('#goal-weight').val());
            const h = parseFloat($('#goal-height').val());
            const age = parseInt($('#goal-age').val());
            const gender = $('#goal-gender').val();
            const activity = parseFloat($('#goal-activity').val());
            const adjustment = parseInt($('#goal-plan').val());

            if (!w || !h || !age) {
                $('.calculator-inputs input').each(function () {
                    if (!$(this).val()) $(this).addClass('is-invalid');
                    else $(this).removeClass('is-invalid');
                });
                return;
            }
            $('.calculator-inputs input').removeClass('is-invalid');

            // Save for later
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ w, h, age, gender, activity, adjustment }));

            // 1. Calculate BMR (Mifflin)
            let bmr = (10 * w) + (6.25 * h) - (5 * age);
            bmr += (gender === 'male' ? 5 : -161);

            // 2. Calculate TDEE
            const tdee = Math.round(bmr * activity);

            // 3. Apply Adjustment
            const target = Math.round(tdee + adjustment);

            // 4. Weekly Weight Change Estimate
            // 500 kcal/day = 0.5kg/week roughly
            let weeklyChange = 0;
            if (adjustment < 0) weeklyChange = -0.5;
            else if (adjustment > 0) weeklyChange = 0.5;

            // UI Update
            $('#goal-target-display').text(target);
            $('#goal-weekly-change').text(`${weeklyChange > 0 ? '+' : ''}${weeklyChange} kg`);
            $('#goal-maintenance-text').text(tdee);
            $('#goal-adjustment-text').text(Math.abs(adjustment));

            $('#goal-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#goal-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('.calculator-inputs input').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const target = $('#goal-target-display').text();
            const change = $('#goal-weekly-change').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Calorie & Goal Target',
                    text: `My target daily intake is ${target} calories to achieve a ${change} weekly change. Planning my fitness journey with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#goal-weight').val(data.w);
                $('#goal-height').val(data.h);
                $('#goal-age').val(data.age);
                $('#goal-gender').val(data.gender);
                $('#goal-activity').val(data.activity);
                $('#goal-plan').val(data.adjustment);
            }
        }
    };
})(jQuery);
