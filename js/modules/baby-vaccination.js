/**
 * baby-vaccination.js - Indian Immunization Schedule Tracker
 * Namespace: Companion.Vaccination
 */
window.Companion = window.Companion || {};

Companion.Vaccination = (function () {
    const STORAGE_KEY = 'baby_vaccination';

    const indianSchedule = [
        {
            id: 'birth',
            age: 'At Birth',
            ageInDays: 0,
            vaccines: [
                { name: 'BCG', description: 'Bacillus Calmette-Guérin (Tuberculosis)' },
                { name: 'OPV-0', description: 'Oral Polio Vaccine (Birth dose)' },
                { name: 'Hepatitis B-1', description: 'Hepatitis B (1st dose)' }
            ]
        },
        {
            id: 'week6',
            age: '6 Weeks',
            ageInDays: 42,
            vaccines: [
                { name: 'DTwP-1/DTaP-1', description: 'Diphtheria, Tetanus, Pertussis (1st dose)' },
                { name: 'IPV-1', description: 'Inactivated Polio Vaccine (1st dose)' },
                { name: 'Hib-1', description: 'Haemophilus influenzae type b (1st dose)' },
                { name: 'Hepatitis B-2', description: 'Hepatitis B (2nd dose)' },
                { name: 'PCV-1', description: 'Pneumococcal Conjugate Vaccine (1st dose)' },
                { name: 'Rotavirus-1', description: 'Rotavirus Vaccine (1st dose)' }
            ]
        },
        {
            id: 'week10',
            age: '10 Weeks',
            ageInDays: 70,
            vaccines: [
                { name: 'DTwP-2/DTaP-2', description: 'Diphtheria, Tetanus, Pertussis (2nd dose)' },
                { name: 'IPV-2', description: 'Inactivated Polio Vaccine (2nd dose)' },
                { name: 'Hib-2', description: 'Haemophilus influenzae type b (2nd dose)' },
                { name: 'PCV-2', description: 'Pneumococcal Conjugate Vaccine (2nd dose)' },
                { name: 'Rotavirus-2', description: 'Rotavirus Vaccine (2nd dose)' }
            ]
        },
        {
            id: 'week14',
            age: '14 Weeks',
            ageInDays: 98,
            vaccines: [
                { name: 'DTwP-3/DTaP-3', description: 'Diphtheria, Tetanus, Pertussis (3rd dose)' },
                { name: 'IPV-3', description: 'Inactivated Polio Vaccine (3rd dose)' },
                { name: 'Hib-3', description: 'Haemophilus influenzae type b (3rd dose)' },
                { name: 'Hepatitis B-3', description: 'Hepatitis B (3rd dose)' },
                { name: 'PCV-3', description: 'Pneumococcal Conjugate Vaccine (3rd dose)' },
                { name: 'Rotavirus-3', description: 'Rotavirus Vaccine (3rd dose)' }
            ]
        },
        {
            id: 'month6',
            age: '6 Months',
            ageInDays: 180,
            vaccines: [
                { name: 'OPV-1', description: 'Oral Polio Vaccine (1st dose)' },
                { name: 'Hepatitis B-4', description: 'Hepatitis B (4th dose - if needed)' }
            ]
        },
        {
            id: 'month9',
            age: '9 Months',
            ageInDays: 270,
            vaccines: [
                { name: 'OPV-2', description: 'Oral Polio Vaccine (2nd dose)' },
                { name: 'MMR-1', description: 'Measles, Mumps, Rubella (1st dose)' }
            ]
        },
        {
            id: 'month12',
            age: '12 Months',
            ageInDays: 365,
            vaccines: [
                { name: 'Hepatitis A-1', description: 'Hepatitis A (1st dose)' },
                { name: 'Typhoid Conjugate', description: 'Typhoid Conjugate Vaccine' }
            ]
        },
        {
            id: 'month15',
            age: '15 Months',
            ageInDays: 455,
            vaccines: [
                { name: 'MMR-2', description: 'Measles, Mumps, Rubella (2nd dose)' },
                { name: 'Varicella-1', description: 'Chickenpox Vaccine (1st dose)' },
                { name: 'PCV Booster', description: 'Pneumococcal Conjugate Vaccine (Booster)' }
            ]
        },
        {
            id: 'month18',
            age: '18 Months',
            ageInDays: 545,
            vaccines: [
                { name: 'DTwP/DTaP Booster-1', description: 'Diphtheria, Tetanus, Pertussis (1st Booster)' },
                { name: 'IPV Booster-1', description: 'Inactivated Polio Vaccine (1st Booster)' },
                { name: 'Hib Booster', description: 'Haemophilus influenzae type b (Booster)' },
                { name: 'Hepatitis A-2', description: 'Hepatitis A (2nd dose)' }
            ]
        }
    ];

    return {
        getSchedule: function () {
            return indianSchedule;
        },

        getVaccinationData: function () {
            return Companion.Data.get(STORAGE_KEY, {});
        },

        markAsCompleted: function (scheduleId, vaccineName, date = null) {
            const data = this.getVaccinationData();
            if (!data[scheduleId]) data[scheduleId] = {};

            data[scheduleId][vaccineName] = {
                completed: true,
                date: date || dayjs().format('YYYY-MM-DD'),
                timestamp: Date.now()
            };

            Companion.Data.save(STORAGE_KEY, data);
            return data;
        },

        unmarkCompleted: function (scheduleId, vaccineName) {
            const data = this.getVaccinationData();
            if (data[scheduleId] && data[scheduleId][vaccineName]) {
                delete data[scheduleId][vaccineName];
                Companion.Data.save(STORAGE_KEY, data);
            }
            return data;
        },

        isCompleted: function (scheduleId, vaccineName) {
            const data = this.getVaccinationData();
            return data[scheduleId] && data[scheduleId][vaccineName] && data[scheduleId][vaccineName].completed;
        },

        getProgress: function () {
            const data = this.getVaccinationData();
            let totalVaccines = 0;
            let completedVaccines = 0;

            indianSchedule.forEach(schedule => {
                schedule.vaccines.forEach(vaccine => {
                    totalVaccines++;
                    if (this.isCompleted(schedule.id, vaccine.name)) {
                        completedVaccines++;
                    }
                });
            });

            return {
                total: totalVaccines,
                completed: completedVaccines,
                percentage: totalVaccines > 0 ? Math.round((completedVaccines / totalVaccines) * 100) : 0
            };
        },

        getUpcomingVaccines: function (babyBirthDate) {
            if (!babyBirthDate) return [];

            const birthDate = dayjs(babyBirthDate);
            const today = dayjs();
            const babyAgeInDays = today.diff(birthDate, 'day');

            const upcoming = [];
            const data = this.getVaccinationData();

            indianSchedule.forEach(schedule => {
                const dueDate = birthDate.add(schedule.ageInDays, 'day');
                const daysUntilDue = dueDate.diff(today, 'day');

                // Show if due within next 30 days or overdue
                if (daysUntilDue <= 30 && daysUntilDue >= -90) {
                    const allCompleted = schedule.vaccines.every(v =>
                        this.isCompleted(schedule.id, v.name)
                    );

                    if (!allCompleted) {
                        upcoming.push({
                            ...schedule,
                            dueDate: dueDate.format('YYYY-MM-DD'),
                            dueDateFormatted: dueDate.format('MMM D, YYYY'),
                            daysUntilDue: daysUntilDue,
                            isOverdue: daysUntilDue < 0,
                            status: daysUntilDue < 0 ? 'overdue' : daysUntilDue <= 7 ? 'urgent' : 'upcoming'
                        });
                    }
                }
            });

            return upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
        }
    };
})();
