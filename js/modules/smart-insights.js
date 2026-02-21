/**
 * smart-insights.js - Contextual Guidance & Suggestions
 * Namespace: Companion.Insights
 */
window.Companion = window.Companion || {};

Companion.Insights = (function () {
    const DISMISSED_KEY = 'dismissed_insights';

    return {
        getDismissedInsights: function () {
            return Companion.Data.get(DISMISSED_KEY, []);
        },

        dismissInsight: function (insightId) {
            const dismissed = this.getDismissedInsights();
            if (!dismissed.includes(insightId)) {
                dismissed.push(insightId);
                Companion.Data.save(DISMISSED_KEY, dismissed);
            }
        },

        isInsightDismissed: function (insightId) {
            return this.getDismissedInsights().includes(insightId);
        },

        getActiveInsights: function () {
            const insights = [];
            const profile = Companion.Data.get('profile');

            if (!profile) return insights;

            const mode = profile.stage;
            const dismissed = this.getDismissedInsights();

            // --- PREGNANCY SPECIFIC ---
            if (mode === 'pregnancy') {
                if (!profile.lmp) return insights;
                const gestationData = Companion.Engine.getGestation(profile.lmp);
                if (!gestationData) return insights;

                const weeks = gestationData.weeks;

                // Kick Counter (28+ weeks)
                if (weeks >= 28 && !dismissed.includes('kick_counter_28')) {
                    insights.push({
                        id: 'kick_counter_28',
                        type: 'suggestion',
                        icon: 'bi-heart-pulse',
                        color: 'info',
                        title: 'Track Baby\'s Movements',
                        message: 'Tracking kicks helps monitor your baby\'s well-being. Try our Kick Counter today.',
                        action: 'kicks',
                        actionLabel: 'Start Tracking',
                        priority: 2
                    });
                }

                // Labor Signs (36+ weeks)
                if (weeks >= 36 && !dismissed.includes('labor_signs_36')) {
                    insights.push({
                        id: 'labor_signs_36',
                        type: 'info',
                        icon: 'bi-info-circle',
                        color: 'warning',
                        title: 'Recognizing Labor Signs',
                        message: 'Getting close! Look out for regular contractions, water breaking, or "bloody show".',
                        action: 'labor',
                        actionLabel: 'Learn Signs',
                        priority: 1
                    });
                }

                // Hospital Bag (32+ weeks)
                if (weeks >= 32 && !dismissed.includes('hospital_bag_32')) {
                    insights.push({
                        id: 'hospital_bag_32',
                        type: 'suggestion',
                        icon: 'bi-bag-check',
                        color: 'success',
                        title: 'Pack Your Hospital Bag',
                        message: 'Ensure you have everything ready for the big day with our checklist.',
                        action: 'checklist',
                        actionLabel: 'View Checklist',
                        priority: 3
                    });
                }
            }

            // --- POSTPARTUM SPECIFIC ---
            if (mode === 'postpartum') {
                const recoveryProfile = Companion.Recovery ? Companion.Recovery.getProfile() : null;
                const daysPostpartum = Companion.Recovery ? Companion.Recovery.getDaysPostpartum() : null;

                // Early Recovery Tips (1-7 days)
                if (daysPostpartum !== null && daysPostpartum <= 7 && !dismissed.includes('recovery_tips_week1')) {
                    insights.push({
                        id: 'recovery_tips_week1',
                        type: 'tip',
                        icon: 'bi-bandaid',
                        color: 'info',
                        title: 'Early Recovery Tips',
                        message: 'Rest as much as possible, stay hydrated, and don\'t hesitate to ask for help. Your body needs time to heal.',
                        action: 'recovery',
                        actionLabel: 'Track Recovery',
                        priority: 1
                    });
                }

                // Vaccination Reminder (if baby born)
                if (daysPostpartum !== null && daysPostpartum >= 1 && daysPostpartum <= 14 && !dismissed.includes('vaccination_reminder')) {
                    insights.push({
                        id: 'vaccination_reminder',
                        type: 'suggestion',
                        icon: 'bi-shield-check',
                        color: 'success',
                        title: 'Baby\'s Vaccination Schedule',
                        message: 'Don\'t forget to track your baby\'s immunizations. The first vaccines are due at birth and 6 weeks.',
                        action: 'vaccination',
                        actionLabel: 'View Schedule',
                        priority: 2
                    });
                }

                // Postpartum Checkup Reminder (4-6 weeks)
                if (daysPostpartum !== null && daysPostpartum >= 28 && daysPostpartum <= 42 && !dismissed.includes('postpartum_checkup')) {
                    insights.push({
                        id: 'postpartum_checkup',
                        type: 'reminder',
                        icon: 'bi-calendar-check',
                        color: 'warning',
                        title: 'Schedule Your Postpartum Checkup',
                        message: 'Your 6-week postpartum checkup is important. Make sure to schedule it with your healthcare provider.',
                        priority: 1
                    });
                }
            }

            // --- HEALTH & WELLNESS (ALL MODES) ---

            // 1. Sleep Analysis: < 6 hrs for 3 days
            if (Companion.Sleep && !dismissed.includes('sleep_advice')) {
                const sleepLogs = Companion.Sleep.getWeeklyLogs();
                // Check last 3 entries (most recent dates are at the end usually, but check implementation)
                // getWeeklyLogs returns array of 7 days, likely sorted by date.
                const recentSleep = sleepLogs.slice(-3);
                const lowSleepDays = recentSleep.filter(log => log.totalDuration > 0 && log.totalDuration < 360).length; // 360 mins = 6 hrs

                if (lowSleepDays === 3) {
                    insights.push({
                        id: 'sleep_advice',
                        type: 'tip',
                        icon: 'bi-moon-stars',
                        color: 'purple',
                        title: 'Rest is Important',
                        message: 'It looks like you\'ve had a few short nights. Try a warm bath or reading before bed to help you relax.',
                        priority: 4
                    });
                }
            }

            // 2. Hydration Check: < Goal for 3 days
            if (Companion.Water && !dismissed.includes('hydration_help')) {
                const waterLogs = Companion.Water.getWeeklyLogs();
                const recentWater = waterLogs.slice(-3);
                const lowWaterDays = recentWater.filter(log => log.goal > 0 && log.glasses < log.goal).length;

                if (lowWaterDays === 3) {
                    insights.push({
                        id: 'hydration_help',
                        type: 'suggestion',
                        icon: 'bi-droplet-half',
                        color: 'info',
                        title: 'Hydration Gentle Reminder',
                        message: 'Staying hydrated helps with energy and baby\'s development. Keep a water bottle handy!',
                        action: 'water', // Assuming this opens water tracker
                        actionLabel: 'Log Water',
                        priority: 5
                    });
                }
            }

            // 3. Mood/Anxiety Check
            if (Companion.Symptoms && !dismissed.includes('anxiety_calm')) {
                const summary = Companion.Symptoms.getWeeklySummary();
                const anxietyCount = Object.keys(summary.symptomCounts).reduce((sum, name) => {
                    if (name.toLowerCase().includes('anxiety') || name === 'Mood Swings') {
                        return sum + summary.symptomCounts[name];
                    }
                    return sum;
                }, 0);

                if (anxietyCount >= 3) {
                    insights.push({
                        id: 'anxiety_calm',
                        type: 'tip',
                        icon: 'bi-flower1',
                        color: 'success',
                        title: 'Take a Moment for You',
                        message: 'It\'s normal to feel anxious. Deep breathing or a short walk can help clear your mind. You\'re doing great.',
                        priority: 2
                    });
                }
            }

            // 4. Low Hemoglobin
            if (Companion.Health && Companion.Health.getHBLogs && !dismissed.includes('iron_diet')) {
                const hbLogs = Companion.Health.getHBLogs();
                if (hbLogs.length > 0 && hbLogs[0].value < 11) {
                    insights.push({
                        id: 'iron_diet',
                        type: 'insight',
                        icon: 'bi-egg-fried',
                        color: 'danger',
                        title: 'Boost Your Iron',
                        message: 'Your iron levels are a bit low. Try adding spinach, lentils, or lean meats to your meals.',
                        priority: 1
                    });
                }
            }

            // Fallback Hydration Tip (if no other hydration alert)
            if (!insights.some(i => i.id === 'hydration_help')) {
                const lastDismiss = Companion.Data.get('last_hydration_dismiss');
                const daysSince = lastDismiss ? (Date.now() - lastDismiss) / (86400000) : 999;

                if (daysSince > 7 && !dismissed.includes('hydration_general')) {
                    insights.push({
                        id: 'hydration_general',
                        type: 'tip',
                        icon: 'bi-droplet',
                        color: 'primary',
                        title: 'Daily Hydration',
                        message: 'Aim for 8-10 glasses of water a day to keep you and baby healthy.',
                        priority: 6
                    });
                }
            }

            return insights.sort((a, b) => a.priority - b.priority);
        },

        dismissInsightTemporarily: function (insightId) {
            // For recurring insights like hydration
            if (insightId === 'hydration_reminder') {
                Companion.Data.save('last_hydration_dismiss', Date.now());
            }
        }
    };
})();
