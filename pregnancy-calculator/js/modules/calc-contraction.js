/**
 * calc-contraction.js - Contraction Timer Module
 * Namespace: Companion.UI.Calculators.Contraction
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.Contraction = (function ($) {
    const STORAGE_KEY = 'calc_contraction_history';
    let contractionInterval = null;
    let contractionStart = null;
    let contractionHistory = [];

    const modalHtml = `
        <div class="modal fade" id="calc-contraction-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-danger text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-stopwatch me-2"></i>Contraction Timer</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="text-center mb-5">
                            <div class="timer-display display-1 fw-bold font-monospace text-danger mb-4 animate-pulse shadow-sm p-3 bg-white rounded-4" id="calc-ct-timer">00:00</div>
                            <button id="calc-ct-btn" class="btn btn-lg btn-danger rounded-circle shadow-lg d-flex align-items-center justify-content-center mx-auto animate-button" 
                                style="width:120px; height:120px; font-weight:bold; font-size: 1.2rem; transition: all 0.3s ease;" 
                                onclick="Companion.UI.Calculators.Contraction.toggle()">
                                START
                            </button>
                            <p class="text-muted small mt-3" id="calc-ct-status">Tap when a contraction starts</p>
                        </div>
                        
                        <div class="history-section">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold small text-muted text-uppercase mb-0">Recent Activity</h6>
                                <button class="btn btn-link btn-sm text-danger text-decoration-none x-small p-0" onclick="Companion.UI.Calculators.Contraction.clearHistory()">Clear All</button>
                            </div>
                            <div id="calc-ct-history" class="vstack gap-2">
                                <div class="text-center text-muted small py-4 bg-white rounded-3 border">No logs yet. Data will appear here.</div>
                            </div>
                        </div>

                        <!-- 5-1-1 Rule Info -->
                        <div class="mt-4 p-3 rounded-4 bg-white border animate-reveal shadow-sm">
                            <div class="d-flex gap-3">
                                <div class="text-danger fs-4"><i class="bi bi-hospital"></i></div>
                                <div>
                                    <h6 class="fw-bold small mb-1">The 5-1-1 Rule</h6>
                                    <p class="x-small text-muted mb-0">Contractions every <strong>5</strong> min, lasting <strong>1</strong> min, for over <strong>1</strong> hour? Contact your doctor.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Medical Disclaimer -->
                        <div class="mt-4 p-3 rounded-3 bg-soft-secondary x-small text-muted text-center">
                            <strong>Note:</strong> This timer is for tracking helper. If you feel severe pain or your water breaks, call emergency services immediately.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        init: function () {
            if ($('#calc-contraction-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadHistory();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-contraction-modal'));
            modal.show();
        },

        toggle: function () {
            const $btn = $('#calc-ct-btn');
            const $timer = $('#calc-ct-timer');
            const $status = $('#calc-ct-status');

            if (!contractionStart) {
                // START
                contractionStart = Date.now();
                $btn.text('STOP').removeClass('btn-danger').addClass('btn-outline-danger');
                $status.text('Recording contraction...');
                $('.timer-display').addClass('active-glow');

                if (contractionInterval) clearInterval(contractionInterval);
                contractionInterval = setInterval(() => {
                    const diff = Date.now() - contractionStart;
                    const totalSec = Math.floor(diff / 1000);
                    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
                    const s = (totalSec % 60).toString().padStart(2, '0');
                    $timer.text(`${m}:${s}`);
                }, 1000);
            } else {
                // STOP
                clearInterval(contractionInterval);
                contractionInterval = null;
                $('.timer-display').removeClass('active-glow');

                const diff = Date.now() - contractionStart;
                const durationSec = Math.floor(diff / 1000);
                const minutes = Math.floor(durationSec / 60);
                const seconds = durationSec % 60;
                const durationStr = `${minutes}m ${seconds}s`;

                // Calculate frequency (time since last contraction started)
                let frequency = '-';
                if (contractionHistory.length > 0) {
                    const lastStart = contractionHistory[0].timestamp;
                    const freqDiff = Math.floor((contractionStart - lastStart) / 60000);
                    frequency = `${freqDiff} min`;
                }

                // Add to history
                const item = {
                    time: dayjs().format('HH:mm'),
                    timestamp: contractionStart,
                    duration: durationStr,
                    frequency: frequency
                };

                contractionHistory.unshift(item);
                this.saveHistory();
                this.renderHistory();

                // Reset UI
                contractionStart = null;
                $timer.text('00:00');
                $btn.text('START').removeClass('btn-outline-danger').addClass('btn-danger');
                $status.text('Saved! Tap to start next one.');
            }
        },

        renderHistory: function () {
            const $container = $('#calc-ct-history');
            if (contractionHistory.length === 0) {
                $container.html('<div class="text-center text-muted small py-4 bg-white rounded-3 border">No logs yet. Data will appear here.</div>');
                return;
            }

            let html = '';
            contractionHistory.slice(0, 5).forEach((c, idx) => {
                html += `
                    <div class="p-3 bg-white rounded-3 border shadow-xs animate-reveal" style="--delay: ${idx * 0.1}s">
                        <div class="row align-items-center">
                            <div class="col-4">
                                <div class="fw-bold small">${c.time}</div>
                                <div class="x-small text-muted">Start Time</div>
                            </div>
                            <div class="col-4 text-center">
                                <div class="fw-bold text-danger small">${c.duration}</div>
                                <div class="x-small text-muted">Duration</div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="fw-bold text-primary small">${c.frequency}</div>
                                <div class="x-small text-muted">Frequency</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            $container.html(html);
        },

        saveHistory: function () {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(contractionHistory));
        },

        loadHistory: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                contractionHistory = JSON.parse(saved);
                this.renderHistory();
            }
        },

        clearHistory: function () {
            if (confirm('Clear all contraction logs?')) {
                contractionHistory = [];
                this.saveHistory();
                this.renderHistory();
            }
        }
    };
})(jQuery);
