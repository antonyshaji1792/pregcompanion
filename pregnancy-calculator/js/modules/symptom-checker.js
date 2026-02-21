/**
 * symptom-checker.js - Non-diagnostic risk assessment
 * Namespace: Companion.Symptoms
 */
window.Companion = window.Companion || {};

Companion.Symptoms = (function () {
    const symptomsData = [
        { id: 'bleeding', label: 'Vaginal Bleeding', risk: 'emergency', icon: 'bi-droplet-fill' },
        { id: 'abdominal_pain', label: 'Severe Abdominal Pain', risk: 'emergency', icon: 'bi-exclamation-octagon' },
        { id: 'fever', label: 'Fever (above 38°C/100.4°F)', risk: 'monitor', icon: 'bi-thermometer-half' },
        { id: 'headache', label: 'Severe Headache/Vision Changes', risk: 'emergency', icon: 'bi-lightning-charge' },
        { id: 'movement', label: 'Reduced Baby Movement', risk: 'emergency', icon: 'bi-hand-index-thumb' },
        { id: 'swelling', label: 'Sudden Swelling (Face/Hands)', risk: 'monitor', icon: 'bi-person-exclamation' }
    ];

    const guidance = {
        emergency: {
            title: "Urgent Action Required",
            message: "One or more symptoms indicate a potential emergency. Please contact your maternity unit or emergency services immediately.",
            class: "alert-danger",
            icon: "bi-exclamation-triangle-fill"
        },
        monitor: {
            title: "Clinical Consultation Recommended",
            message: "These symptoms require monitoring. Please contact your midwife or doctor today for a non-urgent assessment.",
            class: "alert-warning",
            icon: "bi-info-circle-fill"
        },
        normal: {
            title: "Supportive Care",
            message: "If you feel well otherwise, continue to monitor. However, always trust your instincts—call your midwife if you are concerned.",
            class: "alert-success",
            icon: "bi-check-circle-fill"
        }
    };

    return {
        getSymptoms: function () {
            return symptomsData;
        },

        assessRisk: function (selectedIds) {
            if (selectedIds.length === 0) return null;

            const selectedSymptoms = symptomsData.filter(s => selectedIds.includes(s.id));

            // Determine highest risk
            const hasEmergency = selectedSymptoms.some(s => s.risk === 'emergency');
            const hasMonitor = selectedSymptoms.some(s => s.risk === 'monitor');

            if (hasEmergency) return guidance.emergency;
            if (hasMonitor) return guidance.monitor;
            return guidance.normal;
        }
    };
})();
