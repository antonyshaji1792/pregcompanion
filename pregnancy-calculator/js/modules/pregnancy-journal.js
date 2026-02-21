/**
 * pregnancy-journal.js - Personal Pregnancy Diary & Memory Keeper
 * Namespace: Companion.Journal
 */
window.Companion = window.Companion || {};

Companion.Journal = (function () {
    const STORAGE_KEY = 'pregnancy_journal';

    const moodOptions = [
        { id: 'happy', label: 'Happy', emoji: '😊', color: '#10B981', value: 5 },
        { id: 'excited', label: 'Excited', emoji: '🤩', color: '#EC4899', value: 4 },
        { id: 'calm', label: 'Calm', emoji: '😌', color: '#3B82F6', value: 3 },
        { id: 'tired', label: 'Tired', emoji: '😴', color: '#6B7280', value: 2 },
        { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#F59E0B', value: 1 },
        { id: 'emotional', label: 'Emotional', emoji: '🥺', color: '#8B5CF6', value: 2 }
    ];

    return {
        getMoodOptions: function () {
            return moodOptions;
        },

        getEntries: function () {
            return Companion.Data.get(STORAGE_KEY, []);
        },

        addEntry: function (note, mood, photo = null) {
            const entries = this.getEntries();
            const profile = Companion.Data.get('profile');

            // Calculate week if in pregnancy mode
            let week = null;
            if (profile && profile.stage === 'pregnancy' && profile.lmp) {
                const lmp = dayjs(profile.lmp);
                const today = dayjs();
                const totalDays = today.diff(lmp, 'day');
                week = Math.floor(totalDays / 7);
            }

            const entry = {
                id: Date.now(),
                date: dayjs().format('YYYY-MM-DD'),
                time: dayjs().format('HH:mm'),
                timestamp: Date.now(),
                note: note,
                mood: mood,
                photo: photo, // base64 string
                week: week
            };

            entries.unshift(entry);
            Companion.Data.save(STORAGE_KEY, entries);
            return entry;
        },

        deleteEntry: function (id) {
            let entries = this.getEntries();
            entries = entries.filter(e => e.id !== id);
            Companion.Data.save(STORAGE_KEY, entries);
            return entries;
        },

        searchEntries: function (keyword) {
            if (!keyword) return this.getEntries();
            const lowerKeyword = keyword.toLowerCase();
            return this.getEntries().filter(e =>
                (e.note && e.note.toLowerCase().includes(lowerKeyword)) ||
                (e.mood && e.mood.toLowerCase().includes(lowerKeyword))
            );
        },

        getAnxietyAlert: function () {
            // Check last 3 days for anxiety
            const recent = this.getEntries().filter(e => {
                const dayDiff = dayjs().diff(dayjs(e.date), 'day');
                return dayDiff <= 3 && e.mood === 'anxious';
            });

            // If 3+ anxious entries in last 3 days
            return recent.length >= 3;
        },

        getEntriesByDate: function (date) {
            return this.getEntries().filter(e => e.date === date);
        },

        getEntriesByWeek: function (week) {
            return this.getEntries().filter(e => e.week === week);
        },

        getMoodStats: function () {
            const entries = this.getEntries();
            const total = entries.length;
            if (total === 0) return null;

            // Count per mood
            const counts = {};
            moodOptions.forEach(m => counts[m.id] = 0);
            entries.forEach(e => {
                if (counts[e.mood] !== undefined) counts[e.mood]++;
            });

            // Find dominant mood
            let maxCount = -1;
            let dominant = null;
            for (const [mood, count] of Object.entries(counts)) {
                if (count > maxCount) {
                    maxCount = count;
                    dominant = moodOptions.find(m => m.id === mood);
                }
            }

            return {
                total,
                counts,
                dominant
            };
        },

        getMoodTrend: function () {
            // Get last 7 entries for sparking a trend line
            const entries = this.getEntries().slice(0, 14).reverse(); // Last 14 entries
            return {
                labels: entries.map(e => dayjs(e.date).format('MMM D')),
                data: entries.map(e => {
                    const mood = moodOptions.find(m => m.id === e.mood);
                    return mood ? mood.value : 3;
                }),
                moods: entries.map(e => e.mood)
            };
        },

        exportAsText: function () {
            const entries = this.getEntries();
            let text = '=== MY PREGNANCY JOURNAL ===\n\n';

            entries.forEach(entry => {
                const moodData = moodOptions.find(m => m.id === entry.mood);
                text += `Date: ${dayjs(entry.timestamp).format('MMMM D, YYYY - h:mm A')}\n`;
                if (entry.week) text += `Week: ${entry.week}\n`;
                text += `Mood: ${moodData ? moodData.emoji + ' ' + moodData.label : 'N/A'}\n`;
                text += `Note: ${entry.note}\n`;
                if (entry.photo) text += `[Photo attached]\n`;
                text += '\n---\n\n';
            });

            return text;
        }
    };
})();
