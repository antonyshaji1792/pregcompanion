/**
 * reminder-engine.js - Enhanced alert and notification management
 * Namespace: Companion.Reminders
 */
window.Companion = window.Companion || {};

Companion.Reminders = (function () {
    const STORAGE_KEY = 'reminders_v2';

    return {
        add: function (title, date, type, daysBefore = 1) {
            const list = this.getAll();
            const reminder = {
                id: Date.now(),
                title,
                date, // YYYY-MM-DD
                type, // 'scan', 'doctor', 'vaccine', 'custom'
                daysBefore: parseInt(daysBefore),
                enabled: true,
                notified: false
            };
            list.push(reminder);
            Companion.Storage.save(STORAGE_KEY, list);
            return reminder;
        },

        getAll: function () {
            return Companion.Storage.get(STORAGE_KEY, []);
        },

        toggle: function (id) {
            const list = this.getAll();
            const index = list.findIndex(r => r.id === id);
            if (index !== -1) {
                list[index].enabled = !list[index].enabled;
                Companion.Storage.save(STORAGE_KEY, list);
            }
        },

        remove: function (id) {
            let list = this.getAll();
            list = list.filter(r => r.id !== id);
            Companion.Storage.save(STORAGE_KEY, list);
        },

        requestPermission: function () {
            if (!("Notification" in window)) return;

            // Don't spam if we already asked in this session or if previously denied/granted
            if (Notification.permission === "default") {
                const alreadyAsked = localStorage.getItem('companion_notification_asked');
                if (!alreadyAsked) {
                    Notification.requestPermission().then(() => {
                        localStorage.setItem('companion_notification_asked', 'true');
                    });
                }
            }
        },

        checkAlerts: function () {
            const today = dayjs().startOf('day');
            const list = this.getAll();
            const due = [];
            let changed = false;

            list.forEach(r => {
                if (!r.enabled) return;

                const targetDate = dayjs(r.date);
                const alertDate = targetDate.subtract(r.daysBefore, 'day');

                // If today is the alert date and we haven't notified yet
                if (today.isSame(alertDate, 'day') || (today.isAfter(alertDate) && today.isBefore(targetDate.add(1, 'day')))) {
                    due.push(r);

                    // Show browser notification if permission granted
                    if (Notification.permission === "granted" && !r.notified) {
                        new Notification("Pregnancy Companion Reminder", {
                            body: `${r.title} is coming up on ${dayjs(r.date).format('MMM D')}`,
                            icon: '/favicon.ico' // Default or specific icon
                        });
                        r.notified = true;
                        changed = true;
                    }
                }
            });

            if (changed) {
                Companion.Storage.save(STORAGE_KEY, list);
            }

            return due;
        },

        getIcon: function (type) {
            switch (type) {
                case 'scan': return 'bi-calendar-check';
                case 'doctor': return 'bi-person-badge';
                case 'vaccine': return 'bi-vials';
                default: return 'bi-bell';
            }
        }
    };
})();
