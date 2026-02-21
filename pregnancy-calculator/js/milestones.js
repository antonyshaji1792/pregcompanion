/**
 * milestones.js - Automatic pregnancy scan milestones based on LMP
 */
const Milestones = {
    /**
     * Standard scan schedule
     */
    schedule: [
        { week: 8, title: "Early Viability Scan" },
        { week: 12, title: "NT Scan (Nuchal Translucency)" },
        { week: 20, title: "Anomaly Scan" },
        { week: 28, title: "GTT (Glucose Tolerance Test)" },
        { week: 32, title: "Growth Scan" },
        { week: 36, title: "Final Scan / Presentation" }
    ],

    /**
     * Generate milestones with exact dates based on LMP
     * @param {string} lmpDate - ISO date string
     * @returns {array} Array of milestone objects
     */
    generateForLMP: function (lmpDate) {
        if (!lmpDate) return [];

        const lmp = dayjs(lmpDate);
        return this.schedule.map(m => {
            return {
                week: m.week,
                title: m.title,
                date: lmp.add(m.week, 'week').format('YYYY-MM-DD'),
                formattedDate: lmp.add(m.week, 'week').format('MMM D, YYYY')
            };
        });
    },

    /**
     * Legacy method for the UI compatibility, gets milestones relative to current week
     */
    getRelevant: function (currentWeek, lmpDate) {
        return this.generateForLMP(lmpDate);
    }
};
