/**
 * tool-bishop-score.js - Bishop Score Tool
 * Namespace: Companion.UI.Tools.BishopScore
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.BishopScore = (function ($) {
    const modalHtml = `
        <div class="modal fade" id="tool-bishop-score-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-deep-purple text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-clipboard-pulse me-2"></i>Bishop Score Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Assess the readiness of the cervix for labor induction or spontaneous delivery based on pelvic exam findings.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <!-- Dilation -->
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Cervical Dilation</label>
                                        <select class="form-select border-0 bg-light" id="bishop-dilation">
                                            <option value="0">Closed (0 cm)</option>
                                            <option value="1">1 - 2 cm</option>
                                            <option value="2">3 - 4 cm</option>
                                            <option value="3">≥ 5 cm</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- Effacement -->
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Effacement</label>
                                        <select class="form-select border-0 bg-light" id="bishop-effacement">
                                            <option value="0">0 - 30%</option>
                                            <option value="1">40 - 50%</option>
                                            <option value="2">60 - 70%</option>
                                            <option value="3">≥ 80%</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- Station -->
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Fetal Station</label>
                                        <select class="form-select border-0 bg-light" id="bishop-station">
                                            <option value="0">-3</option>
                                            <option value="1">-2</option>
                                            <option value="2">-1, 0</option>
                                            <option value="3">+1, +2</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- Consistency -->
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Cervical Consistency</label>
                                        <select class="form-select border-0 bg-light" id="bishop-consistency">
                                            <option value="0">Firm</option>
                                            <option value="1">Medium</option>
                                            <option value="2">Soft</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- Position -->
                                <div class="col-md-12">
                                    <div class="p-3 bg-white rounded-4 shadow-sm">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Cervical Position</label>
                                        <select class="form-select border-0 bg-light" id="bishop-position">
                                            <option value="0">Posterior</option>
                                            <option value="1">Mid-position</option>
                                            <option value="2">Anterior</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn btn-deep-purple w-100 rounded-pill py-3 fw-bold shadow-lg animate-button mt-4 text-white" onclick="Companion.UI.Tools.BishopScore.calculate()">
                                Calculate Bishop Score
                            </button>
                        </div>
                        
                        <div id="bishop-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm mb-4 animate-reveal">
                                <div class="text-center">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Total Bishop Score</div>
                                    <h1 class="fw-bold text-deep-purple mb-1" id="bishop-score-total">0</h1>
                                    <div id="bishop-badge" class="badge px-4 py-2 rounded-pill fw-bold mb-3">--</div>
                                </div>

                                <div class="p-3 bg-light rounded-4">
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="fs-4 text-deep-purple"><i class="bi bi-lightbulb"></i></div>
                                        <div class="small text-muted" id="bishop-note">
                                            Select all parameters to see clinical interpretation.
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.BishopScore.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-deep-purple rounded-pill px-3" onclick="Companion.UI.Tools.BishopScore.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Medical Disclaimer -->
                        <div class="mt-4 p-3 rounded-3 bg-soft-secondary x-small text-muted line-height-sm shadow-sm border-0">
                            <i class="bi bi-exclamation-circle-fill me-1 text-deep-purple"></i> 
                            <strong>Clinical Context:</strong> A score of 8 or more is generally considered favorable for a successful vaginal delivery. This tool is for educational purposes for parents and students. Medical decisions must be made by qualified healthcare providers.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-deep-purple { background: linear-gradient(135deg, #4527a0, #7e57c2) !important; }
            .text-deep-purple { color: #4527a0 !important; }
            .btn-deep-purple { background-color: #4527a0 !important; border-color: #4527a0 !important; }
            .bg-soft-deep-purple { background-color: rgba(69, 39, 160, 0.1) !important; }
            .btn-soft-deep-purple { background-color: rgba(69, 39, 160, 0.1) !important; color: #4527a0 !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-bishop-score-modal').length === 0) {
                $('body').append(modalHtml);
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-bishop-score-modal'));
            modal.show();
        },

        calculate: function () {
            const dil = parseInt($('#bishop-dilation').val());
            const eff = parseInt($('#bishop-effacement').val());
            const sta = parseInt($('#bishop-station').val());
            const con = parseInt($('#bishop-consistency').val());
            const pos = parseInt($('#bishop-position').val());

            const total = dil + eff + sta + con + pos;

            $('#bishop-score-total').text(total);

            let status = "";
            let badgeClass = "";
            let note = "";

            if (total >= 8) {
                status = "Favorable";
                badgeClass = "bg-success";
                note = "A score of 8 or more is considered a high probability of successful vaginal delivery. Spontaneous labor is likely.";
            } else if (total >= 6) {
                status = "Intermediate";
                badgeClass = "bg-warning text-dark";
                note = "Cervical status is intermediate. The provider will decide based on clinical progress.";
            } else {
                status = "Unfavorable";
                badgeClass = "bg-danger";
                note = "Cervical status is unfavorable. Labor induction may have a higher chance of failure if attempted without ripening.";
            }

            $('#bishop-badge').text(status).removeClass().addClass(`badge px-4 py-2 rounded-pill fw-bold mb-3 ${badgeClass}`);
            $('#bishop-note').text(note);

            $('#bishop-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#bishop-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('.calculator-inputs select').val('0');
            });
        },

        share: function () {
            const score = $('#bishop-score-total').text();
            const status = $('#bishop-badge').text();
            if (navigator.share) {
                navigator.share({
                    title: 'Bishop Labor Readiness Score',
                    text: `The calculated Bishop Score is ${score} (${status}). Analyzing labor readiness with PregCal!`,
                    url: window.location.href
                });
            }
        }
    };
})(jQuery);
