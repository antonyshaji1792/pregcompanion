/**
 * tool-kick-counter.js - Baby Kick Counter Tool
 * Namespace: Companion.UI.Tools.KickCounter
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.KickCounter = (function ($) {
    const STORAGE_KEY = 'tool_kick_sessions';
    let sessionActive = false;
    let kicks = 0;
    let timerInterval = null;
    let timeLeft = 7200; // 2 hours in seconds
    let startTime = null;

    const modalHtml = `
        <div class="modal fade" id="tool-kick-counter-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-coral text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-heart-pulse me-2"></i>Baby Kick Counter</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <!-- Active Session View -->
                        <div id="kick-active-view" class="text-center d-none">
                            <div class="mb-4">
                                <span class="badge bg-soft-coral text-coral rounded-pill px-3 py-2 fw-bold animate-pulse">
                                    <i class="bi bi-record-fill me-1"></i>SESSION ACTIVE
                                </span>
                            </div>
                            
                            <div class="mb-5">
                                <div class="display-1 fw-bold text-coral mb-0" id="kick-count-display">0</div>
                                <div class="text-muted text-uppercase small fw-bold">Total Kicks</div>
                            </div>

                            <button id="btn-tap-kick" class="btn-kick-pulse d-flex align-items-center justify-content-center shadow-lg border-0 mb-5 mx-auto">
                                <i class="bi bi-hand-index-thumb fs-1 text-white"></i>
                            </button>

                            <div class="p-3 bg-white rounded-4 shadow-sm mb-4">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="text-start">
                                        <div class="x-small text-muted fw-bold text-uppercase">Time Remaining</div>
                                        <div class="fw-bold fs-5 text-dark" id="kick-timer-display">02:00:00</div>
                                    </div>
                                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="Companion.UI.Tools.KickCounter.endSession()">
                                        End Session Early
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Initial / History View -->
                        <div id="kick-start-view">
                            <div class="text-center mb-5 p-4 bg-white rounded-4 shadow-sm">
                                <i class="bi bi-info-circle text-coral fs-1 mb-3 d-block"></i>
                                <h4 class="fw-bold">Track Baby's Movement</h4>
                                <p class="text-muted small mb-4">Start a 2-hour session to count 10 movements. This helps monitor your baby's well-being in the third trimester.</p>
                                <button class="btn btn-coral w-100 rounded-pill py-3 fw-bold text-white shadow-lg" onclick="Companion.UI.Tools.KickCounter.startSession()">
                                    Start New Session
                                </button>
                            </div>

                            <div id="kick-history-section" class="d-none">
                                <h6 class="fw-bold text-muted text-uppercase x-small mb-3">Recent Sessions</h6>
                                <div id="kick-history-list" class="vstack gap-2">
                                    <!-- History items injected here -->
                                </div>
                                <button class="btn btn-link text-muted x-small w-100 mt-3 text-decoration-none" onclick="Companion.UI.Tools.KickCounter.clearHistory()">
                                    Clear All History
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-coral { background: linear-gradient(135deg, #ff7e5f, #feb47b) !important; }
            .text-coral { color: #ff7e5f !important; }
            .btn-coral { background-color: #ff7e5f !important; border-color: #ff7e5f !important; }
            .bg-soft-coral { background-color: rgba(255, 126, 95, 0.1) !important; }
            .btn-kick-pulse {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: #ff7e5f;
                transition: transform 0.1s;
                position: relative;
            }
            .btn-kick-pulse:active { transform: scale(0.9); }
            .btn-kick-pulse::after {
                content: '';
                position: absolute;
                inset: -5px;
                border: 2px solid #ff7e5f;
                border-radius: 50%;
                animation: kick-ripple 2s infinite;
            }
            @keyframes kick-ripple {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(1.4); opacity: 0; }
            }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-kick-counter-modal').length === 0) {
                $('body').append(modalHtml);
                this.bindEvents();
                this.renderHistory();
            }
        },

        bindEvents: function () {
            const self = this;
            $(document).on('click', '#btn-tap-kick', function () {
                self.recordKick();
            });
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-kick-counter-modal'));
            modal.show();
        },

        startSession: function () {
            sessionActive = true;
            kicks = 0;
            timeLeft = 7200; // 2 hours
            startTime = dayjs();

            $('#kick-start-view').addClass('d-none');
            $('#kick-active-view').removeClass('d-none');
            $('#kick-count-display').text('0');

            this.updateTimerDisplay();
            this.startTimer();
        },

        recordKick: function () {
            if (!sessionActive) return;
            kicks++;
            $('#kick-count-display').text(kicks);

            // Simple visual feedback
            $('#kick-count-display').addClass('animate-bounce');
            setTimeout(() => $('#kick-count-display').removeClass('animate-bounce'), 500);

            if (kicks === 10) {
                // Success sound or vibrate could go here
                this.endSession(true);
            }
        },

        startTimer: function () {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeLeft--;
                this.updateTimerDisplay();
                if (timeLeft <= 0) {
                    this.endSession(false);
                }
            }, 1000);
        },

        updateTimerDisplay: function () {
            const h = Math.floor(timeLeft / 3600);
            const m = Math.floor((timeLeft % 3600) / 60);
            const s = timeLeft % 60;
            const display = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            $('#kick-timer-display').text(display);
        },

        endSession: function (success = null) {
            clearInterval(timerInterval);
            sessionActive = false;

            const durationArr = dayjs().diff(startTime, 'second');
            const minutes = Math.ceil(durationArr / 60);

            if (success === null) success = kicks >= 10;

            const session = {
                date: dayjs().format('MMM D, h:mm A'),
                count: kicks,
                minutes: minutes,
                status: success ? 'Healthy' : 'Low Movement'
            };

            this.saveSession(session);

            if (!success) {
                alert("Session ended: Less than 10 kicks recorded in 2 hours. Please contact your care provider if you are concerned about decreased movement.");
            } else if (kicks >= 10) {
                // Option for a success toast/alert
            }

            // UI Switch back
            $('#kick-active-view').addClass('d-none');
            $('#kick-start-view').removeClass('d-none');
            this.renderHistory();
        },

        saveSession: function (session) {
            let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            history.unshift(session);
            history = history.slice(0, 5); // Keep last 5
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        },

        renderHistory: function () {
            const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const $list = $('#kick-history-list');
            $list.empty();

            if (history.length > 0) {
                $('#kick-history-section').removeClass('d-none');
                history.forEach(s => {
                    const statusClass = s.status === 'Healthy' ? 'text-success' : 'text-danger';
                    $list.append(`
                        <div class="p-3 bg-white rounded-3 shadow-sm d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fw-bold small text-dark">${s.date}</div>
                                <div class="x-small text-muted">${s.minutes} mins duration</div>
                            </div>
                            <div class="text-end">
                                <div class="fw-bold text-coral">${s.count} Kicks</div>
                                <div class="x-small fw-bold ${statusClass}">${s.status}</div>
                            </div>
                        </div>
                    `);
                });
            } else {
                $('#kick-history-section').addClass('d-none');
            }
        },

        clearHistory: function () {
            if (confirm("Clear all kick history?")) {
                localStorage.removeItem(STORAGE_KEY);
                this.renderHistory();
            }
        }
    };
})(jQuery);
