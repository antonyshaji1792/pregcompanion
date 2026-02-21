/**
 * dashboard.js - Application logic coordinator
 * Namespace: Companion.Dashboard
 */
window.Companion = window.Companion || {};

Companion.Dashboard = (function () {

    return {
        /**
         * Initialize the application
         */
        init: function () {
            console.log('[Dashboard] Initializing Systems...');

            // 1. Initial State
            Companion.UI.setLoading(true);
            Companion.UI.initTheme();

            // 2. Setup Modules
            if (Companion.Planning) Companion.Planning.init();
            if (Companion.Calendar) Companion.Calendar.init();
            this.checkOnboarding();
            this.bindEvents();
            this.bindNav();

            // 3. Deferred Init to allow UI to breathe
            setTimeout(() => {
                const profile = Companion.Data.get('profile');
                if (profile) {
                    Companion.Reminders.requestPermission();
                    Companion.Share.init();
                }
                Companion.UI.setLoading(false);
            }, 800);
        },

        /**
         * Check if user has completed onboarding
         */
        checkOnboarding: function () {
            const profile = Companion.Data.get('profile');
            if (profile) {
                $('#hero-banner').removeClass('active').addClass('d-none');
                $('#main-content').removeClass('d-none');
                $('#mainNavbar').removeClass('d-none');
                Companion.UI.setLifeStage(profile.stage || 'pregnancy');
                this.loadCompanion(profile);
            } else {
                $('#onboarding-host').removeClass('d-none');
                $('#hero-banner').remove(); // Completely remove as requested
                $('#main-content').addClass('d-none');
                $('#mainNavbar').addClass('d-none');
            }
        },

        /**
         * Orchestrates data loading and dashboard rendering
         */
        loadCompanion: function (profile) {
            try {
                // Initial State defaults
                let edd = dayjs();
                let gestation = { weeks: 0, days: 0, progress: 0 };
                let baby = { size: '...', emoji: '👶' };
                let milestones = [];
                let trimester = { label: 'Unknown' };

                if (profile.stage === 'pregnancy') {
                    const lmp = profile.lmp;
                    const cycle = profile.cycle || 28;
                    edd = Companion.Engine.calculateEDD(lmp, cycle);
                    gestation = Companion.Engine.getGestation(lmp);
                    baby = Companion.Engine.getBabyInfo(gestation.weeks);
                    milestones = Companion.Milestones.generateFromLMP(lmp);
                    trimester = Companion.Engine.getTrimester(gestation.weeks);

                    Companion.UI.triggerTrimesterCelebration(trimester);
                }

                // UI Distribution
                Companion.UI.updateDashboard({
                    edd: edd.format('MMMM D, YYYY'),
                    gestation, baby, milestones, trimester
                });

                Companion.UI.renderRemindersUI();

                if (profile.stage === 'pregnancy') {
                    Companion.UI.renderEngagementUI(gestation);
                }

                // Render Smart Insights
                Companion.UI.renderSmartInsights();

                // Render Encouragement
                if (profile.stage === 'pregnancy' && gestation) {
                    Companion.UI.renderWeeklyMessage(gestation.weeks);
                    Companion.UI.renderEncouragementBanner();
                }

                // Ensure home page is shown
                $('.site-page').removeClass('active');
                $('#page-home').addClass('active');
                $('#hero-banner').removeClass('active').addClass('d-none');
                $('.site-nav-link').removeClass('active');
                $('.site-nav-link[data-page="home"]').addClass('active');
            } catch (error) {
                console.error('[Dashboard] Critical load error:', error);
                $('#hero-banner').addClass('active').removeClass('d-none');
                Companion.UI.showModule('onboarding');
            }
        },

        /**
         * Centralized Event Hub using delegation
         */
        bindEvents: function () {
            const self = this;
            const $body = $('body');

            // --- 1. Navigation & Core ---

            // Smart Insights Dismissal
            $body.off('click', '.dismiss-insight').on('click', '.dismiss-insight', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const id = $(this).data('insight-id');
                if (Companion.Insights) {
                    Companion.Insights.dismissInsight(id);
                    Companion.Insights.dismissInsightTemporarily(id);
                }
                $(this).closest('.modern-card').slideUp(300, function () {
                    $(this).remove();
                });
            });

            // Clean unbind & rebind for delegated events
            $body.off('click', '[data-action]').on('click', '[data-action]', function (e) {
                const action = $(this).data('action');
                const profile = Companion.Data.get('profile');
                if (!profile && action !== 'onboarding') return;

                switch (action) {
                    case 'weight':
                        Companion.UI.showModule('weight');
                        Companion.UI.renderWeightUI();
                        break;
                    case 'kicks':
                    case 'labor':
                        Companion.UI.showModule('trackers');
                        Companion.UI.renderKickUI();
                        Companion.UI.renderLaborUI();
                        break;
                    case 'ovulation':
                        Companion.UI.showModule('planning');
                        Companion.UI.renderPlanningUI();
                        break;
                    case 'health':
                        const stage = Companion.Data.get('profile')?.stage;
                        if (stage === 'planning') {
                            Companion.UI.showModule('preconception');
                            Companion.UI.renderPreconceptionUI();
                        } else {
                            Companion.UI.showModule('health');
                            Companion.UI.renderHealthUI();
                        }
                        break;
                    case 'symptoms':
                        Companion.UI.showModule('symptoms');
                        Companion.UI.renderSymptomsUI();
                        break;
                    case 'reminders':
                        Companion.UI.showModule('reminders');
                        Companion.UI.renderRemindersUI();
                        break;
                    case 'checklist':
                        new bootstrap.Modal('#hospitalBagModal').show();
                        Companion.UI.renderChecklistUI();
                        break;
                    case 'supplements':
                        Companion.UI.showModule('supplements');
                        Companion.UI.renderSupplementsUI();
                        break;
                    case 'journal':
                        Companion.UI.showModule('journal');
                        Companion.UI.renderJournalUI();
                        break;
                    case 'newborn':
                        Companion.UI.showModule('newborn');
                        Companion.UI.renderNewbornUI();
                        break;
                    case 'vaccination':
                        Companion.UI.showModule('vaccination');
                        Companion.UI.renderVaccinationUI();
                        break;
                    case 'recovery':
                        Companion.UI.showModule('recovery');
                        Companion.UI.renderRecoveryUI();
                        break;
                    case 'share':
                        Companion.UI.showModule('share');
                        Companion.UI.renderStorageStats();
                        break;
                    case 'symptoms':
                        Companion.UI.showModule('symptoms');
                        Companion.UI.renderSymptomsUI();
                        break;
                    case 'water':
                        Companion.UI.showModule('water');
                        Companion.UI.renderWaterUI();
                        break;
                    case 'sleep':
                        Companion.UI.showModule('sleep');
                        Companion.UI.renderSleepUI();
                        break;
                    case 'bump-tracker':
                        Companion.UI.showModule('bump-tracker');
                        Companion.UI.renderBumpTrackerUI();
                        break;
                    case 'lab-vault':
                        Companion.UI.showModule('lab');
                        Companion.UI.renderLabVaultUI();
                        break;
                    case 'birth-plan':
                        Companion.UI.showModule('birth-plan');
                        Companion.UI.renderBirthPlanUI();
                        break;
                    case 'hospital-bag':
                        Companion.UI.showModule('hospital-bag');
                        Companion.UI.renderHospitalBagUI();
                        break;
                    case 'emergency-card':
                        Companion.UI.showModule('emergency-card');
                        Companion.UI.renderEmergencyCardUI();
                        break;
                    case 'appointment-prep':
                        Companion.UI.showModule('appointment-prep');
                        Companion.UI.renderAppointmentPrepUI();
                        break;
                }
            });

            // Check Reminders (after profile load)
            const profile = Companion.Data.get('profile');
            if (profile) {
                const gestation = Companion.Engine.getGestation(profile.lmp);

                // Birth Plan Reminder (30 weeks)
                if (Companion.BirthPlan.shouldShowReminder(gestation.weeks)) {
                    const alertHtml = `
                    <div class="alert alert-info alert-dismissible fade show shadow-sm border-0 rounded-4 m-3" role="alert">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-bell-fill fs-4 me-3 text-info"></i>
                            <div>
                                <strong>Planning Ahead</strong>
                                <div class="small">You're ${gestation.weeks} weeks along! It's a great time to start your <strong>Birth Plan</strong>.</div>
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
                    $('#alert-host').prepend(alertHtml);
                }

                // Hospital Bag Reminder (32 weeks)
                if (Companion.HospitalBag.shouldShowReminder(gestation.weeks)) {
                    const bagAlert = `
                    <div class="alert alert-primary alert-dismissible fade show shadow-sm border-0 rounded-4 m-3" role="alert">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-bag-plus-fill fs-4 me-3 text-primary"></i>
                            <div>
                                <strong>Hospital Bag</strong>
                                <div class="small">You're ${gestation.weeks} weeks along! Have you started packing your hospital bag yet?</div>
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
                    $('#alert-host').prepend(bagAlert);
                }
            }

            $body.on('click', '#theme-toggle', () => {
                Companion.UI.toggleTheme();
            });

            $body.on('click', '.back-to-dashboard', () => {
                Companion.UI.showModule('dashboard');
                Companion.UI.renderRemindersUI();
            });

            $body.on('change', 'input[name="life-stage"]', function () {
                const stage = $(this).val();
                $('.stage-inputs').addClass('d-none');
                $(`#${stage}-inputs`).removeClass('d-none');

                // Toggle required attributes
                $('.stage-inputs input').prop('required', false);
                $(`#${stage}-inputs input`).prop('required', true);
            });

            $body.on('submit', '#onboarding-form', function (e) {
                e.preventDefault();
                const stage = $('input[name="life-stage"]:checked').val();

                // Set the mode first so storage keys are correct
                Companion.Data.setMode(stage);

                let data = { stage: stage };
                if (stage === 'planning') {
                    data.lmp = $('#planning-lmp-input').val();
                    data.cycle = 28;
                } else if (stage === 'pregnancy') {
                    data.lmp = $('#lmp-input').val();
                    data.cycle = $('#cycle-input').val() || 28;
                } else if (stage === 'postpartum') {
                    data.birthDate = $('#birth-date-input').val();
                }

                Companion.Data.save('profile', data);
                self.loadCompanion(data);
            });

            $body.on('change', '#settings-stage-select', function () {
                const newStage = $(this).val();

                // Switch the storage context
                Companion.Data.setMode(newStage);

                // Check if we have a profile for this new mode
                const profile = Companion.Data.get('profile');
                if (profile) {
                    self.loadCompanion(profile);
                } else {
                    // No profile for this mode, go to onboarding
                    Companion.UI.showModule('onboarding');
                }
            });

            // --- 2. Feature Specific Events ---

            // Health & Weight
            $body.on('submit', '#log-bp-form', function (e) {
                e.preventDefault();
                const r = Companion.Health.logBP($('#bp-sys-input').val(), $('#bp-dia-input').val());
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderHealthUI();
                Companion.UI.showAlert(r.isHigh ? 'High BP detected!' : 'BP logged.', r.isHigh ? 'danger' : 'success');
            });

            $body.on('submit', '#log-bs-form', function (e) {
                e.preventDefault();
                const r = Companion.Health.logBS($('#bs-val-input').val(), $('#bs-type-input').val());
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderHealthUI();
                Companion.UI.showAlert(r.isHigh ? 'High Sugar detected!' : 'Sugar logged.', r.isHigh ? 'warning' : 'success');
            });

            $body.on('submit', '#log-weight-form', function (e) {
                e.preventDefault();
                Companion.Weight.logWeight($('#log-weight-input-val').val(), $('#log-week-input').val());
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderWeightUI();
                Companion.UI.showAlert('Weight saved!', 'success');
            });

            // Kicks
            $body.on('click', '#start-kick-btn', () => { Companion.Kicks.startSession(); Companion.UI.renderKickUI(); });
            $body.on('click', '#record-kick-btn', () => { Companion.Kicks.countKick(); Companion.UI.refreshKickSession(); });
            $body.on('click', '#stop-kick-btn', () => {
                const s = Companion.Kicks.stopSession();
                if (s && s.isConcern) Companion.UI.showAlert('Low movement detected.', 'warning');
                Companion.UI.renderKickUI();
            });

            // Labor
            $body.on('click', '#start-labor-btn', () => { Companion.Labor.start(); Companion.UI.renderLaborUI(); });
            $body.on('click', '#stop-labor-btn', () => {
                Companion.Labor.stop();
                if (Companion.Labor.checkLaborRule(Companion.Labor.getHistory())) {
                    Companion.UI.showAlert('<strong>Immediate Attention:</strong> Possible labor pattern detected (5-1-1).', 'danger');
                }
                Companion.UI.renderLaborUI();
            });

            // Reminders
            $body.on('submit', '#add-reminder-form', function (e) {
                e.preventDefault();
                Companion.Reminders.add($('#rem-title-input').val(), $('#rem-date-input').val(), $('#rem-type-input').val(), $('#rem-days-input').val());
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderRemindersUI();
                this.reset();
            });

            $body.on('change', '.reminder-toggle', function () {
                Companion.Reminders.toggle($(this).data('id'));
            });

            $body.on('click', '.delete-reminder', function () {
                if (confirm('Delete reminder?')) {
                    Companion.Reminders.remove($(this).data('id'));
                    Companion.UI.renderRemindersUI();
                }
            });

            // Planning
            $body.on('submit', '#log-period-form', function (e) {
                e.preventDefault();
                const date = $('#period-start-input').val();
                const cycle = $('#avg-cycle-input').val() || 28;

                Companion.Planning.saveSettings({ avgLength: parseInt(cycle) });
                Companion.Planning.logPeriod(date);

                // Update profile LMP/Stage if needed
                const profile = Companion.Data.get('profile');
                if (profile) {
                    profile.lmp = date;
                    profile.cycle = cycle;
                    Companion.Data.save('profile', profile);
                }

                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderPlanningUI();
                self.loadCompanion(profile);
                Companion.UI.showAlert('Cycle entry saved.', 'success');
                this.reset();
            });

            $body.on('click', '.delete-cycle', function () {
                if (confirm('Delete this entry?')) {
                    Companion.Planning.deleteEntry($(this).data('id'));
                    Companion.UI.renderPlanningUI();
                }
            });

            // Preconception Health
            $body.on('submit', '#preconception-health-form', function (e) {
                e.preventDefault();
                const data = {
                    weight: parseFloat($('#pre-weight-input').val()),
                    height: parseFloat($('#pre-height-input').val()),
                    hb: parseFloat($('#pre-hb-input').val()),
                    thyroid: $('#pre-thyroid-input').val()
                };
                Companion.HealthPlanning.saveHealthData(data);
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderPreconceptionUI();
                Companion.UI.showAlert('Health data updated.', 'success');
            });

            $body.on('change', '#folic-acid-toggle', function () {
                Companion.HealthPlanning.toggleFolicAcid($(this).is(':checked'));
                Companion.UI.renderPreconceptionUI();
            });

            // Symptoms
            $body.on('click', '#assess-symptoms-btn', function () {
                const selected = [];
                $('.symptom-checkbox:checked').each(function () {
                    selected.push($(this).val());
                });

                const result = Companion.Symptoms.assessRisk(selected);
                if (result) {
                    $('#symptom-assessment-result').html(`
                    <div class="alert ${result.class} rounded-4 animate-up">
                        <h6 class="fw-bold"><i class="bi ${result.icon} me-2"></i> ${result.title}</h6>
                        <p class="small mb-0">${result.message}</p>
                    </div>`);
                } else {
                    Companion.UI.showAlert('Please select at least one symptom.', 'info');
                }
            });

            // Hospital Bag
            $body.on('change', '.bag-toggle', function () {
                Companion.Checklist.toggleItem($(this).data('id'));
                Companion.UI.renderChecklistUI();
            });

            // Supplements
            $body.on('click', '.mark-taken', function () {
                Companion.Supplements.markAsTaken($(this).data('id'));
                Companion.UI.renderSupplementsUI();
                Companion.UI.showAlert('Supplement marked as taken!', 'success');
            });

            $body.on('change', '.toggle-supplement', function () {
                Companion.Supplements.toggleSupplement($(this).data('id'));
                Companion.UI.renderSupplementsUI();
            });

            $body.on('click', '.delete-supplement', function () {
                if (confirm('Delete this supplement?')) {
                    Companion.Supplements.deleteSupplement($(this).data('id'));
                    Companion.UI.renderSupplementsUI();
                }
            });

            $body.on('submit', '#add-supplement-form', function (e) {
                e.preventDefault();
                const name = $('#custom-supplement-name').val();
                const time = $('#custom-supplement-time').val();
                Companion.Supplements.addCustomSupplement(name, time);
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderSupplementsUI();
                Companion.UI.showAlert(`${name} added successfully!`, 'success');
                this.reset();
            });

            // Health Logs
            $body.on('submit', '#log-bp-form', function (e) {
                e.preventDefault();
                const sys = $('#bp-sys-input').val();
                const dia = $('#bp-dia-input').val();
                Companion.Health.logBP(sys, dia);
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderHealthUI();
                Companion.UI.showAlert('Blood pressure logged.', 'success');
                this.reset();
            });

            $body.on('submit', '#log-bs-form', function (e) {
                e.preventDefault();
                const value = $('#bs-value-input').val();
                const type = $('#bs-type-input').val();
                Companion.Health.logBS(value, type);
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderHealthUI();
                Companion.UI.showAlert('Blood sugar logged.', 'success');
                this.reset();
            });

            $body.on('submit', '#log-hb-form', function (e) {
                e.preventDefault();
                const value = $('#hb-value-input').val();
                Companion.Health.logHB(value);
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderHealthUI();
                Companion.UI.showAlert('Hemoglobin logged.', 'success');
                this.reset();
            });

            // Journal
            $body.on('click', '.mood-btn', function () {
                $('.mood-btn').removeClass('active').css('background', '');
                $(this).addClass('active');
                const moodId = $(this).data('mood');
                const color = Companion.Journal.getMoodOptions().find(m => m.id === moodId).color;
                $(this).css('background', color + '30');
                $('#selected-mood').val(moodId);
            });

            // New Journal Mood Selection
            $body.on('change', 'input[name="journal-mood"]', function () {
                // Visual feedback handled by CSS/Bootstrap
            });

            $body.on('input', '#journal-search-input', function () {
                const keyword = $(this).val();
                Companion.UI.renderJournalUI(keyword);
            });

            $body.on('change', '#journal-photo-input', function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        $('#preview-image').attr('src', event.target.result);
                        $('#photo-preview').removeClass('d-none');
                    };
                    reader.readAsDataURL(file);
                }
            });

            $body.on('submit', '#journal-entry-form', function (e) {
                e.preventDefault();
                const mood = $('input[name="journal-mood"]:checked').val();
                const note = $('#journal-note-input').val();

                if (!mood) {
                    Companion.UI.showAlert('Please select a mood.', 'warning');
                    return;
                }

                Companion.Journal.addEntry(note, mood, null); // Photo support removed for simplicity per request
                Companion.UI.renderJournalUI();
                Companion.UI.showAlert('Journal entry saved!', 'success');

                // Reset form
                $('#journal-entry-form')[0].reset();
                $('input[name="journal-mood"]').prop('checked', false);
            });

            $body.on('click', '.delete-journal-entry', function () {
                if (confirm('Delete this journal entry?')) {
                    Companion.Journal.deleteEntry(parseInt($(this).data('id')));
                    Companion.UI.renderJournalUI();
                    Companion.UI.showAlert('Entry deleted.', 'info');
                }
            });

            $body.on('click', '#export-journal-btn', function () {
                const text = Companion.Journal.exportAsText();
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pregnancy-journal-${dayjs().format('YYYY-MM-DD')}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                Companion.UI.showAlert('Journal exported!', 'success');
            });

            // Newborn Tracker
            $body.on('click', '#start-feeding-btn', function () {
                Companion.Newborn.startFeeding('breast');
                Companion.UI.renderNewbornUI();
                Companion.UI.showAlert('Feeding timer started!', 'info');
            });

            $body.on('click', '#stop-feeding-btn', function () {
                const session = Companion.Newborn.stopFeeding();
                Companion.UI.renderNewbornUI();
                if (session) {
                    Companion.UI.showAlert(`Feeding logged: ${session.duration} minutes`, 'success');
                }
            });

            $body.on('click', '#start-sleep-btn', function () {
                Companion.Newborn.startSleep();
                Companion.UI.renderNewbornUI();
                Companion.UI.showAlert('Sleep timer started!', 'info');
            });

            $body.on('click', '#stop-sleep-btn', function () {
                const session = Companion.Newborn.stopSleep();
                Companion.UI.renderNewbornUI();
                if (session) {
                    Companion.UI.showAlert(`Sleep logged: ${session.duration} minutes`, 'success');
                }
            });

            $body.on('click', '.log-diaper', function () {
                const type = $(this).data('type');
                Companion.Newborn.logDiaper(type);
                Companion.UI.renderNewbornUI();
                Companion.UI.showAlert(`Diaper change logged (${type})`, 'success');
            });

            $body.on('submit', '#log-baby-weight-form', function (e) {
                e.preventDefault();
                const weight = $('#baby-weight-input').val();
                const unit = $('#baby-weight-unit').val();
                Companion.Newborn.logWeight(weight, unit);
                bootstrap.Modal.getInstance(this.closest('.modal')).hide();
                Companion.UI.renderNewbornUI();
                Companion.UI.showAlert('Baby weight logged!', 'success');
                this.reset();
            });

            // Vaccination
            $body.on('change', '.vaccine-checkbox', function () {
                const scheduleId = $(this).data('schedule');
                const vaccineName = $(this).data('vaccine');

                if ($(this).is(':checked')) {
                    Companion.Vaccination.markAsCompleted(scheduleId, vaccineName);
                    Companion.UI.showAlert(`${vaccineName} marked as completed!`, 'success');
                } else {
                    Companion.Vaccination.unmarkCompleted(scheduleId, vaccineName);
                }

                Companion.UI.renderVaccinationUI();
            });

            // Postpartum Recovery
            $body.on('submit', '#recovery-profile-form', function (e) {
                e.preventDefault();
                const deliveryType = $('#delivery-type-input').val();
                const deliveryDate = $('#delivery-date-input').val();
                Companion.Recovery.setProfile(deliveryType, deliveryDate);
                Companion.UI.renderRecoveryUI();
                Companion.UI.showAlert('Recovery profile saved!', 'success');
            });

            $body.on('input', '#pain-level-input', function () {
                $('#pain-level-value').text($(this).val());
            });

            $body.on('click', '.mood-btn-recovery', function () {
                $('.mood-btn-recovery').removeClass('active');
                $(this).addClass('active');
                $('#mood-input').val($(this).data('mood'));
            });

            $body.on('submit', '#recovery-log-form', function (e) {
                e.preventDefault();
                const painLevel = $('#pain-level-input').val();
                const mood = $('#mood-input').val();
                const bleedingLevel = $('#bleeding-level-input').val();

                if (!mood) {
                    Companion.UI.showAlert('Please select your mood', 'warning');
                    return;
                }

                Companion.Recovery.logDay(painLevel, mood, bleedingLevel);
                Companion.UI.renderRecoveryUI();
                Companion.UI.showAlert('Daily log saved!', 'success');
                this.reset();
                $('#pain-level-input').val(5);
                $('#pain-level-value').text(5);
                $('.mood-btn-recovery').removeClass('active');
            });

            $body.on('change', '.recovery-checklist-item', function () {
                const id = $(this).data('id');
                Companion.Recovery.toggleChecklistItem(id);
                Companion.UI.renderRecoveryUI();
            });

            $body.on('click', '.delete-recovery-log', function () {
                if (confirm('Delete this recovery log?')) {
                    Companion.Recovery.deleteLog($(this).data('id'));
                    Companion.UI.renderRecoveryUI();
                }
            });

            // Smart Insights
            $body.on('click', '.dismiss-insight', function () {
                const insightId = $(this).data('insight-id');
                Companion.Insights.dismissInsight(insightId);
                $(this).closest('[data-insight-id]').fadeOut(300, function () {
                    $(this).remove();
                    Companion.UI.renderSmartInsights();
                });
            });

            $body.on('click', '.insight-action', function () {
                const action = $(this).data('action');
                // Trigger the action button click
                $(`.action-btn[data-action="${action}"]`).click();
            });

            // Data Management
            $body.on('click', '#export-json-btn', function () {
                try {
                    Companion.Data.exportAsJSON();
                    Companion.UI.showAlert('Data exported successfully!', 'success');
                } catch (error) {
                    Companion.UI.showAlert('Export failed: ' + error.message, 'danger');
                }
            });

            $body.on('click', '#import-json-btn', function () {
                $('#import-file-input').click();
            });

            $body.on('change', '#import-file-input', function (e) {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (event) {
                    try {
                        const result = Companion.Data.importFromJSON(event.target.result);
                        if (result.success) {
                            Companion.UI.showAlert(result.message, 'success');
                            setTimeout(() => location.reload(), 1500);
                        } else {
                            Companion.UI.showAlert(result.message, 'danger');
                        }
                    } catch (error) {
                        Companion.UI.showAlert('Import failed: ' + error.message, 'danger');
                    }
                };
                reader.readAsText(file);
                e.target.value = ''; // Reset input
            });

            $body.on('click', '#clear-mode-data-btn', function () {
                const mode = Companion.Data.getMode();
                const modeName = mode === 'pregnancy' ? 'Pregnancy' : mode === 'postpartum' ? 'Postpartum' : 'Planning';

                if (confirm(`Clear all ${modeName} mode data? This will remove all logs and trackers for this mode, but keep your profile.`)) {
                    Companion.Data.clearModeData();
                    Companion.UI.showAlert(`${modeName} data cleared!`, 'success');
                    setTimeout(() => location.reload(), 1000);
                }
            });

            $body.on('click', '#reset-all-data-btn', function () {
                if (confirm('⚠️ WARNING: This will delete ALL your data permanently. Are you absolutely sure?')) {
                    if (confirm('This action cannot be undone. Click OK to proceed with complete data reset.')) {
                        Companion.Data.resetAll();
                        Companion.UI.showAlert('All data has been reset.', 'info');
                        setTimeout(() => location.reload(), 1000);
                    }
                }
            });

            // --- 3. New Redesigned Module Events ---


            // Lab Vault Form
            $body.on('submit', '#lab-vault-form', function (e) {
                e.preventDefault();
                const file = $('#lab-image-input')[0].files[0];
                const data = {
                    testName: $('#lab-test-name').val(),
                    date: $('#lab-date-input').val(),
                    category: $('#lab-category-select').val(),
                };

                Companion.Lab.processImage(file, (base64) => {
                    data.image = base64;
                    const result = Companion.Lab.addRecord(data);
                    if (result.success) {
                        bootstrap.Modal.getInstance($('#addLabRecordModal')[0]).hide();
                        Companion.UI.renderLabVaultUI();
                        Companion.UI.showAlert('Record saved to vault.', 'success');
                        this.reset();
                    } else {
                        Companion.UI.showAlert(result.error, 'danger');
                    }
                });
            });

            // Emergency Card Form
            $body.on('submit', '#emergency-form', function (e) {
                e.preventDefault();
                const data = {
                    name: $('#ec-name').val(),
                    bloodGroup: $('#ec-blood').val(),
                    dueDate: $('#ec-due-date').val(),
                    doctorName: $('#ec-doctor').val(),
                    emergencyContact: $('#ec-contact').val(),
                    allergies: $('#ec-conditions').val()
                };
                Companion.EmergencyCard.saveData(data);
                Companion.UI.renderEmergencyCardUI();
                Companion.UI.showAlert('Emergency card updated.', 'success');
                $('#emergency-edit-mode').addClass('d-none');
                $('#emergency-view-mode').removeClass('d-none');
            });

            // Appointment Prep Events
            $body.on('submit', '#schedule-appt-form', function (e) {
                e.preventDefault();
                const date = $('#new-appt-date').val();
                const doctor = $('#new-appt-doctor').val();
                const type = $('#new-appt-type').val();

                Companion.AppointmentPrep.addAppointment(date, doctor, type);
                bootstrap.Modal.getInstance($('#schedule-appt-modal')[0]).hide();
                Companion.UI.renderAppointmentPrepUI();
                Companion.UI.showAlert('Appointment scheduled.', 'success');
                this.reset();
            });

            $body.on('submit', '#complete-appt-form', function (e) {
                e.preventDefault();
                const id = parseInt($('#complete-appt-id').val());
                const notes = $('#complete-notes').val();
                const nextDate = $('#next-visit-date').val();

                Companion.AppointmentPrep.completeAppointment(id, notes, nextDate);
                bootstrap.Modal.getInstance($('#complete-appt-modal')[0]).hide();
                Companion.UI.renderAppointmentPrepUI();
                Companion.UI.showAlert('Visit marked as done.', 'success');
                this.reset();
            });


            // Symptom Log
            $body.on('click', '.symptom-btn', function () {
                const symptomId = $(this).data('symptom-id');
                const symptomName = $(this).data('symptom-name');

                $('#selected-symptom-id').val(symptomId);
                $('#symptom-modal-title').text(`Log ${symptomName}`);
                $('#symptom-severity-input').val(3);
                $('#severity-value').text(3);

                // Show guidance
                const guidance = Companion.Symptoms.getGuidance(symptomId);
                $('#symptom-guidance').html(`<i class="bi bi-lightbulb me-2"></i>${guidance}`);

                const modal = new bootstrap.Modal(document.getElementById('symptomSeverityModal'));
                modal.show();
            });

            $body.on('input', '#symptom-severity-input', function () {
                $('#severity-value').text($(this).val());
            });

            $body.on('input', '#custom-symptom-severity', function () {
                $('#custom-severity-value').text($(this).val());
            });

            $body.on('submit', '#symptom-severity-form', function (e) {
                e.preventDefault();
                const symptomId = $('#selected-symptom-id').val();
                const severity = $('#symptom-severity-input').val();

                Companion.Symptoms.logSymptom(symptomId, severity);
                Companion.UI.renderSymptomsUI();

                bootstrap.Modal.getInstance(document.getElementById('symptomSeverityModal')).hide();
                Companion.UI.showAlert('Symptom logged successfully!', 'success');
            });

            $body.on('submit', '#custom-symptom-form', function (e) {
                e.preventDefault();
                const name = $('#custom-symptom-name').val();
                const severity = $('#custom-symptom-severity').val();

                if (name.trim()) {
                    Companion.Symptoms.logCustomSymptom(name, severity);
                    Companion.UI.renderSymptomsUI();

                    bootstrap.Modal.getInstance(document.getElementById('customSymptomModal')).hide();
                    $('#custom-symptom-name').val('');
                    $('#custom-symptom-severity').val(3);
                    Companion.UI.showAlert('Custom symptom logged!', 'success');
                }
            });

            $body.on('click', '.remove-symptom', function () {
                const symptomId = $(this).data('symptom-id');
                const today = dayjs().format('YYYY-MM-DD');

                if (confirm('Remove this symptom from today\'s log?')) {
                    Companion.Symptoms.removeSymptom(today, symptomId);
                    Companion.UI.renderSymptomsUI();
                    Companion.UI.showAlert('Symptom removed.', 'info');
                }
            });

            // Water Tracker
            $body.on('click', '#add-water-btn', function () {
                Companion.Water.addGlass();
                Companion.UI.renderWaterUI();

                const progress = Companion.Water.getTodayProgress();
                if (progress.achieved && progress.glasses === progress.goal) {
                    // First time reaching goal today
                    Companion.UI.showAlert('🎉 Congratulations! You\'ve reached your hydration goal!', 'success');
                }
            });

            $body.on('click', '#remove-water-btn', function () {
                Companion.Water.removeGlass();
                Companion.UI.renderWaterUI();
            });

            $body.on('submit', '#water-goal-form', function (e) {
                e.preventDefault();
                const goal = $('#water-goal-input').val();

                Companion.Water.setGoal(goal);
                Companion.UI.renderWaterUI();

                bootstrap.Modal.getInstance(document.getElementById('waterGoalModal')).hide();
                Companion.UI.showAlert('Daily goal updated!', 'success');
            });

            // Open water goal modal - populate current goal
            $('#waterGoalModal').on('show.bs.modal', function () {
                const currentGoal = Companion.Water.getGoal();
                $('#water-goal-input').val(currentGoal);
            });

            // Sleep Tracker
            $body.on('submit', '#sleep-log-form', function (e) {
                e.preventDefault();

                const sleepStart = $('#sleep-start-input').val();
                const wakeTime = $('#wake-time-input').val();
                const awakenings = $('#awakenings-input').val();
                const quality = $('#quality-input').val();

                if (!sleepStart || !wakeTime) {
                    Companion.UI.showAlert('Please enter both sleep start and wake time.', 'warning');
                    return;
                }

                // Validate wake time is after sleep start
                if (dayjs(wakeTime).isBefore(dayjs(sleepStart))) {
                    Companion.UI.showAlert('Wake time must be after sleep start time.', 'warning');
                    return;
                }

                Companion.Sleep.logSleep(sleepStart, wakeTime, awakenings, quality);
                Companion.UI.renderSleepUI();

                // Reset form
                $('#sleep-log-form')[0].reset();
                Companion.UI.showAlert('🌙 Sleep logged successfully!', 'success');
            });

            $body.on('click', '.delete-sleep-log', function () {
                const logId = parseInt($(this).data('log-id'));
                const date = $(this).data('date');

                if (confirm('Delete this sleep log?')) {
                    Companion.Sleep.deleteSleepLog(date, logId);
                    Companion.UI.renderSleepUI();
                    Companion.UI.showAlert('Sleep log deleted.', 'info');
                }
            });

            // Bump Tracker
            $body.on('submit', '#bump-photo-form', function (e) {
                e.preventDefault();

                const week = $('#bump-week-input').val();
                const file = $('#bump-photo-input')[0].files[0];
                const caption = $('#bump-caption-input').val();

                if (!week || !file) {
                    Companion.UI.showAlert('Please select a week and upload a photo.', 'warning');
                    return;
                }

                // Show progress bar
                $('#bump-upload-progress').removeClass('d-none');

                Companion.Bump.processImage(file, function (processedImage) {
                    const result = Companion.Bump.addPhoto(week, processedImage, caption);

                    $('#bump-upload-progress').addClass('d-none');

                    if (result.success) {
                        Companion.UI.renderBumpTrackerUI();
                        $('#bump-photo-form')[0].reset();
                        Companion.UI.showAlert('📸 Bump photo saved!', 'success');
                    } else {
                        Companion.UI.showAlert(result.error, 'danger');
                    }
                });
            });

            $body.on('click', '.delete-bump-photo', function () {
                const id = $(this).data('id');
                if (confirm('Delete this photo?')) {
                    Companion.Bump.deletePhoto(id);
                    Companion.UI.renderBumpTrackerUI();
                    Companion.UI.showAlert('Photo deleted.', 'info');
                }
            });

            $body.on('change', '#compare-week-1', function () {
                const id = $(this).val();
                Companion.UI.renderBumpComparison(1, id);
            });

            $body.on('change', '#compare-week-2', function () {
                const id = $(this).val();
                Companion.UI.renderBumpComparison(2, id);
            });

            // Lab Vault
            $body.on('submit', '#lab-vault-form', function (e) {
                e.preventDefault();

                const file = $('#lab-image-input')[0].files[0];
                const testName = $('#lab-test-name').val();
                const date = $('#lab-date-input').val();
                const category = $('#lab-category-select').val();
                const resultValue = $('#lab-result-value').val();
                const unit = $('#lab-unit-input').val();
                const isAbnormal = $('#lab-abnormal-check').is(':checked');
                const notes = $('#lab-notes-input').val();

                $('#lab-upload-progress').removeClass('d-none');

                // Helper to save after potentially processing image
                const saveRecord = (processedImage) => {
                    const data = {
                        testName: testName,
                        date: date,
                        category: category,
                        resultValue: resultValue,
                        unit: unit,
                        isAbnormal: isAbnormal,
                        notes: notes,
                        image: processedImage
                    };

                    const result = Companion.Lab.addRecord(data);
                    $('#lab-upload-progress').addClass('d-none');

                    if (result.success) {
                        Companion.UI.renderLabVaultUI();
                        $('#lab-vault-form')[0].reset();
                        Companion.UI.showAlert('Medical record saved securely!', 'success');
                    } else {
                        Companion.UI.showAlert(result.error, 'danger');
                    }
                };

                if (file) {
                    Companion.Lab.processImage(file, saveRecord);
                } else {
                    saveRecord(null);
                }
            });

            $body.on('shown.bs.tab', '#lab-trimester-tabs button[data-bs-toggle="pill"]', function (e) {
                const targetId = $(e.target).attr('id');
                // Get active category filter
                const catFilter = $('#lab-category-filters button.active').data('filter') || 'all';
                let tri = 0;

                if (targetId === 'lab-t1-tab') tri = 1;
                else if (targetId === 'lab-t2-tab') tri = 2;
                else if (targetId === 'lab-t3-tab') tri = 3;

                Companion.UI.renderLabVaultUI(tri, catFilter);
            });

            $body.on('click', '#lab-category-filters button', function () {
                $('#lab-category-filters button').removeClass('active');
                $(this).addClass('active');

                const catFilter = $(this).data('filter');
                const activeTab = $('#lab-trimester-tabs .nav-link.active').attr('id');
                let tri = 0;

                if (activeTab === 'lab-t1-tab') tri = 1;
                else if (activeTab === 'lab-t2-tab') tri = 2;
                else if (activeTab === 'lab-t3-tab') tri = 3;

                Companion.UI.renderLabVaultUI(tri, catFilter);
            });

            // Birth Plan
            $body.on('submit', '#birth-plan-form', function (e) {
                e.preventDefault();

                const data = {
                    deliveryMode: $('#bp-delivery-mode').val(),
                    painRelief: $('#bp-pain-relief').val(),
                    dimLights: $('#bp-dim-lights').is(':checked'),
                    music: $('#bp-music').is(':checked'),
                    photography: $('#bp-photos').is(':checked'),
                    skinToSkin: $('#bp-skin-to-skin').is(':checked'),
                    delayedCordClamping: $('#bp-delayed-cord').is(':checked'),
                    breastfeedingGoldenHour: $('#bp-golden-hour').is(':checked'),
                    companionAllowed: $('#bp-companion-check').is(':checked'),
                    companionName: $('#bp-companion-name').val(),
                    notes: $('#bp-notes').val()
                };

                const result = Companion.BirthPlan.savePlan(data);
                if (result.success) {
                    Companion.UI.showAlert('Birth plan saved successfully!', 'success');
                    Companion.UI.renderBirthPlanCard();
                    // Switch to card tab
                    const cardTab = new bootstrap.Tab(document.querySelector('#bp-card-tab'));
                    cardTab.show();
                } else {
                    Companion.UI.showAlert('Failed to save plan.', 'danger');
                }
            });

            // Homepage Tracker Tiles
            $body.on('click', '.tracker-trigger', function () {
                const tracker = $(this).data('tracker');
                Companion.UI.showModule(tracker);
            });


        },


        bindNav: function () {
            const self = this;

            // Site-wide navigation (Home, Calendar, Tracker, etc.)
            $(document).on('click', '.site-nav-link', function (e) {
                const pageId = $(this).data('page');
                if (!pageId) return;

                console.log('[Dashboard] Navigating to page:', pageId);

                // UI Logic is handled in index.html inline script mostly, 
                // but we trigger data refreshes here.
                const profile = Companion.Data.get('profile');

                if (pageId === 'insights') Companion.UI.renderInsights();
                if (pageId === 'calendar' && Companion.Calendar) Companion.Calendar.render();
                if (pageId === 'profile' && profile) {
                    $('#profile-lmp-display').text(dayjs(profile.lmp).format('MMMM D, YYYY'));
                }

                // If the user navigates to "Tracker", reset the hub view
                if (pageId === 'tracker') {
                    $('#tracker-hub-grid').removeClass('d-none');
                    $('#module-overlay').addClass('d-none');
                }
            });

            // Mobile Menu Toggle
            $(document).on('click', '.mobile-menu-btn', function () {
                $('.nav-links').toggleClass('active');
            });

            // Tracker Hub Close Overlay
            $(document).on('click', '#close-module-overlay', function () {
                $('#tracker-hub-grid').removeClass('d-none');
                $('#module-overlay').addClass('d-none');
                $('.site-page').removeClass('active');
                $('#page-tracker').addClass('active');
            });

            // Legacy support for any direct showModule calls
            $('.nav-item, .side-nav-item').on('click', function () {
                const nav = $(this).data('nav');
                if (nav) {
                    Companion.UI.showModule(nav);
                }
            });
        }
    };
})();

// Bootstrap
$(document).ready(() => Companion.Dashboard.init());
