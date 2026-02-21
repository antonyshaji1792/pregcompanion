/**
 * postpartum-recovery.js - Maternal Recovery & Wellbeing Tracker
 * Namespace: Companion.Recovery
 */
window.Companion = window.Companion || {};

Companion.Recovery = (function () {
    const PROFILE_KEY = 'postpartum_profile';
    const LOGS_KEY = 'postpartum_logs';
    const CHECKLIST_KEY = 'postpartum_checklist';

    const defaultChecklist = [
        { id: 'rest', text: 'Getting adequate rest (6-8 hours)', category: 'essential' },
        { id: 'iron', text: 'Continuing iron supplements', category: 'essential' },
        { id: 'hydration', text: 'Drinking 8-10 glasses of water daily', category: 'essential' },
        { id: 'nutrition', text: 'Eating nutritious, balanced meals', category: 'essential' },
        { id: 'hygiene', text: 'Maintaining personal hygiene', category: 'essential' },
        { id: 'wound_care', text: 'Proper wound care (if applicable)', category: 'essential' },
        { id: 'pelvic_rest', text: 'Following pelvic rest guidelines', category: 'essential' },
        { id: 'exercise', text: 'Light exercise (after doctor approval)', category: 'optional' },
        { id: 'kegel', text: 'Pelvic floor exercises (Kegels)', category: 'optional' },
        { id: 'support', text: 'Seeking emotional support when needed', category: 'mental' }
    ];

    return {
        // Profile
        setProfile: function (deliveryType, deliveryDate) {
            const profile = {
                deliveryType: deliveryType, // 'normal' or 'csection'
                deliveryDate: deliveryDate,
                timestamp: Date.now()
            };
            Companion.Data.save(PROFILE_KEY, profile);
            return profile;
        },

        getProfile: function () {
            return Companion.Data.get(PROFILE_KEY);
        },

        // Daily Logs
        logDay: function (painLevel, mood, bleedingLevel, notes = '') {
            const logs = this.getLogs();
            const entry = {
                id: Date.now(),
                date: dayjs().format('YYYY-MM-DD'),
                timestamp: Date.now(),
                painLevel: parseInt(painLevel), // 1-10
                mood: mood, // 'good', 'okay', 'low', 'depressed'
                bleedingLevel: bleedingLevel, // 'light', 'moderate', 'heavy'
                notes: notes
            };
            logs.unshift(entry);
            Companion.Data.save(LOGS_KEY, logs);
            return entry;
        },

        getLogs: function () {
            return Companion.Data.get(LOGS_KEY, []);
        },

        deleteLog: function (id) {
            const logs = this.getLogs().filter(l => l.id !== id);
            Companion.Data.save(LOGS_KEY, logs);
            return logs;
        },

        // Checklist
        getChecklist: function () {
            const saved = Companion.Data.get(CHECKLIST_KEY);
            if (!saved || saved.length === 0) {
                const initialized = defaultChecklist.map(item => ({ ...item, checked: false }));
                Companion.Data.save(CHECKLIST_KEY, initialized);
                return initialized;
            }
            return saved;
        },

        toggleChecklistItem: function (id) {
            const checklist = this.getChecklist();
            const item = checklist.find(i => i.id === id);
            if (item) {
                item.checked = !item.checked;
                item.lastChecked = item.checked ? Date.now() : null;
                Companion.Data.save(CHECKLIST_KEY, checklist);
            }
            return checklist;
        },

        getChecklistProgress: function () {
            const checklist = this.getChecklist();
            const total = checklist.length;
            const checked = checklist.filter(i => i.checked).length;
            return {
                total: total,
                checked: checked,
                percentage: total > 0 ? Math.round((checked / total) * 100) : 0
            };
        },

        // Analytics
        getWeeklySummary: function () {
            const logs = this.getLogs();
            const weekAgo = dayjs().subtract(7, 'day');
            const recentLogs = logs.filter(l => dayjs(l.timestamp).isAfter(weekAgo));

            if (recentLogs.length === 0) {
                return {
                    avgPain: 0,
                    moodDistribution: {},
                    concerningSymptoms: false
                };
            }

            const avgPain = (recentLogs.reduce((sum, l) => sum + l.painLevel, 0) / recentLogs.length).toFixed(1);

            const moodDistribution = {};
            recentLogs.forEach(l => {
                moodDistribution[l.mood] = (moodDistribution[l.mood] || 0) + 1;
            });

            // Check for concerning symptoms
            const highPain = recentLogs.some(l => l.painLevel >= 8);
            const heavyBleeding = recentLogs.some(l => l.bleedingLevel === 'heavy');
            const lowMood = recentLogs.filter(l => l.mood === 'low' || l.mood === 'depressed').length >= 3;

            return {
                avgPain: parseFloat(avgPain),
                moodDistribution: moodDistribution,
                concerningSymptoms: highPain || heavyBleeding || lowMood,
                highPain: highPain,
                heavyBleeding: heavyBleeding,
                persistentLowMood: lowMood
            };
        },

        getDaysPostpartum: function () {
            const profile = this.getProfile();
            if (!profile || !profile.deliveryDate) return null;

            const deliveryDate = dayjs(profile.deliveryDate);
            const today = dayjs();
            return today.diff(deliveryDate, 'day');
        },

        getRecoveryMilestone: function () {
            const days = this.getDaysPostpartum();
            if (!days) return null;

            if (days <= 7) return { phase: 'Early Recovery', message: 'First week - Focus on rest and healing' };
            if (days <= 14) return { phase: 'Week 2', message: 'Continue resting, monitor bleeding and pain' };
            if (days <= 42) return { phase: 'First 6 Weeks', message: 'Gradual recovery, attend postpartum checkup' };
            if (days <= 90) return { phase: 'Extended Recovery', message: 'Most physical recovery complete' };
            return { phase: 'Post-Recovery', message: 'Continue self-care and monitoring' };
        }
    };
})();
