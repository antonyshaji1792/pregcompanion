/**
 * health-logs.js - Track BP and Blood Sugar
 * Namespace: Companion.Health
 */
window.Companion = window.Companion || {};

Companion.Health = (function () {
    const BP_KEY = 'health_bp_logs';
    const BS_KEY = 'health_bs_logs';
    const HB_KEY = 'health_hb_logs';

    return {
        // Blood Pressure
        logBP: function (sys, dia) {
            const logs = this.getBPLogs();
            const record = {
                sys: parseInt(sys),
                dia: parseInt(dia),
                date: dayjs().format('YYYY-MM-DD HH:mm'),
                timestamp: Date.now(),
                isHigh: parseInt(sys) >= 140 || parseInt(dia) >= 90
            };
            logs.unshift(record);
            Companion.Storage.save(BP_KEY, logs);
            return record;
        },

        getBPLogs: function () {
            return Companion.Storage.get(BP_KEY, []);
        },

        // Blood Sugar
        logBS: function (value, type) {
            const logs = this.getBSLogs();
            const valNum = parseFloat(value);

            let isHigh = false;
            if (type === 'fasting') {
                isHigh = valNum > 95;
            } else {
                isHigh = valNum > 140;
            }

            const record = {
                value: valNum,
                type: type, // 'fasting' or 'post-meal'
                date: dayjs().format('YYYY-MM-DD HH:mm'),
                timestamp: Date.now(),
                isHigh: isHigh
            };
            logs.unshift(record);
            Companion.Storage.save(BS_KEY, logs);
            return record;
        },

        getBSLogs: function () {
            return Companion.Storage.get(BS_KEY, []);
        },

        getBPChartData: function () {
            const logs = [...this.getBPLogs()].reverse();
            return {
                labels: logs.map(l => dayjs(l.timestamp).format('MMM D')),
                sys: logs.map(l => l.sys),
                dia: logs.map(l => l.dia)
            };
        },

        getBSChartData: function () {
            const logs = [...this.getBSLogs()].reverse();
            return {
                labels: logs.map(l => dayjs(l.timestamp).format('MMM D')),
                values: logs.map(l => l.value),
                types: logs.map(l => l.type)
            };
        },

        // Hemoglobin
        logHB: function (value) {
            const logs = this.getHBLogs();
            const valNum = parseFloat(value);
            const record = {
                value: valNum,
                date: dayjs().format('YYYY-MM-DD HH:mm'),
                timestamp: Date.now(),
                isLow: valNum < 11
            };
            logs.unshift(record);
            Companion.Storage.save(HB_KEY, logs);
            return record;
        },

        getHBLogs: function () {
            return Companion.Storage.get(HB_KEY, []);
        },

        // Risk Assessment
        getRiskAlerts: function () {
            const alerts = [];

            // Check latest BP
            const bpLogs = this.getBPLogs();
            if (bpLogs.length > 0) {
                const latestBP = bpLogs[0];
                if (latestBP.sys > 140 || latestBP.dia > 90) {
                    alerts.push({
                        type: 'danger',
                        icon: 'bi-heart-pulse-fill',
                        title: 'Elevated Blood Pressure',
                        reading: `${latestBP.sys}/${latestBP.dia} mmHg`,
                        guidance: 'Your blood pressure is above the recommended range. Please rest and recheck in 15 minutes. If it remains elevated, contact your healthcare provider.',
                        disclaimer: 'This is not a diagnosis. Always consult your doctor for medical advice.'
                    });
                }
            }

            // Check latest Blood Sugar
            const bsLogs = this.getBSLogs();
            if (bsLogs.length > 0) {
                const latestBS = bsLogs[0];
                if (latestBS.type === 'fasting' && latestBS.value > 95) {
                    alerts.push({
                        type: 'warning',
                        icon: 'bi-droplet-fill',
                        title: 'Elevated Fasting Blood Sugar',
                        reading: `${latestBS.value} mg/dL`,
                        guidance: 'Your fasting blood sugar is higher than the recommended level for pregnancy. Consider dietary adjustments and discuss with your healthcare provider.',
                        disclaimer: 'This is not a diagnosis. Always consult your doctor for medical advice.'
                    });
                } else if (latestBS.type === 'post-meal' && latestBS.value > 140) {
                    alerts.push({
                        type: 'warning',
                        icon: 'bi-droplet-fill',
                        title: 'Elevated Post-Meal Blood Sugar',
                        reading: `${latestBS.value} mg/dL`,
                        guidance: 'Your post-meal blood sugar is higher than recommended. Monitor your carbohydrate intake and consult your healthcare provider.',
                        disclaimer: 'This is not a diagnosis. Always consult your doctor for medical advice.'
                    });
                }
            }

            // Check latest Hemoglobin
            const hbLogs = this.getHBLogs();
            if (hbLogs.length > 0) {
                const latestHB = hbLogs[0];
                if (latestHB.value < 11) {
                    alerts.push({
                        type: 'danger',
                        icon: 'bi-exclamation-triangle-fill',
                        title: 'Low Hemoglobin (Anemia)',
                        reading: `${latestHB.value} g/dL`,
                        guidance: 'Your hemoglobin level is below the normal range for pregnancy. This may indicate anemia. Increase iron-rich foods and discuss iron supplementation with your doctor.',
                        disclaimer: 'This is not a diagnosis. Always consult your doctor for medical advice.'
                    });
                }
            }

            return alerts;
        }
    };
})();
