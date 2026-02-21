/**
 * calc-weight.js - Weight Gain Estimator Module
 * Namespace: Companion.UI.Calculators.Weight
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.Weight = (function ($) {
    const STORAGE_KEY = 'calc_weight_data';

    const modalHtml = `
        <div class="modal fade" id="calc-weight-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-success text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-speedometer2 me-2"></i>Weight Gain Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <div class="col-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Height (cm)</label>
                                    <input type="number" class="form-control rounded-3 border-0 shadow-sm" id="calc-wt-height" placeholder="e.g. 165">
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Pre-Pregnancy (kg)</label>
                                    <input type="number" class="form-control rounded-3 border-0 shadow-sm" id="calc-wt-pre" step="0.1" placeholder="e.g. 60">
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Current Weight (kg)</label>
                                    <input type="number" class="form-control rounded-3 border-0 shadow-sm" id="calc-wt-current" step="0.1" placeholder="e.g. 65">
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Pregnancy Week</label>
                                    <input type="number" class="form-control rounded-3 border-0 shadow-sm" id="calc-wt-week" placeholder="1-40">
                                </div>
                            </div>
                            <button class="btn btn-success w-100 rounded-pill py-3 fw-bold shadow-lg animate-button mt-4" onclick="Companion.UI.Calculators.Weight.calculate()">
                                Calculate Weight Gain
                            </button>
                        </div>
                        
                        <div id="calc-wt-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="row g-0 mb-4 border-bottom pb-4">
                                    <div class="col-6 text-center border-end">
                                        <div class="small text-muted text-uppercase fw-bold mb-1">Pre-Pregnancy BMI</div>
                                        <h3 class="fw-bold text-success mb-1" id="calc-wt-bmi">--</h3>
                                        <div id="calc-wt-cat" class="badge rounded-pill fw-bold" style="font-size: 0.7rem;">NORMAL</div>
                                    </div>
                                    <div class="col-6 text-center">
                                        <div class="small text-muted text-uppercase fw-bold mb-1">Current Gain</div>
                                        <h3 class="fw-bold text-dark mb-1" id="calc-wt-current-gain">+0.0 kg</h3>
                                        <div class="x-small text-muted" id="calc-wt-week-label">Week --</div>
                                    </div>
                                </div>

                                <div class="mb-4 text-center">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Recommended Total Gain</div>
                                    <h4 class="fw-bold text-dark mb-3" id="calc-wt-range">--</h4>
                                    
                                    <div class="position-relative mt-2" style="height: 30px;">
                                        <div class="progress rounded-pill bg-light h-100 shadow-inner">
                                            <div id="calc-wt-progress-bar" class="progress-bar bg-gradient-success rounded-pill" role="progressbar" style="width: 0%; transition: width 1s ease;"></div>
                                        </div>
                                        <!-- Markers could go here -->
                                    </div>
                                    <div class="d-flex justify-content-between x-small text-muted mt-2 fw-bold px-1">
                                        <span>MIN RECOMMENDED</span>
                                        <span>MAX RECOMMENDED</span>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Calculators.Weight.reset()">
                                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-success rounded-pill px-3" onclick="Companion.UI.Calculators.Weight.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>

                            <!-- Health Tip -->
                            <div class="mt-4 p-3 rounded-4 bg-soft-success border-0 animate-reveal" style="--delay: 0.1s">
                                <div class="d-flex gap-3">
                                    <div class="text-success fs-4"><i class="bi bi-check2-circle"></i></div>
                                    <div>
                                        <h6 class="fw-bold small mb-1" id="calc-wt-status-title">Status: On Track</h6>
                                        <p class="x-small text-muted mb-0" id="calc-wt-status-msg">Your weight gain is within the recommended range for this week.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        init: function () {
            if ($('#calc-weight-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-weight-modal'));
            modal.show();
        },

        calculate: function () {
            const pre = parseFloat($('#calc-wt-pre').val());
            const height = parseFloat($('#calc-wt-height').val());
            const current = parseFloat($('#calc-wt-current').val());
            const week = parseInt($('#calc-wt-week').val());

            if (!pre || !height || !current || !week) {
                $('.calculator-inputs input').each(function () {
                    if (!$(this).val()) $(this).addClass('is-invalid');
                    else $(this).removeClass('is-invalid');
                });
                return;
            }
            $('.calculator-inputs input').removeClass('is-invalid');

            // Save basic settings for persistence
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ pre, height, current, week }));

            const bmi = Companion.Weight.calculateBMI(pre, height);
            const cat = Companion.Weight.getBMICategory(bmi);
            const rec = Companion.Weight.getRecommendations(cat);
            const currentGain = current - pre;

            // Check if within range for current week
            const assessment = Companion.Weight.isWithinRange(current, week);

            // Update UI
            $('#calc-wt-bmi').text(bmi);
            $('#calc-wt-cat').text(cat.toUpperCase());

            // Color mapping for BMI Category
            $('#calc-wt-cat').removeClass().addClass('badge rounded-pill fw-bold');
            if (cat === 'underweight') $('#calc-wt-cat').addClass('bg-soft-warning text-warning');
            else if (cat === 'normal') $('#calc-wt-cat').addClass('bg-soft-success text-success');
            else $('#calc-wt-cat').addClass('bg-soft-danger text-danger');

            $('#calc-wt-current-gain').text(`${currentGain > 0 ? '+' : ''}${currentGain.toFixed(1)} kg`);
            $('#calc-wt-week-label').text(`Week ${week}`);
            $('#calc-wt-range').text(`${rec.min} - ${rec.max} kg`);

            // Progress Bar Logic: Current Gain vs Max Recommended
            // Let's cap the progress bar at the max recommended gain
            let progress = (currentGain / rec.max) * 100;
            if (progress < 0) progress = 0;
            if (progress > 100) progress = 100;

            $('#calc-wt-progress-bar').css('width', '0%');

            // Status Assessment
            if (assessment.isHigh) {
                $('#calc-wt-status-title').text('Status: Above Range');
                $('#calc-wt-status-msg').text(`Your gain is slightly above the recommended ${assessment.expectedMax}kg for week ${week}.`);
                $('#calc-wt-status-title').parent().parent().removeClass('bg-soft-success').addClass('bg-soft-danger');
            } else if (assessment.isLow) {
                $('#calc-wt-status-title').text('Status: Below Range');
                $('#calc-wt-status-msg').text(`Your gain is below the recommended ${assessment.expectedMin}kg for week ${week}.`);
                $('#calc-wt-status-title').parent().parent().removeClass('bg-soft-success').addClass('bg-soft-warning');
            } else {
                $('#calc-wt-status-title').text('Status: On Track');
                $('#calc-wt-status-msg').text('Your weight gain is within the healthy recommended range for this week.');
                $('#calc-wt-status-title').parent().parent().removeClass('bg-soft-danger bg-soft-warning').addClass('bg-soft-success');
            }

            // Animate reveal
            $('#calc-wt-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');

            setTimeout(() => {
                $('#calc-wt-progress-bar').css('width', progress + '%');
            }, 300);
        },

        reset: function () {
            $('#calc-wt-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('.calculator-inputs input').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const gain = $('#calc-wt-current-gain').text();
            const week = $('#calc-wt-week-label').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Pregnancy Weight Gain',
                    text: `Checking my weight gain with PregCal! I'm at ${week} and gained ${gain}.`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#calc-wt-pre').val(data.pre);
                $('#calc-wt-height').val(data.height);
                $('#calc-wt-current').val(data.current);
                $('#calc-wt-week').val(data.week);
            }
        }
    };
})(jQuery);

