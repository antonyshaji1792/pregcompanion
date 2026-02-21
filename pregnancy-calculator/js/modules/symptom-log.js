/**
 * symptom-log.js - Daily Symptom Tracker
 * Namespace: Companion.Symptoms
 */
window.Companion = window.Companion || {};

Companion.Symptoms = (function () {
    const STORAGE_KEY = 'symptom_logs';

    const predefinedSymptoms = [
        { id: 'nausea', name: 'Nausea', icon: '🤢' },
        { id: 'back_pain', name: 'Back Pain', icon: '🔙' },
        { id: 'heartburn', name: 'Heartburn', icon: '🔥' },
        { id: 'swelling', name: 'Swelling', icon: '💧' },
        { id: 'headache', name: 'Headache', icon: '🤕' },
        { id: 'sleep_issues', name: 'Sleep Issues', icon: '😴' },
        { id: 'mood_swings', name: 'Mood Swings', icon: '😢' },
        { id: 'reduced_movement', name: 'Reduced Baby Movement', icon: '👶' }
    ];

    return {
        getPredefinedSymptoms: function () {
            return predefinedSymptoms;
        },

        logSymptom: function (symptomId, severity, customName = null) {
            const logs = this.getLogs();
            const today = dayjs().format('YYYY-MM-DD');

            if (!logs[today]) {
                logs[today] = {
                    date: today,
                    timestamp: Date.now(),
                    symptoms: []
                };
            }

            // Check if symptom already logged today
            const existingIndex = logs[today].symptoms.findIndex(s => s.id === symptomId);

            const symptomData = {
                id: symptomId,
                name: customName || predefinedSymptoms.find(s => s.id === symptomId)?.name || 'Custom',
                severity: parseInt(severity),
                timestamp: Date.now()
            };

            if (existingIndex >= 0) {
                // Update existing
                logs[today].symptoms[existingIndex] = symptomData;
            } else {
                // Add new
                logs[today].symptoms.push(symptomData);
            }

            Companion.Data.save(STORAGE_KEY, logs);
            return logs[today];
        },

        logCustomSymptom: function (customName, severity) {
            const customId = `custom_${Date.now()}`;
            return this.logSymptom(customId, severity, customName);
        },

        removeSymptom: function (date, symptomId) {
            const logs = this.getLogs();
            if (logs[date]) {
                logs[date].symptoms = logs[date].symptoms.filter(s => s.id !== symptomId);
                if (logs[date].symptoms.length === 0) {
                    delete logs[date];
                }
                Companion.Data.save(STORAGE_KEY, logs);
            }
            return logs;
        },

        getLogs: function () {
            return Companion.Data.get(STORAGE_KEY, {});
        },

        getTodayLog: function () {
            const today = dayjs().format('YYYY-MM-DD');
            const logs = this.getLogs();
            return logs[today] || { date: today, symptoms: [] };
        },

        getWeeklyLogs: function () {
            const logs = this.getLogs();
            const weekAgo = dayjs().subtract(7, 'day');
            const weeklyLogs = [];

            Object.keys(logs).forEach(date => {
                if (dayjs(date).isAfter(weekAgo)) {
                    weeklyLogs.push(logs[date]);
                }
            });

            return weeklyLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        },

        getWeeklySummary: function () {
            const weeklyLogs = this.getWeeklyLogs();
            const symptomCounts = {};
            const symptomSeverities = {};
            let totalSymptoms = 0;

            weeklyLogs.forEach(dayLog => {
                dayLog.symptoms.forEach(symptom => {
                    const key = symptom.name;
                    symptomCounts[key] = (symptomCounts[key] || 0) + 1;

                    if (!symptomSeverities[key]) {
                        symptomSeverities[key] = [];
                    }
                    symptomSeverities[key].push(symptom.severity);
                    totalSymptoms++;
                });
            });

            // Find most frequent
            let mostFrequent = null;
            let maxCount = 0;
            Object.keys(symptomCounts).forEach(symptom => {
                if (symptomCounts[symptom] > maxCount) {
                    maxCount = symptomCounts[symptom];
                    mostFrequent = symptom;
                }
            });

            // Calculate average severities
            const avgSeverities = {};
            Object.keys(symptomSeverities).forEach(symptom => {
                const avg = symptomSeverities[symptom].reduce((a, b) => a + b, 0) / symptomSeverities[symptom].length;
                avgSeverities[symptom] = avg.toFixed(1);
            });

            return {
                totalSymptoms: totalSymptoms,
                uniqueSymptoms: Object.keys(symptomCounts).length,
                mostFrequent: mostFrequent,
                mostFrequentCount: maxCount,
                symptomCounts: symptomCounts,
                avgSeverities: avgSeverities
            };
        },

        checkForAlerts: function () {
            const today = this.getTodayLog();
            const alerts = [];

            // Check for severe headache + swelling
            const headache = today.symptoms.find(s => s.id === 'headache');
            const swelling = today.symptoms.find(s => s.id === 'swelling');

            if (headache && swelling && (headache.severity >= 4 || swelling.severity >= 4)) {
                alerts.push({
                    type: 'danger',
                    title: 'Important: Severe Headache + Swelling',
                    message: 'This combination can be a sign of preeclampsia. Please contact your healthcare provider immediately.',
                    urgent: true
                });
            }

            // Check for reduced movement
            const reducedMovement = today.symptoms.find(s => s.id === 'reduced_movement');
            if (reducedMovement) {
                alerts.push({
                    type: 'warning',
                    title: 'Reduced Baby Movement Noted',
                    message: 'If you notice decreased fetal movement, please contact your healthcare provider. Try the kick counter and monitor your baby\'s activity.',
                    urgent: true
                });
            }

            // Check for severe symptoms
            today.symptoms.forEach(symptom => {
                if (symptom.severity >= 5) {
                    if (symptom.id !== 'headache' && symptom.id !== 'swelling' && symptom.id !== 'reduced_movement') {
                        alerts.push({
                            type: 'warning',
                            title: `Severe ${symptom.name}`,
                            message: 'If this symptom persists or worsens, consider contacting your healthcare provider.',
                            urgent: false
                        });
                    }
                }
            });

            return alerts;
        },

        getChartData: function () {
            const weeklyLogs = this.getWeeklyLogs();
            const last7Days = [];

            // Generate last 7 days
            for (let i = 6; i >= 0; i--) {
                last7Days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
            }

            const datasets = {};
            const labels = last7Days.map(date => dayjs(date).format('MMM D'));

            // Collect all unique symptoms
            weeklyLogs.forEach(dayLog => {
                dayLog.symptoms.forEach(symptom => {
                    if (!datasets[symptom.name]) {
                        datasets[symptom.name] = new Array(7).fill(0);
                    }
                });
            });

            // Fill in severity data
            last7Days.forEach((date, index) => {
                const logs = this.getLogs();
                const dayLog = logs[date];
                if (dayLog) {
                    dayLog.symptoms.forEach(symptom => {
                        if (datasets[symptom.name]) {
                            datasets[symptom.name][index] = symptom.severity;
                        }
                    });
                }
            });

            return {
                labels: labels,
                datasets: Object.keys(datasets).map((symptomName, index) => {
                    const colors = [
                        '#FF9EB7', '#64B5F6', '#A5D6A7', '#FFE082',
                        '#EF9A9A', '#C77DFF', '#FFB6C1', '#87CEEB'
                    ];
                    return {
                        label: symptomName,
                        data: datasets[symptomName],
                        borderColor: colors[index % colors.length],
                        backgroundColor: colors[index % colors.length] + '33',
                        tension: 0.4,
                        fill: false
                    };
                })
            };
        },

        getGuidance: function (symptomId) {
            const guidance = {
                nausea: 'Try eating small, frequent meals. Ginger tea and crackers may help. Stay hydrated.',
                back_pain: 'Practice good posture. Use a pregnancy pillow. Gentle stretching and prenatal yoga can help.',
                heartburn: 'Avoid spicy and fatty foods. Eat smaller meals. Sleep with your head elevated.',
                swelling: 'Elevate your feet when resting. Stay hydrated. Avoid standing for long periods.',
                headache: 'Rest in a quiet, dark room. Stay hydrated. A cold compress may help.',
                sleep_issues: 'Establish a bedtime routine. Use a pregnancy pillow. Avoid screens before bed.',
                mood_swings: 'Talk to loved ones. Practice self-care. Consider prenatal yoga or meditation.',
                reduced_movement: 'Try drinking cold water and lying on your left side. Count kicks. Contact your provider if concerned.'
            };

            return guidance[symptomId] || 'Track this symptom and discuss with your healthcare provider if it persists.';
        }
    };
})();
