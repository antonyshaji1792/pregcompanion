/**
 * appointment-prep.js - Doctor Visit Preparation & Tracking
 * Namespace: Companion.AppointmentPrep
 */
window.Companion = window.Companion || {};

Companion.AppointmentPrep = (function () {
    const STORAGE_KEY = 'appointment_prep_data';

    const trimesterQuestions = {
        1: [
            "What prenatal vitamins do you recommend?",
            "Are there specific foods I should avoid?",
            "What screening tests are available/recommended?",
            "Is my current medication safe?",
            "How much weight should I expect to gain?",
            "When should I schedule my first ultrasound?"
        ],
        2: [
            "When is the anatomy scan scheduled?",
            "How is the baby's growth tracking?",
            "Am I gaining weight at a healthy rate?",
            "What exercises are safe for me now?",
            "When will I start feeling the baby move?",
            "Should I be taking any new supplements (e.g., iron)?"
        ],
        3: [
            "How do I know when labor is starting?",
            "When should I go to the hospital?",
            "Can we discuss my birth plan?",
            "What is your policy on delayed cord clamping?",
            "Do I need the Tdap or flu vaccine?",
            "How can I manage pain during labor?"
        ]
    };

    return {
        getData: function () {
            return Companion.Data.get(STORAGE_KEY) || { appointments: [], nextVisitId: 1 };
        },

        saveData: function (data) {
            Companion.Data.save(STORAGE_KEY, data);
        },

        addAppointment: function (date, doctorName, type) {
            const data = this.getData();
            const newAppt = {
                id: data.nextVisitId++,
                date: date,
                doctorName: doctorName,
                type: type, // 'checkup', 'scan', 'test'
                status: 'upcoming', // upcoming, completed
                questions: [],
                notes: '',
                symptomsAttached: false,
                symptomSummary: null
            };
            data.appointments.push(newAppt);
            data.appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
            this.saveData(data);

            // Add to Reminder Engine
            if (Companion.Reminders) {
                Companion.Reminders.add(`Doctor Visit: ${doctorName}`, date, 'doctor', 1);
            }

            return newAppt;
        },

        getUpcomingAppointment: function () {
            const data = this.getData();
            const today = dayjs().startOf('day');
            return data.appointments.find(a => a.status === 'upcoming' && (dayjs(a.date).isSame(today) || dayjs(a.date).isAfter(today)));
        },

        getPastAppointments: function () {
            const data = this.getData();
            const today = dayjs().startOf('day');
            // Completed or past dates
            return data.appointments.filter(a => a.status === 'completed' || dayjs(a.date).isBefore(today)).reverse();
        },

        updateAppointment: function (id, updates) {
            const data = this.getData();
            const index = data.appointments.findIndex(a => a.id === id);
            if (index !== -1) {
                data.appointments[index] = { ...data.appointments[index], ...updates };
                this.saveData(data);
                return true;
            }
            return false;
        },

        completeAppointment: function (id, notes, nextDate) {
            const success = this.updateAppointment(id, { status: 'completed', notes: notes });
            if (success && nextDate) {
                // Schedule next
                this.addAppointment(nextDate, 'Doctor', 'checkup');
            }
            return success;
        },

        getSuggestedQuestions: function (trimester) {
            return trimesterQuestions[trimester] || trimesterQuestions[1];
        },

        attachSymptomSummary: function (apptId) {
            if (!Companion.Symptoms) return false;

            const summary = Companion.Symptoms.getWeeklySummary();
            const textSummary = `
                Symptoms (Last 7 Days):
                - Total Reported: ${summary.totalSymptoms}
                - Most Frequent: ${summary.mostFrequent || 'None'}
                - Alerts: None active
            `.trim(); // Simplified for now

            return this.updateAppointment(apptId, {
                symptomsAttached: true,
                symptomSummary: textSummary
            });
        },

        getTimeline: function () {
            return this.getData().appointments;
        }
    };
})();
