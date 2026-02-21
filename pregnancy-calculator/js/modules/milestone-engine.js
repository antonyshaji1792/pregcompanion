/**
 * milestone-engine.js - Clinical schedule and milestones
 * Namespace: Companion.Milestones
 */
window.Companion = window.Companion || {};

Companion.Milestones = (function () {
    const milestonesTemplate = [
        { week: 8, title: "Dating Scan", desc: "Confirm pregnancy and heartbeat.", type: 'scan' },
        { week: 12, title: "NT Scan", desc: "Screening for chromosomal conditions.", type: 'scan' },
        { week: 14, title: "Second Trimester", desc: "Welcome to the second trimester!", type: 'trimester' },
        { week: 20, title: "Anomaly Scan", desc: "Detailed scan of baby's anatomy.", type: 'scan' },
        { week: 24, title: "Viability Milestone", desc: "Baby's chance of survival increases significantly.", type: 'clinical' },
        { week: 28, title: "Third Trimester", desc: "Final stretch begins.", type: 'trimester' },
        { week: 32, title: "Growth Scan", desc: "Optional check on baby's positioning.", type: 'scan' },
        { week: 37, title: "Full Term", desc: "Baby is now considered early term.", type: 'clinical' },
        { week: 40, title: "Due Date", desc: "Estimated arrival of your little one.", type: 'due' }
    ];

    return {
        generateFromLMP: function (lmp) {
            const lmpDate = dayjs(lmp);
            const today = dayjs().startOf('day');

            return milestonesTemplate.map(m => {
                const milestoneDate = lmpDate.add(m.week, 'week');

                let status = 'upcoming';
                if (milestoneDate.isBefore(today, 'day')) {
                    status = 'completed';
                } else if (milestoneDate.isSame(today, 'week')) {
                    status = 'current';
                }

                return {
                    ...m,
                    date: milestoneDate.format('YYYY-MM-DD'),
                    displayDate: milestoneDate.format('MMM D, YYYY'),
                    status: status
                };
            });
        }
    };
})();
