/**
 * engagement-engine.js - Fun additions and affirmations
 * Namespace: Companion.Engagement
 */
window.Companion = window.Companion || {};

Companion.Engagement = (function () {
    const affirmations = [
        "Your body is doing amazing work, be proud of yourself.",
        "Every day brings you closer to meeting your little one.",
        "You are strong, capable, and already a wonderful mother.",
        "Trust your body; it knows exactly what to do.",
        "You are growing the future. Take time to rest today.",
        "A healthy mother is the best start for a healthy baby.",
        "Your love is the perfect environment for your baby's growth.",
        "Embrace the changes; they are beautiful signs of life.",
        "You are more than enough for your baby.",
        "Focus on the joy that is coming your way."
    ];

    return {
        getDailyAffirmation: function () {
            // Static rotation based on day of month to keep it consistent for the day
            const day = new Date().getDate();
            return affirmations[day % affirmations.length];
        },

        getBadges: function (weeks) {
            const badges = [];
            if (weeks >= 12) badges.push({ title: "First Trimester Grad", icon: "bi-mortarboard", color: "bg-success" });
            if (weeks >= 24) badges.push({ title: "Viability Milestone", icon: "bi-shield-check", color: "bg-info" });
            if (weeks >= 28) badges.push({ title: "3rd Trimester Pro", icon: "bi-trophy", color: "bg-primary" });
            return badges;
        }
    };
})();
