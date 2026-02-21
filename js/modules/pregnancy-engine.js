/**
 * pregnancy-engine.js - Core maternity logic
 * Namespace: Companion.Engine
 */
window.Companion = window.Companion || {};

Companion.Engine = (function () {
    const PREGNANCY_DAYS = 280;

    const developmentalData = {
        4: { size: "Poppy Seed", emoji: "🌱", note: "The zygote has implanted.", length: "0.1 cm", weight: "< 1 g" },
        5: { size: "Orange Seed", emoji: "🍊", note: "The heart begins to beat.", length: "0.33 cm", weight: "< 1 g" },
        6: { size: "Sweet Pea", emoji: "🫛", note: "Facial features start to form.", length: "0.64 cm", weight: "< 1 g" },
        7: { size: "Blueberry", emoji: "🫐", note: "Arm and leg buds are growing.", length: "1.3 cm", weight: "< 1 g" },
        8: { size: "Raspberry", emoji: "🍓", note: "Fingers and toes are forming.", length: "1.6 cm", weight: "1 g" },
        10: { size: "Prune", emoji: "🫒", note: "Baby is now a fetus.", length: "3.1 cm", weight: "4 g" },
        12: { size: "Plum", emoji: "🍑", note: "Kidneys begin to produce urine.", length: "5.4 cm", weight: "14 g" },
        14: { size: "Lemon", emoji: "🍋", note: "Baby can squint and frown.", length: "8.7 cm", weight: "43 g" },
        16: { size: "Avocado", emoji: "🥑", note: "Nervous system is functioning.", length: "11.6 cm", weight: "100 g" },
        18: { size: "Sweet Potato", emoji: "🍠", note: "Baby can feel your movements.", length: "14.2 cm", weight: "190 g" },
        20: { size: "Banana", emoji: "🍌", note: "Halfway! Baby hears your voice.", length: "16.4 cm", weight: "300 g" },
        22: { size: "Coconut", emoji: "🥥", note: "Taste buds are fully formed.", length: "27.8 cm", weight: "430 g" },
        24: { size: "Corn", emoji: "🌽", note: "Viability reached. Lungs developing.", length: "30 cm", weight: "0.6 kg" },
        26: { size: "Zucchini", emoji: "🥒", note: "Brain activity for sight & sound.", length: "35.6 cm", weight: "0.76 kg" },
        28: { size: "Eggplant", emoji: "🍆", note: "Baby can open eyes and sense light.", length: "37.6 cm", weight: "1 kg" },
        30: { size: "Cabbage", emoji: "🥬", note: "Lungs and digestive tract nearly ready.", length: "39.9 cm", weight: "1.3 kg" },
        32: { size: "Squash", emoji: "🎃", note: "Developing fingernails and toenails.", length: "42.4 cm", weight: "1.7 kg" },
        34: { size: "Cantaloupe", emoji: "🍈", note: "Skull is still soft for birth.", length: "45 cm", weight: "2.1 kg" },
        36: { size: "Lettuce", emoji: "🥗", note: "Baby is dropping into the pelvis.", length: "47.4 cm", weight: "2.6 kg" },
        38: { size: "Watermelon", emoji: "🍉", note: "Considered full term.", length: "49.8 cm", weight: "3 kg" },
        40: { size: "Pumpkin", emoji: "🎃", note: "Baby is fully developed and ready!", length: "51.2 cm", weight: "3.5 kg" }
    };

    return {
        calculateEDD: function (lmp, cycle = 28) {
            const lmpDate = dayjs(lmp);
            const adjustment = parseInt(cycle) - 28;
            return lmpDate.add(PREGNANCY_DAYS + adjustment, 'day');
        },

        getGestation: function (lmp) {
            const today = dayjs().startOf('day');
            const lmpDate = dayjs(lmp);
            const totalDays = today.diff(lmpDate, 'day');
            const edd = this.calculateEDD(lmp);

            return {
                totalDays,
                weeks: Math.floor(totalDays / 7),
                days: totalDays % 7,
                daysRemaining: Math.max(0, edd.diff(today, 'day')),
                progress: Math.min(100, (totalDays / PREGNANCY_DAYS) * 100)
            };
        },

        getTrimester: function (weeks) {
            if (weeks <= 13) return { num: 1, label: "First", color: "bg-warning" };
            if (weeks <= 27) return { num: 2, label: "Second", color: "bg-info text-white" };
            return { num: 3, label: "Third", color: "bg-success text-white" };
        },

        getBabyInfo: function (weeks) {
            // 1. Get Fallback Data (Sparse: 4, 6, 8... weeks)
            const availableWeeks = Object.keys(developmentalData).map(Number).sort((a, b) => b - a);
            const key = availableWeeks.find(w => weeks >= w) || 4;
            const fallbackData = developmentalData[key];

            // 2. Get Detailed Data (Dense: 1, 2, 3... weeks)
            if (window.Companion.Development) {
                const detailed = window.Companion.Development.getData(weeks);
                if (detailed) {
                    // Merge: prefer detailed (note, emoji, size) but fill gaps (length, weight) from fallback
                    return {
                        ...fallbackData,   // Base properties (including length/weight from nearest milestone)
                        ...detailed,       // Overwrite with detailed info (note, emoji, precise size name)
                        weeks,             // Ensure correct week number
                        // Ensure length/weight are present (prefer detailed if exists, else fallback)
                        length: detailed.length || fallbackData.length || '—',
                        weight: detailed.weight || fallbackData.weight || '—'
                    };
                }
            }

            // 3. Return Fallback if no detailed module
            return { ...fallbackData, weeks: key };
        },

        getTimeline: function (lmp) {
            const lmpDate = dayjs(lmp);
            const today = dayjs().startOf('day');
            const timeline = [];

            const milestones = {
                3: "Baby conceived",
                4: "Pregnancy test positive",
                6: "Heartbeat detectable by ultrasound",
                12: "Miscarriage risk decreases",
                14: "Baby can squint and frown",
                19: "Baby begins making noticeable movements, can hear sounds, and gender can be found out",
                23: "Premature baby may survive",
                28: "Baby can breathe",
                37: "Early Term",
                39: "Full Term"
            };

            for (let week = 1; week <= 40; week++) {
                const weekStart = lmpDate.add((week - 1) * 7, 'day');
                const weekEnd = weekStart.add(6, 'day');
                const isToday = today.isBetween(weekStart, weekEnd, 'day', '[]');
                const trimester = this.getTrimester(week);

                timeline.push({
                    week,
                    start: weekStart.format('MMM D, YYYY'),
                    end: weekEnd.format('MMM D, YYYY'),
                    trimester: trimester.label,
                    milestone: milestones[week] || "",
                    isToday
                });
            }

            return timeline;
        }
    };
})();
