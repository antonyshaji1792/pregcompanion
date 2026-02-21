/**
 * ui.js - Orchestrates UI rendering, validation, and user interaction
 */
const UI = {
    selectors: {
        calcForm: '#calc-form',
        resultsSection: '#results-section',
        inputCard: '#input-card',
        dueDate: '#due-date-display',
        currentWeek: '#current-week-display',
        currentDays: '#current-days-display',
        daysRemaining: '#days-remaining',
        trimesterBadge: '#trimester-badge',
        milestonesTimeline: '#milestones-timeline',
        remindersList: '#scan-reminders-list',
        milestoneReminderSettings: '#milestone-reminder-settings',
        btnReset: '#btn-reset',
        notificationModal: '#notificationModal',
        babySizeText: '#baby-size-text',
        babyDescText: '#baby-desc-text',
        progressBar: '#pregnancy-progress-bar',
        progressPercentage: '#progress-percentage',
        daysCountdownText: '#days-countdown-text'
    },

    /**
     * Initialization: Wire up UI events
     */
    init: function () {
        this.wireEvents();
        this.checkAndShowNotifications();
    },

    /**
     * Centralized event wiring
     */
    wireEvents: function () {
        const self = this;

        // Form Submit
        $(this.selectors.calcForm).on('submit', function (e) {
            e.preventDefault();
            self.handleFormSubmit();
        });

        // Reset Button
        $(this.selectors.btnReset).on('click', function () {
            self.resetApp();
        });

        // Other listeners (reminders, etc.)
        // These are handled in app.js or can be moved here for total UI control
    },

    /**
     * Handle Calculation Logic Trigger
     */
    handleFormSubmit: function () {
        const lmp = $('#lmp-date').val();
        const cycle = $('#cycle-length').val();

        if (this.validateInputs(lmp, cycle)) {
            const results = Calculator.calculate(lmp, cycle);
            Storage.savePregnancyData({ lmp, cycle });
            this.renderResults(results);

            // Scroll for mobile
            if ($(window).width() < 768) {
                $('html, body').animate({
                    scrollTop: $(this.selectors.resultsSection).offset().top - 20
                }, 800);
            }
        }
    },

    /**
     * Input Validation with Bootstrap feedback
     */
    validateInputs: function (lmp, cycle) {
        this.clearErrors();
        let isValid = true;

        if (!lmp) {
            this.showError('#lmp-date', 'Please select your Last Period date.');
            isValid = false;
        } else {
            const lmpDate = dayjs(lmp);
            const today = dayjs().startOf('day');

            if (lmpDate.isAfter(today)) {
                this.showError('#lmp-date', 'LMP date cannot be in the future.');
                isValid = false;
            }
        }

        const cycleNum = parseInt(cycle);
        if (isNaN(cycleNum) || cycleNum < 21 || cycleNum > 40) {
            this.showError('#cycle-length', 'Cycle length must be between 21 and 40 days.');
            isValid = false;
        }

        return isValid;
    },

    showError: function (selector, message) {
        const input = $(selector);
        input.addClass('is-invalid');
        // Prevent double error messages
        input.siblings('.invalid-feedback').remove();
        input.after(`<div class="invalid-feedback fw-bold">${message}</div>`);
    },

    clearErrors: function () {
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').remove();
    },

    /**
     * Render the result dashboard
     */
    renderResults: function (data) {
        // Special Case: Pregnancy > 42 weeks (Delivery)
        if (data.totalWeeks >= 42) {
            this.showDeliveryMessage(data);
            return;
        }

        $(this.selectors.dueDate).text(data.formattedDueDate);
        $(this.selectors.currentWeek).text(data.totalWeeks);
        $(this.selectors.currentDays).text(data.remainingDays);
        $(this.selectors.daysRemaining).text(data.daysRemaining);
        $(this.selectors.daysCountdownText).text(data.daysRemaining);

        // Progress Logic
        const totalProgress = Math.min(100, (data.totalWeeks / 40) * 100);
        $(this.selectors.progressBar).css('width', `${totalProgress}%`);
        $(this.selectors.progressPercentage).text(Math.round(totalProgress));

        // Trimester Color Coding
        const badge = $(this.selectors.trimesterBadge);
        badge.text(`${data.trimester} Trimester`);

        // Reset classes
        badge.removeClass('bg-warning bg-info bg-success bg-secondary text-dark text-white');

        if (data.trimester === "First") {
            badge.addClass('bg-warning text-dark');
        } else if (data.trimester === "Second") {
            badge.addClass('bg-info text-white');
        } else {
            badge.addClass('bg-success text-white');
        }

        // Confetti for 12 weeks
        if (data.totalWeeks === 12) {
            this.launchConfetti();
        }

        // Sub-renders
        this.renderMilestones(data.totalWeeks, data.lmp);
        this.renderMilestoneSettings(data.lmp);
        this.renderReminders();
        this.renderBabyInfo(data.totalWeeks);

        this.revealResults();
    },

    launchConfetti: function () {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f06292', '#42a5f5', '#ffffff']
            });
        }
    },

    renderBabyInfo: function (week) {
        const info = WeeklyTracker.getInfo(week);
        $(this.selectors.babySizeText).text(info.size);
        $(this.selectors.babyDescText).text(info.desc);
    },

    showDeliveryMessage: function (data) {
        let html = `
            <div class="medical-card text-center py-5 border-start border-5 border-success">
                <div class="display-1 mb-3">🎉</div>
                <h2 class="h3 fw-bold mb-3">Congratulations!</h2>
                <p class="lead text-muted mb-4">Your pregnancy has reached ${data.totalWeeks} weeks. Based on your LMP (${dayjs(data.lmp).format('MMM D, YYYY')}), your baby has likely arrived!</p>
                <div class="stat-card d-inline-block px-4 py-2">
                    <span class="stat-label">Estimated Delivery</span>
                    <div class="stat-value">${data.formattedDueDate}</div>
                </div>
                <div class="mt-4">
                    <button class="btn btn-outline-primary" id="btn-restart">Start New Tracker</button>
                </div>
            </div>
        `;
        $(this.selectors.resultsSection).html(html).removeClass('d-none').hide().fadeIn(600);

        $('#btn-restart').on('click', () => this.resetApp());
    },

    revealResults: function () {
        $(this.selectors.resultsSection)
            .hide()
            .removeClass('d-none')
            .fadeIn(400);
    },

    renderMilestones: function (week, lmpDate) {
        const milestones = Milestones.generateForLMP(lmpDate);
        let html = '';
        const today = dayjs().startOf('day');
        let foundUpcoming = false;

        milestones.forEach(m => {
            const milestoneDate = dayjs(m.date);
            const isPast = milestoneDate.isBefore(today);
            const isUpcoming = !isPast && !foundUpcoming;
            if (isUpcoming) foundUpcoming = true;

            html += `
                <div class="timeline-item ${isUpcoming ? 'upcoming-milestone' : ''}">
                    <div class="timeline-dot" style="background: ${isPast ? '#27ae60' : (isUpcoming ? 'var(--accent-pink)' : '#cbd5e0')}"></div>
                    <div class="timeline-content" style="${isUpcoming ? 'border: 2px solid var(--accent-pink); background: #fffafb;' : ''}">
                        <div class="d-flex justify-content-between">
                            <div class="timeline-week">WEEK ${m.week}</div>
                            <div class="small fw-600 ${isPast ? 'text-success' : 'text-muted'}">${m.formattedDate}</div>
                        </div>
                        <h4 class="h6 mb-1">${m.title}</h4>
                        ${isUpcoming ? '<span class="badge bg-danger mb-0" style="font-size: 0.65rem;">NEXT MILESTONE</span>' : ''}
                    </div>
                </div>
            `;
        });
        $(this.selectors.milestonesTimeline).html(html);
    },

    renderReminders: function () {
        const upcoming = Reminders.getUpcoming(5);
        let html = '';
        upcoming.forEach(r => {
            if (r.id.startsWith('custom_')) {
                html += `
                    <div class="reminder-item">
                        <div class="reminder-icon"><i class="bi bi-calendar-check"></i></div>
                        <div class="text-start flex-grow-1">
                            <div class="fw-bold small">${r.title}</div>
                            <div class="text-muted" style="font-size: 0.75rem;">${dayjs(r.eventDate).format('MMM D, YYYY')}</div>
                        </div>
                        <button class="btn btn-sm text-danger delete-reminder" data-id="${r.id}"><i class="bi bi-trash"></i></button>
                    </div>
                `;
            }
        });
        $(this.selectors.remindersList).html(html || '<p class="text-muted small">No custom reminders.</p>');
    },

    renderMilestoneSettings: function (lmpDate) {
        const milestones = Milestones.generateForLMP(lmpDate);
        const savedReminders = Reminders.getAll();
        let html = '';
        milestones.forEach(m => {
            const saved = savedReminders.find(r => r.id === `ms_${m.week}`);
            const enabled = saved ? saved.reminderEnabled : false;
            const days = saved ? saved.remindBeforeDays : 1;
            html += `
                <div class="mb-3 p-2 border-bottom">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="small fw-bold">${m.title}</span>
                        <div class="form-check form-switch">
                            <input class="form-check-input milestone-toggle" type="checkbox" 
                                data-week="${m.week}" data-title="${m.title}" data-date="${m.date}" ${enabled ? 'checked' : ''}>
                        </div>
                    </div>
                    <div class="d-flex align-items-center ${enabled ? '' : 'd-none'}" id="settings-ms-${m.week}">
                        <span class="small text-muted me-2">Remind me</span>
                        <select class="form-select form-select-sm milestone-days" data-week="${m.week}" style="width: auto;">
                            <option value="1" ${days == 1 ? 'selected' : ''}>1 day before</option>
                            <option value="2" ${days == 2 ? 'selected' : ''}>2 days before</option>
                            <option value="3" ${days == 3 ? 'selected' : ''}>3 days before</option>
                            <option value="7" ${days == 7 ? 'selected' : ''}>7 days before</option>
                        </select>
                    </div>
                </div>
            `;
        });
        $(this.selectors.milestoneReminderSettings).html(html);
    },

    checkAndShowNotifications: function () {
        const alerts = Reminders.checkNotifications();
        if (alerts.length > 0) {
            let message = '<strong>Upcoming Events:</strong><br>';
            alerts.forEach(a => { message += `• ${a.title} (on ${dayjs(a.eventDate).format('MMM D')})<br>`; });
            $('#notification-message').html(message);
            new bootstrap.Modal(document.querySelector(this.selectors.notificationModal)).show();
        }
    },

    resetApp: function () {
        $(this.selectors.resultsSection).fadeOut(400, () => {
            $(this.selectors.resultsSection).addClass('d-none');
            $(this.selectors.calcForm)[0].reset();
            this.clearErrors();
        });
        Storage.clearPregnancyData();
    }
};
