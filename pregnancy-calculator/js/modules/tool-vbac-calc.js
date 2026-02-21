/**
 * tool-vbac-calc.js - VBAC (Vaginal Birth After Cesarean) Success Calculator
 * Namespace: Companion.UI.Tools.VBACCalc
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.VBACCalc = (function ($) {
    const modalHtml = `
        <div class="modal fade" id="tool-vbac-calc-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-navy text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-shield-check me-2"></i>VBAC Success Predictor</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Estimate the probability of a successful Vaginal Birth After Cesarean (VBAC) based on clinical factors.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <!-- Age -->
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Maternal Age</label>
                                        <select class="form-select border-0 bg-light" id="vbac-age">
                                            <option value="1">Under 35</option>
                                            <option value="0.8">35 - 39</option>
                                            <option value="0.6">40 or older</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- BMI -->
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Current BMI</label>
                                        <select class="form-select border-0 bg-light" id="vbac-bmi">
                                            <option value="1">Less than 30</option>
                                            <option value="0.7">30 - 40</option>
                                            <option value="0.4">Over 40</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- Prior Vaginal Birth -->
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Prior Vaginal Delivery?</label>
                                        <select class="form-select border-0 bg-light" id="vbac-prior-vag">
                                            <option value="0">None</option>
                                            <option value="1.5">Yes, before C-section</option>
                                            <option value="2.5">Yes, after C-section (VBAC)</option>
                                            <option value="3.0">Yes, both before & after</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- Prior C-Section Reason -->
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Reason for Prior C-Section</label>
                                        <select class="form-select border-0 bg-light" id="vbac-reason">
                                            <option value="1">Non-recurring (Breech, Twins)</option>
                                            <option value="0.8">Fetal Distress</option>
                                            <option value="0.5">Failure to Progress / Dystocia</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn btn-navy w-100 rounded-pill py-3 fw-bold shadow-lg animate-button mt-4 text-white" onclick="Companion.UI.Tools.VBACCalc.calculate()">
                                Calculate Probability
                            </button>
                        </div>
                        
                        <div id="vbac-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm mb-4 animate-reveal">
                                <div class="text-center">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Estimated Success Probability</div>
                                    <div class="display-3 fw-bold text-navy mb-1"><span id="vbac-percentage">0</span>%</div>
                                    <div id="vbac-label" class="badge px-4 py-2 rounded-pill fw-bold mb-3">--</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span class="small text-muted fw-bold">PROBABILITY SCORE</span>
                                        <span class="x-small text-muted" id="vbac-score-text">Model Calculation</span>
                                    </div>
                                    <div class="progress rounded-pill bg-light" style="height: 12px;">
                                        <div id="vbac-progress" class="progress-bar bg-navy rounded-pill" style="width: 0%"></div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.VBACCalc.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-navy rounded-pill px-3" onclick="Companion.UI.Tools.VBACCalc.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Medical Disclaimer -->
                        <div class="mt-4 p-3 rounded-3 bg-soft-secondary x-small text-muted line-height-sm shadow-sm border-0">
                            <i class="bi bi-exclamation-octagon-fill me-1 text-navy"></i> 
                            <strong>Clinical Notice:</strong> This predictor is based on statistical models. A high probability does not guarantee success, nor does a low probability mean failure. The decision to attempt a Trial of Labor After Cesarean (TOLAC) must be made in consultation with your obstetrician, considering factors like scar type and hospital facilities.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-navy { background: linear-gradient(135deg, #1a237e, #3949ab) !important; }
            .text-navy { color: #1a237e !important; }
            .btn-navy { background-color: #1a237e !important; border-color: #1a237e !important; }
            .bg-soft-navy { background-color: rgba(26, 35, 126, 0.1) !important; }
            .btn-soft-navy { background-color: rgba(26, 35, 126, 0.1) !important; color: #1a237e !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-vbac-calc-modal').length === 0) {
                $('body').append(modalHtml);
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-vbac-calc-modal'));
            modal.show();
        },

        calculate: function () {
            const ageFactor = parseFloat($('#vbac-age').val());
            const bmiFactor = parseFloat($('#vbac-bmi').val());
            const priorVagFactor = parseFloat($('#vbac-prior-vag').val());
            const reasonFactor = parseFloat($('#vbac-reason').val());

            // Base probability around 60%
            let score = 60;

            // Adjust based on factors
            score *= ageFactor;
            score *= bmiFactor;
            score *= reasonFactor;

            // Bonus for prior vaginal deliveries (very strong predictor)
            if (priorVagFactor > 0) {
                score += (priorVagFactor * 10);
            }

            // Cap at 95% and floor at 10%
            let finalPercentage = Math.min(Math.round(score), 95);
            finalPercentage = Math.max(finalPercentage, 10);

            $('#vbac-percentage').text(finalPercentage);
            $('#vbac-progress').css('width', finalPercentage + '%');

            let label = "";
            let badgeClass = "";
            if (finalPercentage >= 80) {
                label = "Optimistic Candidate";
                badgeClass = "bg-success";
            } else if (finalPercentage >= 60) {
                label = "Good Candidate";
                badgeClass = "bg-info text-white";
            } else if (finalPercentage >= 40) {
                label = "Moderate Candidate";
                badgeClass = "bg-warning text-dark";
            } else {
                label = "Consult Provider";
                badgeClass = "bg-danger";
            }

            $('#vbac-label').text(label).removeClass().addClass(`badge px-4 py-2 rounded-pill fw-bold mb-3 ${badgeClass}`);

            $('#vbac-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#vbac-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('.calculator-inputs select').val('1'); // Default select values
                $('#vbac-prior-vag').val('0');
            });
        },

        share: function () {
            const pct = $('#vbac-percentage').text();
            const label = $('#vbac-label').text();
            if (navigator.share) {
                navigator.share({
                    title: 'VBAC Success Predictor',
                    text: `My estimated VBAC success probability is ${pct}% (${label}). Discussing birth options with PregCal!`,
                    url: window.location.href
                });
            }
        }
    };
})(jQuery);
