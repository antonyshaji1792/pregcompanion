/**
 * tool-fetal-dev.js - Fetal Development Explorer Tool
 * Namespace: Companion.UI.Tools.FetalDev
 */
window.Companion = window.Companion || {};
window.Companion.UI = window.Companion.UI || {};
window.Companion.UI.Tools = window.Companion.UI.Tools || {};

Companion.UI.Tools.FetalDev = (function ($) {
    const devData = {
        1: { organs: "Uterine lining thickening.", symptoms: "Fatigue, mild cramping." },
        2: { organs: "Ovulation and fertilization.", symptoms: "Increased energy, spotting." },
        3: { organs: "Zygote becomes a blastocyst.", symptoms: "Heightened sense of smell." },
        4: { organs: "Neural tube begins to form.", symptoms: "Missed period, breast tenderness." },
        5: { organs: "Heart and circulatory system.", symptoms: "Nausea (Morning sickness), fatigue." },
        6: { organs: "C-shaped embryo, arm buds.", symptoms: "Food aversions, frequent urination." },
        7: { organs: "Brain divisions, leg buds.", symptoms: "Mood swings, acne." },
        8: { organs: "Fingers and toes forming.", symptoms: "Bloating, constipation." },
        9: { organs: "Eyes and eyelids developing.", symptoms: "Dizziness, vivid dreams." },
        10: { organs: "Vital organs start to function.", symptoms: "Visible veins, round ligament pain." },
        11: { organs: "Diaphragm and external ears.", symptoms: "Nail and hair growth changes." },
        12: { organs: "Pituitary gland and vocal cords.", symptoms: "Diminished nausea, 'Glow' begins." },
        13: { organs: "Intestines move into abdomen.", symptoms: "Increased appetite, libido changes." },
        14: { organs: "Neck is defined, thyroid works.", symptoms: "End of morning sickness for many." },
        15: { organs: "Skeleton continues to harden.", symptoms: "Nasal congestion, nosebleeds." },
        16: { organs: "Nervous system taking control.", symptoms: "Occasional forgetfulness (Baby brain)." },
        17: { organs: "Fat stores (adipose) developing.", symptoms: "Backaches, skin pigment changes." },
        18: { organs: "Myelin coating on nerves.", symptoms: "Feeling the 'flutters' (Quickening)." },
        19: { organs: "Sensory brain cells developing.", symptoms: "Leg cramps, hip pain." },
        20: { organs: "Pancreas and gallbladder form.", symptoms: "Itchy belly, sleep struggles." },
        21: { organs: "Bone marrow making blood cells.", symptoms: "Stretch marks, varicose veins." },
        22: { organs: "Taste buds and sensory nerves.", symptoms: "Heartburn, indigestion." },
        23: { organs: "Inner ear fully developed.", symptoms: "Swollen ankles (Edema)." },
        24: { organs: "Surfactant starts in lungs.", symptoms: "Braxton Hicks contractions." },
        25: { organs: "Manual dexterity developing.", symptoms: "Back pain, restless legs." },
        26: { organs: "Optic nerve and retina working.", symptoms: "Increased pressure in pelvis." },
        27: { organs: "Eyes open and blink.", symptoms: "Shortness of breath." },
        28: { organs: "REM sleep cycles begin.", symptoms: "Lower back pain, hemorrhoids." },
        29: { organs: "Brain grows wrinkled/complex.", symptoms: "Difficulties finding sleep positions." },
        30: { organs: "Body temp regulation starts.", symptoms: "Gas and bloating." },
        31: { organs: "Lung capillaries developing.", symptoms: "Colostrum (early milk) leakage." },
        32: { organs: "Toenails and fingernails grown.", symptoms: "Frequent bathroom trips." },
        33: { organs: "Amniotic fluid at peak levels.", symptoms: "Carpal tunnel symptoms." },
        34: { organs: "Central nervous system mature.", symptoms: "Blurry vision (hormone related)." },
        35: { organs: "Liver and kidneys functional.", symptoms: "Pelvic discomfort as baby drops." },
        36: { organs: "Digestive system ready.", symptoms: "Easier breathing as baby drops." },
        37: { organs: "Lungs considered nearly mature.", symptoms: "Increase in vaginal discharge." },
        38: { organs: "Grasp is firm and strong.", symptoms: "Engagement pressure (lightening)." },
        39: { organs: "Brain control of all systems.", symptoms: "Loss of mucus plug, nesting urge." },
        40: { organs: "Arrival ready: Fully mature.", symptoms: "Active labor signs, contractions." }
    };

    const modalHtml = `
        <div class="modal fade" id="tool-fetal-dev-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div class="modal-header border-0 pb-0 bg-gradient-pink text-white p-4">
                        <h5 class="modal-title fw-bold"><i class="bi bi-heart-fill me-2"></i>Fetal Development Explorer</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="text-center mb-5">
                            <div class="display-1 fw-bold text-gradient-pink mb-0" id="fetal-week-display">Week 1</div>
                            <div class="text-muted text-uppercase small fw-bold letter-spacing-2">Pregnancy Progress</div>
                            
                            <div class="mt-4 px-3">
                                <input type="range" class="form-range custom-range" id="fetal-week-slider" min="1" max="40" value="1">
                                <div class="d-flex justify-content-between x-small text-muted fw-bold mt-2">
                                    <span>CONCEPTION</span>
                                    <span>FULL TERM</span>
                                </div>
                            </div>
                        </div>

                        <div class="row g-4">
                            <!-- Section: Baby Size -->
                            <div class="col-md-4">
                                <div class="p-4 bg-white rounded-4 shadow-sm h-100 text-center animate-reveal" style="--delay: 0.1s">
                                    <div class="mb-3 text-pink fs-1" id="fetal-emoji">✨</div>
                                    <h6 class="fw-bold text-muted text-uppercase x-small mb-2">Baby's Size</h6>
                                    <h4 class="fw-bold text-dark mb-0" id="fetal-size">Microscopic</h4>
                                </div>
                            </div>

                            <!-- Section: Organs -->
                            <div class="col-md-4">
                                <div class="p-4 bg-white rounded-4 shadow-sm h-100 animate-reveal" style="--delay: 0.2s">
                                    <div class="d-flex align-items-center gap-2 mb-3">
                                        <div class="bg-soft-pink p-2 rounded-circle text-pink"><i class="bi bi-diagram-3"></i></div>
                                        <h6 class="fw-bold text-dark mb-0">Development</h6>
                                    </div>
                                    <p class="small text-muted mb-0" id="fetal-organs">Growth is just beginning.</p>
                                </div>
                            </div>

                            <!-- Section: Symptoms -->
                            <div class="col-md-4">
                                <div class="p-4 bg-white rounded-4 shadow-sm h-100 animate-reveal" style="--delay: 0.3s">
                                    <div class="d-flex align-items-center gap-2 mb-3">
                                        <div class="bg-soft-warning p-2 rounded-circle text-warning"><i class="bi bi-lightning-charge"></i></div>
                                        <h6 class="fw-bold text-dark mb-0">Typical Symptoms</h6>
                                    </div>
                                    <p class="small text-muted mb-0" id="fetal-symptoms">Fatigue, mild cramping.</p>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-4 bg-white rounded-4 shadow-sm animate-reveal" style="--delay: 0.4s">
                            <h6 class="fw-bold text-dark mb-3"><i class="bi bi-info-circle me-2 text-pink"></i>Weekly Note</h6>
                            <p class="mb-0 text-muted italic" id="fetal-note" style="font-size: 0.95rem;"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .bg-gradient-pink { background: linear-gradient(135deg, #ff6b6b, #ee5253) !important; }
            .text-pink { color: #ff6b6b !important; }
            .bg-soft-pink { background-color: rgba(255, 107, 107, 0.1) !important; }
            .text-gradient-pink {
                background: linear-gradient(135deg, #ff6b6b, #ee5253);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .custom-range::-webkit-slider-thumb { background: #ff6b6b; }
            .custom-range::-moz-range-thumb { background: #ff6b6b; }
            .custom-range::-ms-thumb { background: #ff6b6b; }
        </style>
    `;

    return {
        init: function () {
            if ($('#tool-fetal-dev-modal').length === 0) {
                $('body').append(modalHtml);
                this.bindEvents();
            }
        },

        bindEvents: function () {
            const self = this;
            $('#fetal-week-slider').on('input', function () {
                self.updateUI($(this).val());
            });
        },

        open: function (initialWeek = null) {
            this.init();

            let targetWeek = initialWeek;
            if (targetWeek === null) {
                const profile = Companion.Data.get('profile');
                if (profile && profile.stage === 'pregnancy' && profile.lmp) {
                    const gestation = Companion.Engine.getGestation(profile.lmp);
                    targetWeek = gestation.weeks || 1;
                } else {
                    targetWeek = 1;
                }
            }

            this.updateUI(targetWeek);
            $('#fetal-week-slider').val(targetWeek);
            var modal = new bootstrap.Modal(document.getElementById('tool-fetal-dev-modal'));
            modal.show();
        },

        updateUI: function (week) {
            $('#fetal-week-display').text(`Week ${week}`);

            // Get data from development module
            if (window.Companion && window.Companion.Development) {
                const basic = window.Companion.Development.getData(week);
                $('#fetal-size').text(basic.size);
                $('#fetal-emoji').text(basic.emoji);
                $('#fetal-note').text(basic.note);
            }

            // Get local tool data
            const detail = devData[week] || { organs: "Development continues.", symptoms: "Varies by person." };
            $('#fetal-organs').text(detail.organs);
            $('#fetal-symptoms').text(detail.symptoms);

            // Re-trigger reveal animation for content sections
            const $reveals = $('#tool-fetal-dev-modal .animate-reveal');
            $reveals.removeClass('slide-up-fade-in');
            setTimeout(() => $reveals.addClass('slide-up-fade-in'), 10);

            // Pulse effect on text update
            $('#fetal-week-display').stop(true, true).fadeOut(50).fadeIn(150);
        }
    };
})(jQuery);
