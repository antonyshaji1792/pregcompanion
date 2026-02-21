/**
 * preconception-health.js - Health Readiness for Planning Mode
 * Namespace: Companion.HealthPlanning
 */
window.Companion = window.Companion || {};

Companion.HealthPlanning = (function () {
    const STORAGE_KEY = 'preconception_health';

    return {
        getHealthData: function () {
            return Companion.Data.get(STORAGE_KEY, {
                weight: null,
                height: null,
                hb: null,
                thyroid: 'normal', // normal, hypothyroid, hyperthyroid
                folicAcid: false, // daily check
                lastFolicDate: null
            });
        },

        saveHealthData: function (data) {
            const current = this.getHealthData();
            const updated = { ...current, ...data };
            Companion.Data.save(STORAGE_KEY, updated);
            return updated;
        },

        calculateBMI: function (w, h) {
            if (!w || !h) return null;
            const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
            return parseFloat(bmi);
        },

        getReadinessScore: function () {
            const data = this.getHealthData();
            const bmi = this.calculateBMI(data.weight, data.height);
            let score = 0;
            let totalPossible = 5;

            // 1. BMI Score (18.5 - 24.9 is ideal)
            if (bmi >= 18.5 && bmi <= 25) score += 1;
            else if (bmi > 25 && bmi <= 30) score += 0.5;

            // 2. Hemoglobin (Ideal > 12)
            if (data.hb >= 12) score += 1;
            else if (data.hb >= 10) score += 0.5;

            // 3. Thyroid
            if (data.thyroid === 'normal') score += 1;

            // 4. Folic Acid (Checked today?)
            const today = dayjs().format('YYYY-MM-DD');
            if (data.folicAcid && data.lastFolicDate === today) score += 1;

            // 5. Weight recorded
            if (data.weight) score += 1;

            const percentage = (score / totalPossible) * 100;

            if (percentage >= 80) return { label: 'Ready', class: 'bg-success', percentage };
            if (percentage >= 50) return { label: 'Good', class: 'bg-primary', percentage };
            return { label: 'Needs improvement', class: 'bg-warning', percentage };
        },

        toggleFolicAcid: function (checked) {
            const today = dayjs().format('YYYY-MM-DD');
            this.saveHealthData({
                folicAcid: checked,
                lastFolicDate: checked ? today : null
            });
        }
    };
})();
