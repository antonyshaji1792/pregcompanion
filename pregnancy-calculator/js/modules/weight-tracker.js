/**
 * weight-tracker.js - Tracks pregnancy weight gain and BMI
 * Namespace: Companion.Weight
 */
window.Companion = window.Companion || {};

Companion.Weight = (function () {
    const STORAGE_KEY = 'weight_data';

    // standard IOM guidelines for total pregnancy weight gain
    const gainGuidelines = {
        underweight: { min: 12.5, max: 18, label: "Underweight (BMI < 18.5)" },
        normal: { min: 11.5, max: 16, label: "Normal weight (BMI 18.5–24.9)" },
        overweight: { min: 7, max: 11.5, label: "Overweight (BMI 25.0–29.9)" },
        obese: { min: 5, max: 9, label: "Obese (BMI ≥ 30.0)" }
    };

    return {
        calculateBMI: function (weightKg, heightCm) {
            if (!weightKg || !heightCm) return null;
            const heightM = heightCm / 100;
            return (weightKg / (heightM * heightM)).toFixed(1);
        },

        getBMICategory: function (bmi) {
            if (bmi < 18.5) return 'underweight';
            if (bmi < 25) return 'normal';
            if (bmi < 30) return 'overweight';
            return 'obese';
        },

        getRecommendations: function (category) {
            return gainGuidelines[category] || gainGuidelines.normal;
        },

        saveSettings: function (preWeight, height) {
            const data = this.getData();
            data.settings = {
                preWeight: parseFloat(preWeight),
                height: parseFloat(height),
                bmi: this.calculateBMI(preWeight, height),
                category: this.getBMICategory(this.calculateBMI(preWeight, height))
            };
            Companion.Data.save(STORAGE_KEY, data);
            return data.settings;
        },

        logWeight: function (weight, week) {
            const data = this.getData();
            data.logs.push({
                week: parseInt(week),
                weight: parseFloat(weight),
                date: dayjs().format('YYYY-MM-DD'),
                timestamp: Date.now()
            });
            // Sort by week
            data.logs.sort((a, b) => a.week - b.week);
            Companion.Data.save(STORAGE_KEY, data);
        },

        getData: function () {
            return Companion.Data.get(STORAGE_KEY, { settings: null, logs: [] });
        },

        getTrendData: function () {
            const data = this.getData();
            if (!data.settings) return null;

            return {
                labels: data.logs.map(l => `W${l.week}`),
                values: data.logs.map(l => l.weight),
                baseline: data.settings.preWeight
            };
        },

        isWithinRange: function (currentWeight, week) {
            const data = this.getData();
            if (!data.settings || week < 1) return true;

            const rec = this.getRecommendations(data.settings.category);
            const totalGain = currentWeight - data.settings.preWeight;

            // Very rough estimate: first trimester 1-2kg, then linear gain
            // For a 40 week pregnancy:
            let expectedMin, expectedMax;
            if (week <= 12) {
                expectedMin = 0;
                expectedMax = 2;
            } else {
                const weeksRemaining = 40 - 12;
                const rateMin = (rec.min - 2) / weeksRemaining;
                const rateMax = (rec.max - 2) / weeksRemaining;
                expectedMin = 1 + (rateMin * (week - 12));
                expectedMax = 2 + (rateMax * (week - 12));
            }

            return {
                gain: totalGain.toFixed(1),
                isHigh: totalGain > expectedMax,
                isLow: totalGain < expectedMin,
                expectedMin: expectedMin.toFixed(1),
                expectedMax: expectedMax.toFixed(1)
            };
        }
    };
})();
