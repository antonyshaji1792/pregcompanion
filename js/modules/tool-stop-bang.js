/**
 * tool-stop-bang.js - STOP-Bang Sleep Apnea Screening
 * Namespace: Companion.UI.Tools.StopBang
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.StopBang = (function ($) {
    const STORAGE_KEY = 'tool_stopbang_data';

    const questions = [
        { id: 'sb-snore', text: 'Do you Snore Loudly? (Louder than talking or through closed doors)' },
        { id: 'sb-tired', text: 'Do you often feel Tired, Fatigued, or Sleepy during the daytime?' },
        { id: 'sb-observed', text: 'Has anyone Observed you stop breathing during your sleep?' },
        { id: 'sb-pressure', text: 'Do you have or are you being treated for High Blood Pressure?' },
        { id: 'sb-bmi', text: 'Is your BMI more than 35 kg/m²?' },
        { id: 'sb-age', text: 'Are you over 50 years old?' },
        { id: 'sb-neck', text: 'Is your Neck circumference greater than 40 cm (16 inches)?' },
        { id: 'sb-gender', text: 'Is your Gender Male?' }
    ];

    const modalHtml = `
        <div class="modal fade" id="tool-stopbang-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-navy text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-moon-stars-fill me-2"></i>Sleep Apnea Screening</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Answer these 8 simple questions to assess your risk for Obstructive Sleep Apnea (OSA) using the validated STOP-Bang questionnaire.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="vstack gap-3">
                                ${questions.map((q, idx) => `
                                    <div class="p-3 bg-white rounded-4 shadow-sm d-flex align-items-center justify-content-between">
                                        <div class="pe-3">
                                            <span class="badge bg-soft-navy text-navy rounded-pill me-2 x-small">${(q.id.split('-')[1]).toUpperCase()}</span>
                                            <span class="small fw-bold text-dark">${q.text}</span>
                                        </div>
                                        <div class="form-check form-switch pt-1">
                                            <input class="form-check-input sb-question-input" type="checkbox" id="${q.id}" style="width: 3em; height: 1.5em; cursor: pointer;">
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <button class="btn btn-navy w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button mt-4" onclick="Companion.UI.Tools.StopBang.calculate()">
                                View Risk Assessment
                            </button>
                        </div>

                        <div id="sb-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center mb-4">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Your STOP-Bang Score</div>
                                    <h1 class="display-2 fw-bold text-navy mb-0" id="sb-score-display">0</h1>
                                    <div id="sb-risk-badge" class="badge rounded-pill px-4 py-2 fw-bold mt-2" style="font-size: 1rem;">--</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <div class="p-3 rounded-4 bg-light">
                                        <div class="d-flex align-items-center gap-3">
                                            <div class="fs-4 text-navy"><i class="bi bi-info-circle"></i></div>
                                            <div class="small text-muted" id="sb-advice">
                                                Based on your answers, your risk level is determined by the total number of 'Yes' responses.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.StopBang.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-navy rounded-pill px-3" onclick="Companion.UI.Tools.StopBang.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-3 rounded-4 bg-soft-navy x-small text-muted shadow-sm border-0">
                            <i class="bi bi-megaphone-fill me-1 text-navy"></i> 
                            <strong>Clinical Disclaimer:</strong> This screening tool is for informational purposes and does not replace professional medical diagnosis. Highly suggestive scores should be discussed with a sleep specialist.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-navy { background: linear-gradient(135deg, #1a237e, #0d47a1) !important; }
            .text-navy { color: #1a237e !important; }
            .btn-navy { background-color: #1a237e !important; border-color: #1a237e !important; }
            .bg-soft-navy { background-color: rgba(26, 35, 126, 0.1) !important; }
            .btn-soft-navy { background-color: rgba(26, 35, 126, 0.1) !important; color: #1a237e !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-stopbang-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-stopbang-modal'));
            modal.show();
        },

        calculate: function () {
            let score = 0;
            const data = {};

            $('.sb-question-input').each(function () {
                const isChecked = $(this).is(':checked');
                data[$(this).attr('id')] = isChecked;
                if (isChecked) score++;
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            $('#sb-score-display').text(score);

            let risk = "";
            let bClass = "";
            let advice = "";

            if (score <= 2) {
                risk = "Low Risk";
                bClass = "bg-success";
                advice = "Your score suggests a low risk for Obstructive Sleep Apnea. Continue practicing good sleep hygiene.";
            } else if (score <= 4) {
                risk = "Intermediate Risk";
                bClass = "bg-warning text-dark";
                advice = "You have an intermediate risk. Consider monitoring your sleep quality and discussing these symptoms with your physician.";
            } else {
                risk = "High Risk";
                bClass = "bg-danger";
                advice = "Your score indicates a high risk for Obstructive Sleep Apnea. We strongly recommend scheduling a consultation with a sleep specialist or your primary care doctor.";
            }

            $('#sb-risk-badge').text(risk).removeClass().addClass(`badge rounded-pill px-4 py-2 fw-bold mt-2 ${bClass}`);
            $('#sb-advice').text(advice);

            $('#sb-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');

            // Scroll to result
            setTimeout(() => {
                document.getElementById('sb-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        },

        reset: function () {
            $('#sb-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('.sb-question-input').prop('checked', false);
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const score = $('#sb-score-display').text();
            const risk = $('#sb-risk-badge').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My STOP-Bang Sleep Assessment',
                    text: `I just completed a sleep apnea screening on PregCal. My STOP-Bang score is ${score} (${risk}). Check your sleep health!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                Object.keys(data).forEach(id => {
                    $(`#${id}`).prop('checked', data[id]);
                });
            }
        }
    };
})(jQuery);
