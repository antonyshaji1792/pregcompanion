/**
 * storage-layer.js - Centralized Data Management
 * Namespace: Companion.Data
 * Description: Handles persistence and abstracts data access for future backend migration.
 */
window.Companion = window.Companion || {};

Companion.Data = (function () {
    const PREFIX = 'preg_companion_';
    const UNIVERSAL_KEYS = ['user_theme', 'active_stage', 'profiles_config'];
    let _currentMode = 'pregnancy';

    /**
     * Internal helper for localStorage access
     */
    const _storage = {
        save: (key, val) => localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(val)),
        get: (key) => {
            const data = localStorage.getItem(`${PREFIX}${key}`);
            try { return data ? JSON.parse(data) : null; } catch (e) { return null; }
        },
        remove: (key) => localStorage.removeItem(`${PREFIX}${key}`)
    };

    return {
        init: function () {
            _currentMode = localStorage.getItem(`${PREFIX}active_stage`);
            try { _currentMode = _currentMode ? JSON.parse(_currentMode) : 'pregnancy'; } catch (e) { _currentMode = 'pregnancy'; }
        },

        setMode: function (mode) {
            _currentMode = mode;
            localStorage.setItem(`${PREFIX}active_stage`, JSON.stringify(mode));
        },

        getMode: function () {
            return _currentMode;
        },

        _getModeKey: function (key) {
            if (UNIVERSAL_KEYS.includes(key)) return key;
            return `${_currentMode}_${key}`;
        },

        /**
         * Generic save method
         * @param {string} key 
         * @param {any} data 
         */
        save: function (key, data) {
            try {
                return _storage.save(this._getModeKey(key), data);
            } catch (error) {
                console.error(`[DataService] Error saving ${key}:`, error);
                return false;
            }
        },

        /**
         * Generic fetch method
         * @param {string} key 
         * @param {any} fallback 
         */
        get: function (key, fallback = null) {
            const data = _storage.get(this._getModeKey(key));
            return data !== null ? data : fallback;
        },

        /**
         * Delete a specific key
         */
        delete: function (key) {
            _storage.remove(this._getModeKey(key));
        },

        /**
         * Export all app data as a single object
         */
        exportAll: function () {
            const backup = {};
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(PREFIX)) {
                    backup[k] = localStorage.getItem(k);
                }
            });
            return backup;
        },

        /**
         * Export all data as downloadable JSON file
         */
        exportAsJSON: function () {
            const data = this.exportAll();
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                appName: 'Pregnancy Companion',
                data: data
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pregnancy-companion-backup-${dayjs().format('YYYY-MM-DD')}.json`;
            a.click();
            URL.revokeObjectURL(url);

            return exportData;
        },

        /**
         * Import data from backup JSON file
         */
        importFromJSON: function (jsonData) {
            try {
                let importData;

                // Parse if string
                if (typeof jsonData === 'string') {
                    importData = JSON.parse(jsonData);
                } else {
                    importData = jsonData;
                }

                // Validate structure
                if (!importData.data || !importData.appName) {
                    throw new Error('Invalid backup file format');
                }

                // Clear existing data
                this.clear();

                // Restore data
                Object.keys(importData.data).forEach(key => {
                    localStorage.setItem(key, importData.data[key]);
                });

                // Reinitialize
                this.init();

                return { success: true, message: 'Data imported successfully!' };
            } catch (error) {
                console.error('[DataService] Import error:', error);
                return { success: false, message: error.message || 'Failed to import data' };
            }
        },

        /**
         * Reset all application data (complete wipe)
         */
        resetAll: function () {
            this.clear();
            this.init();
            return true;
        },

        /**
         * Clear only current mode data (preserve profile and universal settings)
         */
        clearModeData: function (mode = null) {
            const targetMode = mode || _currentMode;
            const modePrefix = `${PREFIX}${targetMode}_`;

            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(modePrefix)) {
                    localStorage.removeItem(k);
                }
            });

            return true;
        },

        /**
         * Get all storage keys for debugging
         */
        getAllKeys: function () {
            const keys = [];
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(PREFIX)) {
                    keys.push(k.replace(PREFIX, ''));
                }
            });
            return keys;
        },

        /**
         * Get storage usage statistics
         */
        getStorageStats: function () {
            let totalSize = 0;
            let itemCount = 0;

            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(PREFIX)) {
                    totalSize += (localStorage.getItem(k) || '').length;
                    itemCount++;
                }
            });

            return {
                itemCount: itemCount,
                totalSize: totalSize,
                totalSizeKB: (totalSize / 1024).toFixed(2),
                totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
            };
        },

        /**
         * Wipe all application data
         */
        clear: function () {
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(PREFIX)) localStorage.removeItem(k);
            });
        }
    };
})();

// Initialize
Companion.Data.init();

// Backward compatibility alias (to prevent breaking other modules during migration)
Companion.Storage = Companion.Data;

