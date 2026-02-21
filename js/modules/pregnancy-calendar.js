/**
 * pregnancy-calendar.js - Premium Lightweight Monthly Calendar
 * Namespace: Companion.Calendar
 */
window.Companion = window.Companion || {};

Companion.Calendar = (function () {
    const calendarState = {
        currentDate: dayjs(),
        selectedDate: dayjs(),
        viewMode: 'month', // 'month' or 'week'
        showHeatmap: false
    };

    const calendarGridId = '#calendar-grid-premium';

    return {
        init: function () {
            this.render();
            this.renderTimeline();
            $('#heatmap-toggle').on('click', () => this.toggleHeatmap());
        },

        toggleHeatmap: function () {
            calendarState.showHeatmap = !calendarState.showHeatmap;
            $('#heatmap-toggle').toggleClass('btn-dark btn-accent');
            this.render();
        },

        prev: function () {
            calendarState.currentDate = calendarState.currentDate.subtract(1, calendarState.viewMode === 'week' ? 'week' : 'month');
            this.render();
        },

        next: function () {
            calendarState.currentDate = calendarState.currentDate.add(1, calendarState.viewMode === 'week' ? 'week' : 'month');
            this.render();
        },

        setView: function (mode) {
            calendarState.viewMode = mode;
            this.render();
        },

        getAllEvents: function () {
            const events = {}; // date -> []
            const addEvent = (date, evt) => {
                if (!events[date]) events[date] = [];
                events[date].push(evt);
            };

            // 1. Appointments
            if (Companion.AppointmentPrep) {
                const appts = Companion.AppointmentPrep.getData().appointments || [];
                appts.forEach(a => {
                    addEvent(a.date, { type: 'doctor', title: `Dr. Visit: ${a.doctorName}`, color: 'primary', icon: 'bi-person-badge' });
                });
            }

            // 2. Supplements
            if (Companion.Supplements) {
                const logs = Companion.Supplements.getLogs() || {};
                Object.keys(logs).forEach(date => {
                    if (logs[date].taken) {
                        addEvent(date, { type: 'supplement', title: 'Supplements Taken', color: 'success', icon: 'bi-capsule' });
                    }
                });
            }

            // 3. Symptoms
            if (Companion.Symptoms) {
                const logs = Companion.Symptoms.getLogs() || {};
                Object.keys(logs).forEach(date => {
                    const count = logs[date].symptoms?.length || 0;
                    if (count > 0) {
                        addEvent(date, { type: 'symptom', title: `${count} Symptoms Logged`, color: 'warning', icon: 'bi-bandaid' });
                    }
                });
            }

            // 4. Milestones (if Pregnancy)
            const profile = Companion.Data.get('profile');
            if (profile && profile.stage === 'pregnancy' && profile.lmp) {
                const milestones = Companion.Milestones.generateFromLMP(profile.lmp);
                milestones.forEach(m => {
                    addEvent(m.date, { type: 'milestone', title: m.title, color: 'danger', icon: 'bi-star-fill' });
                });
            }

            // 5. Water Goal Met?
            if (Companion.Water) {
                const logs = Companion.Water.getLogs() || {};
                Object.keys(logs).forEach(date => {
                    if (logs[date].glasses >= logs[date].goal) {
                        addEvent(date, { type: 'water', title: 'Hydration Goal Met', color: 'info', icon: 'bi-droplet-fill' });
                    }
                });
            }

            // 6. Custom Reminders
            if (Companion.Reminders) {
                const reminders = Companion.Reminders.getAll() || [];
                reminders.forEach(r => {
                    addEvent(r.date, {
                        type: r.type || 'custom',
                        title: r.title,
                        color: 'primary',
                        icon: r.type === 'doctor' ? 'bi-person-badge' : (r.type === 'scan' ? 'bi-camera' : 'bi-bell')
                    });
                });
            }

            return events;
        },

        render: function () {
            const current = calendarState.currentDate;
            let start, end;

            if (calendarState.viewMode === 'month') {
                start = current.startOf('month').startOf('week');
                end = current.endOf('month').endOf('week');
                $('#cal-month-year').text(current.format('MMMM YYYY'));
            } else {
                start = current.startOf('week');
                end = current.endOf('week');
                $('#cal-month-year').text(`Week of ${start.format('MMM D')}`);
            }

            const allEvents = this.getAllEvents();
            let html = '';
            let day = start;

            while (day.isBefore(end) || day.isSame(end, 'day')) {
                const dateStr = day.format('YYYY-MM-DD');
                const isToday = day.isSame(dayjs(), 'day');
                const isCurrentMonth = calendarState.viewMode === 'month' ? (day.month() === current.month()) : true;
                const dayEvents = allEvents[dateStr] || [];

                // Determine specialty styling
                let classes = 'calendar-day-v2';
                if (!isCurrentMonth) classes += ' opacity-25';
                if (isToday) classes += ' today';

                // Heatmap logic
                if (calendarState.showHeatmap && dayEvents.length > 0) {
                    const intensity = dayEvents.length >= 3 ? 'high' : (dayEvents.length >= 2 ? 'mid' : 'low');
                    classes += ` heatmap-${intensity}`;
                }

                // Milestone highlighting
                const hasMilestone = dayEvents.some(e => e.type === 'milestone');
                const hasDoctor = dayEvents.some(e => e.type === 'doctor');

                if (hasMilestone) classes += ' milestone-highlight';
                if (hasDoctor) classes += ' doctor-highlight';

                html += `
                <div class="${classes}" data-date="${dateStr}" onclick="Companion.Calendar.selectDate('${dateStr}')">
                    ${day.date()}
                </div>`;

                day = day.add(1, 'day');
            }

            $(calendarGridId).html(html);
            this.renderMilestones(current);
            this.renderMini();
        },

        renderMini: function () {
            const container = $('#mini-calendar-grid');
            if (!container.length) return;

            const today = dayjs();
            const start = today.startOf('month').startOf('week');
            const end = today.endOf('month').endOf('week');
            const allEvents = this.getAllEvents();

            // Month name header (spans all 7 columns via wrapper)
            const monthHeader = `
                <div class="mini-month-header">
                    <span class="mini-month-name">${today.format('MMMM YYYY')}</span>
                </div>`;

            // Day-of-week labels
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                .map(d => `<div class="mini-day-label">${d}</div>`).join('');

            let dayCells = '';
            let day = start;

            while (day.isBefore(end) || day.isSame(end, 'day')) {
                const dateStr = day.format('YYYY-MM-DD');
                const isToday = day.isSame(today, 'day');
                const isCurrentMonth = day.month() === today.month();
                const hasEvent = allEvents[dateStr] && allEvents[dateStr].length > 0;

                let classes = 'mini-day';
                if (!isCurrentMonth) classes += ' opacity-25';
                if (isToday) classes += ' today';
                if (hasEvent) classes += ' has-event';

                dayCells += `<div class="${classes}" onclick="Companion.Calendar.selectDate('${dateStr}')">${day.date()}</div>`;
                day = day.add(1, 'day');
            }

            container.html(monthHeader + `<div class="mini-calendar-inner">${dayLabels}${dayCells}</div>`);
        },

        renderMilestones: function (currentMonth) {
            const container = $('#calendar-milestones');
            const allEvents = this.getAllEvents();
            const start = currentMonth.startOf('month');
            const end = currentMonth.endOf('month');

            let html = '';
            let milestoneDates = Object.keys(allEvents).filter(d =>
                dayjs(d).isSame(currentMonth, 'month') &&
                allEvents[d].some(e => e.type === 'milestone' || e.type === 'doctor')
            );

            milestoneDates.sort((a, b) => dayjs(a).diff(dayjs(b))).forEach(d => {
                const evts = allEvents[d].filter(e => e.type === 'milestone' || e.type === 'doctor');
                evts.forEach(e => {
                    html += `
                    <div class="premium-card p-3 d-flex align-items-center gap-3">
                        <div class="tile-icon bg-light text-primary m-0" style="width: 45px; height: 45px;">
                            <i class="bi ${e.icon}"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-bold">${e.title}</div>
                            <div class="subtitle x-small">${dayjs(d).format('dddd, MMM D')}</div>
                        </div>
                    </div>`;
                });
            });

            if (html === '') html = '<div class="text-center py-4 text-muted small">No major milestones this month</div>';
            container.html(html);
        },

        selectDate: function (dateStr) {
            calendarState.selectedDate = dayjs(dateStr);
            const date = calendarState.selectedDate;
            const allEvents = this.getAllEvents();
            const dayEvents = allEvents[dateStr] || [];

            // Update Modal Title
            $('#day-detail-title').text(date.format('MMMM D, YYYY'));

            // Build Events List
            let html = '';
            if (dayEvents.length === 0) {
                html = '<div class="text-center py-3 text-muted small">No logs or events for this day.</div>';
            } else {
                dayEvents.forEach(e => {
                    html += `
                    <div class="d-flex align-items-center gap-3 p-3 bg-light rounded-20">
                        <div class="tile-icon bg-white text-primary shadow-sm m-0" style="width: 40px; height: 40px;">
                            <i class="bi ${e.icon || 'bi-calendar-event'}"></i>
                        </div>
                        <div>
                            <div class="fw-bold small">${e.title}</div>
                            <div class="x-small text-muted">${e.type.toUpperCase()}</div>
                        </div>
                    </div>`;
                });
            }

            $('#day-events-list').html(html);

            // Show Modal
            const modal = new bootstrap.Modal(document.getElementById('dayDetailModal'));
            modal.show();
        },

        addQuickReminder: function () {
            const title = $('#quick-reminder-title').val().trim();
            const type = $('#quick-reminder-type').val();
            const date = calendarState.selectedDate.format('YYYY-MM-DD');

            if (!title) {
                Companion.UI.showAlert('Please enter a reminder title.', 'warning');
                return;
            }

            if (Companion.Reminders) {
                Companion.Reminders.add(title, date, type);
                $('#quick-reminder-title').val('');

                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('dayDetailModal')).hide();

                // Refresh UI
                this.render();
                Companion.UI.showAlert('Reminder added successfully!', 'success');
            }
        },

        renderTimeline: function () {
            const profile = Companion.Data.get('profile');
            if (!profile || profile.stage !== 'pregnancy' || !profile.lmp) {
                $('#pregnancy-timeline-container').hide();
                return;
            }

            $('#pregnancy-timeline-container').show();
            const timeline = Companion.Engine.getTimeline(profile.lmp);
            let html = '';

            timeline.forEach(row => {
                const trClass = row.isToday ? 'timeline-row-today' : '';
                const milestoneHtml = row.milestone ? `<span class="milestone-tag">${row.milestone}</span>` : '';

                html += `
                    <tr class="${trClass}" id="timeline-week-${row.week}">
                        <td><span class="fw-bold">Week ${row.week}</span></td>
                        <td><div class="small fw-semibold text-muted">${row.start} - ${row.end}</div></td>
                        <td class="trimester-cell text-center" style="background: ${row.trimester === 'First' ? '#fff3e0' : (row.trimester === 'Second' ? '#e1f5fe' : '#e8f5e9')}">${row.trimester} Trimester</td>
                        <td class="milestone-cell">${milestoneHtml}</td>
                    </tr>
                `;
            });

            $('#timeline-table-body').html(html);

            // Smooth scroll to today's week if requested
            const activeWeek = timeline.find(r => r.isToday);
            if (activeWeek) {
                setTimeout(() => {
                    const row = document.getElementById(`timeline-week-${activeWeek.week}`);
                    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    };
})();
