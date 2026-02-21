/**
 * weekly-development.js - Weekly baby development data (1-40)
 * Namespace: Companion.Development
 */
window.Companion = window.Companion || {};

Companion.Development = (function () {
    const weeklyData = {
        1: { size: "Microscopic", emoji: "✨", note: "Conception: The journey begins as your body prepares for pregnancy." },
        2: { size: "Microscopic", emoji: "✨", note: "Ovulation: Fertilization occurs, forming a zygote." },
        3: { size: "Pinhead", emoji: "📍", note: "Implantation: The tiny ball of cells settles into the uterine lining." },
        4: { size: "Poppy Seed", emoji: "🌱", note: "Early Embryo: The amniotic sac and yolk sac are forming." },
        5: { size: "Apple Seed", emoji: "🍎", note: "Heartbeat: The circulatory system and heart begin to develop." },
        6: { size: "Sweet Pea", emoji: "🫛", note: "Features: Neural tube closes, and tiny buds for limbs appear." },
        7: { size: "Blueberry", emoji: "🫐", note: "Brain: Tiny brain and heart are becoming more complex." },
        8: { size: "Raspberry", emoji: "🍓", note: "Movement: Webbed fingers and toes are forming; baby is moving!" },
        9: { size: "Green Olive", emoji: "🫒", note: "Eyes: Eyelids form and the tail at the bottom of the spinal cord disappears." },
        10: { size: "Prune", emoji: "🫐", note: "Organs: Vital organs are now in place and starting to function." },
        11: { size: "Lime", emoji: "🍋‍🟩", note: "Reflexes: Baby starts to make tiny jerky movements and can open its mouth." },
        12: { size: "Plum", emoji: "🍑", note: "Detail: Kidneys begin producing urine and fingernails start to grow." },
        13: { size: "Lemon", emoji: "🍋", note: "Fingerprints: Unique fingerprints have formed on those tiny fingertips." },
        14: { size: "Nectarine", emoji: "🍑", note: "Expressions: Facial muscles are working; baby may squint or frown." },
        15: { size: "Apple", emoji: "🍎", note: "Senses: Baby can sense light from outside your tummy." },
        16: { size: "Avocado", emoji: "🥑", note: "Grip: Baby can now make a fist and even hold onto the umbilical cord." },
        17: { size: "Pear", emoji: "🍐", note: "Sweat: Sweat glands are developing and baby is practicing breathing." },
        18: { size: "Sweet Potato", emoji: "🍠", note: "Hearing: Baby can hear your heartbeat and loud noises from outside." },
        19: { size: "Mango", emoji: "🥭", note: "Vernix: A protective waxy coating forms to protect baby's skin." },
        20: { size: "Banana", emoji: "🍌", note: "Halfway: You might start feeling baby's kicks and flips clearly now." },
        21: { size: "Carrot", emoji: "🥕", note: "Digestion: Baby is swallowing amniotic fluid to practice swallowing." },
        22: { size: "Papaya", emoji: "🥭", note: "Taste: Taste buds have started to develop on the tongue." },
        23: { size: "Grapefruit", emoji: "🍊", note: "Lungs: The lungs are producing surfactant to prepare for breathing." },
        24: { size: "Corn", emoji: "🌽", note: "Viability: Baby has reached a critical milestone for survival outside." },
        25: { size: "Cauliflower", emoji: "🥦", note: "Dexterity: Baby is becoming more active and responsive to touch." },
        26: { size: "Kale", emoji: "🥬", note: "Eyes Open: Baby's eyes are opening and can blink." },
        27: { size: "Head of Lettuce", emoji: "🥗", note: "Sleep: Baby is developing more regular sleep and wake cycles." },
        28: { size: "Eggplant", emoji: "🍆", note: "Dreams: Rapid Eye Movement (REM) sleep begins; baby may be dreaming." },
        29: { size: "Butternut Squash", emoji: "🎃", note: "Brain Growth: The brain is growing rapidly and becoming wrinkled." },
        30: { size: "Cucumber", emoji: "🥒", note: "Temperature: Baby can now regulate their own body temperature better." },
        31: { size: "Pineapple", emoji: "🍍", note: "Space: It’s getting a bit crowded in there; movements feel different." },
        32: { size: "Jicama", emoji: "🥔", note: "Practice: Baby is practicing breathing and swallowing intensely." },
        33: { size: "Durian", emoji: "🍈", note: "Immunity: Baby is receiving antibodies from your blood." },
        34: { size: "Cantaloupe", emoji: "🍈", note: "Bones: Bones are fully developed but remain soft and pliable." },
        35: { size: "Coconut", emoji: "🥥", note: "Fat: Rapid weight gain as baby puts on fat for warmth." },
        36: { size: "Honeydew Melon", emoji: "🍈", note: "Prep: Baby is likely settling into a head-down position for birth." },
        37: { size: "Swiss Chard", emoji: "🥬", note: "Early Term: Baby is considered early term and the lungs are ready." },
        38: { size: "Leek", emoji: "🎋", note: "Grip: The hand grip is now firm and baby is fully formed." },
        39: { size: "Watermelon", emoji: "🍉", note: "Waiting: Baby is just gaining weight and waiting for the big arrival." },
        40: { size: "Pumpkin", emoji: "🎃", note: "Arrival: Baby is fully grown and ready to meet the world!" }
    };

    return {
        getData: function (week) {
            const w = parseInt(week);
            return weeklyData[w] || weeklyData[40];
        },
        getAll: function () {
            return weeklyData;
        }
    };
})();
