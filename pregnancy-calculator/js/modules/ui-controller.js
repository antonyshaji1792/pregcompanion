/**
 * ui-controller.js - DOM orchestration
 * Namespace: Companion.UI
 */
window.Companion = window.Companion || {};

Companion.UI = (function () {
    console.log('Companion UI Loading...');
    // Cache selectors
    const DOM = {
        mainContent: '#companion-app',
        eddDisplay: '#edd-display',
        weeksDisplay: '#weeks-display',
        daysDisplay: '#days-display',
        daysRemaining: '#days-remaining-display',
        progressCircle: '#dashboard-progress-circle',
        babySize: '#baby-size-visual',
        babyFruit: '#baby-fruit-icon',
        weightChart: 'weightChart',
        bmiVal: '#bmi-val',
        bmiBadge: '#bmi-cat-badge',
        kickTimer: '#kick-timer-val',
        kickLiveCount: '#live-kick-count',
        noKickSession: '#no-active-kick-session',
        activeKickSession: '#active-kick-session',
        laborTimer: '#labor-timer-val',
        noLaborSession: '#no-active-labor',
        activeLaborSession: '#active-labor',
        remindersFullList: '#reminders-full-list',
        reminderAlertContent: '#alert-modal-content',
        calMonthYear: '#calendar-month-year',
        preWeight: '#pre-weight-display',
        preBMI: '#pre-bmi-display',
        preHB: '#pre-hb-display',
        preThyroid: '#pre-thyroid-display',
        folicToggle: '#folic-acid-toggle',
        readinessBadge: '#readiness-badge',
        readinessProgress: '#readiness-progress',
        bpHistory: '#bp-history',
        bsHistory: '#bs-history',
        symptomsList: '#symptoms-list',
        assessmentPlaceholder: '#assessment-placeholder',
        assessmentResult: '#assessment-result',
        assessmentBox: '#assessment-box',
        assessmentTitle: '#assessment-title',
        assessmentMsg: '#assessment-msg',
        weightHistoryTable: '#weight-history-table',
        bmiCard: '#bmi-card',
        recGain: '#rec-gain',
        affirmationText: '#affirmation-text',
        badgesContainer: '#badges-container'
    };

    let weightChartInstance = null;
    let kickInterval = null;
    let laborTimerInterval = null;
    let bpChartInstance = null;
    let bsChartInstance = null;

    return {
        setLoading: function (isLoading) {
            const loader = $('#global-loader');
            if (isLoading) {
                loader.removeClass('d-none').addClass('d-flex').css('opacity', 1);
            } else {
                loader.css('opacity', 0);
                setTimeout(() => loader.addClass('d-none').removeClass('d-flex'), 500);
            }
        },

        toggleTheme: function () {
            const current = $('body').attr('data-theme');
            const target = current === 'dark' ? 'light' : 'dark';
            $('body').attr('data-theme', target);
            Companion.Data.save('user_theme', target);
        },

        initTheme: function () {
            const saved = Companion.Data.get('user_theme', 'light');
            $('body').attr('data-theme', saved);
        },

        setLifeStage: function (stage) {
            $('body').attr('data-life-stage', stage);
            $('#settings-stage-select').val(stage);

            // Contextual labeling
            if (stage === 'planning') {
                $('#week-label').text('Cycle Day');
                $('#ref-date-label').text('NEXT PERIOD');
                $('#days-remaining-label').text('TILL NEXT');
                $('#days-summary-line').hide();
            } else if (stage === 'postpartum') {
                $('#week-label').text('Baby Age');
                $('#ref-date-label').text('BIRTH DATE');
                $('#days-remaining-label').text('MILESTONE');
                $('#days-summary-line').show();
            } else {
                $('#week-label').text('Weeks');
                $('#ref-date-label').text('DUE DATE');
                $('#days-remaining-label').text('REMAINING');
                $('#days-summary-line').show();
            }
        },

        showModule: function (moduleName) {
            // Core Pages
            const primaryPages = ['home', 'calendar', 'tracker', 'insights', 'resources', 'profile'];

            if (moduleName === 'onboarding') {
                // Show the onboarding screen, hide everything else
                $('#onboarding-host').removeClass('d-none');
                $('#main-content').addClass('d-none');
                $('nav.top-nav').addClass('d-none');
                $('footer.site-footer').addClass('d-none');
            } else if (primaryPages.includes(moduleName)) {
                // Ensure main content is visible
                $('#onboarding-host').addClass('d-none');
                $('#main-content').removeClass('d-none');
                $('nav.top-nav').removeClass('d-none');
                $('footer.site-footer').removeClass('d-none');
                // If the user wants to go to a primary page, trigger the nav link
                $(`.site-nav-link[data-page="${moduleName}"]`).first().trigger('click');
            } else {
                // It's a sub-module (e.g., 'health', 'lab', 'journal')
                // We show the tracker page hub first, then swap the grid for the active module
                $('.site-page').removeClass('active');
                $('#page-tracker').addClass('active');

                $('#tracker-hub-grid').addClass('d-none');
                $('#module-overlay').removeClass('d-none');

                // Show the specific sub-module
                $('.companion-module').addClass('d-none');
                $(`#module-${moduleName}`).removeClass('d-none');

                // If it's the first time, we might need to move the module DOM 
                // but for now assume they are already there or injected.
                $(`#module-${moduleName}`).appendTo('#module-content-host');
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Contextual renders
            if (moduleName === 'planning') this.renderPlanningUI();
            if (moduleName === 'preconception') this.renderPreconceptionUI();
            if (moduleName === 'sleep') this.renderSleepUI();
            if (moduleName === 'emergency-card') this.renderEmergencyCardUI();
            if (moduleName === 'appointment-prep') this.renderAppointmentPrepUI();
            if (moduleName === 'lab') this.renderLabVaultUI();
            if (moduleName === 'hospital-bag') this.renderHospitalBagUI();
            if (moduleName === 'insights' || moduleName === 'health') this.renderInsights();
        },

        countdownInterval: null,

        startLiveCountdown: function (targetDate) {
            if (this.countdownInterval) clearInterval(this.countdownInterval);

            const update = () => {
                const now = dayjs();
                const diff = targetDate.diff(now);

                if (diff <= 0) {
                    $('#home-countdown').html('<i class="bi bi-balloon-heart me-1"></i> Due Date Reached!');
                    clearInterval(this.countdownInterval);
                    return;
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                const html = `
                    <div class="d-flex gap-2">
                        <div class="text-center"><div class="fw-bold">${days}d</div><div class="x-small opacity-50">DAYS</div></div>
                        <div class="text-center"><div class="fw-bold">${hours}h</div><div class="x-small opacity-50">HRS</div></div>
                        <div class="text-center"><div class="fw-bold">${minutes}m</div><div class="x-small opacity-50">MIN</div></div>
                        <div class="text-center"><div class="fw-bold text-accent">${seconds}s</div><div class="x-small opacity-50">SEC</div></div>
                    </div>
                `;
                $('#home-countdown').html(html);
            };

            update();
            this.countdownInterval = setInterval(update, 1000);
        },

        updateDashboard: function (data) {
            const stage = Companion.Data.get('profile')?.stage || 'pregnancy';
            this.setLifeStage(stage);

            // Update Website Homepage Elements
            if (stage === 'pregnancy') {
                $('#home-gestation-text').text(`${data.gestation.weeks} Weeks ${data.gestation.days} Days`);
                $('#home-edd-display').text(`Due: ${data.edd}`);
                $('#home-gestation-progress').css('width', `${Math.min(100, data.gestation.progress)}%`);

                // Start live countdown
                const profile = Companion.Data.get('profile');
                if (profile && profile.lmp) {
                    const edd = Companion.Engine.calculateEDD(profile.lmp, profile.cycle);
                    this.startLiveCountdown(edd);
                }

                // Update womb overlay info
                const babyName = data.baby.size || '—';
                const babyEmoji = data.baby.emoji || '👶';
                const babyNote = data.baby.note || data.baby.description || `About the size of a ${babyName.toLowerCase()}.`;
                const weekNum = data.gestation.weeks || 0;
                const trimester = Companion.Engine.getTrimester(weekNum);

                $('#home-baby-size').text(babyName);
                $('#home-baby-desc').text(babyNote);
                $('#home-baby-week-badge').text(`Week ${weekNum}`);

                // Calculate Month
                let monthNum = 1;
                if (weekNum <= 4) monthNum = 1;
                else if (weekNum <= 8) monthNum = 2;
                else if (weekNum <= 13) monthNum = 3;
                else if (weekNum <= 17) monthNum = 4;
                else if (weekNum <= 21) monthNum = 5;
                else if (weekNum <= 26) monthNum = 6;
                else if (weekNum <= 30) monthNum = 7;
                else if (weekNum <= 35) monthNum = 8;
                else monthNum = 9;

                $('#home-baby-month-badge').text(`Month ${monthNum}`);

                $('#home-baby-length').text(data.baby.length || '—');
                $('#home-baby-weight').text(data.baby.weight || '—');
                $('#home-baby-trimester').text(trimester ? `${trimester.label}` : '—');

                // SVG Scaling removed as it's replaced by static image


                // Weekly Highlight Banner
                if (Companion.Development) {
                    const devData = Companion.Development.getData(weekNum);
                    if (devData && devData.note) {
                        $('#home-weekly-note').text(devData.note);
                    }
                }

                // Legacy fallback support
                $(DOM.eddDisplay).text(data.edd);
                $(DOM.weeksDisplay).text(data.gestation.weeks);
                $(DOM.daysDisplay).text(data.gestation.days);
                $(DOM.daysRemaining).text(`${data.gestation.daysRemaining} Days`);
            } else if (stage === 'planning') {
                const lmp = dayjs(Companion.Data.get('profile').lmp);
                const today = dayjs().startOf('day');
                const cycleDay = today.diff(lmp, 'day') + 1;
                const nextPeriod = lmp.add(Companion.Data.get('profile').cycle || 28, 'day');

                $('#home-gestation-text').text(`Day ${cycleDay}`);
                $('#home-edd-display').text(`Next Period: ${nextPeriod.format('MMM D')}`);

                const progress = Math.min(100, (cycleDay / (Companion.Data.get('profile').cycle || 28)) * 100);
                $('#home-gestation-progress').css('width', `${progress}%`);
            }

            // 1. Next Appointment
            if (Companion.AppointmentPrep && Companion.AppointmentPrep.getUpcomingAppointment) {
                const nextAppt = Companion.AppointmentPrep.getUpcomingAppointment();
                if (nextAppt) {
                    const dateStr = dayjs(nextAppt.date).format('MMM D');
                    $('#dash-appt-details').html(`<span class="text-primary fw-bold">${dateStr}</span> • ${nextAppt.doctorName}`);
                } else {
                    $('#dash-appt-details').text('No upcoming visits scheduled');
                }
            }

            // 2. Hospital Bag Status
            if (Companion.HospitalBag && stage === 'pregnancy' && Companion.HospitalBag.getProgress) {
                const bagProgress = Companion.HospitalBag.getProgress();
                $('#dash-bag-percent').text(`${bagProgress}%`);
                $('#dash-bag-progress').css('width', `${bagProgress}%`);
            }

            // 3. Water Summary for Trackers Hub
            if (Companion.Water) {
                const waterLog = Companion.Water.getTodayLog();
                const waterCount = waterLog ? waterLog.glasses : 0;
                const waterGoal = waterLog ? (waterLog.goal || 8) : 8;
                $('#home-water-summary, #water-summary').text(`${waterCount} / ${waterGoal} Cups`);
            }

            // 4. Weight Summary for Health Insights
            if (stage === 'pregnancy' && Companion.Weight) {
                const startWeight = Companion.Data.get('profile')?.preWeight;
                const currentLogs = Companion.Weight.getData().logs;
                if (currentLogs.length > 0 && startWeight) {
                    const currentWeight = currentLogs[currentLogs.length - 1].weight;
                    const gain = (currentWeight - startWeight).toFixed(1);
                    $('#insight-total-gain').text(`+${gain}`);
                }
            }

            this.renderUpcomingEvents(data.milestones);
            this.renderReminders();
            if (Companion.Calendar) Companion.Calendar.renderMini();

            // --- Milestone Celebrations ---
            this.checkMilestoneCelebration(data.gestation.weeks);
        },

        checkMilestoneCelebration: function (weeks) {
            const lastCelebrated = Companion.Data.get('last_celebrated_week');
            if (lastCelebrated === weeks) return;

            const majorMilestones = [
                { week: 0, title: "Your Journey Begins!", sub: "Welcome to PregCompanion Premium." },
                { week: 14, title: "Second Trimester!", sub: "You've reached a beautiful milestone." },
                { week: 28, title: "Third Trimester!", sub: "The final countdown begins." },
                { week: 40, title: "Happy Due Date!", sub: "Your little one is ready to meet the world." }
            ];

            const match = majorMilestones.find(m => m.week === weeks);
            if (match) {
                this.triggerCelebration(match.title, match.sub);
                Companion.Data.save('last_celebrated_week', weeks);
            }
        },

        triggerCelebration: function (title, subtext) {
            // 1. Confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            // 2. Visual Feedback (Toast or Banner)
            console.log(`🎉 Celebration: ${title}`);
            // We could add a premium toast here if desired
        },

        renderWeeklyGuide: function () {
            const profile = Companion.Data.get('profile');
            if (!profile || !profile.lmp || !Companion.Engine) return;

            const gestation = Companion.Engine.getGestation(profile.lmp);
            const week = gestation.weeks;

            if (!Companion.Development) return;
            const data = Companion.Development.getData(week);
            const container = $('#weekly-guide-container');

            if (!data) return;

            const html = `
                <div class="d-flex align-items-center gap-3 mb-4">
                    <div class="display-1">${data.emoji}</div>
                    <div>
                        <h4 class="fw-bold mb-1">Week ${week}: ${data.size}</h4>
                        <div class="text-muted small">Your baby is about the size of a ${data.size.toLowerCase()}</div>
                    </div>
                </div>
                
                <div class="p-3 bg-soft-primary rounded-3 mb-4 border-start border-primary border-4">
                    <p class="mb-0 fs-6 lh-base">${data.note}</p>
                </div>

                <div class="row g-3 text-center">
                    <div class="col-6">
                        <div class="p-3 border rounded-3 bg-white h-100 shadow-sm">
                            <div class="text-muted x-small uppercase fw-bold mb-1">Length</div>
                            <div class="fw-bold fs-4 text-dark">${data.length || '—'}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-3 border rounded-3 bg-white h-100 shadow-sm">
                            <div class="text-muted x-small uppercase fw-bold mb-1">Weight</div>
                            <div class="fw-bold fs-4 text-dark">${data.weight || '—'}</div>
                        </div>
                    </div>
                </div>
            `;

            container.html(html);
        },

        renderInsights: function () {
            console.log('[UI] Rendering Insights Page...');
            this.renderWeeklyGuide();

            // Weight Chart
            const weightCtx = document.getElementById('insights-weight-chart');
            if (weightCtx && Companion.Weight) {
                const weightData = Companion.Weight.getData().logs;
                if (weightData.length > 0) {
                    const labels = weightData.map(log => dayjs(log.date).format('MMM D'));
                    const values = weightData.map(log => log.weight);

                    new Chart(weightCtx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Weight (kg)',
                                data: values,
                                borderColor: '#F48FB1',
                                backgroundColor: 'rgba(244, 143, 177, 0.1)',
                                fill: true,
                                tension: 0.4,
                                borderWidth: 3,
                                pointBackgroundColor: '#F48FB1'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } },
                                x: { grid: { display: false } }
                            }
                        }
                    });
                }
            }
        },

        renderNextScan: function (milestones) {
            const today = dayjs().startOf('day');
            const next = milestones.find(m => dayjs(m.date).isAfter(today)) || milestones[milestones.length - 1];
            $('#next-scan-display').text(`${next.title} (W${next.week}) - ${dayjs(next.date).format('MMM D')}`);
        },

        /**
         * Renders upcoming milestones in the horizontal scroll container
         */
        renderUpcomingEvents: function (milestones) {
            const container = $('#home-upcoming-events');
            if (!container.length) return;

            const today = dayjs().startOf('day');
            const upcoming = milestones.filter(m => dayjs(m.date).isAfter(today.subtract(1, 'day'))).slice(0, 5);

            if (upcoming.length === 0) {
                container.html('<div class="event-card"><p class="small text-muted mb-0">No upcoming events scheduled.</p></div>');
                return;
            }

            let html = '';
            upcoming.forEach(m => {
                const date = dayjs(m.date);
                const isTomorrow = date.isSame(today.add(1, 'day'), 'day');
                const isToday = date.isSame(today, 'day');
                const label = isToday ? 'Today' : (isTomorrow ? 'Tomorrow' : date.format('MMM D'));
                const colorClass = m.type === 'scan' ? 'text-primary' : (m.type === 'trimester' ? 'text-accent' : 'text-info');

                html += `
                    <div class="event-card">
                        <div class="subtitle ${colorClass} mb-2">${label}</div>
                        <h5 class="fw-bold">${m.title}</h5>
                        <p class="small text-muted mb-0">${m.desc || 'Scheduled milestone'}</p>
                    </div>
                `;
            });
            container.html(html);
        },

        renderReminders: function () {
            const alerts = Companion.Reminders.checkAlerts();
            const container = $('#today-reminders-list');

            if (alerts.length > 0) {
                let html = '';
                alerts.forEach(a => {
                    html += `<div class="p-2 border-bottom small"><i class="bi bi-check2-circle text-success me-2"></i>${a.title}</div>`;
                });
                container.html(html);
            } else {
                container.html('<div class="alert alert-light border-0 small py-2 mb-0">No reminders for today.</div>');
            }
        },

        renderWeightUI: function () {
            const data = Companion.Weight.getData();
            if (data.settings) {
                $(DOM.bmiCard).removeClass('d-none');
                $(DOM.bmiVal).text(data.settings.bmi);
                $(DOM.bmiBadge).text(data.settings.category.toUpperCase());

                const rec = Companion.Weight.getRecommendations(data.settings.category);
                $(DOM.recGain).text(`${rec.min} - ${rec.max} kg (${rec.label})`);

                // Set form values
                $('#pre-weight-input').val(data.settings.preWeight);
                $('#height-input').val(data.settings.height);
            }

            this.renderWeightHistory(data.logs);
            this.renderWeightChart(data);
        },

        renderWeightHistory: function (logs) {
            const tbody = $(DOM.weightHistoryTable);
            if (logs.length === 0) {
                tbody.html('<tr><td colspan="4" class="text-center text-muted">No entries yet.</td></tr>');
                return;
            }

            let html = '';
            logs.forEach(l => {
                const status = Companion.Weight.isWithinRange(l.weight, l.week);
                const statusHtml = status.isHigh ? '<span class="text-danger"><i class="bi bi-arrow-up-circle me-1"></i>High</span>' :
                    (status.isLow ? '<span class="text-warning"><i class="bi bi-arrow-down-circle me-1"></i>Low</span>' :
                        '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Normal</span>');

                html += `<tr>
                    <td>Week ${l.week}</td>
                    <td>${l.weight} kg</td>
                    <td>${statusHtml}</td>
                    <td>+${status.gain} kg</td>
                </tr>`;
            });
            tbody.html(html);
        },

        renderWeightChart: function (data) {
            const ctx = document.getElementById(DOM.weightChart);
            if (!ctx) return;

            const trend = Companion.Weight.getTrendData();
            if (!trend || trend.values.length === 0) return;

            if (weightChartInstance) weightChartInstance.destroy();

            weightChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: trend.labels,
                    datasets: [{
                        label: 'Your Weight (kg)',
                        data: trend.values,
                        borderColor: '#f06292',
                        backgroundColor: 'rgba(240, 98, 146, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: '#f06292'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        },

        renderKickUI: function () {
            const history = Companion.Kicks.getHistory();
            this.renderKickHistory(history);

            this.refreshKickSession();
        },

        refreshKickSession: function () {
            const active = Companion.Kicks.getActive();

            if (active && active.status === 'running') {
                $(DOM.noKickSession).addClass('d-none');
                $(DOM.activeKickSession).removeClass('d-none');
                $(DOM.kickLiveCount).text(active.count);

                if (!kickInterval) {
                    kickInterval = setInterval(() => {
                        const current = Companion.Kicks.getActive();
                        if (!current || !current.remainingMs) {
                            clearInterval(kickInterval);
                            kickInterval = null;
                            this.renderKickUI();
                            return;
                        }

                        const h = Math.floor(current.remainingMs / 3600000).toString().padStart(2, '0');
                        const m = Math.floor((current.remainingMs % 3600000) / 60000).toString().padStart(2, '0');
                        const s = Math.floor((current.remainingMs % 60000) / 1000).toString().padStart(2, '0');
                        $(DOM.kickTimer).text(`${h}:${m}:${s}`);
                    }, 1000);
                }
            } else {
                $(DOM.noKickSession).removeClass('d-none');
                $(DOM.activeKickSession).addClass('d-none');
                if (kickInterval) {
                    clearInterval(kickInterval);
                    kickInterval = null;
                }
            }
        },

        renderKickHistory: function (history) {
            const container = $('#kick-history-cards');
            if (history.length === 0) {
                container.html('<div class="text-center text-muted small py-3">No sessions yet</div>');
                return;
            }

            let html = '';
            history.slice(0, 5).forEach(s => {
                const duration = Companion.Kicks.formatDuration(s.duration);
                html += `
                <div class="p-3 bg-light rounded-4 d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">${s.count} Kicks</div>
                        <div class="x-small text-muted">${s.date} • ${duration}</div>
                    </div>
                    <i class="bi ${s.isConcern ? 'bi-exclamation-circle text-warning' : 'bi-check-circle-fill text-success'}"></i>
                </div>`;
            });
            container.html(html);
        },

        renderLaborUI: function () {
            const history = Companion.Labor.getHistory();
            this.renderLaborHistory(history);
            this.refreshLaborTimer();
        },

        refreshLaborTimer: function () {
            const active = Companion.Labor.getActive();
            const noLabor = $(DOM.noLaborSession);
            const activeLabor = $(DOM.activeLaborSession);

            if (active) {
                noLabor.addClass('d-none');
                activeLabor.removeClass('d-none');

                if (!laborTimerInterval) {
                    laborTimerInterval = setInterval(() => {
                        const current = Companion.Labor.getActive();
                        if (!current) {
                            clearInterval(laborTimerInterval);
                            laborTimerInterval = null;
                            return;
                        }
                        $(DOM.laborTimer).text(`${current.elapsed}s`);
                    }, 1000);
                }
            } else {
                noLabor.removeClass('d-none');
                activeLabor.addClass('d-none');
                if (laborTimerInterval) {
                    clearInterval(laborTimerInterval);
                    laborTimerInterval = null;
                }
            }
        },

        renderLaborHistory: function (history) {
            const container = $('#labor-history-cards');
            if (history.length === 0) {
                container.html('<div class="text-center text-muted small py-3">No logs yet</div>');
                return;
            }

            let html = '';
            history.slice(0, 5).forEach((h, index) => {
                let interval = '--';
                if (index < history.length - 1) {
                    const mins = (history[index].start - history[index + 1].start) / 60000;
                    interval = mins.toFixed(1) + 'm';
                }

                html += `
                <div class="p-3 bg-light rounded-4 d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">${h.duration}s Duration</div>
                        <div class="x-small text-muted">${dayjs(h.start).format('HH:mm:ss')} • ${interval} interval</div>
                    </div>
                    <i class="bi bi-clock text-primary"></i>
                </div>`;
            });
            container.html(html);
        },

        renderSymptomsUI: function () {
            const symptoms = Companion.Symptoms.getSymptoms();
            const container = $(DOM.symptomsList);

            let html = '';
            symptoms.forEach(s => {
                html += `
                <label class="list-group-item d-flex align-items-center border-0 px-0 py-3 cursor-pointer">
                    <input class="form-check-input me-3 symptom-checkbox" type="checkbox" value="${s.id}" style="width: 22px; height: 22px;">
                    <i class="bi ${s.icon} fs-4 me-3 text-muted"></i>
                    <span class="fw-semibold">${s.label}</span>
                </label>`;
            });
            container.html(html);

            this.resetSymptomAssessment();
        },

        updateSymptomAssessment: function (selectedIds) {
            const assessment = Companion.Symptoms.assessRisk(selectedIds);

            if (!assessment) {
                this.resetSymptomAssessment();
                return;
            }

            $(DOM.assessmentPlaceholder).addClass('d-none');
            $(DOM.assessmentResult).removeClass('d-none');

            $(DOM.assessmentBox)
                .removeClass('alert-danger alert-warning alert-success')
                .addClass(assessment.class);

            $(DOM.assessmentTitle).html(`<i class="bi ${assessment.icon} me-2"></i>${assessment.title}`);
            $(DOM.assessmentMsg).text(assessment.message);
        },

        resetSymptomAssessment: function () {
            $(DOM.assessmentPlaceholder).removeClass('d-none');
            $(DOM.assessmentResult).addClass('d-none');
        },

        renderHealthUI: function () {
            this.renderBPHistory();
            this.renderBPChart();
            this.renderBSHistory();
            this.renderBSChart();
        },

        renderBPHistory: function () {
            const logs = Companion.Health.getBPLogs();
            const tbody = $(DOM.bpHistory);

            if (logs.length === 0) {
                tbody.html('<tr><td colspan="3" class="text-center text-muted">No BP logs yet.</td></tr>');
                return;
            }

            let html = '';
            logs.forEach(l => {
                const statusHtml = l.isHigh ? '<span class="badge bg-danger">High Reading</span>' : '<span class="badge bg-success">Normal</span>';
                html += `<tr>
                    <td>${dayjs(l.timestamp).format('MMM D, HH:mm')}</td>
                    <td class="fw-bold ${l.isHigh ? 'text-danger' : ''}">${l.sys}/${l.dia}</td>
                    <td>${statusHtml}</td>
                </tr>`;
            });
            tbody.html(html);
        },

        renderBPChart: function () {
            const ctx = document.getElementById('bpChart');
            if (!ctx) return;

            const data = Companion.Health.getBPChartData();
            if (data.labels.length === 0) return;

            if (bpChartInstance) bpChartInstance.destroy();

            bpChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'Systolic',
                            data: data.sys,
                            borderColor: '#28a745',
                            tension: 0.3,
                            pointRadius: 4
                        },
                        {
                            label: 'Diastolic',
                            data: data.dia,
                            borderColor: '#17a2b8',
                            tension: 0.3,
                            pointRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: false } }
                }
            });
        },

        renderBSHistory: function () {
            const logs = Companion.Health.getBSLogs();
            const tbody = $(DOM.bsHistory);

            if (logs.length === 0) {
                tbody.html('<tr><td colspan="4" class="text-center text-muted">No sugar logs yet.</td></tr>');
                return;
            }

            let html = '';
            logs.forEach(l => {
                const statusHtml = l.isHigh ? '<span class="badge bg-danger">High Reading</span>' : '<span class="badge bg-success">Normal</span>';
                html += `<tr>
                    <td>${dayjs(l.timestamp).format('MMM D, HH:mm')}</td>
                    <td class="fw-bold ${l.isHigh ? 'text-danger' : ''}">${l.value}</td>
                    <td class="text-capitalize small">${l.type}</td>
                    <td>${statusHtml}</td>
                </tr>`;
            });
            tbody.html(html);
        },

        renderBSChart: function () {
            const ctx = document.getElementById('bsChart');
            if (!ctx) return;

            const data = Companion.Health.getBSChartData();
            if (data.labels.length === 0) return;

            if (bsChartInstance) bsChartInstance.destroy();

            bsChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Blood Sugar (mg/dL)',
                        data: data.values,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: false } }
                }
            });
        },

        renderTimeline: function (milestones) {
            const container = $(DOM.timelineContainer);
            let html = '';

            milestones.forEach(m => {
                const statusClass = m.status; // completed, current, upcoming
                const typeClass = m.type; // scan, trimester, clinical, due

                html += `
                <div class="timeline-item ${statusClass} ${typeClass}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <div class="d-flex justify-content-between align-items-start">
                            <h4 class="fw-bold mb-1">${m.title}</h4>
                            <span class="date">${m.displayDate}</span>
                        </div>
                        <p class="text-muted small mb-0">${m.desc}</p>
                        ${m.status === 'current' ? '<span class="badge bg-accent-pink x-small mt-1">Happening Now</span>' : ''}
                    </div>
                </div>`;
            });

            container.html(html);
        },

        renderRemindersUI: function () {
            const list = Companion.Reminders.getAll();
            const fullList = $(DOM.remindersFullList);

            let fullHtml = '';
            if (list.length === 0) {
                fullHtml = '<div class="text-center py-5 text-muted">No plan items yet.</div>';
            } else {
                list.sort((a, b) => dayjs(a.date).diff(dayjs(b.date))).forEach(r => {
                    const icon = Companion.Reminders.getIcon(r.type);
                    fullHtml += `
                    <div class="modern-card mb-3 d-flex align-items-center animate-up">
                        <div class="bg-primary-subtle p-3 rounded-4 me-3 text-primary">
                            <i class="bi ${icon} fs-4"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-bold">${r.title}</div>
                            <div class="small text-muted">${dayjs(r.date).format('MMM D, YYYY')}</div>
                        </div>
                        <div class="form-check form-switch me-3">
                            <input class="form-check-input reminder-toggle" type="checkbox" data-id="${r.id}" ${r.enabled ? 'checked' : ''}>
                        </div>
                        <button class="btn btn-link text-danger p-0 delete-reminder" data-id="${r.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>`;
                });
            }
            fullList.html(fullHtml);
        },

        showReminderAlert: function (reminder) {
            $(DOM.reminderAlertContent).html(`
                <p class="h5 mb-1">${reminder.title}</p>
                <p class="small">Scheduled for <strong>${dayjs(reminder.date).format('dddd, MMMM D')}</strong></p>
            `);
            const modal = new bootstrap.Modal(document.getElementById('reminderAlertModal'));
            modal.show();
        },

        renderDevelopmentUI: function (week) {
            const data = Companion.Development.getData(week);

            $(DOM.devWeekNum).text(week);
            $(DOM.devSizeVal).text(data.size);
            $(DOM.devWeightVal).text(data.weight);
            $(DOM.devSummaryText).text(data.note);

            // Approximation for length based on week (Hasse's rule or similar curve)
            let length = '--';
            if (week >= 8) {
                length = (week * 1.1).toFixed(1);
            }
            $(DOM.devLengthVal).text(length + ' cm');
        },

        renderPlanningUI: function () {
            this.renderCalendar();
            this.renderCycleHistory();
        },

        renderCalendar: function () {
            const container = $(DOM.cycleCalendar);
            const title = $(DOM.calMonthYear);
            const days = Companion.Planning.getCalendarDays();

            if (days.length === 0) {
                container.html('<div class="col-12 text-center text-muted small py-4">Log your last period to see predictions</div>');
                title.text('Cycle Guide');
                return;
            }

            title.text(dayjs(days[0].date).format('MMMM YYYY'));

            let html = '';
            days.forEach(d => {
                html += `<div class="calendar-day ${d.type} ${d.isToday ? 'today' : ''}">${d.dayNum}</div>`;
            });
            container.html(html);
        },

        renderCycleHistory: function () {
            const container = $(DOM.cycleHistory);
            const history = Companion.Planning.getHistory();

            if (history.length === 0) {
                container.html('<div class="text-center py-4 text-muted small">No history yet.</div>');
                return;
            }

            let html = '';
            history.forEach(h => {
                html += `
                <div class="modern-card mb-2 d-flex justify-content-between align-items-center p-3">
                    <div>
                        <div class="fw-bold">${dayjs(h.date).format('MMM D, YYYY')}</div>
                        <div class="x-small text-muted">Period Started</div>
                    </div>
                    <button class="btn btn-link text-danger p-0 delete-cycle" data-id="${h.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>`;
            });
            container.html(html);
        },

        renderSymptomsUI: function () {
            const container = $('#symptoms-list');
            const symptoms = Companion.Symptoms.getSymptoms();
            let html = '';

            symptoms.forEach(s => {
                html += `
                <div class="form-check modern-card p-3 mb-2 d-flex align-items-center">
                    <input class="form-check-input me-3 symptom-checkbox" type="checkbox" value="${s.id}" id="chk-${s.id}">
                    <label class="form-check-label flex-grow-1 fw-bold" for="chk-${s.id}">
                        <i class="bi ${s.icon} me-2 text-accent-pink"></i> ${s.label}
                    </label>
                </div>`;
            });
            container.html(html);
            $('#symptom-assessment-result').html('');
        },

        renderPreconceptionUI: function () {
            const data = Companion.HealthPlanning.getHealthData();
            const score = Companion.HealthPlanning.getReadinessScore();
            const bmi = Companion.HealthPlanning.calculateBMI(data.weight, data.height);

            // Metrics
            $(DOM.preWeight).text(data.weight ? `${data.weight} kg` : '--');
            $(DOM.preBMI).text(`BMI: ${bmi || '--'}`);
            $(DOM.preHB).text(data.hb || '--');
            $(DOM.preThyroid).text(data.thyroid.charAt(0).toUpperCase() + data.thyroid.slice(1));
            $(DOM.folicToggle).prop('checked', data.folicAcid);

            // Score
            $(DOM.readinessBadge).text(score.label).removeClass('bg-success bg-primary bg-warning').addClass(score.class);
            $(DOM.readinessProgress).css('width', `${score.percentage}%`).removeClass('bg-success bg-primary bg-warning').addClass(score.class);

            // Set form values for modal
            $('#pre-weight-input').val(data.weight);
            $('#pre-height-input').val(data.height);
            $('#pre-hb-input').val(data.hb);
            $('#pre-thyroid-input').val(data.thyroid);
        },

        renderConditionalCards: function (weeks) {
            const container = $('#conditional-cards');
            let html = '';

            // Hospital Bag (W32+)
            if (weeks >= 32) {
                html += `
                <div class="modern-card p-3 border-0 bg-primary-subtle mb-3 animate-up">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-1"><i class="bi bi-briefcase me-2"></i>Hospital Bag</h6>
                            <p class="x-small text-muted mb-0">Almost time! Is your bag ready?</p>
                        </div>
                        <button class="btn btn-white btn-sm rounded-pill shadow-sm py-1 px-3 x-small fw-bold" data-action="checklist">CHECKLIST</button>
                    </div>
                </div>`;
            }

            // Kick Counter (W28+)
            if (weeks >= 28 && weeks < 41) {
                html += `
                <div class="modern-card p-3 border-0 bg-accent-pink bg-opacity-10 mb-3 animate-up" style="animation-delay: 0.1s">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-1 text-accent-pink"><i class="bi bi-heart-pulse me-2"></i>Kick Counter</h6>
                            <p class="x-small text-muted mb-0">Monitor baby's active moves.</p>
                        </div>
                        <button class="btn btn-accent-pink btn-sm rounded-pill shadow-sm py-1 px-3 x-small fw-bold" data-action="kicks">START</button>
                    </div>
                </div>`;
            }

            // Contraction Timer (W36+)
            if (weeks >= 36) {
                html += `
                <div class="modern-card p-3 border-0 bg-danger bg-opacity-10 mb-3 animate-up" style="animation-delay: 0.2s">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-1 text-danger"><i class="bi bi-stopwatch me-2"></i>Contraction Timer</h6>
                            <p class="x-small text-muted mb-0">Track frequency and duration.</p>
                        </div>
                        <button class="btn btn-danger btn-sm rounded-pill shadow-sm py-1 px-3 x-small fw-bold" data-action="labor">TIMED</button>
                    </div>
                </div>`;
            }

            container.html(html);
        },

        renderChecklistUI: function () {
            const container = $('#checklist-items-container');
            const items = Companion.Checklist.getItems();
            const progress = Companion.Checklist.getProgress();

            $('#bag-progress-bar').css('width', `${progress.percentage}%`);

            let html = '';
            items.forEach(item => {
                html += `
                <div class="form-check p-2 mb-1">
                    <input class="form-check-input bag-toggle" type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''} data-id="${item.id}">
                    <label class="form-check-label small ${item.checked ? 'text-muted text-decoration-line-through' : 'fw-bold'}" for="${item.id}">
                        ${item.text}
                    </label>
                </div>`;
            });
            container.html(html);
        },

        renderSupplementsUI: function () {
            const supplements = Companion.Supplements.getSupplements();
            const adherence = Companion.Supplements.getWeeklyAdherence();
            const missed = Companion.Supplements.getMissedDoses();

            // Adherence Stats
            $('#adherence-percentage').text(`${adherence.percentage}%`);
            $('#adherence-progress').css('width', `${adherence.percentage}%`);
            $('#adherence-stats').text(`${adherence.taken}/${adherence.total}`);

            // Supplement List
            const listContainer = $('#supplement-list');
            let html = '';

            const enabledSupplements = supplements.filter(s => s.enabled);
            if (enabledSupplements.length === 0) {
                html = '<div class="text-center py-4 text-muted small">No active supplements. Enable or add one above.</div>';
            } else {
                enabledSupplements.forEach(supplement => {
                    const isTaken = Companion.Supplements.isTakenToday(supplement.id);
                    html += `
                    <div class="modern-card p-3 mb-2 d-flex justify-content-between align-items-center ${isTaken ? 'bg-success bg-opacity-10' : ''}">
                        <div class="flex-grow-1">
                            <div class="fw-bold">${supplement.name}</div>
                            <div class="x-small text-muted">
                                <i class="bi bi-clock me-1"></i>${supplement.reminderTime}
                                ${supplement.isCustom ? '<span class="badge bg-secondary ms-2 x-small">Custom</span>' : ''}
                            </div>
                        </div>
                        <div class="d-flex gap-2 align-items-center">
                            ${isTaken ?
                            '<span class="badge bg-success rounded-pill"><i class="bi bi-check-lg"></i> Taken</span>' :
                            `<button class="btn btn-accent-pink btn-sm rounded-pill px-3 mark-taken" data-id="${supplement.id}">Mark</button>`
                        }
                            ${supplement.isCustom ?
                            `<button class="btn btn-link text-danger p-0 delete-supplement" data-id="${supplement.id}"><i class="bi bi-trash"></i></button>` :
                            `<div class="form-check form-switch mb-0">
                                    <input class="form-check-input toggle-supplement" type="checkbox" ${supplement.enabled ? 'checked' : ''} data-id="${supplement.id}">
                                </div>`
                        }
                        </div>
                    </div>`;
                });
            }
            listContainer.html(html);

            // Missed Doses
            const missedContainer = $('#missed-doses-list');
            const missedSection = $('#missed-doses-section');

            if (missed.length > 0) {
                missedSection.removeClass('d-none');
                let missedHtml = '';
                missed.slice(0, 10).forEach(m => {
                    missedHtml += `
                    <div class="alert alert-danger border-0 rounded-4 p-2 mb-2 small d-flex justify-content-between align-items-center">
                        <span><i class="bi bi-exclamation-triangle me-2"></i>${m.supplement} - ${m.date}</span>
                    </div>`;
                });
                missedContainer.html(missedHtml);
            } else {
                missedSection.addClass('d-none');
            }
        },

        renderHealthUI: function () {
            const alerts = Companion.Health.getRiskAlerts();
            const container = $('#risk-alerts-container');

            if (alerts.length > 0) {
                let html = '';
                alerts.forEach(alert => {
                    html += `
                    <div class="alert alert-${alert.type} border-0 rounded-4 p-4 mb-3 animate-up">
                        <div class="d-flex align-items-start gap-3">
                            <i class="bi ${alert.icon} fs-3"></i>
                            <div class="flex-grow-1">
                                <h6 class="fw-bold mb-2">${alert.title}</h6>
                                <div class="badge bg-white bg-opacity-25 mb-2">${alert.reading}</div>
                                <p class="small mb-2">${alert.guidance}</p>
                                <hr class="my-2 opacity-25">
                                <p class="x-small mb-0 opacity-75"><i class="bi bi-info-circle me-1"></i>${alert.disclaimer}</p>
                            </div>
                        </div>
                    </div>`;
                });
                container.html(html);
            } else {
                container.html('');
            }

            // Render charts if data exists
            this.renderBPChart();
            this.renderBSChart();
        },

        renderBPChart: function () {
            const data = Companion.Health.getBPChartData();
            if (data.labels.length === 0) return;

            const ctx = document.getElementById('bpChart');
            if (!ctx) return;

            if (window.bpChartInstance) window.bpChartInstance.destroy();

            window.bpChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'Systolic',
                            data: data.sys,
                            borderColor: '#FF6B9D',
                            backgroundColor: 'rgba(255, 107, 157, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Diastolic',
                            data: data.dia,
                            borderColor: '#C084FC',
                            backgroundColor: 'rgba(192, 132, 252, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true } }
                }
            });
        },

        renderBSChart: function () {
            const data = Companion.Health.getBSChartData();
            if (data.labels.length === 0) return;

            const ctx = document.getElementById('bsChart');
            if (!ctx) return;

            if (window.bsChartInstance) window.bsChartInstance.destroy();

            window.bsChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Blood Sugar',
                        data: data.values,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        },

        renderJournalUI: function () {
            const entries = Companion.Journal.getEntries();
            const stats = Companion.Journal.getMoodStats();
            const moods = Companion.Journal.getMoodOptions();

            // Mood Stats
            const statsContainer = $('#mood-stats-grid');
            let statsHtml = '';
            moods.forEach(mood => {
                const count = stats[mood.id] || 0;
                statsHtml += `
                <div class="text-center px-3 py-2 rounded-4" style="background: ${mood.color}15; border: 2px solid ${mood.color}30;">
                    <div class="fs-4">${mood.emoji}</div>
                    <div class="x-small fw-bold" style="color: ${mood.color};">${count}</div>
                </div>`;
            });
            statsContainer.html(statsHtml);

            // Timeline
            this.renderJournalTimeline(entries);

            // Mood Selector in Modal
            this.renderMoodSelector();
        },

        renderMoodSelector: function () {
            const moods = Companion.Journal.getMoodOptions();
            const container = $('#mood-selector');
            let html = '';

            moods.forEach(mood => {
                html += `
                <button type="button" class="btn btn-outline-secondary rounded-pill px-3 py-2 mood-btn" data-mood="${mood.id}" style="border-color: ${mood.color}50;">
                    <span class="fs-5">${mood.emoji}</span>
                    <span class="small ms-1">${mood.label}</span>
                </button>`;
            });
            container.html(html);
        },

        renderJournalTimeline: function (entries) {
            const timeline = $('#journal-timeline');
            const empty = $('#journal-empty');

            if (entries.length === 0) {
                timeline.html('');
                empty.removeClass('d-none');
                return;
            }

            empty.addClass('d-none');
            let html = '';

            entries.forEach(entry => {
                const moodData = Companion.Journal.getMoodOptions().find(m => m.id === entry.mood);
                html += `
                <div class="modern-card p-4 mb-3 animate-up" style="border-left: 4px solid ${moodData.color};">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <span class="fs-4">${moodData.emoji}</span>
                                <span class="badge rounded-pill" style="background: ${moodData.color};">${moodData.label}</span>
                                ${entry.week ? `<span class="badge bg-secondary">Week ${entry.week}</span>` : ''}
                            </div>
                            <div class="x-small text-muted">
                                <i class="bi bi-calendar3 me-1"></i>${dayjs(entry.timestamp).format('MMM D, YYYY')}
                                <i class="bi bi-clock ms-2 me-1"></i>${entry.time}
                            </div>
                        </div>
                        <button class="btn btn-link text-danger p-0 delete-journal" data-id="${entry.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <p class="mb-2">${entry.note}</p>
                    ${entry.photo ? `<img src="${entry.photo}" class="img-fluid rounded-4 mt-2" style="max-height: 300px;">` : ''}
                </div>`;
            });

            timeline.html(html);
        },

        renderNewbornUI: function () {
            // Check for active sessions
            const activeFeeding = Companion.Newborn.getActiveFeeding();
            const activeSleep = Companion.Newborn.getActiveSleep();

            const alertContainer = $('#active-session-alert');
            if (activeFeeding || activeSleep) {
                let alertHtml = '';
                if (activeFeeding) {
                    const elapsed = Math.floor((Date.now() - activeFeeding.startTime) / 1000 / 60);
                    alertHtml += `
                    <div class="alert alert-warning border-0 rounded-4 p-3 mb-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="bi bi-cup-straw me-2"></i>
                                <strong>Feeding in progress</strong> - ${elapsed} min
                            </div>
                            <button id="stop-feeding-btn" class="btn btn-sm btn-danger rounded-pill">Stop</button>
                        </div>
                    </div>`;
                }
                if (activeSleep) {
                    const elapsed = Math.floor((Date.now() - activeSleep.startTime) / 1000 / 60);
                    alertHtml += `
                    <div class="alert alert-info border-0 rounded-4 p-3 mb-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="bi bi-moon me-2"></i>
                                <strong>Sleep in progress</strong> - ${elapsed} min
                            </div>
                            <button id="stop-sleep-btn" class="btn btn-sm btn-dark rounded-pill">Stop</button>
                        </div>
                    </div>`;
                }
                alertContainer.html(alertHtml).removeClass('d-none');
            } else {
                alertContainer.addClass('d-none');
            }

            // Daily Summary
            const dailySummary = Companion.Newborn.getDailySummary();
            $('#today-feedings').text(dailySummary.feedingCount);
            $('#today-diapers').text(dailySummary.diaperCount);
            $('#today-sleep').text(dailySummary.totalSleepHours + 'h');
            $('#today-sleep-sessions').text(dailySummary.sleepSessions);

            // Weekly Summary
            const weeklySummary = Companion.Newborn.getWeeklySummary();
            $('#week-avg-feedings').text(weeklySummary.avgFeedingsPerDay);
            $('#week-avg-diapers').text(weeklySummary.avgDiapersPerDay);
            $('#week-avg-sleep').text(weeklySummary.avgSleepHours + 'h');
            $('#week-total-feedings').text(weeklySummary.totalFeedings);

            // Activity Log
            this.renderNewbornActivityLog();
        },

        renderNewbornActivityLog: function () {
            const feedings = Companion.Newborn.getFeedingLogs().slice(0, 5);
            const diapers = Companion.Newborn.getDiaperLogs().slice(0, 5);
            const sleeps = Companion.Newborn.getSleepLogs().slice(0, 5);
            const weights = Companion.Newborn.getWeightLogs().slice(0, 3);

            // Combine and sort by timestamp
            const allActivities = [
                ...feedings.map(f => ({ ...f, activityType: 'feeding' })),
                ...diapers.map(d => ({ ...d, activityType: 'diaper' })),
                ...sleeps.map(s => ({ ...s, activityType: 'sleep' })),
                ...weights.map(w => ({ ...w, activityType: 'weight' }))
            ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

            const container = $('#newborn-activity-log');
            let html = '';

            if (allActivities.length === 0) {
                html = '<div class="text-center py-4 text-muted small">No activity logged yet.</div>';
            } else {
                allActivities.forEach(activity => {
                    let icon, label, details, color;

                    switch (activity.activityType) {
                        case 'feeding':
                            icon = 'bi-cup-straw';
                            label = 'Feeding';
                            details = `${activity.duration} min`;
                            color = 'text-pink';
                            break;
                        case 'diaper':
                            icon = 'bi-droplet';
                            label = 'Diaper';
                            details = activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
                            color = 'text-primary';
                            break;
                        case 'sleep':
                            icon = 'bi-moon';
                            label = 'Sleep';
                            details = `${activity.duration} min`;
                            color = 'text-info';
                            break;
                        case 'weight':
                            icon = 'bi-speedometer2';
                            label = 'Weight';
                            details = `${activity.weight} ${activity.unit}`;
                            color = 'text-success';
                            break;
                    }

                    html += `
                    <div class="modern-card p-3 mb-2 d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-3">
                            <i class="bi ${icon} fs-4 ${color}"></i>
                            <div>
                                <div class="fw-bold">${label}</div>
                                <div class="x-small text-muted">${dayjs(activity.timestamp).format('MMM D, h:mm A')}</div>
                            </div>
                        </div>
                        <div class="text-end">
                            <div class="badge bg-secondary">${details}</div>
                        </div>
                    </div>`;
                });
            }

            container.html(html);
        },

        renderVaccinationUI: function () {
            const schedule = Companion.Vaccination.getSchedule();
            const progress = Companion.Vaccination.getProgress();
            const profile = Companion.Data.get('profile');
            const babyBirthDate = profile && profile.stage === 'postpartum' ? profile.birthDate : null;

            // Progress
            $('#vaccine-progress-badge').text(`${progress.percentage}%`);
            $('#vaccine-progress-bar').css('width', `${progress.percentage}%`);
            $('#vaccine-progress-text').text(`${progress.completed}/${progress.total}`);

            // Upcoming Vaccines
            if (babyBirthDate) {
                const upcoming = Companion.Vaccination.getUpcomingVaccines(babyBirthDate);
                const upcomingSection = $('#upcoming-vaccines-section');
                const upcomingList = $('#upcoming-vaccines-list');

                if (upcoming.length > 0) {
                    upcomingSection.removeClass('d-none');
                    let upcomingHtml = '';

                    upcoming.forEach(item => {
                        const statusColor = item.status === 'overdue' ? 'danger' : item.status === 'urgent' ? 'warning' : 'info';
                        const statusText = item.status === 'overdue' ? `Overdue by ${Math.abs(item.daysUntilDue)} days` :
                            item.status === 'urgent' ? `Due in ${item.daysUntilDue} days` :
                                `Due on ${item.dueDateFormatted}`;

                        upcomingHtml += `
                        <div class="alert alert-${statusColor} border-0 rounded-4 p-3 mb-2">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="fw-bold">${item.age}</div>
                                    <div class="x-small">${statusText}</div>
                                </div>
                                <span class="badge bg-${statusColor}">${item.vaccines.length} vaccines</span>
                            </div>
                        </div>`;
                    });

                    upcomingList.html(upcomingHtml);
                } else {
                    upcomingSection.addClass('d-none');
                }
            }

            // Full Schedule
            const scheduleContainer = $('#vaccination-schedule');
            let scheduleHtml = '';

            schedule.forEach(item => {
                const allCompleted = item.vaccines.every(v =>
                    Companion.Vaccination.isCompleted(item.id, v.name)
                );

                scheduleHtml += `
                <div class="modern-card p-3 mb-3 ${allCompleted ? 'bg-success bg-opacity-10' : ''}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <h6 class="fw-bold mb-0">${item.age}</h6>
                            ${allCompleted ? '<span class="badge bg-success small"><i class="bi bi-check-circle"></i> Completed</span>' : ''}
                        </div>
                    </div>
                    <div class="vaccine-list">`;

                item.vaccines.forEach(vaccine => {
                    const isCompleted = Companion.Vaccination.isCompleted(item.id, vaccine.name);
                    scheduleHtml += `
                    <div class="form-check p-2 mb-1">
                        <input class="form-check-input vaccine-checkbox" type="checkbox" 
                            ${isCompleted ? 'checked' : ''} 
                            data-schedule="${item.id}" 
                            data-vaccine="${vaccine.name}" 
                            id="vaccine-${item.id}-${vaccine.name.replace(/[^a-zA-Z0-9]/g, '')}">
                        <label class="form-check-label small ${isCompleted ? 'text-muted text-decoration-line-through' : 'fw-bold'}" 
                            for="vaccine-${item.id}-${vaccine.name.replace(/[^a-zA-Z0-9]/g, '')}">
                            <div>${vaccine.name}</div>
                            <div class="x-small text-muted">${vaccine.description}</div>
                        </label>
                    </div>`;
                });

                scheduleHtml += `
                    </div>
                </div>`;
            });


            scheduleContainer.html(scheduleHtml);
        },

        renderRecoveryUI: function () {
            const profile = Companion.Recovery.getProfile();
            const profileDisplay = $('#recovery-profile-display');
            const profileForm = $('#recovery-profile-form');

            // Profile Section
            if (profile) {
                const days = Companion.Recovery.getDaysPostpartum();
                const milestone = Companion.Recovery.getRecoveryMilestone();

                $('#delivery-type-display').text(profile.deliveryType === 'normal' ? 'Normal Delivery' : 'C-Section');
                $('#days-postpartum-display').text(days + ' days');
                $('#recovery-phase-display').text(milestone ? `${milestone.phase} - ${milestone.message}` : '-');

                profileDisplay.removeClass('d-none');
                profileForm.addClass('d-none');
            } else {
                profileDisplay.addClass('d-none');
                profileForm.removeClass('d-none');
            }

            // Checklist
            const checklist = Companion.Recovery.getChecklist();
            const checklistContainer = $('#recovery-checklist');
            let checklistHtml = '';

            const essential = checklist.filter(i => i.category === 'essential');
            const optional = checklist.filter(i => i.category === 'optional');
            const mental = checklist.filter(i => i.category === 'mental');

            if (essential.length > 0) {
                checklistHtml += '<div class="mb-3"><div class="x-small fw-bold text-muted mb-2">ESSENTIAL</div>';
                essential.forEach(item => {
                    checklistHtml += `
                    <div class="form-check p-2 mb-1">
                        <input class="form-check-input recovery-checklist-item" type="checkbox" 
                            ${item.checked ? 'checked' : ''} 
                            data-id="${item.id}" 
                            id="recovery-${item.id}">
                        <label class="form-check-label small ${item.checked ? 'text-muted text-decoration-line-through' : 'fw-bold'}" 
                            for="recovery-${item.id}">
                            ${item.text}
                        </label>
                    </div>`;
                });
                checklistHtml += '</div>';
            }

            if (optional.length > 0) {
                checklistHtml += '<div class="mb-3"><div class="x-small fw-bold text-muted mb-2">RECOMMENDED</div>';
                optional.forEach(item => {
                    checklistHtml += `
                    <div class="form-check p-2 mb-1">
                        <input class="form-check-input recovery-checklist-item" type="checkbox" 
                            ${item.checked ? 'checked' : ''} 
                            data-id="${item.id}" 
                            id="recovery-${item.id}">
                        <label class="form-check-label small ${item.checked ? 'text-muted text-decoration-line-through' : ''}" 
                            for="recovery-${item.id}">
                            ${item.text}
                        </label>
                    </div>`;
                });
                checklistHtml += '</div>';
            }

            if (mental.length > 0) {
                checklistHtml += '<div class="mb-3"><div class="x-small fw-bold text-muted mb-2">MENTAL HEALTH</div>';
                mental.forEach(item => {
                    checklistHtml += `
                    <div class="form-check p-2 mb-1">
                        <input class="form-check-input recovery-checklist-item" type="checkbox" 
                            ${item.checked ? 'checked' : ''} 
                            data-id="${item.id}" 
                            id="recovery-${item.id}">
                        <label class="form-check-label small ${item.checked ? 'text-muted text-decoration-line-through' : ''}" 
                            for="recovery-${item.id}">
                            ${item.text}
                        </label>
                    </div>`;
                });
                checklistHtml += '</div>';
            }

            checklistContainer.html(checklistHtml);

            // Recent Logs
            const logs = Companion.Recovery.getLogs().slice(0, 7);
            const logsContainer = $('#recovery-logs-list');
            let logsHtml = '';

            if (logs.length === 0) {
                logsHtml = '<div class="text-center py-4 text-muted small">No logs yet. Start tracking your recovery!</div>';
            } else {
                logs.forEach(log => {
                    const moodEmoji = { good: '😊', okay: '😐', low: '😔', depressed: '😢' }[log.mood] || '😐';
                    const moodColor = { good: 'success', okay: 'info', low: 'warning', depressed: 'danger' }[log.mood] || 'secondary';
                    const bleedingColor = { light: 'success', moderate: 'warning', heavy: 'danger' }[log.bleedingLevel] || 'secondary';

                    logsHtml += `
                    <div class="modern-card p-3 mb-2">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <div class="fw-bold">${dayjs(log.timestamp).format('MMM D, YYYY')}</div>
                                <div class="x-small text-muted">${dayjs(log.timestamp).format('h:mm A')}</div>
                            </div>
                            <button class="btn btn-link text-danger p-0 delete-recovery-log" data-id="${log.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <div class="row g-2">
                            <div class="col-4">
                                <div class="x-small text-muted">Pain</div>
                                <div class="badge bg-${log.painLevel >= 7 ? 'danger' : log.painLevel >= 4 ? 'warning' : 'success'}">${log.painLevel}/10</div>
                            </div>
                            <div class="col-4">
                                <div class="x-small text-muted">Mood</div>
                                <div class="badge bg-${moodColor}">${moodEmoji}</div>
                            </div>
                            <div class="col-4">
                                <div class="x-small text-muted">Bleeding</div>
                                <div class="badge bg-${bleedingColor}">${log.bleedingLevel}</div>
                            </div>
                        </div>
                    </div>`;
                });
            }


            logsContainer.html(logsHtml);
        },

        renderSmartInsights: function () {
            if (!Companion.Insights) return;

            const insights = Companion.Insights.getActiveInsights();
            const container = $('#smart-insights-container');

            if (insights.length === 0) {
                container.html('');
                return;
            }

            let html = '';

            insights.forEach(insight => {
                const hasAction = insight.action && insight.actionLabel;
                const iconClass = insight.icon || 'bi-lightbulb';
                const colorClass = insight.color || 'info';

                html += `
                <div class="modern-card p-3 mb-3 border-start border-${colorClass} border-4 animate-up" data-insight-id="${insight.id}">
                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <div class="d-flex align-items-start gap-3 flex-grow-1">
                            <i class="bi ${iconClass} fs-4 text-${colorClass}"></i>
                            <div class="flex-grow-1">
                                <h6 class="fw-bold mb-1">${insight.title}</h6>
                                <p class="small mb-2 text-muted">${insight.message}</p>
                                ${hasAction ? `
                                <button class="btn btn-${colorClass} btn-sm rounded-pill px-3 insight-action" data-action="${insight.action}">
                                    ${insight.actionLabel}
                                </button>` : ''}
                            </div>
                        </div>
                        <button class="btn btn-link text-muted p-0 dismiss-insight" data-insight-id="${insight.id}" title="Dismiss">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>`;
            });


            container.html(html);
        },

        renderStorageStats: function () {
            const stats = Companion.Data.getStorageStats();
            $('#storage-item-count').text(stats.itemCount);
            $('#storage-size').text(stats.totalSizeKB + ' KB');
        },

        renderWeeklyMessage: function (week) {
            if (!Companion.Encouragement) return;

            const message = Companion.Encouragement.getWeeklyMessage(week);
            if (!message) return;

            const html = `
                <div class="weekly-message-card d-flex align-items-center">
                    <span class="message-icon">💝</span>
                    <p class="message-text flex-grow-1">${message}</p>
                </div>`;

            // Insert after smart insights
            $('#smart-insights-container').after(html);
        },

        renderEncouragementBanner: function () {
            if (!Companion.Encouragement) return;

            const shouldShow = Companion.Encouragement.shouldShowBanner();
            if (!shouldShow) {
                $('#encouragement-banner').addClass('d-none');
                return;
            }

            const message = Companion.Encouragement.getRandomEncouragement();
            const html = `
                <div class="encouragement-content">
                    <div class="encouragement-title">
                        <span>💕</span>
                        <span>You are doing great!</span>
                    </div>
                    <p class="encouragement-message">${message}</p>
                </div>
                <button class="encouragement-close" id="close-encouragement">
                    <i class="bi bi-x"></i>
                </button>`;


            $('#encouragement-banner').html(html).removeClass('d-none');
        },

        renderSymptomsUI: function () {
            if (!Companion.Symptoms) return;

            const symptoms = Companion.Symptoms.getPredefinedSymptoms();
            const todayLog = Companion.Symptoms.getTodayLog();
            const alerts = Companion.Symptoms.checkForAlerts();
            const summary = Companion.Symptoms.getWeeklySummary();

            // Render symptom buttons
            const buttonsContainer = $('#symptom-buttons');
            let buttonsHtml = '';

            symptoms.forEach(symptom => {
                const logged = todayLog.symptoms.find(s => s.id === symptom.id);
                const btnClass = logged ? 'btn-success' : 'btn-outline-primary';

                buttonsHtml += `
                <button class="btn ${btnClass} rounded-pill d-flex align-items-center justify-content-between symptom-btn" 
                    data-symptom-id="${symptom.id}" data-symptom-name="${symptom.name}">
                    <span><span class="me-2">${symptom.icon}</span>${symptom.name}</span>
                    ${logged ? `<span class="badge bg-white text-success">${logged.severity}/5</span>` : ''}
                </button>`;
            });

            buttonsContainer.html(buttonsHtml);

            // Render alerts
            const alertsContainer = $('#symptom-alerts');
            let alertsHtml = '';

            alerts.forEach(alert => {
                alertsHtml += `
                <div class="alert alert-${alert.type} border-0 rounded-4 p-3 mb-3">
                    <div class="d-flex align-items-start gap-2">
                        <i class="bi bi-${alert.urgent ? 'exclamation-triangle-fill' : 'info-circle'} fs-5"></i>
                        <div>
                            <strong>${alert.title}</strong>
                            <p class="small mb-0 mt-1">${alert.message}</p>
                        </div>
                    </div>
                </div>`;
            });

            alertsContainer.html(alertsHtml);

            // Render today's logged symptoms
            const todayList = $('#today-symptoms-list');
            let todayHtml = '';

            if (todayLog.symptoms.length > 0) {
                todayHtml = '<h6 class="fw-bold mb-3">Today\'s Logged Symptoms</h6>';
                todayLog.symptoms.forEach(symptom => {
                    const severityColor = symptom.severity >= 4 ? 'danger' : symptom.severity >= 3 ? 'warning' : 'success';
                    todayHtml += `
                    <div class="modern-card p-3 mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fw-bold">${symptom.name}</div>
                                <div class="x-small text-muted">Severity: ${symptom.severity}/5</div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-${severityColor}">${symptom.severity}/5</span>
                                <button class="btn btn-link text-danger p-0 remove-symptom" data-symptom-id="${symptom.id}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>`;
                });
            }

            todayList.html(todayHtml);

            // Render weekly summary
            const statsContainer = $('#weekly-summary-stats');
            let statsHtml = `
                <div class="col-6">
                    <div class="p-3 bg-light rounded-4">
                        <div class="x-small text-muted">Total Symptoms</div>
                        <div class="fw-bold fs-4">${summary.totalSymptoms}</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-3 bg-light rounded-4">
                        <div class="x-small text-muted">Unique Types</div>
                        <div class="fw-bold fs-4">${summary.uniqueSymptoms}</div>
                    </div>
                </div>`;

            statsContainer.html(statsHtml);

            // Most frequent
            const mostFrequentContainer = $('#most-frequent-symptom');
            if (summary.mostFrequent) {
                mostFrequentContainer.html(`
                    <div class="alert alert-info border-0 rounded-4 p-3">
                        <strong>Most Frequent:</strong> ${summary.mostFrequent} (${summary.mostFrequentCount} times this week)
                    </div>`);
            } else {
                mostFrequentContainer.html('<p class="text-muted small">No symptoms logged this week.</p>');
            }

            // Render chart
            this.renderSymptomChart();
        },

        renderSymptomChart: function () {
            const chartData = Companion.Symptoms.getChartData();
            const ctx = document.getElementById('symptom-chart');

            if (!ctx) return;

            // Destroy existing chart if any
            if (window.symptomChart) {
                window.symptomChart.destroy();
            }

            window.symptomChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            ticks: {
                                stepSize: 1
                            },
                            title: {
                                display: true,
                                text: 'Severity'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        }
                    }
                }
            });
        },

        renderWaterUI: function () {
            if (!Companion.Water) return;

            const progress = Companion.Water.getTodayProgress();
            const status = Companion.Water.getHydrationStatus();
            const weeklyAvg = Companion.Water.getWeeklyAverage();
            const weeklyGoalPct = Companion.Water.getWeeklyGoalPercentage();

            // Update count and goal
            $('#water-count').text(progress.glasses);
            $('#water-goal-text').text(`of ${progress.goal} glasses`);

            // Update progress bar
            $('#water-progress-bar').css('width', progress.percentage + '%');
            $('#water-progress-bar').attr('aria-valuenow', progress.percentage);
            $('#water-progress-text').text(progress.percentage + '%');

            // Update status message
            $('#hydration-status').html(`
                <div class="alert alert-${status.color} border-0 rounded-4 p-3 mb-0">
                    <strong>${status.message}</strong>
                </div>`);

            // Get trimester for tip
            const profile = Companion.Data.get('profile');
            let trimester = 2; // Default
            if (profile && profile.lmp) {
                const weeks = dayjs().diff(dayjs(profile.lmp), 'week');
                if (weeks <= 12) trimester = 1;
                else if (weeks <= 27) trimester = 2;
                else trimester = 3;
            }

            // Update tip
            const tip = Companion.Water.getTrimesterTip(trimester);
            $('#hydration-tip').html(`
                <div class="d-flex align-items-start gap-2">
                    <i class="bi bi-lightbulb fs-5"></i>
                    <div class="small">${tip}</div>
                </div>`);

            // Update weekly summary
            $('#weekly-avg').text(weeklyAvg);
            $('#weekly-goal-pct').text(weeklyGoalPct + '%');

            // Render chart
            this.renderWaterChart();
        },

        renderWaterChart: function () {
            const chartData = Companion.Water.getChartData();
            const ctx = document.getElementById('water-chart');

            if (!ctx) return;

            // Destroy existing chart if any
            if (window.waterChart) {
                window.waterChart.destroy();
            }

            window.waterChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function (context) {
                                    return context.dataset.label + ': ' + context.parsed.y + ' glasses';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            },
                            title: {
                                display: true,
                                text: 'Glasses'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        }
                    }
                }
            });
        },

        renderBumpTrackerUI: function () {
            if (!Companion.Bump) return;

            const photos = Companion.Bump.getPhotos();
            const gallery = $('#bump-gallery');
            const weekSelect = $('#bump-week-input');
            const compareSelect1 = $('#compare-week-1');
            const compareSelect2 = $('#compare-week-2');

            // Populate week selector (4 to 42 weeks)
            let weekOptions = '<option value="" disabled selected>Week</option>';
            for (let i = 4; i <= 42; i++) {
                weekOptions += `<option value="${i}">Week ${i}</option>`;
            }
            if (weekSelect.children('option').length <= 1) {
                weekSelect.html(weekOptions);
                compareSelect1.html('<option value="">Select Week</option>');
                compareSelect2.html('<option value="">Select Week</option>');
            }

            // Render Gallery
            let galleryHtml = '';
            if (photos.length === 0) {
                galleryHtml = `
                <div class="col-12 text-center py-5">
                    <div class="text-muted display-1 mb-3">🤰</div>
                    <h5>Start Your Journey</h5>
                    <p class="small text-muted">Upload your first bump photo to start tracking your progress!</p>
                </div>`;
            } else {
                photos.forEach(photo => {
                    galleryHtml += `
                    <div class="col">
                        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative group-hover">
                            <img src="${photo.image}" class="card-img-top object-fit-cover" style="height: 180px;" alt="Week ${photo.week}">
                            <div class="card-body p-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="badge bg-accent-pink">Week ${photo.week}</span>
                                    <small class="text-muted">${dayjs(photo.date).format('MMM D')}</small>
                                </div>
                                <p class="card-text small text-truncate mb-0">${photo.caption}</p>
                            </div>
                            <button class="btn btn-sm btn-white position-absolute top-0 end-0 m-2 rounded-circle shadow-sm delete-bump-photo" 
                                data-id="${photo.id}" style="width: 30px; height: 30px; padding: 0;">
                                <i class="bi bi-trash text-danger"></i>
                            </button>
                        </div>
                    </div>`;

                    // Update comparison dropdowns if needed
                    if (compareSelect1.find(`option[value="${photo.id}"]`).length === 0) {
                        const option = `<option value="${photo.id}">Week ${photo.week}</option>`;
                        compareSelect1.append(option);
                        compareSelect2.append(option);
                    }
                });
            }
            gallery.html(galleryHtml);

            // Auto-select current week if possible
            const profile = Companion.Data.get('profile');
            if (profile && profile.lmp && weekSelect.val() === null) {
                const currentWeek = Companion.Engine.getGestation(profile.lmp).weeks;
                if (currentWeek >= 4 && currentWeek <= 42) {
                    weekSelect.val(currentWeek);
                }
            }
        },

        renderBumpComparison: function (slot, photoId) {
            const container = $(`#compare-photo-${slot}`);

            if (!photoId) {
                container.html('<span class="text-muted small">Select a week</span>');
                container.css('background-image', 'none');
                return;
            }

            const photo = Companion.Bump.getPhotoById(parseInt(photoId));
            if (photo) {
                container.html('');
                container.css({
                    'background-image': `url('${photo.image}')`,
                    'background-size': 'cover',
                    'background-position': 'center'
                });
                container.append(`<span class="badge bg-white text-dark position-absolute bottom-0 start-50 translate-middle-x mb-2 shadow-sm">Week ${photo.week}</span>`);
            }
        },

        renderJournalUI: function (filterKeyword = null) {
            if (!Companion.Journal) return;

            const entries = Companion.Journal.searchEntries(filterKeyword);
            const moodStats = Companion.Journal.getMoodStats();
            const anxietyAlert = Companion.Journal.getAnxietyAlert();
            const moodOptions = Companion.Journal.getMoodOptions();

            // Render Mood Selection Chips
            let moodChips = '';
            moodOptions.forEach(m => {
                moodChips += `
                    <input type="radio" class="btn-check" name="journal-mood" id="mood-${m.id}" value="${m.id}">
                    <label class="btn btn-outline-light text-dark border shadow-sm rounded-pill m-1" for="mood-${m.id}" style="border-color: ${m.color} !important;">
                        ${m.emoji} ${m.label}
                    </label>
                `;
            });
            $('#journal-mood-selector').html(moodChips);

            // Render Anxiety Alert
            if (anxietyAlert) {
                $('#journal-alert').html(`
                    <div class="alert alert-warning border-0 rounded-4 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3">
                            <i class="bi bi-heart-pulse fs-1 text-warning"></i>
                            <div>
                                <h6 class="fw-bold mb-1">We noticed you've been feeling anxious lately.</h6>
                                <p class="mb-0 small">It's completely normal to feel this way. Consider practicing deep breathing, talking to a loved one, or discussing it with your healthcare provider.</p>
                            </div>
                        </div>
                    </div>
                `).removeClass('d-none');
            } else {
                $('#journal-alert').addClass('d-none');
            }

            // Render Stats & Chart
            if (moodStats) {
                $('#journal-stats').removeClass('d-none');
                $('#journal-total-entries').text(moodStats.total);
                $('#journal-dominant-mood').html(`${moodStats.dominant.emoji} ${moodStats.dominant.label}`);

                this.renderMoodChart();
            } else {
                $('#journal-stats').addClass('d-none');
            }

            // Render Entries List
            const entriesContainer = $('#journal-entries-list');
            let entriesHtml = '';

            if (entries.length === 0) {
                entriesHtml = `
                    <div class="text-center py-5 text-muted">
                        <div class="fs-1 mb-2">📔</div>
                        <p>${filterKeyword ? 'No entries found matching your search.' : 'Your journal is empty. Write your first entry!'}</p>
                    </div>`;
            } else {
                entries.forEach(entry => {
                    const mood = moodOptions.find(m => m.id === entry.mood);
                    entriesHtml += `
                    <div class="modern-card p-3 mb-3 border-start border-4" style="border-color: ${mood ? mood.color : '#ccc'} !important;">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="d-flex align-items-center gap-2">
                                <span class="fs-4">${mood ? mood.emoji : '😐'}</span>
                                <div>
                                    <div class="fw-bold small">${dayjs(entry.date).format('MMMM D, YYYY')}</div>
                                    <div class="x-small text-muted">${entry.time} ${entry.week ? '• Week ' + entry.week : ''}</div>
                                </div>
                            </div>
                            <button class="btn btn-link text-muted p-0 delete-journal-entry" data-id="${entry.id}">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <p class="mb-0 text-break" style="white-space: pre-wrap;">${entry.note}</p>
                    </div>`;
                });
            }
            entriesContainer.html(entriesHtml);
        },

        renderLabVaultUI: function (trimesterFilter = 0, categoryFilter = 'all') {
            if (!Companion.Lab) return;

            let records = Companion.Lab.getRecords();
            const categories = Companion.Lab.getCategories();

            // Filter by Trimester
            if (trimesterFilter > 0) {
                records = records.filter(r => r.trimester === trimesterFilter);
            }

            // Filter by Category
            if (categoryFilter !== 'all') {
                records = records.filter(r => r.category === categoryFilter);
            }

            const listContainer = $('#lab-records-list');
            let html = '';

            if (records.length === 0) {
                html = `
                <div class="text-center py-5 text-muted">
                    <div class="display-1 mb-3">🧬</div>
                    <h5>No Records Found</h5>
                    <p class="small">Add your test results to keep them safe.</p>
                </div>`;
            } else {
                records.forEach(record => {
                    const category = categories.find(c => c.id === record.category) || categories[6];
                    const abnormalBadge = record.isAbnormal ?
                        `<span class="badge bg-danger ms-2"><i class="bi bi-exclamation-circle-fill me-1"></i>Abnormal</span>` : '';

                    html += `
                    <div class="modern-card p-3 mb-3 border-start border-4 ${record.isAbnormal ? 'border-danger' : 'border-primary'}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="d-flex align-items-center mb-1">
                                    <span class="badge bg-white text-muted border shadow-sm me-2">
                                        <i class="bi ${category.icon}"></i> ${category.label}
                                    </span>
                                    <small class="text-muted">${dayjs(record.date).format('MMM D, YYYY')}</small>
                                </div>
                                <h6 class="fw-bold mb-1">${record.testName} ${abnormalBadge}</h6>
                                ${record.resultValue ? `<div class="text-primary fw-bold my-1">${record.resultValue} <small class="text-muted fw-normal">${record.unit}</small></div>` : ''}
                                ${record.notes ? `<p class="small text-muted mb-0 mt-2 fst-italic">"${record.notes}"</p>` : ''}
                            </div>
                            <div class="d-flex flex-column gap-2">
                                ${record.image ? `
                                <button class="btn btn-sm btn-outline-primary rounded-circle" onclick="Companion.UI.viewImage('${record.image}')">
                                    <i class="bi bi-eye"></i>
                                </button>` : ''}
                                <button class="btn btn-sm btn-link text-danger p-0" onclick="if(confirm('Delete record?')) { Companion.Lab.deleteRecord(${record.id}); Companion.UI.renderLabVaultUI(); }">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>`;
                });
            }

            listContainer.html(html);
        },

        renderBirthPlanUI: function () {
            if (!Companion.BirthPlan) return;
            const plan = Companion.BirthPlan.getPlan();

            if (plan) {
                // Populate Form
                $('#bp-delivery-mode').val(plan.deliveryMode);
                $('#bp-pain-relief').val(plan.painRelief);
                $('#bp-dim-lights').prop('checked', plan.dimLights);
                $('#bp-music').prop('checked', plan.music);
                $('#bp-photos').prop('checked', plan.photography);
                $('#bp-skin-to-skin').prop('checked', plan.skinToSkin);
                $('#bp-delayed-cord').prop('checked', plan.delayedCordClamping);
                $('#bp-golden-hour').prop('checked', plan.breastfeedingGoldenHour);
                $('#bp-companion-check').prop('checked', plan.companionAllowed).trigger('change');
                $('#bp-companion-name').val(plan.companionName);
                $('#bp-notes').val(plan.notes);

                // Render Card
                this.renderBirthPlanCard();
            }
        },

        renderBirthPlanCard: function () {
            const summary = Companion.BirthPlan.getSummaryText();
            const profile = Companion.Data.get('profile');
            if (!summary) return;

            const html = `
                <div class="row align-items-center mb-4 border-bottom pb-3">
                    <div class="col-8">
                        <h2 class="fw-bold text-accent-pink mb-0">Birth Plan Preference Card</h2>
                        <div class="text-muted small">Generated on ${dayjs().format('MMMM D, YYYY')}</div>
                    </div>
                     <div class="col-4 text-end">
                        <div class="fw-bold fs-5">${profile ? profile.name : 'Mother'}</div>
                        <div class="small text-muted"> Due: ${profile ? dayjs(profile.dueDate).format('MMM D, YYYY') : 'Unknown'}</div>
                    </div>
                </div>

                <div class="row g-4 bg-light p-3 rounded-4 mb-3">
                    <div class="col-6">
                        <h6 class="fw-bold text-uppercase text-muted x-small ls-1">Delivery Mode</h6>
                        <div class="fs-5 fw-bold text-dark">${summary.mode}</div>
                    </div>
                    <div class="col-6">
                         <h6 class="fw-bold text-uppercase text-muted x-small ls-1">Pain Relief</h6>
                        <div class="fs-5 fw-bold text-dark">${summary.pain}</div>
                    </div>
                </div>

                <div class="mb-4">
                    <h6 class="fw-bold text-primary mb-2"><i class="bi bi-person-check me-2"></i>Birthing Partner</h6>
                    <p class="mb-0 border-start border-3 border-primary ps-3">${summary.companion}</p>
                </div>

                <div class="mb-4">
                     <h6 class="fw-bold text-success mb-2"><i class="bi bi-stars me-2"></i>Environment & Atmosphere</h6>
                     <p class="mb-0 border-start border-3 border-success ps-3">${summary.environment || 'No specific preferences.'}</p>
                </div>

                <div class="mb-4">
                     <h6 class="fw-bold text-info mb-2"><i class="bi bi-heart-pulse me-2"></i>Baby Care (Immediately After Birth)</h6>
                     <ul class="list-unstyled border-start border-3 border-info ps-3">
                        ${summary.immediateCare.split(', ').map(item => item ? `<li class="mb-1"><i class="bi bi-check2-circle me-2"></i>${item}</li>` : '').join('')}
                     </ul>
                </div>

                 ${$('#bp-notes').val() ? `
                <div class="mb-4">
                     <h6 class="fw-bold text-secondary mb-2"><i class="bi bi-pencil me-2"></i>Additional Notes</h6>
                     <p class="fst-italic text-muted border-start border-3 border-secondary ps-3">"${$('#bp-notes').val()}"</p>
                </div>` : ''}
                
                <div class="mt-5 pt-3 border-top text-center text-muted x-small">
                    <p class="mb-0">This document is a guide to my preferences. I trust my medical team to act in the best interest of myself and my baby in case of emergency.</p>
                </div>
            `;

            $('#bp-printable-area').html(html);
        },

        viewImage: function (src) {
            // Simple overlay viewer
            const viewer = $(`
                <div class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center p-4" style="z-index: 9999; cursor: zoom-out;" onclick="$(this).remove()">
                    <img src="${src}" class="img-fluid rounded-4 shadow-lg" style="max-height: 90vh; max-width: 90vw;">
                </div>
            `);
            $('body').append(viewer);
        },

        renderHospitalBagUI: function () {
            if (!Companion.HospitalBag) return;

            const data = Companion.HospitalBag.getData();
            let progress = Companion.HospitalBag.getProgress();
            // Ensure progress is a valid number
            if (isNaN(progress)) progress = 0;

            // Update Progress Bar
            $('#bag-progress-text').text(progress + '%');
            $('#bag-progress-bar').css('width', progress + '%').attr('aria-valuenow', progress);

            let message = 'Time to start packing!';
            if (progress > 25) message = 'Great start! Keep going.';
            if (progress > 50) message = 'Halfway there!';
            if (progress > 75) message = 'Almost ready for the big day!';
            if (progress === 100) message = 'You are all set! 🎒 ready to go!';
            $('#bag-status-message').text(message);

            // Render Lists
            const renderList = (items, containerId, category) => {
                if (!items) return;
                let html = '';
                items.forEach(item => {
                    html += `
                        <label class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 cursor-pointer" onclick="event.stopPropagation(); Companion.HospitalBag.toggleItem('${category}', '${item.id}', !${item.packed}); Companion.UI.renderHospitalBagUI();">
                            <div class="d-flex align-items-center gap-3">
                                <span class="${item.packed ? 'text-decoration-line-through text-muted' : 'fw-bold'}">${item.label}</span>
                            </div>
                            ${item.packed ? '<i class="bi bi-check-circle-fill text-success fs-5"></i>' : '<i class="bi bi-circle text-muted fs-5"></i>'}
                        </label>
                    `;
                });
                $(containerId).html(html);
            };

            renderList(data.mother, '#bag-list-mother', 'mother');
            renderList(data.baby, '#bag-list-baby', 'baby');
            renderList(data.partner, '#bag-list-partner', 'partner');
            renderList(data.documents, '#bag-list-documents', 'documents');
        },

        renderEmergencyCardUI: function () {
            if (!Companion.EmergencyCard) return;

            const data = Companion.EmergencyCard.getData();

            // Populate Display
            $('#ec-name-display').text(data.name || 'Set Name');
            $('#ec-due-display').text(data.dueDate ? `Due: ${dayjs(data.dueDate).format('MMM D, YYYY')}` : 'Due Date Not Set');
            $('#ec-blood-display').text(data.bloodGroup || '--');
            $('#ec-doctor-display').text(data.doctorName || '--');
            $('#ec-alerts-display').text(data.allergies && data.allergies !== 'None' ? data.allergies : 'None listed.');
            $('#ec-contact-display').text(data.emergencyContact || 'No contact set');

            $('#ec-call-btn').attr('href', data.emergencyContact ? `tel:${data.emergencyContact}` : '#');

            // Populate Form
            $('#ec-name').val(data.name);
            $('#ec-blood').val(data.bloodGroup);
            $('#ec-due-date').val(data.dueDate);
            $('#ec-doctor').val(data.doctorName);
            $('#ec-contact').val(data.emergencyContact);
            $('#ec-conditions').val(data.allergies);

            // Show Edit mode if no data
            if (!data.name || !data.emergencyContact) {
                $('#emergency-edit-mode').removeClass('d-none');
                $('#emergency-view-mode').addClass('d-none');
            } else {
                $('#emergency-edit-mode').addClass('d-none');
                $('#emergency-view-mode').removeClass('d-none');
            }
        },

        renderAppointmentPrepUI: function () {
            if (!Companion.AppointmentPrep) return;

            const upcoming = Companion.AppointmentPrep.getUpcomingAppointment();
            const past = Companion.AppointmentPrep.getPastAppointments();
            const today = dayjs().startOf('day');

            // Render Upcoming Card
            if (upcoming) {
                $('#upcoming-appt-card').removeClass('d-none');
                $('#no-upcoming-appt').addClass('d-none');

                $('#appt-doctor-name').text(upcoming.doctorName);
                $('#appt-date').text(dayjs(upcoming.date).format('dddd, MMMM D, YYYY'));

                const daysDiff = dayjs(upcoming.date).diff(today, 'day');
                let badgeText = '';
                let badgeClass = 'bg-info';

                if (daysDiff === 0) {
                    badgeText = 'TODAY';
                    badgeClass = 'bg-danger';
                } else if (daysDiff === 1) {
                    badgeText = 'TOMORROW';
                    badgeClass = 'bg-warning text-dark';
                } else {
                    badgeText = `${daysDiff} Days`;
                }

                $('#appt-days-left').text(badgeText).removeClass('bg-info bg-danger bg-warning text-dark').addClass(badgeClass);

                // Store ID for modals
                $('#upcoming-appt-card').data('id', upcoming.id);

            } else {
                $('#upcoming-appt-card').addClass('d-none');
                $('#no-upcoming-appt').removeClass('d-none');
            }

            // Render Timeline
            const timelineContainer = $('#appt-timeline');
            let timelineHtml = '';

            if (past.length === 0) {
                timelineHtml = '<div class="text-muted small fst-italic py-2">No past visits recorded.</div>';
            } else {
                past.forEach(appt => {
                    timelineHtml += `
                        <div class="mb-4 position-relative">
                            <div class="position-absolute start-0 top-0 translate-middle-x bg-light border border-2 border-primary rounded-circle" style="width: 12px; height: 12px; margin-left: -1px;"></div>
                            <div class="ms-3">
                                <div class="small fw-bold text-muted">${dayjs(appt.date).format('MMM D, YYYY')}</div>
                                <div class="fw-bold">${appt.doctorName} <span class="badge bg-secondary x-small ms-2">${appt.type}</span></div>
                                ${appt.notes ? `<div class="bg-light p-2 rounded-3 mt-2 small text-muted">"${appt.notes}"</div>` : ''}
                                ${appt.symptomSummary ? `<div class="x-small text-info mt-1"><i class="bi bi-paperclip me-1"></i>Symptom Report Attached</div>` : ''}
                            </div>
                        </div>
                    `;
                });
            }
            timelineContainer.html(timelineHtml);
        },

        showApptPrepModal: function () {
            const apptId = $('#upcoming-appt-card').data('id');
            if (!apptId) return;

            const appt = Companion.AppointmentPrep.getData().appointments.find(a => a.id === apptId);
            if (!appt) return;

            // Get Trimester
            const profile = Companion.Data.get('profile');
            let trimester = 1;
            if (profile) {
                const gestation = Companion.Calculator.calculateGestation(profile.lmp);
                trimester = Companion.Calculator.getTrimester(gestation.weeks);
            }
            $('#prep-trimester').text(trimester);

            // Suggestions
            const suggestions = Companion.AppointmentPrep.getSuggestedQuestions(trimester);
            let suggHtml = '';
            suggestions.forEach((q, i) => {
                const isChecked = appt.questions.includes(q);
                suggHtml += `
                    <label class="list-group-item">
                        <input class="form-check-input me-1 appt-question-check" type="checkbox" value="${q}" ${isChecked ? 'checked' : ''}>
                        ${q}
                    </label>
                `;
            });
            $('#suggested-questions-list').html(suggHtml);

            // Custom Notes
            $('#prep-custom-notes').val(appt.notes || '');
            $('#attach-symptoms-switch').prop('checked', appt.symptomsAttached);

            $('#prep-appt-modal').modal('show');
        },

        saveApptPrep: function () {
            const apptId = $('#upcoming-appt-card').data('id');
            if (!apptId) return;

            const questions = [];
            $('.appt-question-check:checked').each(function () {
                questions.push($(this).val());
            });

            const notes = $('#prep-custom-notes').val();
            const attachSymptoms = $('#attach-symptoms-switch').is(':checked');

            // Save
            Companion.AppointmentPrep.updateAppointment(apptId, {
                questions: questions,
                notes: notes,
                symptomsAttached: attachSymptoms
            });

            if (attachSymptoms) {
                Companion.AppointmentPrep.attachSymptomSummary(apptId);
            }

            $('#prep-appt-modal').modal('hide');
            Companion.UI.showAlert('Preparation saved!', 'success');
        },

        completeApptModal: function () {
            const apptId = $('#upcoming-appt-card').data('id');
            if (!apptId) return;
            $('#complete-appt-id').val(apptId);
            const appt = Companion.AppointmentPrep.getData().appointments.find(a => a.id === apptId);
            if (appt) {
                $('#complete-notes').val(appt.notes || ''); // Pre-fill if they saved prep notes
            }
            $('#complete-appt-modal').modal('show');
        },




        renderSleepUI: function () {
            if (!Companion.Sleep) return;

            const todayLogs = Companion.Sleep.getTodayLogs();
            const weeklyAvg = Companion.Sleep.getWeeklyAverage();
            const tip = Companion.Sleep.getRandomTip();

            // Render sleep tip
            $('#sleep-tip').html(`
                <div class="d-flex align-items-start gap-2">
                    <i class="bi bi-moon-stars fs-5"></i>
                    <div class="small">${tip}</div>
                </div>`);

            // Render today's logs
            const logsContainer = $('#today-sleep-logs');
            let logsHtml = '';

            if (todayLogs.length > 0) {
                logsHtml = '<h6 class="fw-bold mb-3">Today\'s Sleep Logs</h6>';
                todayLogs.forEach(log => {
                    const qualityStatus = Companion.Sleep.getSleepQualityStatus(log.quality);
                    logsHtml += `
                    <div class="modern-card p-3 mb-2">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center gap-2 mb-2">
                                    <span class="badge bg-${qualityStatus.color}">${qualityStatus.icon} ${qualityStatus.text}</span>
                                    <span class="badge bg-secondary">${log.durationHours}h</span>
                                </div>
                                <div class="small text-muted">
                                    <i class="bi bi-moon"></i> ${Companion.Sleep.formatTime(log.sleepStart)} → 
                                    <i class="bi bi-sunrise"></i> ${Companion.Sleep.formatTime(log.wakeTime)}
                                </div>
                                ${log.awakenings > 0 ? `<div class="x-small text-muted mt-1"><i class="bi bi-exclamation-circle"></i> ${log.awakenings} awakening(s)</div>` : ''}
                            </div>
                            <button class="btn btn-link text-danger p-0 delete-sleep-log" data-log-id="${log.id}" data-date="${log.date}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>`;
                });
            }

            logsContainer.html(logsHtml);

            // Update weekly summary
            $('#avg-sleep-duration').text(weeklyAvg.avgDuration + 'h');
            $('#avg-sleep-quality').text(weeklyAvg.avgQuality);
            $('#avg-awakenings').text(weeklyAvg.avgAwakenings);

            // Render chart
            this.renderSleepChart();
        },

        renderSleepChart: function () {
            const chartData = Companion.Sleep.getChartData();
            const ctx = document.getElementById('sleep-chart');

            if (!ctx) return;

            // Destroy existing chart if any
            if (window.sleepChart) {
                window.sleepChart.destroy();
            }

            window.sleepChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    if (context.dataset.label.includes('Duration')) {
                                        return context.dataset.label + ': ' + context.parsed.y + ' hours';
                                    } else {
                                        return context.dataset.label + ': ' + context.parsed.y + '/5';
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Hours'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            max: 5,
                            grid: {
                                drawOnChartArea: false
                            },
                            title: {
                                display: true,
                                text: 'Quality (1-5)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        }
                    }
                }
            });
        },

        showAlert: function (msg, type = 'info') {
            const html = `<div class="alert alert-${type} alert-dismissible fade show">
                    ${msg}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>`;
            $('#alert-host').prepend(html);
        },

        renderEngagementUI: function (gestation) {
            // Affirmation
            const text = Companion.Engagement.getDailyAffirmation();
            $(DOM.affirmationText).fadeOut(200, function () {
                $(this).text(`"${text}"`).fadeIn(400);
            });

            // Badges
            const badges = Companion.Engagement.getBadges(gestation.weeks);
            let badgesHtml = '';
            badges.forEach(b => {
                badgesHtml += `
                    <div class="badge ${b.color} d-flex align-items-center gap-1 py-2 px-3 rounded-pill shadow-sm" title="${b.title}">
                        <i class="bi ${b.icon}"></i>
                        <span class="x-small fw-bold">${b.title}</span>
                    </div>`;
            });
            $(DOM.badgesContainer).html(badgesHtml);
        },

        triggerTrimesterCelebration: function (trimester) {
            const lastTrimester = Companion.Data.get('last_trimester_seen', 0);
            if (trimester.num > lastTrimester && lastTrimester !== 0) {
                // Celebration!
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#f06292', '#f8bbd0', '#64b5f6']
                });

                this.showAlert(`<strong>Congratulations!</strong> You've entered the ${trimester.label} Trimester!`, 'success');
            }
            Companion.Data.save('last_trimester_seen', trimester.num);
        }
    };
})();
