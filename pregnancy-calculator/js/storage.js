/**
 * storage.js - LocalStorage management for Pregnancy Calculator
 */
const Storage = {
    KEYS: {
        PREGNANCY_DATA: 'pregnancy_calculator_data',
        REMINDERS: 'pregnancy_calculator_reminders'
    },

    /**
     * 1. Save Pregnancy Data (LMP and Cycle)
     */
    savePregnancyData: function (data) {
        if (!data) return;
        localStorage.setItem(this.KEYS.PREGNANCY_DATA, JSON.stringify(data));
    },

    /**
     * 2. Get Pregnancy Data
     */
    getPregnancyData: function () {
        const data = localStorage.getItem(this.KEYS.PREGNANCY_DATA);
        try {
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Error parsing pregnancy data", e);
            return null;
        }
    },

    /**
     * 3. Clear Pregnancy Data
     */
    clearPregnancyData: function () {
        localStorage.removeItem(this.KEYS.PREGNANCY_DATA);
    },

    /**
     * 4. Save Reminders Array
     */
    saveReminders: function (reminderArray) {
        if (!Array.isArray(reminderArray)) return;
        localStorage.setItem(this.KEYS.REMINDERS, JSON.stringify(reminderArray));
    },

    /**
     * 5. Get Reminders Array
     */
    getReminders: function () {
        const reminders = localStorage.getItem(this.KEYS.REMINDERS);
        try {
            return reminders ? JSON.parse(reminders) : [];
        } catch (e) {
            console.error("Error parsing reminders", e);
            return [];
        }
    }
};
