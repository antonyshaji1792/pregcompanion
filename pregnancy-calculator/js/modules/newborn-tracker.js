/**
 * newborn-tracker.js - Comprehensive Baby Care Tracker for Postpartum Mode
 * Namespace: Companion.Newborn
 */
window.Companion = window.Companion || {};

Companion.Newborn = (function () {
    const FEEDING_KEY = 'newborn_feeding';
    const DIAPER_KEY = 'newborn_diaper';
    const SLEEP_KEY = 'newborn_sleep';
    const WEIGHT_KEY = 'newborn_weight';
    const ACTIVE_SESSION_KEY = 'newborn_active_session';

    return {
        // === FEEDING ===
        startFeeding: function (type = 'breast') {
            const session = {
                id: Date.now(),
                type: type, // 'breast', 'bottle', 'formula'
                startTime: Date.now(),
                startDate: dayjs().format('YYYY-MM-DD HH:mm'),
                active: true
            };
            Companion.Data.save(ACTIVE_SESSION_KEY, session);
            return session;
        },

        stopFeeding: function () {
            const session = Companion.Data.get(ACTIVE_SESSION_KEY);
            if (!session || !session.active) return null;

            session.endTime = Date.now();
            session.endDate = dayjs().format('YYYY-MM-DD HH:mm');
            session.duration = Math.round((session.endTime - session.startTime) / 1000 / 60); // minutes
            session.active = false;

            const logs = this.getFeedingLogs();
            logs.unshift(session);
            Companion.Data.save(FEEDING_KEY, logs);
            Companion.Data.delete(ACTIVE_SESSION_KEY);
            return session;
        },

        getActiveFeeding: function () {
            return Companion.Data.get(ACTIVE_SESSION_KEY);
        },

        getFeedingLogs: function () {
            return Companion.Data.get(FEEDING_KEY, []);
        },

        deleteFeeding: function (id) {
            const logs = this.getFeedingLogs().filter(l => l.id !== id);
            Companion.Data.save(FEEDING_KEY, logs);
            return logs;
        },

        // === DIAPER ===
        logDiaper: function (type) {
            const logs = this.getDiaperLogs();
            const entry = {
                id: Date.now(),
                type: type, // 'wet', 'dirty', 'both'
                timestamp: Date.now(),
                date: dayjs().format('YYYY-MM-DD HH:mm')
            };
            logs.unshift(entry);
            Companion.Data.save(DIAPER_KEY, logs);
            return entry;
        },

        getDiaperLogs: function () {
            return Companion.Data.get(DIAPER_KEY, []);
        },

        deleteDiaper: function (id) {
            const logs = this.getDiaperLogs().filter(l => l.id !== id);
            Companion.Data.save(DIAPER_KEY, logs);
            return logs;
        },

        // === SLEEP ===
        startSleep: function () {
            const session = {
                id: Date.now(),
                startTime: Date.now(),
                startDate: dayjs().format('YYYY-MM-DD HH:mm'),
                active: true
            };
            Companion.Data.save(ACTIVE_SESSION_KEY + '_sleep', session);
            return session;
        },

        stopSleep: function () {
            const session = Companion.Data.get(ACTIVE_SESSION_KEY + '_sleep');
            if (!session || !session.active) return null;

            session.endTime = Date.now();
            session.endDate = dayjs().format('YYYY-MM-DD HH:mm');
            session.duration = Math.round((session.endTime - session.startTime) / 1000 / 60); // minutes
            session.active = false;

            const logs = this.getSleepLogs();
            logs.unshift(session);
            Companion.Data.save(SLEEP_KEY, logs);
            Companion.Data.delete(ACTIVE_SESSION_KEY + '_sleep');
            return session;
        },

        getActiveSleep: function () {
            return Companion.Data.get(ACTIVE_SESSION_KEY + '_sleep');
        },

        getSleepLogs: function () {
            return Companion.Data.get(SLEEP_KEY, []);
        },

        deleteSleep: function (id) {
            const logs = this.getSleepLogs().filter(l => l.id !== id);
            Companion.Data.save(SLEEP_KEY, logs);
            return logs;
        },

        // === WEIGHT ===
        logWeight: function (weight, unit = 'kg') {
            const logs = this.getWeightLogs();
            const entry = {
                id: Date.now(),
                weight: parseFloat(weight),
                unit: unit,
                timestamp: Date.now(),
                date: dayjs().format('YYYY-MM-DD')
            };
            logs.unshift(entry);
            Companion.Data.save(WEIGHT_KEY, logs);
            return entry;
        },

        getWeightLogs: function () {
            return Companion.Data.get(WEIGHT_KEY, []);
        },

        deleteWeight: function (id) {
            const logs = this.getWeightLogs().filter(l => l.id !== id);
            Companion.Data.save(WEIGHT_KEY, logs);
            return logs;
        },

        // === SUMMARIES ===
        getDailySummary: function (date = null) {
            const targetDate = date || dayjs().format('YYYY-MM-DD');

            const feedings = this.getFeedingLogs().filter(f =>
                dayjs(f.startTime).format('YYYY-MM-DD') === targetDate
            );

            const diapers = this.getDiaperLogs().filter(d =>
                dayjs(d.timestamp).format('YYYY-MM-DD') === targetDate
            );

            const sleeps = this.getSleepLogs().filter(s =>
                dayjs(s.startTime).format('YYYY-MM-DD') === targetDate
            );

            const totalSleepMinutes = sleeps.reduce((sum, s) => sum + (s.duration || 0), 0);

            return {
                date: targetDate,
                feedingCount: feedings.length,
                diaperCount: diapers.length,
                wetDiapers: diapers.filter(d => d.type === 'wet' || d.type === 'both').length,
                dirtyDiapers: diapers.filter(d => d.type === 'dirty' || d.type === 'both').length,
                sleepSessions: sleeps.length,
                totalSleepHours: (totalSleepMinutes / 60).toFixed(1)
            };
        },

        getWeeklySummary: function () {
            const today = dayjs();
            const summaries = [];

            for (let i = 0; i < 7; i++) {
                const date = today.subtract(i, 'day').format('YYYY-MM-DD');
                summaries.push(this.getDailySummary(date));
            }

            const totalFeedings = summaries.reduce((sum, s) => sum + s.feedingCount, 0);
            const totalDiapers = summaries.reduce((sum, s) => sum + s.diaperCount, 0);
            const avgSleepHours = (summaries.reduce((sum, s) => sum + parseFloat(s.totalSleepHours), 0) / 7).toFixed(1);

            return {
                days: summaries.reverse(),
                totalFeedings: totalFeedings,
                avgFeedingsPerDay: (totalFeedings / 7).toFixed(1),
                totalDiapers: totalDiapers,
                avgDiapersPerDay: (totalDiapers / 7).toFixed(1),
                avgSleepHours: avgSleepHours
            };
        }
    };
})();
