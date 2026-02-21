/**
 * supplement-tracker.js - Medication and Supplement Adherence Tracker
 * Namespace: Companion.Supplements
 */
window.Companion = window.Companion || {};

Companion.Supplements = (function () {
    const STORAGE_KEY = 'supplement_tracker';
    const LOG_KEY = 'supplement_logs';

    const defaultSupplements = [
        { id: 'iron', name: 'Iron', enabled: false, reminderTime: '09:00' },
        { id: 'calcium', name: 'Calcium', enabled: false, reminderTime: '20:00' },
        { id: 'folic_acid', name: 'Folic Acid', enabled: false, reminderTime: '09:00' },
        { id: 'thyroid', name: 'Thyroid Medication', enabled: false, reminderTime: '07:00' }
    ];

    return {
        getSupplements: function () {
            const saved = Companion.Data.get(STORAGE_KEY);
            if (!saved || saved.length === 0) {
                Companion.Data.save(STORAGE_KEY, defaultSupplements);
                return defaultSupplements;
            }
            return saved;
        },

        addCustomSupplement: function (name, reminderTime = '09:00') {
            const supplements = this.getSupplements();
            const newSupplement = {
                id: `custom_${Date.now()}`,
                name: name,
                enabled: true,
                reminderTime: reminderTime,
                isCustom: true
            };
            supplements.push(newSupplement);
            Companion.Data.save(STORAGE_KEY, supplements);
            return newSupplement;
        },

        toggleSupplement: function (id) {
            const supplements = this.getSupplements();
            const supplement = supplements.find(s => s.id === id);
            if (supplement) {
                supplement.enabled = !supplement.enabled;
                Companion.Data.save(STORAGE_KEY, supplements);
            }
            return supplements;
        },

        updateReminderTime: function (id, time) {
            const supplements = this.getSupplements();
            const supplement = supplements.find(s => s.id === id);
            if (supplement) {
                supplement.reminderTime = time;
                Companion.Data.save(STORAGE_KEY, supplements);
            }
            return supplements;
        },

        deleteSupplement: function (id) {
            const supplements = this.getSupplements().filter(s => s.id !== id);
            Companion.Data.save(STORAGE_KEY, supplements);
            return supplements;
        },

        markAsTaken: function (supplementId, date = null) {
            const logs = this.getLogs();
            const dateKey = date || dayjs().format('YYYY-MM-DD');

            if (!logs[dateKey]) logs[dateKey] = [];

            // Check if already marked for today
            if (!logs[dateKey].includes(supplementId)) {
                logs[dateKey].push(supplementId);
                Companion.Data.save(LOG_KEY, logs);
            }

            return logs;
        },

        unmarkAsTaken: function (supplementId, date = null) {
            const logs = this.getLogs();
            const dateKey = date || dayjs().format('YYYY-MM-DD');

            if (logs[dateKey]) {
                logs[dateKey] = logs[dateKey].filter(id => id !== supplementId);
                if (logs[dateKey].length === 0) delete logs[dateKey];
                Companion.Data.save(LOG_KEY, logs);
            }

            return logs;
        },

        getLogs: function () {
            return Companion.Data.get(LOG_KEY, {});
        },

        isTakenToday: function (supplementId) {
            const logs = this.getLogs();
            const today = dayjs().format('YYYY-MM-DD');
            return logs[today] && logs[today].includes(supplementId);
        },

        getWeeklyAdherence: function () {
            const supplements = this.getSupplements().filter(s => s.enabled);
            const logs = this.getLogs();

            if (supplements.length === 0) return { percentage: 0, taken: 0, total: 0 };

            let totalExpected = 0;
            let totalTaken = 0;

            // Last 7 days
            for (let i = 0; i < 7; i++) {
                const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
                totalExpected += supplements.length;

                if (logs[date]) {
                    // Count only enabled supplements that were taken
                    const takenCount = logs[date].filter(id =>
                        supplements.some(s => s.id === id)
                    ).length;
                    totalTaken += takenCount;
                }
            }

            const percentage = totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;

            return {
                percentage: percentage,
                taken: totalTaken,
                total: totalExpected
            };
        },

        getMissedDoses: function (days = 7) {
            const supplements = this.getSupplements().filter(s => s.enabled);
            const logs = this.getLogs();
            const missed = [];

            for (let i = 0; i < days; i++) {
                const date = dayjs().subtract(i, 'day');
                const dateKey = date.format('YYYY-MM-DD');
                const takenIds = logs[dateKey] || [];

                supplements.forEach(supplement => {
                    if (!takenIds.includes(supplement.id)) {
                        missed.push({
                            supplement: supplement.name,
                            date: date.format('MMM D'),
                            dateKey: dateKey
                        });
                    }
                });
            }

            return missed;
        }
    };
})();
