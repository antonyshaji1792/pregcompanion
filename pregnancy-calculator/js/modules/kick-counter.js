/**
 * kick-counter.js - Monitor baby movement
 * Namespace: Companion.Kicks
 */
window.Companion = window.Companion || {};

Companion.Kicks = (function () {
    const STORAGE_KEY = 'kick_history';
    const SESSION_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 hours
    const TARGET_KICKS = 10;

    let activeSession = null;
    let timerInterval = null;

    return {
        startSession: function () {
            if (activeSession) return activeSession;

            activeSession = {
                startTime: Date.now(),
                count: 0,
                kicks: [],
                status: 'running'
            };
            return activeSession;
        },

        countKick: function () {
            if (!activeSession) this.startSession();
            activeSession.count++;
            activeSession.kicks.push(Date.now());
            return activeSession;
        },

        stopSession: function () {
            if (!activeSession) return null;

            const endTime = Date.now();
            const durationMs = endTime - activeSession.startTime;

            const sessionResult = {
                date: dayjs(activeSession.startTime).format('YYYY-MM-DD HH:mm'),
                count: activeSession.count,
                duration: durationMs,
                isConcern: activeSession.count < TARGET_KICKS,
                timestamp: activeSession.startTime
            };

            const history = this.getHistory();
            history.unshift(sessionResult);
            Companion.Storage.save(STORAGE_KEY, history);

            activeSession = null;
            return sessionResult;
        },

        getActive: function () {
            if (!activeSession) return null;

            const elapsed = Date.now() - activeSession.startTime;
            const remaining = Math.max(0, SESSION_LIMIT_MS - elapsed);

            if (remaining === 0) {
                return this.stopSession();
            }

            return {
                ...activeSession,
                remainingMs: remaining,
                progress: (elapsed / SESSION_LIMIT_MS) * 100
            };
        },

        getHistory: function () {
            return Companion.Storage.get(STORAGE_KEY, []);
        },

        formatDuration: function (ms) {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        }
    };
})();
