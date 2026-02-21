/**
 * calculator.js - Pregnancy calculation logic based on Naegele’s rule
 */
const Calculator = {

    /**
     * 1. Calculate Due Date using Naegele’s rule
     * EDD = LMP + 280 days + (cycleLength - 28)
     */
    calculateDueDate: function (lmpDate, cycleLength = 28) {
        const lmp = dayjs(lmpDate);
        const cycleAdjustment = parseInt(cycleLength) - 28;
        return lmp.add(280 + cycleAdjustment, 'day');
    },

    /**
     * 2. Calculate Gestation (Weeks and remaining days)
     */
    calculateGestation: function (lmpDate) {
        const lmp = dayjs(lmpDate);
        const today = dayjs().startOf('day');
        const totalDays = today.diff(lmp, 'day');

        return {
            totalWeeks: Math.floor(totalDays / 7),
            days: totalDays % 7
        };
    },

    /**
     * 3. Get Trimester based on week number
     * 1-13 = First, 14-27 = Second, 28+ = Third
     */
    getTrimester: function (week) {
        if (week <= 13) return "First";
        if (week <= 27) return "Second";
        return "Third";
    },

    /**
     * 4. Get Days Remaining until EDD
     */
    getDaysRemaining: function (edd) {
        const today = dayjs().startOf('day');
        const diff = edd.diff(today, 'day');
        return Math.max(0, diff);
    },

    /**
     * Main calculation function returning the structured object
     * @returns {object} structured result
     */
    calculate: function (lmpDate, cycleLength = 28) {
        const edd = this.calculateDueDate(lmpDate, cycleLength);
        const gestation = this.calculateGestation(lmpDate);
        const trimester = this.getTrimester(gestation.totalWeeks);
        const daysRemaining = this.getDaysRemaining(edd);

        return {
            lmp: lmpDate,
            dueDate: edd.format('YYYY-MM-DD'),
            formattedDueDate: edd.format('MMMM D, YYYY'),
            totalWeeks: gestation.totalWeeks,
            remainingDays: gestation.days,
            trimester: trimester,
            daysRemaining: daysRemaining,
            // Keeping babySize for the UI consistency if needed
            babySize: this.getBabySize ? this.getBabySize(gestation.totalWeeks) : null
        };
    },

    // Helper for UI (optional but useful)
    getBabySize: function (weeks) {
        const sizes = {
            4: "Poppy Seed", 8: "Raspberry", 12: "Plum", 16: "Avocado",
            20: "Banana", 24: "Ear of Corn", 28: "Eggplant", 32: "Jicama",
            36: "Romaine Lettuce", 40: "Pumpkin"
        };
        const weekKeys = Object.keys(sizes).map(Number).sort((a, b) => b - a);
        const closestWeek = weekKeys.find(w => weeks >= w) || 4;
        return sizes[closestWeek];
    }
};
