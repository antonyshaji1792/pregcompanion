/**
 * reminders.js - Reminder management and notification logic
 */
const Reminders = {
    /**
     * Get all reminders from storage
     */
    getAll: function () {
        return Storage.getReminders();
    },

    /**
     * Save/Update a reminder
     * Format: { id, title, eventDate, reminderEnabled, remindBeforeDays }
     */
    save: function (reminder) {
        const reminders = this.getAll();
        const index = reminders.findIndex(r => r.id === reminder.id);

        if (index > -1) {
            reminders[index] = reminder;
        } else {
            reminders.push(reminder);
        }

        Storage.saveReminders(reminders);
        return reminder;
    },

    /**
     * Add a custom reminder
     */
    addCustom: function (title, date) {
        const newReminder = {
            id: 'custom_' + Date.now(),
            title: title,
            eventDate: date,
            reminderEnabled: true,
            remindBeforeDays: 1 // Default 1 day before
        };
        return this.save(newReminder);
    },

    /**
     * Toggle reminder for a specific milestone
     */
    toggleMilestoneReminder: function (milestoneId, eventDate, enabled, beforeDays) {
        const reminder = {
            id: milestoneId,
            title: milestoneId.replace('_', ' '), // Simple title from ID
            eventDate: eventDate,
            reminderEnabled: enabled,
            remindBeforeDays: parseInt(beforeDays) || 1
        };
        return this.save(reminder);
    },

    /**
     * Delete a reminder
     */
    delete: function (id) {
        let reminders = this.getAll();
        reminders = reminders.filter(r => r.id !== id);
        Storage.saveReminders(reminders);
    },

    /**
     * Check for today's notifications
     */
    checkNotifications: function () {
        const reminders = this.getAll();
        const today = dayjs().startOf('day');
        const activeAlerts = [];

        reminders.forEach(r => {
            if (r.reminderEnabled) {
                const eventDate = dayjs(r.eventDate);
                const reminderDate = eventDate.subtract(r.remindBeforeDays, 'day').startOf('day');

                if (today.isSame(reminderDate)) {
                    activeAlerts.push(r);
                }
            }
        });

        return activeAlerts;
    },

    /**
     * UI helper get upcoming
     */
    getUpcoming: function (limit = 5) {
        const today = dayjs().startOf('day');
        return this.getAll()
            .filter(r => !dayjs(r.eventDate).isBefore(today))
            .sort((a, b) => dayjs(a.eventDate).diff(dayjs(b.eventDate)))
            .slice(0, limit);
    }
};
