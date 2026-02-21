/**
 * lab-vault.js - Secure Medical Record Storage
 * Namespace: Companion.App.Lab
 */
window.Companion = window.Companion || {};

Companion.Lab = (function () {
    const STORAGE_KEY = 'lab_vault_records';
    const MAX_WIDTH = 1000; // Resize large report images
    const QUALITY = 0.7;

    const categories = [
        { id: 'blood', label: 'Blood Test', icon: 'bi-droplet' },
        { id: 'urine', label: 'Urine Test', icon: 'bi-cup-hot' },
        { id: 'ultrasound', label: 'Ultrasound', icon: 'bi-soundwave' },
        { id: 'sugar', label: 'Glucose', icon: 'bi-speedometer' },
        { id: 'bp', label: 'Blood Pressure', icon: 'bi-heart-pulse' },
        { id: 'consult', label: 'Prescription/Consult', icon: 'bi-file-medical' },
        { id: 'other', label: 'Other', icon: 'bi-files' }
    ];

    return {
        getCategories: function () {
            return categories;
        },

        getRecords: function () {
            return Companion.Data.get(STORAGE_KEY, []);
        },

        addRecord: function (data) {
            const records = this.getRecords();
            const profile = Companion.Data.get('profile');

            // Calculate trimester based on record date and LMP
            let trimester = 0;
            if (profile && profile.lmp) {
                const lmp = dayjs(profile.lmp);
                const date = dayjs(data.date);
                const weeks = date.diff(lmp, 'week');

                if (weeks < 14) trimester = 1;
                else if (weeks < 28) trimester = 2;
                else trimester = 3;
            }

            const record = {
                id: Date.now(),
                timestamp: Date.now(),
                testName: data.testName,
                date: data.date,
                category: data.category,
                resultValue: data.resultValue,
                unit: data.unit || '',
                isAbnormal: data.isAbnormal || false,
                notes: data.notes,
                image: data.image, // Base64
                trimester: trimester
            };

            records.unshift(record);

            try {
                Companion.Data.save(STORAGE_KEY, records);
                return { success: true };
            } catch (e) {
                return { success: false, error: 'Storage full. Please delete old records.' };
            }
        },

        deleteRecord: function (id) {
            const records = this.getRecords().filter(r => r.id !== id);
            Companion.Data.save(STORAGE_KEY, records);
        },

        getRecordsByTrimester: function (trimester) {
            return this.getRecords().filter(r => r.trimester === trimester);
        },

        processImage: function (file, callback) {
            if (!file) {
                callback(null);
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = function (event) {
                const img = new Image();
                img.src = event.target.result;

                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
                    callback(dataUrl);
                };
            };
        }
    };
})();
