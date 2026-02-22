/**
 * tool-period-tracker.js - Period & Cycle Tracker Module
 * Namespace: Companion.UI.Tools.PeriodTracker
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.PeriodTracker = (function ($) {
    const STORAGE_KEY = 'tool_period_data';

    const modalHtml = `
        <div class="modal fade" id="tool-period-tracker-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-rose text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-calendar-heart me-2"></i>Period & Cycle Tracker</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="row g-4">
                            <!-- Left: Inputs & Prediction -->
                            <div class="col-lg-5">
                                <div class="p-4 bg-white rounded-4 shadow-sm h-100">
                                    <h6 class="fw-bold text-muted text-uppercase x-small mb-4">Cycle Settings</h6>
                                    
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold">Last Period Start</label>
                                        <input type="date" required class="form-control border-0 bg-light rounded-3" id="period-last-date">
                                    </div>
                                    
                                    <div class="mb-4">
                                        <label class="form-label small fw-bold">Average Cycle Length</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control border-0 bg-light rounded-start-3" id="period-cycle-len" value="28">
                                            <span class="input-group-text border-0 bg-light rounded-end-3 text-muted small">days</span>
                                        </div>
                                    </div>

                                    <button class="btn btn-rose w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button mb-4" onclick="Companion.UI.Tools.PeriodTracker.calculate()">
                                        Update Predictions
                                    </button>

                                    <div id="period-predictions" class="d-none animate-reveal">
                                        <h6 class="fw-bold text-muted text-uppercase x-small mb-3">Next 3 Cycles</h6>
                                        <div id="prediction-list" class="vstack gap-2">
                                            <!-- Predicted cycles injected here -->
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right: Mini Calendar -->
                            <div class="col-lg-7">
                                <div class="p-4 bg-white rounded-4 shadow-sm h-100">
                                    <div class="d-flex justify-content-between align-items-center mb-4">
                                        <h6 class="fw-bold text-dark mb-0" id="calendar-month-year">Calendar</h6>
                                        <div class="d-flex gap-2">
                                            <div class="d-flex align-items-center gap-1"><span class="dot-period"></span><span class="x-small text-muted">Period</span></div>
                                            <div class="d-flex align-items-center gap-1"><span class="dot-fertile"></span><span class="x-small text-muted">Fertile</span></div>
                                        </div>
                                    </div>
                                    
                                    <div id="period-calendar-grid" class="calendar-grid">
                                        <!-- Calendar days injected here -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-3 rounded-4 bg-soft-rose x-small text-muted d-flex gap-3 align-items-center">
                            <i class="bi bi-info-circle-fill text-rose fs-4"></i>
                            <div>
                                This tracker provides estimations based on biological averages. Actual cycles can vary due to stress, diet, and lifestyle changes.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-rose { background: linear-gradient(135deg, #f06292, #ec407a) !important; }
            .text-rose { color: #f06292 !important; }
            .btn-rose { background-color: #f06292 !important; border-color: #f06292 !important; }
            .bg-soft-rose { background-color: rgba(240, 98, 146, 0.1) !important; }
            
            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 5px;
                text-align: center;
            }
            .calendar-day-header { font-weight: bold; font-size: 0.7rem; color: #999; padding-bottom: 5px; }
            .calendar-day {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.85rem;
                border-radius: 8px;
                cursor: default;
            }
            .day-period { background-color: #f06292; color: white; font-weight: bold; }
            .day-fertile { background-color: rgba(240, 98, 146, 0.15); color: #ec407a; border: 1px dashed #f06292; }
            .day-today { border: 1px solid #000; font-weight: bold; }
            
            .dot-period { width: 8px; height: 8px; border-radius: 50%; background: #f06292; }
            .dot-fertile { width: 8px; height: 8px; border-radius: 50%; background: #f0629255; border: 1px dashed #f06292; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-period-tracker-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-period-tracker-modal'));
            modal.show();
            this.calculate(); // Auto-render if data exists
        },

        calculate: function () {
            const lastDateStr = $('#period-last-date').val();
            const cycleLen = parseInt($('#period-cycle-len').val()) || 28;

            if (!lastDateStr) {
                $('#period-last-date').addClass('is-invalid');
                return;
            }
            $('#period-last-date').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: lastDateStr, len: cycleLen }));

            const lastDate = dayjs(lastDateStr);
            const predictions = [];
            const markers = []; // For calendar

            // Predict 3 cycles
            for (let i = 0; i < 3; i++) {
                const start = lastDate.add(i * cycleLen, 'day');
                const end = start.add(5, 'day'); // Assume 5 days period
                const ovulation = start.add(cycleLen - 14, 'day');
                const fertileStart = ovulation.subtract(3, 'day');
                const fertileEnd = ovulation.add(1, 'day');

                predictions.push({
                    start: start.format('MMM D'),
                    ovulation: ovulation.format('MMM D')
                });

                // Add to calendar markers (simplified for the current 3-month view)
                markers.push({ type: 'period', start: start, end: end });
                markers.push({ type: 'fertile', start: fertileStart, end: fertileEnd });
            }

            this.renderPredictions(predictions);
            this.renderCalendar(markers);
            $('#period-predictions').removeClass('d-none');
        },

        renderPredictions: function (preds) {
            const $list = $('#prediction-list');
            $list.empty();
            preds.forEach((p, idx) => {
                const opacity = 1 - (idx * 0.2);
                $list.append(`
                    <div class="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center" style="opacity: ${opacity}">
                        <div class="small fw-bold text-dark">Starts ${p.start}</div>
                        <div class="x-small text-rose fw-bold">Ovulation: ${p.ovulation}</div>
                    </div>
                `);
            });
        },

        renderCalendar: function (markers) {
            const $grid = $('#period-calendar-grid');
            $grid.empty();

            const now = dayjs();
            const startOfMonth = now.startOf('month');
            const daysInMonth = now.daysInMonth();
            const firstDayOfWeek = startOfMonth.day(); // 0 (Sun) to 6 (Sat)

            $('#calendar-month-year').text(now.format('MMMM YYYY'));

            // Headers
            ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
                $grid.append(`<div class="calendar-day-header">${d}</div>`);
            });

            // Empty slots for start of month
            for (let i = 0; i < firstDayOfWeek; i++) {
                $grid.append(`<div class="calendar-day"></div>`);
            }

            // Days
            for (let i = 1; i <= daysInMonth; i++) {
                const date = startOfMonth.date(i);
                let classes = 'calendar-day';

                if (date.isSame(now, 'day')) classes += ' day-today';

                // Check markers
                markers.forEach(m => {
                    if (date.isBetween(m.start.subtract(1, 'ms'), m.end.add(1, 'ms'))) {
                        classes += m.type === 'period' ? ' day-period' : ' day-fertile';
                    }
                });

                $grid.append(`<div class="${classes}">${i}</div>`);
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#period-last-date').val(data.date);
                $('#period-cycle-len').val(data.len);
            }
        }
    };
})(jQuery);
