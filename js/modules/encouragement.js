/**
 * encouragement.js - Positive Messaging & Celebrations
 * Namespace: Companion.Encouragement
 */
window.Companion = window.Companion || {};

Companion.Encouragement = (function () {
    const LAST_BANNER_KEY = 'last_encouragement_banner';

    const weeklyMessages = {
        4: "Your journey has just begun! Every day is a new milestone. 🌱",
        5: "Your little one is growing rapidly. Take it one day at a time! 💕",
        6: "Morning sickness might be tough, but you're tougher. You've got this! 💪",
        8: "Your baby's heart is beating! What an incredible milestone. ❤️",
        10: "You're doing amazing! Remember to rest and hydrate. 🌸",
        12: "First trimester almost complete! You're doing wonderfully. ✨",
        13: "Welcome to the second trimester! The 'golden period' begins. 🌟",
        14: "You're glowing! This trimester often brings renewed energy. ☀️",
        16: "Halfway through your pregnancy! You're doing beautifully. 🎉",
        18: "You might feel those first flutters soon. How magical! 🦋",
        20: "Halfway there! You're stronger than you know. 💖",
        24: "Your baby can hear you now. Talk, sing, and bond! 🎵",
        25: "You're doing an incredible job nurturing your little one. 🌺",
        28: "Third trimester! The home stretch begins. You're amazing! 🏁",
        30: "Your body is doing something miraculous. Be proud! 🌈",
        32: "Almost there! Rest, prepare, and trust your body. 🌙",
        34: "You're in the final weeks. Every day brings you closer! 🎀",
        36: "Full term is near! Your strength is inspiring. 💝",
        38: "Any day now! You've done so well. Trust the process. 🌸",
        40: "You're ready! Your body knows what to do. Breathe and believe. 🌟"
    };

    const generalMessages = [
        "You are doing great! Every step of this journey matters. 💕",
        "Your strength is incredible. Keep going, mama! 🌟",
        "Remember to be kind to yourself. You're growing a human! 🌸",
        "Take a deep breath. You've got this! 💪",
        "Your body is amazing. Trust the process. ✨",
        "Every day, you're one step closer to meeting your baby. 💖",
        "Rest when you need to. You're doing enough. 🌙",
        "You're not alone on this journey. We're here for you! 🤗"
    ];

    const trimesterCelebrations = {
        1: {
            title: "First Trimester Complete! 🎉",
            message: "You've made it through the first 12 weeks! Your baby has grown from a tiny cluster of cells to a fully formed little human. You're doing amazing!",
            emoji: "🌱➡️👶"
        },
        2: {
            title: "Second Trimester Complete! 🌟",
            message: "You've reached week 27! Your baby is growing stronger every day, and you're doing an incredible job. The final stretch awaits!",
            emoji: "💪✨"
        },
        3: {
            title: "Third Trimester - Almost There! 🎀",
            message: "You're in the home stretch! Your baby is almost ready to meet you. Your strength and dedication have brought you this far. You're amazing!",
            emoji: "🏁💖"
        }
    };

    return {
        getWeeklyMessage: function (week) {
            if (weeklyMessages[week]) {
                return weeklyMessages[week];
            }
            return null;
        },

        getRandomEncouragement: function () {
            return generalMessages[Math.floor(Math.random() * generalMessages.length)];
        },

        shouldShowBanner: function () {
            const lastShown = Companion.Data.get(LAST_BANNER_KEY);
            if (!lastShown) return true;

            // Show banner every 3 days
            const daysSince = Math.floor((Date.now() - lastShown) / (1000 * 60 * 60 * 24));
            return daysSince >= 3;
        },

        markBannerShown: function () {
            Companion.Data.save(LAST_BANNER_KEY, Date.now());
        },

        getTrimesterCelebration: function (trimesterNum) {
            return trimesterCelebrations[trimesterNum];
        },

        celebrateTrimester: function (trimesterNum) {
            const celebration = trimesterCelebrations[trimesterNum];
            if (!celebration) return;

            // Create celebration modal
            const modalHtml = `
                <div class="modal fade" id="trimesterCelebrationModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 rounded-4 overflow-hidden">
                            <div class="modal-body p-0">
                                <div class="celebration-gradient p-5 text-center text-white position-relative">
                                    <div class="celebration-confetti"></div>
                                    <h3 class="fw-bold mb-3">${celebration.title}</h3>
                                    <div class="fs-1 mb-3">${celebration.emoji}</div>
                                    <p class="mb-4">${celebration.message}</p>
                                    <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">
                                        Thank You! 💕
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            // Remove existing modal if any
            $('#trimesterCelebrationModal').remove();

            // Add to body
            $('body').append(modalHtml);

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('trimesterCelebrationModal'));
            modal.show();

            // Trigger confetti
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            // Clean up on hide
            $('#trimesterCelebrationModal').on('hidden.bs.modal', function () {
                $(this).remove();
            });
        }
    };
})();
