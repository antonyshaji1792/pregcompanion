/**
 * birth-plan.js - Birth Preferences Manager
 * Namespace: Companion.App.BirthPlan
 */
window.Companion = window.Companion || {};

Companion.BirthPlan = (function () {
    const STORAGE_KEY = 'birth_plan_preferences';

    const defaultPlan = {
        deliveryMode: 'vaginal', // vaginal, c-section, open
        painRelief: 'epidural',  // natural, epidural, gas, pethidine
        skinToSkin: true,
        delayedCordClamping: true,
        breastfeedingGoldenHour: true,
        companionAllowed: true,
        companionName: '',
        music: false,
        dimLights: false,
        photography: false,
        notes: ''
    };

    return {
        savePlan: function (data) {
            try {
                const plan = { ...defaultPlan, ...data, updatedAt: Date.now() };
                Companion.Data.save(STORAGE_KEY, plan);
                return { success: true };
            } catch (e) {
                return { success: false, error: 'Could not save birth plan.' };
            }
        },

        getPlan: function () {
            return Companion.Data.get(STORAGE_KEY) || null;
        },

        shouldShowReminder: function (currentWeek) {
            const plan = this.getPlan();
            // Show reminder if week >= 30 and no plan created yet
            if (currentWeek >= 30 && !plan) {
                return true;
            }
            return false;
        },

        getSummaryText: function () {
            const plan = this.getPlan();
            if (!plan) return null;

            return {
                mode: plan.deliveryMode === 'vaginal' ? 'Vaginal Delivery' : (plan.deliveryMode === 'c-section' ? 'C-Section' : 'Open to Doctor\'s Advice'),
                pain: plan.painRelief === 'natural' ? 'Natural (No Meds)' : plan.painRelief.charAt(0).toUpperCase() + plan.painRelief.slice(1),
                environment: [
                    plan.dimLights ? 'Dim Lights' : null,
                    plan.music ? 'Music' : null,
                    plan.photography ? 'Photos/Video' : null
                ].filter(Boolean).join(', '),
                immediateCare: [
                    plan.skinToSkin ? 'Skin-to-Skin' : null,
                    plan.delayedCordClamping ? 'Delayed Cord Clamping' : null,
                    plan.breastfeedingGoldenHour ? 'Golden Hour Breastfeeding' : null
                ].filter(Boolean).join(', '),
                companion: plan.companionAllowed ? `Companion: ${plan.companionName || 'Yes'}` : 'No Companion'
            };
        }
    };
})();
