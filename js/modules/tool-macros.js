/**
 * tool-macros.js - Macronutrient Split Calculator
 * Namespace: Companion.UI.Tools.Macros
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.Macros = (function ($) {
    const STORAGE_KEY = 'tool_macros_data';

    const modalHtml = `
        <div class="modal fade" id="tool-macros-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-rose text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-pie-chart me-2"></i>Macro Calculator</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <p class="small text-muted mb-4 px-1">Break down your daily calorie target into Protein, Carbohydrates, and Fats based on your nutrition goals.</p>
                        
                        <div class="calculator-inputs mb-4">
                            <div class="p-4 bg-white rounded-4 shadow-sm mb-4">
                                <div class="mb-3">
                                    <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Your Daily TDEE</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control text-center border-0 bg-light rounded-start-pill py-2" id="macros-tdee" placeholder="e.g. 2100">
                                        <span class="input-group-text border-0 bg-light rounded-end-pill x-small text-muted">kcal</span>
                                    </div>
                                    <div class="x-small text-muted mt-2 text-center">Need your TDEE? Use the <a href="#" onclick="Companion.UI.Tools.TDEE.open(); return false;" class="text-rose fw-bold text-decoration-none">TDEE Tool</a></div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Weight Goal</label>
                                    <select class="form-select border-0 bg-light rounded-pill" id="macros-goal">
                                        <option value="-500">Weight Loss (-500 kcal)</option>
                                        <option value="0" selected>Maintenance (+0 kcal)</option>
                                        <option value="500">Weight Gain (+500 kcal)</option>
                                    </select>
                                </div>

                                <div class="mb-0">
                                    <label class="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Diet Preference</label>
                                    <select class="form-select border-0 bg-light rounded-pill" id="macros-diet">
                                        <option value="balanced" selected>Balanced (30/40/30)</option>
                                        <option value="low-carb">Low Carb (40/20/40)</option>
                                        <option value="high-protein">High Protein (45/30/25)</option>
                                        <option value="ketogenic">Ketogenic (20/5/75)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button class="btn btn-rose w-100 rounded-pill py-3 fw-bold text-white shadow-lg animate-button" onclick="Companion.UI.Tools.Macros.calculate()">
                                Calculate Macros
                            </button>
                        </div>

                        <div id="macros-result" class="d-none">
                            <div class="result-card p-4 rounded-4 bg-white shadow-sm animate-reveal">
                                <div class="text-center mb-4">
                                    <h4 class="fw-bold text-dark mb-1" id="macros-target-kcal">0 kcal</h4>
                                    <div class="small text-muted text-uppercase fw-bold">Daily Target</div>
                                </div>

                                <div class="vstack gap-4">
                                    <!-- Protein -->
                                    <div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span class="fw-bold small text-muted text-uppercase"><i class="bi bi-egg text-primary me-1"></i> Protein</span>
                                            <span class="fw-bold text-dark" id="macros-p-grams">0g</span>
                                        </div>
                                        <div class="progress rounded-pill" style="height: 10px;">
                                            <div id="macros-p-bar" class="progress-bar bg-primary progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                                        </div>
                                        <div class="text-end x-small text-muted mt-1" id="macros-p-pct">0%</div>
                                    </div>

                                    <!-- Carbs -->
                                    <div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span class="fw-bold small text-muted text-uppercase"><i class="bi bi-bread-slice text-warning me-1"></i> Carbs</span>
                                            <span class="fw-bold text-dark" id="macros-c-grams">0g</span>
                                        </div>
                                        <div class="progress rounded-pill" style="height: 10px;">
                                            <div id="macros-c-bar" class="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                                        </div>
                                        <div class="text-end x-small text-muted mt-1" id="macros-c-pct">0%</div>
                                    </div>

                                    <!-- Fat -->
                                    <div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span class="fw-bold small text-muted text-uppercase"><i class="bi bi-droplet text-danger me-1"></i> Fats</span>
                                            <span class="fw-bold text-dark" id="macros-f-grams">0g</span>
                                        </div>
                                        <div class="progress rounded-pill" style="height: 10px;">
                                            <div id="macros-f-bar" class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                                        </div>
                                        <div class="text-end x-small text-muted mt-1" id="macros-f-pct">0%</div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="Companion.UI.Tools.Macros.reset()">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-soft-rose rounded-pill px-3" onclick="Companion.UI.Tools.Macros.share()">
                                        <i class="bi bi-share me-1"></i>Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-rose { background: linear-gradient(135deg, #e91e63, #c2185b) !important; }
            .text-rose { color: #e91e63 !important; }
            .btn-rose { background-color: #e91e63 !important; border-color: #e91e63 !important; }
            .bg-soft-rose { background-color: rgba(233, 30, 99, 0.1) !important; }
            .btn-soft-rose { background-color: rgba(233, 30, 99, 0.1) !important; color: #e91e63 !important; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-macros-modal').length === 0) {
                $('body').append(modalHtml);
                this.loadSavedData();
            }
        },

        open: function () {
            this.init();
            var modal = new bootstrap.Modal(document.getElementById('tool-macros-modal'));
            modal.show();
        },

        calculate: function () {
            const tdee = parseFloat($('#macros-tdee').val());
            const goal = parseFloat($('#macros-goal').val());
            const diet = $('#macros-diet').val();

            if (!tdee) {
                $('#macros-tdee').addClass('is-invalid');
                return;
            }
            $('#macros-tdee').removeClass('is-invalid');

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ tdee, goal, diet }));

            const totalKcal = tdee + goal;
            $('#macros-target-kcal').text(`${totalKcal} kcal`);

            let split = { p: 0.3, c: 0.4, f: 0.3 }; // Balanced default

            switch (diet) {
                case 'low-carb': split = { p: 0.4, c: 0.2, f: 0.4 }; break;
                case 'high-protein': split = { p: 0.45, c: 0.3, f: 0.25 }; break;
                case 'ketogenic': split = { p: 0.2, c: 0.05, f: 0.75 }; break;
            }

            // Calculations: Protein (4 kcal/g), Carbs (4 kcal/g), Fat (9 kcal/g)
            const pGrams = Math.round((totalKcal * split.p) / 4);
            const cGrams = Math.round((totalKcal * split.c) / 4);
            const fGrams = Math.round((totalKcal * split.f) / 9);

            // UI Update
            $('#macros-p-grams').text(`${pGrams}g`);
            $('#macros-c-grams').text(`${cGrams}g`);
            $('#macros-f-grams').text(`${fGrams}g`);

            $('#macros-p-pct').text(`${Math.round(split.p * 100)}%`);
            $('#macros-c-pct').text(`${Math.round(split.c * 100)}%`);
            $('#macros-f-pct').text(`${Math.round(split.f * 100)}%`);

            $('#macros-p-bar').css('width', `${split.p * 100}%`);
            $('#macros-c-bar').css('width', `${split.c * 100}%`);
            $('#macros-f-bar').css('width', `${split.f * 100}%`);

            $('#macros-result').hide().removeClass('d-none').fadeIn(600);
            $('.animate-reveal').addClass('slide-up-fade-in');
        },

        reset: function () {
            $('#macros-result').fadeOut(300, function () {
                $(this).addClass('d-none');
                $('#macros-tdee').val('');
                localStorage.removeItem(STORAGE_KEY);
            });
        },

        share: function () {
            const p = $('#macros-p-grams').text();
            const c = $('#macros-c-grams').text();
            const f = $('#macros-f-grams').text();
            if (navigator.share) {
                navigator.share({
                    title: 'My Macro Profile',
                    text: `My tailored macro split is Protein: ${p}, Carbs: ${c}, Fats: ${f}. Managing my nutrition with PregCal!`,
                    url: window.location.href
                });
            }
        },

        loadSavedData: function () {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                $('#macros-tdee').val(data.tdee);
                $('#macros-goal').val(data.goal);
                $('#macros-diet').val(data.diet);
            }
        }
    };
})(jQuery);
