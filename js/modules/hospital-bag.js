/**
 * hospital-bag.js - Hospital Bag Checklist Manager
 * Namespace: Companion.App.HospitalBag
 */
window.Companion = window.Companion || {};

Companion.HospitalBag = (function () {
    const STORAGE_KEY = 'hospital_bag_checklist';

    const defaultItems = {
        mother: [
            { id: 'm1', label: 'Comfortable Clothes / Robe', packed: false },
            { id: 'm2', label: 'Maternity Pads / Underwear', packed: false },
            { id: 'm3', label: 'Toiletries (Brush, Paste, Soap)', packed: false },
            { id: 'm4', label: 'Nursing Bra / Pads', packed: false },
            { id: 'm5', label: 'Slippers / Socks', packed: false },
            { id: 'm6', label: 'Lip Balm / Moisturizer', packed: false },
            { id: 'm7', label: 'Hair Ties / Headband', packed: false },
            { id: 'm8', label: 'Phone & Charger', packed: false }
        ],
        baby: [
            { id: 'b1', label: 'Going Home Outfit', packed: false },
            { id: 'b2', label: 'Onesies / Bodysuits (3-4)', packed: false },
            { id: 'b3', label: 'Newborn Diapers', packed: false },
            { id: 'b4', label: 'Baby Wipes', packed: false },
            { id: 'b5', label: 'Swaddle / Blanket', packed: false },
            { id: 'b6', label: 'Socks / Booties', packed: false },
            { id: 'b7', label: 'Hat / Mitten', packed: false }
        ],
        documents: [
            { id: 'd1', label: 'ID Proof (Aadhar/PAN/Passport)', packed: false },
            { id: 'd2', label: 'Insurance Card / Papers', packed: false },
            { id: 'd3', label: 'Medical Reports / File', packed: false },
            { id: 'd4', label: 'Birth Plan (Printed)', packed: false },
            { id: 'd5', label: 'Hospital Registration Forms', packed: false }
        ],
        partner: [
            { id: 'p1', label: 'Change of Clothes', packed: false },
            { id: 'p2', label: 'Snacks / Drinks', packed: false },
            { id: 'p3', label: 'Phone Charger / Power Bank', packed: false },
            { id: 'p4', label: 'Toiletries', packed: false },
            { id: 'p5', label: 'Cash / Change', packed: false },
            { id: 'p6', label: 'Pillow / Blanket (if needed)', packed: false }
        ]
    };

    return {
        getData: function () {
            const data = Companion.Data.get(STORAGE_KEY);
            if (!data) {
                // Initialize with defaults if empty
                return JSON.parse(JSON.stringify(defaultItems));
            }
            return data;
        },

        toggleItem: function (category, itemId, isPacked) {
            const data = this.getData();
            if (data[category]) {
                const item = data[category].find(i => i.id === itemId);
                if (item) {
                    item.packed = isPacked;
                    Companion.Data.save(STORAGE_KEY, data);
                    return true;
                }
            }
            return false;
        },

        getProgress: function () {
            const data = this.getData();
            let total = 0;
            let packed = 0;

            Object.keys(data).forEach(cat => {
                data[cat].forEach(item => {
                    total++;
                    if (item.packed) packed++;
                });
            });

            return total === 0 ? 0 : Math.round((packed / total) * 100);
        },

        resetList: function () {
            Companion.Data.save(STORAGE_KEY, defaultItems);
        },

        shouldShowReminder: function (currentWeek) {
            const progress = this.getProgress();
            // Show reminder if week >= 32 and progress < 80%
            if (currentWeek >= 32 && progress < 80) {
                return true;
            }
            return false;
        }
    };
})();
