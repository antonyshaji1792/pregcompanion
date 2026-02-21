/**
 * tool-target-hr.js - Target Heart Rate Calculator
 * Namespace: Companion.UI.Tools.TargetHR
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.TargetHR = (function ($) {
    const STORAGE_KEY = 'tool_target_hr_data';

    const modalHtml = `
        <div class="modal fade" id="tool-target-hr-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-pulse text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-activity me-2"></i>Heart Rate Zones</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Determine your maximum heart rate and target exercise zones based on your age.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="p-4 bg-white rounded-4 shadow-sm">
                                <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block text-center">Your Age</label>
                                <input type="number" class="form-control text-center border-0 bg-light rounded-pill py-3 h4 mb-0 fw-bold" id="hr-age" placeholder="e.g. 30">
                            </div>
                            
                            <button class="btn btn-pulse w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button mt-4" onclick="Companion.UI.Tools.TargetHR.calculate()">
                                View My Zones
                            </button>
                        </div>

                        <div id="hr-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center mb-4">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Max Heart Rate</div>
                                    <h1 class="display-3 fw-bold text-pulse mb-0 text-gradient-pulse" id="hr-max-display">0</h1>
                                    <div class="text-muted small fw-bold">BPM (Beats per minute)</div>
                                </div>

                                <div class="mt-4 pt-4 border-top">
                                    <h6 class="fw-bold x-small text-muted text-uppercase mb-3">Target Exercise Zone (50% - 85%)</h6>
                                    <div class="p-4 rounded-4 bg-soft-pulse text-center">
                                        <div class="h3 fw-bold text-pulse mb-1" id="hr-zone-display">0 - 0</div>
                                        <div class="x-small text-muted fw-bold text-uppercase">BPM Range</div>
                                    </div>
                                </div>

                                <div class="mt-4 pt-2">
                                     <div class="vstack gap-2">
                                         <div class="d-flex justify-content-between x-small text-muted border-bottom py-2">
                                             <span>Moderate Intensity (50-70%)</span>
                                             <span class="fw-bold text-dark" id="hr-moderate-display">--</span>
                                         </div>
                                         <div class="d-flex justify-content-between x-small text-muted py-2">
                                             <span>Vigorous Intensity (70-85%)</span>
                                             <span class="fw-bold text-dark" id="hr-vigorous-display">--</span>
                                         </div>
                                     </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.TargetHR.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-pulse rounded-pill px-3" onclick="Companion.UI.Tools.TargetHR.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-3 rounded-4 bg-soft-secondary x-small text-muted border-0">
                            <i class="bi bi-info-circle-fill me-1 text-pulse"></i> 
                            <strong>Exercise Tip:</strong> Stay within 50-70% for moderate activity like walking, and 70-85% for vigorous activity like running. Always listen to your body and consult your provider before starting new intense routines.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-pulse { background: linear-gradient(135deg, #ff1744, #d50000) !important; }
            .text-pulse { color: #ff1744 !important; }
            .btn-pulse { background-color: #ff1744 !important; border-color: #ff1744 !important; }
            .bg-soft-pulse { background-color: rgba(255, 23, 68, 0.08) !important; }
            .btn-soft-pulse { background-color: rgba(255, 23, 68, 0.08) !important; color: #ff1744 !important; }
            .text-gradient-pulse {
                background: linear-gradient(135deg, #ff1744, #d50000);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-target-hr-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-target-hr-modal'));
            modal.show();
        },

        calculate: function () {
            const age = parseInt($('#hr-age').val());

            if (!age) {
                $('#hr-age').addClass('is-invalid');
                return;
            }
            $('#hr-age').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ age }));

            const maxHr = 220 - age;
            const zoneLow = Math.round(maxHr * 0.5);
            const zoneHigh = Math.round(maxHr * 0.85);

            const modLow = Math.round(maxHr * 0.5);
            const modHigh = Math.round(maxHr * 0.7);
            const vigLow = Math.round(maxHr * 0.7);
            const vigHigh = Math.round(maxHr * 0.85);

            $('#hr-max-display').text(maxHr);
            $('#hr-zone-display').text(`${zoneLow} - ${zoneHigh}`);
            $('#hr-moderate-display').text(`${modLow} - ${modHigh} BPM`);
            $('#hr-vigorous-display').text(`${vigLow} - ${vigHigh} BPM`);

            $('#hr-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#hr-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#hr-age').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const max = $('#hr-max-display').text();
            const zone = $('#hr-zone-display').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Heart Rate Zones',
                    text: `My max heart rate is ${max} and my target exercise zone is ${zone} BPM. Tracking my fitness with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#hr-age').val(data.age);
            }
        }
    };
})(jQuery);
