/**
 * emergency-card.js - Critical Medical Info Manager
 * Namespace: Companion.App.EmergencyCard
 */
window.Companion = window.Companion || {};

Companion.EmergencyCard = (function () {
    const STORAGE_KEY = 'emergency_card_data';

    const defaultData = {
        name: '',
        bloodGroup: '',
        dueDate: '',
        doctorName: '',
        emergencyContact: '',
        allergies: 'None',
        conditions: 'None'
    };

    return {
        saveData: function (data) {
            try {
                // Ensure we don't overwrite with empty if partial update
                const current = this.getData() || defaultData;
                const newData = { ...current, ...data, updatedAt: Date.now() };
                Companion.Data.save(STORAGE_KEY, newData);
                return { success: true };
            } catch (e) {
                return { success: false, error: 'Could not save emergency info.' };
            }
        },

        getData: function () {
            // Merge with profile data if available and not set locally
            const data = Companion.Data.get(STORAGE_KEY) || { ...defaultData };
            const profile = Companion.Data.get('profile');

            if (profile) {
                if (!data.name) data.name = profile.name;
                if (!data.dueDate) data.dueDate = profile.dueDate;
            }
            return data;
        },

        callEmergency: function () {
            const data = this.getData();
            if (data.emergencyContact) {
                window.location.href = `tel:${data.emergencyContact}`;
            } else {
                alert('Please set an emergency contact number first.');
            }
        }
    };
})();
