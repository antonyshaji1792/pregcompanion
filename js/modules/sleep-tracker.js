/**
 * sleep-tracker.js - Pregnancy Sleep Tracker
 * Namespace: Companion.Sleep
 */
window.Companion = window.Companion || {};

Companion.Sleep = (function () {
    const STORAGE_KEY = 'sleep_logs';

    const sleepTips = [
        "💤 Sleep on your left side to improve blood flow to your baby.",
        "🛏️ Use a pregnancy pillow between your knees for comfort.",
        "🌙 Establish a consistent bedtime routine to signal your body it's time to sleep.",
        "📱 Avoid screens 1 hour before bed - blue light disrupts sleep.",
        "☕ Limit fluids 2 hours before bedtime to reduce night awakenings.",
        "🧘 Try gentle stretching or prenatal yoga before bed.",
        "🌡️ Keep your bedroom cool (60-67°F) for better sleep.",
        "😌 Practice deep breathing or meditation to calm your mind.",
        "🍵 Try chamomile tea or warm milk before bed (if approved by your doctor).",
        "⏰ Go to bed and wake up at the same time every day, even on weekends."
    ];

    return {
        logSleep: function (sleepStart, wakeTime, awakenings, quality) {
            const logs = this.getLogs();
            const date = dayjs(wakeTime).format('YYYY-MM-DD');

            // Calculate duration
            const start = dayjs(sleepStart);
            const end = dayjs(wakeTime);
            const duration = end.diff(start, 'minute');

            const logEntry = {
                id: Date.now(),
                date: date,
                sleepStart: sleepStart,
                wakeTime: wakeTime,
                awakenings: parseInt(awakenings) || 0,
                quality: parseInt(quality),
                duration: duration,
                durationHours: (duration / 60).toFixed(1),
                timestamp: Date.now()
            };

            if (!logs[date]) {
                logs[date] = [];
            }

            logs[date].push(logEntry);
            Companion.Data.save(STORAGE_KEY, logs);

            return logEntry;
        },

        deleteSleepLog: function (date, logId) {
            const logs = this.getLogs();
            if (logs[date]) {
                logs[date] = logs[date].filter(log => log.id !== logId);
                if (logs[date].length === 0) {
                    delete logs[date];
                }
                Companion.Data.save(STORAGE_KEY, logs);
            }
            return logs;
        },

        getLogs: function () {
            return Companion.Data.get(STORAGE_KEY, {});
        },

        getTodayLogs: function () {
            const today = dayjs().format('YYYY-MM-DD');
            const logs = this.getLogs();
            return logs[today] || [];
        },

        getWeeklyLogs: function () {
            const logs = this.getLogs();
            const weeklyLogs = [];

            for (let i = 6; i >= 0; i--) {
                const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
                if (logs[date] && logs[date].length > 0) {
                    weeklyLogs.push({
                        date: date,
                        logs: logs[date],
                        totalDuration: logs[date].reduce((sum, log) => sum + log.duration, 0),
                        avgQuality: (logs[date].reduce((sum, log) => sum + log.quality, 0) / logs[date].length).toFixed(1),
                        totalAwakenings: logs[date].reduce((sum, log) => sum + log.awakenings, 0)
                    });
                } else {
                    weeklyLogs.push({
                        date: date,
                        logs: [],
                        totalDuration: 0,
                        avgQuality: 0,
                        totalAwakenings: 0
                    });
                }
            }

            return weeklyLogs;
        },

        getWeeklyAverage: function () {
            const weeklyLogs = this.getWeeklyLogs();
            const daysWithSleep = weeklyLogs.filter(day => day.totalDuration > 0).length;

            if (daysWithSleep === 0) {
                return {
                    avgDuration: 0,
                    avgQuality: 0,
                    avgAwakenings: 0
                };
            }

            const totalDuration = weeklyLogs.reduce((sum, day) => sum + day.totalDuration, 0);
            const totalQuality = weeklyLogs.reduce((sum, day) => {
                return sum + (day.logs.reduce((s, log) => s + log.quality, 0));
            }, 0);
            const totalLogs = weeklyLogs.reduce((sum, day) => sum + day.logs.length, 0);
            const totalAwakenings = weeklyLogs.reduce((sum, day) => sum + day.totalAwakenings, 0);

            return {
                avgDuration: (totalDuration / daysWithSleep / 60).toFixed(1), // hours
                avgQuality: totalLogs > 0 ? (totalQuality / totalLogs).toFixed(1) : 0,
                avgAwakenings: (totalAwakenings / daysWithSleep).toFixed(1)
            };
        },

        getChartData: function () {
            const weeklyLogs = this.getWeeklyLogs();

            return {
                labels: weeklyLogs.map(day => dayjs(day.date).format('MMM D')),
                datasets: [
                    {
                        label: 'Sleep Duration (hours)',
                        data: weeklyLogs.map(day => (day.totalDuration / 60).toFixed(1)),
                        borderColor: '#C77DFF',
                        backgroundColor: '#C77DFF33',
                        tension: 0.4,
                        yAxisID: 'y',
                        fill: true
                    },
                    {
                        label: 'Sleep Quality (1-5)',
                        data: weeklyLogs.map(day => day.avgQuality),
                        borderColor: '#64B5F6',
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        yAxisID: 'y1',
                        fill: false
                    }
                ]
            };
        },

        getSleepQualityStatus: function (quality) {
            if (quality >= 4) {
                return { text: 'Excellent', color: 'success', icon: '😴' };
            } else if (quality >= 3) {
                return { text: 'Good', color: 'info', icon: '🙂' };
            } else if (quality >= 2) {
                return { text: 'Fair', color: 'warning', icon: '😐' };
            } else {
                return { text: 'Poor', color: 'danger', icon: '😞' };
            }
        },

        getRandomTip: function () {
            return sleepTips[Math.floor(Math.random() * sleepTips.length)];
        },

        formatTime: function (datetime) {
            return dayjs(datetime).format('h:mm A');
        },

        formatDuration: function (minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        }
    };
})();
