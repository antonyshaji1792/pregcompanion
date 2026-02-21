/**
 * calc-hcg.js - hCG Doubling Calculator Module
 * Namespace: Companion.UI.Calculators.HCG
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Calculators = window.Companion.UI.Calculators || {};

Companion.UI.Calculators.HCG = (function ($) {
    const STORAGE_KEY = 'calc_hcg_data';

    const modalHtml = `
        <div class="modal fade" id="calc-hcg-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-danger text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-graph-up-arrow me-2"></i>hCG Doubling Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="calculator-inputs mb-4">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase">First Test (hCG 1)</label>
                                        <div class="input-group mb-2">
                                            <span class="input-group-text border-0 bg-soft-danger text-danger"><i class="bi bi-droplet"></i></span>
                                            <input type="number" class="form-control border-0 bg-light" id="calc-hcg-val1" placeholder="mUI/ml">
                                        </div>
                                        <input type="datetime-local" class="form-control border-0 bg-light" id="calc-hcg-date1">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="p-3 bg-white rounded-4 shadow-sm h-100">
                                        <label class="form-label fw-bold small text-muted text-uppercase">Second Test (hCG 2)</label>
                                        <div class="input-group mb-2">
                                            <span class="input-group-text border-0 bg-soft-danger text-danger"><i class="bi bi-droplet-fill"></i></span>
                                            <input type="number" class="form-control border-0 bg-light" id="calc-hcg-val2" placeholder="mUI/ml">
                                        </div>
                                        <input type="datetime-local" class="form-control border-0 bg-light" id="calc-hcg-date2">
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-danger w-100 rounded-pill py-3 fw-bold shadow-lg animate-button mt-4" onclick="Companion.UI.Calculators.HCG.calculate()">
                                Calculate Doubling Time
                            </button>
                        </div>
                        
                        <div id="calc-hcg-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm mb-4 animate-reveal">
                                <div class="text-center mb-4">
                                    <div class="small text-muted text-uppercase fw-bold mb-1">Doubling Time</div>
                                    <h2 class="fw-bold text-danger mb-0"><span id="calc-hcg-hours">--</span> Hours</h2>
                                    <div id="calc-hcg-status" class="badge mt-2 px-3 py-2 rounded-pill fw-bold">--</div>
                                </div>

                                <div class="mt-5">
                                    <div class="d-flex justify-content-between small fw-bold text-muted mb-3 text-uppercase letter-spacing-1 px-1">
                                         <span>Level Comparison</span>
                                         <span id="calc-hcg-increase-pct" class="text-success">+0%</span>
                                    </div>
                                    <div class="vstack gap-3">
                                        <div class="hcg-bar-item">
                                            <div class="d-flex justify-content-between x-small fw-bold mb-1">
                                                <span>TEST 1</span>
                                                <span id="calc-hcg-disp-val1">0 mUI/ml</span>
                                            </div>
                                            <div class="progress rounded-pill bg-light" style="height: 10px;">
                                                <div id="calc-hcg-bar1" class="progress-bar bg-soft-danger opacity-50" style="width: 0%; transition: width 1s ease;"></div>
                                            </div>
                                        </div>
                                        <div class="hcg-bar-item">
                                            <div class="d-flex justify-content-between x-small fw-bold mb-1">
                                                <span>TEST 2</span>
                                                <span id="calc-hcg-disp-val2">0 mUI/ml</span>
                                            </div>
                                            <div class="progress rounded-pill bg-light shadow-inner" style="height: 14px;">
                                                <div id="calc-hcg-bar2" class="progress-bar bg-gradient-danger" style="width: 0%; transition: width 1.5s cubic-bezier(0.1, 0.5, 0.5, 1);"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Calculators.HCG.reset()">
                                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-danger rounded-pill px-3" onclick="Companion.UI.Calculators.HCG.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>

                            <!-- Medical Note -->
                            <div class="mt-4 p-3 rounded-3 bg-soft-secondary x-small text-muted line-height-sm shadow-sm border-0">
                                <i class="bi bi-info-circle-fill me-1 text-danger"></i> 
                                <strong>Important:</strong> A "normal" doubling time is 48-72 hours in early pregnancy. As hCG levels increase, doubling time slows down. Always consult your doctor for a clinical interpretation.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        init: function () {
            if ($('#calc-hcg-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('calc-hcg-modal'));
            modal.show();
        },

        calculate: function () {
            const h1 = parseFloat($('#calc-hcg-val1').val());
            const h2 = parseFloat($('#calc-hcg-val2').val());
            const d1 = $('#calc-hcg-date1').val();
            const d2 = $('#calc-hcg-date2').val();

            if (!h1 || !h2 || !d1 || !d2) {
                $('.calculator-inputs input').each(function () {
                    if (!$(this).val()) $(this).addClass('is-invalid');
                });
                return;
            }
            $('.calculator-inputs input').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ h1, h2, d1, d2 }));

            const timeDiffHours = dayjs(d2).diff(dayjs(d1), 'hour', true);

            if (timeDiffHours <= 0) {
                $('#calc-hcg-date2').addClass('is-invalid');
                return;
            }

            // Formula: DoublingTime = (TimeDiff * log(2)) / log(hCG2/hCG1)
            const doublingTime = (timeDiffHours * Math.log(2)) / Math.log(h2 / h1);
            const increasePct = ((h2 - h1) / h1) * 100;

            // UI Update
            $('#calc-hcg-hours').text(doublingTime.toFixed(1));
            $('#calc-hcg-increase-pct').text(`+${increasePct.toFixed(0)}%`);
            $('#calc-hcg-disp-val1').text(`${h1} mUI/ml`);
            $('#calc-hcg-disp-val2').text(`${h2} mUI/ml`);

            // Interpretation
            let status = "Normal";
            let badgeClass = "bg-soft-success text-success";

            if (doublingTime < 30) { status = "Very Fast"; badgeClass = "bg-soft-info text-info"; }
            else if (doublingTime > 72) { status = "Slowing"; badgeClass = "bg-soft-warning text-warning"; }
            else if (doublingTime > 96) { status = "Slow"; badgeClass = "bg-soft-danger text-danger"; }

            $('#calc-hcg-status').text(status).removeClass().addClass(`badge mt-2 px-3 py-2 rounded-pill fw-bold ${badgeClass}`);

            // Bars
            const maxVal = Math.max(h1, h2);
            const w1 = (h1 / maxVal) * 100;
            const w2 = (h2 / maxVal) * 100;

            $('#calc-hcg-bar1').css('width', '0%');
            $('#calc-hcg-bar2').css('width', '0%');

            $('#calc-hcg-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');

            setTimeout(() => {
                $('#calc-hcg-bar1').css('width', w1 + '%');
                $('#calc-hcg-bar2').css('width', w2 + '%');
            }, 300);
        },

        reset: function () {
            $('#calc-hcg-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('.calculator-inputs input').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const hours = $('#calc-hcg-hours').text();
            if (navigator.share) {
                navigator.share({
                    title: 'hCG Doubling Tracker',
                    text: `My hCG doubling time is ${hours} hours. Tracking progress with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#calc-hcg-val1').val(data.h1);
                $('#calc-hcg-val2').val(data.h2);
                $('#calc-hcg-date1').val(data.d1);
                $('#calc-hcg-date2').val(data.d2);
            }
        }
    };
})(jQuery);
