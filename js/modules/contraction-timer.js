/**
 * contraction-timer.js - Labor tracking
 * Namespace: Companion.Labor
 */
window.Companion = window.Companion || {};

Companion.Labor = (function () {
    const STORAGE_KEY = 'contraction_history';
    let activeContraction = null;

    return {
        start: function () {
            if (activeContraction) return activeContraction;
            activeContraction = {
                start: Date.now()
            };
            return activeContraction;
        },

        stop: function () {
            if (!activeContraction) return null;

            const endTime = Date.now();
            const duration = Math.floor((endTime - activeContraction.start) / 1000); // seconds

            const record = {
                start: activeContraction.start,
                end: endTime,
                duration: duration,
                timestamp: activeContraction.start
            };

            const history = this.getHistory();
            history.unshift(record);
            Companion.Storage.save(STORAGE_KEY, history);

            activeContraction = null;
            this.checkLaborRule(history);
            return record;
        },

        getHistory: function () {
            return Companion.Storage.get(STORAGE_KEY, []);
        },

        getStats: function () {
            const history = this.getHistory();
            if (history.length === 0) return null;

            // Stats for last 1 hour
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            const recent = history.filter(h => h.start > oneHourAgo);

            if (recent.length === 0) return null;

            const avgDuration = recent.reduce((acc, curr) => acc + curr.duration, 0) / recent.length;

            let avgInterval = 0;
            if (recent.length > 1) {
                let totalInterval = 0;
                for (let i = 0; i < recent.length - 1; i++) {
                    totalInterval += (recent[i].start - recent[i + 1].start) / 60000; // minutes
                }
                avgInterval = totalInterval / (recent.length - 1);
            }

            return {
                lastDuration: history[0].duration,
                lastInterval: history.length > 1 ? (history[0].start - history[1].start) / 60000 : 0,
                avgDuration: Math.round(avgDuration),
                avgInterval: avgInterval.toFixed(1),
                countRecent: recent.length
            };
        },

        checkLaborRule: function (history) {
            // 5-1-1 Rule check:
            // - Every 5 minutes or less
            // - Lasting 60 seconds or more
            // - For at least 1 hour

            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            const recent = history.filter(h => h.start > oneHourAgo);

            if (recent.length < 3) return false; // Need a pattern

            const avgDuration = recent.reduce((acc, curr) => acc + curr.duration, 0) / recent.length;

            let totalInterval = 0;
            for (let i = 0; i < recent.length - 1; i++) {
                totalInterval += (recent[i].start - recent[i + 1].start) / 60000;
            }
            const avgInterval = totalInterval / (recent.length - 1);

            // The logic: If average interval is <= 5 mins AND avg duration is >= 60s AND we have consistent logs for an hour
            if (avgInterval <= 5 && avgDuration >= 60 && recent.length >= 4) {
                return true;
            }
            return false;
        },

        formatDuration: function (seconds) {
            if (seconds < 60) return `${seconds}s`;
            return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        },

        getActive: function () {
            if (!activeContraction) return null;
            return {
                ...activeContraction,
                elapsed: Math.floor((Date.now() - activeContraction.start) / 1000)
            };
        }
    };
})();
