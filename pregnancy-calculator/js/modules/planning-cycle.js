/**
 * planning-cycle.js - Ovulation and Cycle Tracking for Planning Mode
 * Namespace: Companion.Planning
 */
window.Companion = window.Companion || {};

Companion.Planning = (function () {
    const STORAGE_KEY = 'cycle_history';
    const SETTINGS_KEY = 'cycle_settings';

    return {
        init: function () {
            const settings = Companion.Data.get(SETTINGS_KEY);
            if (!settings) {
                Companion.Data.save(SETTINGS_KEY, { avgLength: 28 });
            }
        },

        getSettings: function () {
            return Companion.Data.get(SETTINGS_KEY, { avgLength: 28 });
        },

        saveSettings: function (settings) {
            Companion.Data.save(SETTINGS_KEY, settings);
        },

        logPeriod: function (startDate) {
            const history = this.getHistory();
            const newEntry = {
                id: Date.now(),
                date: startDate,
                timestamp: new Date(startDate).getTime()
            };

            history.unshift(newEntry);
            // Keep last 12 cycles
            Companion.Data.save(STORAGE_KEY, history.slice(0, 12));
            return newEntry;
        },

        getHistory: function () {
            return Companion.Data.get(STORAGE_KEY, []);
        },

        deleteEntry: function (id) {
            const history = this.getHistory().filter(e => e.id !== id);
            Companion.Data.save(STORAGE_KEY, history);
        },

        calculateCycle: function () {
            const history = this.getHistory();
            const settings = this.getSettings();

            if (history.length === 0) return null;

            const lastPeriod = dayjs(history[0].date);
            const cycleLength = settings.avgLength;

            const nextPeriod = lastPeriod.add(cycleLength, 'day');
            const ovulationDay = nextPeriod.subtract(14, 'day');

            // Fertile window is typically 5 days before ovulation + ovulation day
            const windowStart = ovulationDay.subtract(5, 'day');
            const windowEnd = ovulationDay;

            return {
                lastPeriod,
                nextPeriod,
                ovulationDay,
                fertileWindow: {
                    start: windowStart,
                    end: windowEnd
                },
                cycleLength
            };
        },

        getCalendarDays: function () {
            const calc = this.calculateCycle();
            if (!calc) return [];

            const days = [];
            const startOfCalendar = calc.lastPeriod.startOf('month');
            const endOfCalendar = calc.nextPeriod.endOf('month');

            let current = startOfCalendar;
            while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
                let type = 'normal'; // period, ovulation, fertile

                if (current.isSame(calc.lastPeriod, 'day')) type = 'period';
                if (current.isSame(calc.ovulationDay, 'day')) type = 'ovulation';
                if (current.isAfter(calc.fertileWindow.start.subtract(1, 'day')) && current.isBefore(calc.fertileWindow.end.add(1, 'day'))) {
                    if (type === 'normal') type = 'fertile';
                }
                if (current.isSame(calc.nextPeriod, 'day')) type = 'period-pred';

                days.push({
                    date: current.format('YYYY-MM-DD'),
                    dayNum: current.date(),
                    type: type,
                    isToday: current.isSame(dayjs(), 'day')
                });
                current = current.add(1, 'day');
            }
            return days;
        }
    };
})();
