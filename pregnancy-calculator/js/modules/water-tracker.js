/**
 * water-tracker.js - Daily Hydration Tracker
 * Namespace: Companion.Water
 */
window.Companion = window.Companion || {};

Companion.Water = (function () {
    const STORAGE_KEY = 'water_logs';
    const GOAL_KEY = 'water_goal';
    const DEFAULT_GOAL = 8; // glasses

    const trimesterTips = {
        1: [
            "💧 Staying hydrated helps reduce nausea and fatigue.",
            "🌊 Water supports increased blood volume in early pregnancy.",
            "💦 Proper hydration can help prevent constipation.",
            "✨ Drink water between meals if nausea makes it hard during meals."
        ],
        2: [
            "💧 Your baby's amniotic fluid needs plenty of water!",
            "🌊 Hydration helps prevent swelling and overheating.",
            "💦 Water supports your growing blood volume.",
            "✨ Keep a water bottle handy - you need more fluids now!"
        ],
        3: [
            "💧 Water helps prevent Braxton Hicks contractions.",
            "🌊 Staying hydrated reduces swelling in hands and feet.",
            "💦 Proper hydration supports amniotic fluid levels.",
            "✨ Drink extra water if you're experiencing heartburn."
        ]
    };

    return {
        setGoal: function (glasses) {
            Companion.Data.save(GOAL_KEY, parseInt(glasses));
            return parseInt(glasses);
        },

        getGoal: function () {
            return Companion.Data.get(GOAL_KEY, DEFAULT_GOAL);
        },

        getTodayLog: function () {
            const logs = this.getLogs();
            const today = dayjs().format('YYYY-MM-DD');

            if (!logs[today]) {
                logs[today] = {
                    date: today,
                    glasses: 0,
                    goal: this.getGoal(),
                    lastUpdated: Date.now()
                };
                Companion.Data.save(STORAGE_KEY, logs);
            }

            return logs[today];
        },

        addGlass: function () {
            const logs = this.getLogs();
            const today = dayjs().format('YYYY-MM-DD');

            if (!logs[today]) {
                logs[today] = {
                    date: today,
                    glasses: 0,
                    goal: this.getGoal(),
                    lastUpdated: Date.now()
                };
            }

            logs[today].glasses++;
            logs[today].lastUpdated = Date.now();

            Companion.Data.save(STORAGE_KEY, logs);
            return logs[today];
        },

        removeGlass: function () {
            const logs = this.getLogs();
            const today = dayjs().format('YYYY-MM-DD');

            if (logs[today] && logs[today].glasses > 0) {
                logs[today].glasses--;
                logs[today].lastUpdated = Date.now();
                Companion.Data.save(STORAGE_KEY, logs);
            }

            return logs[today] || { date: today, glasses: 0, goal: this.getGoal() };
        },

        getLogs: function () {
            return Companion.Data.get(STORAGE_KEY, {});
        },

        getWeeklyLogs: function () {
            const logs = this.getLogs();
            const weeklyLogs = [];

            for (let i = 6; i >= 0; i--) {
                const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
                if (logs[date]) {
                    weeklyLogs.push(logs[date]);
                } else {
                    weeklyLogs.push({
                        date: date,
                        glasses: 0,
                        goal: this.getGoal()
                    });
                }
            }

            return weeklyLogs;
        },

        getWeeklyAverage: function () {
            const weeklyLogs = this.getWeeklyLogs();
            const total = weeklyLogs.reduce((sum, log) => sum + log.glasses, 0);
            return (total / 7).toFixed(1);
        },

        getWeeklyGoalPercentage: function () {
            const weeklyLogs = this.getWeeklyLogs();
            const totalGoal = weeklyLogs.reduce((sum, log) => sum + (log.goal || DEFAULT_GOAL), 0);
            const totalActual = weeklyLogs.reduce((sum, log) => sum + log.glasses, 0);
            return totalGoal > 0 ? Math.round((totalActual / totalGoal) * 100) : 0;
        },

        getTodayProgress: function () {
            const today = this.getTodayLog();
            const percentage = Math.min(100, Math.round((today.glasses / today.goal) * 100));
            return {
                glasses: today.glasses,
                goal: today.goal,
                percentage: percentage,
                remaining: Math.max(0, today.goal - today.glasses),
                achieved: today.glasses >= today.goal
            };
        },

        getTrimesterTip: function (trimester) {
            if (!trimester || trimester < 1 || trimester > 3) {
                return trimesterTips[2][0]; // Default to second trimester
            }

            const tips = trimesterTips[trimester];
            return tips[Math.floor(Math.random() * tips.length)];
        },

        getChartData: function () {
            const weeklyLogs = this.getWeeklyLogs();

            return {
                labels: weeklyLogs.map(log => dayjs(log.date).format('MMM D')),
                datasets: [
                    {
                        label: 'Glasses Consumed',
                        data: weeklyLogs.map(log => log.glasses),
                        borderColor: '#64B5F6',
                        backgroundColor: '#64B5F633',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Daily Goal',
                        data: weeklyLogs.map(log => log.goal || DEFAULT_GOAL),
                        borderColor: '#A5D6A7',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0,
                        fill: false
                    }
                ]
            };
        },

        resetToday: function () {
            const logs = this.getLogs();
            const today = dayjs().format('YYYY-MM-DD');

            if (logs[today]) {
                logs[today].glasses = 0;
                logs[today].lastUpdated = Date.now();
                Companion.Data.save(STORAGE_KEY, logs);
            }

            return this.getTodayLog();
        },

        getHydrationStatus: function () {
            const progress = this.getTodayProgress();

            if (progress.achieved) {
                return {
                    status: 'excellent',
                    message: '🎉 Great job! You\'ve reached your hydration goal!',
                    color: 'success'
                };
            } else if (progress.percentage >= 75) {
                return {
                    status: 'good',
                    message: '💪 Almost there! Keep drinking water.',
                    color: 'info'
                };
            } else if (progress.percentage >= 50) {
                return {
                    status: 'moderate',
                    message: '💧 You\'re halfway there. Keep it up!',
                    color: 'warning'
                };
            } else {
                return {
                    status: 'low',
                    message: '🚰 Remember to stay hydrated throughout the day.',
                    color: 'secondary'
                };
            }
        }
    };
})();
