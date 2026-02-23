/**
 * weekly-development.js - Weekly baby development data (1-40)
 * Namespace: Companion.Development
 */
window.Companion = window.Companion || {};

Companion.Development = (function () {
    const weeklyData = {
        1: { size: "Microscopic", length: "—", weight: "—", emoji: "✨", note: "Conception: The journey begins as your body prepares for pregnancy." },
        2: { size: "Microscopic", length: "—", weight: "—", emoji: "✨", note: "Ovulation: Fertilization occurs, forming a zygote." },
        3: { size: "Pinhead", length: "0.1 mm", weight: "< 1 g", emoji: "📍", note: "Implantation: The tiny ball of cells settles into the uterine lining." },
        4: { size: "Poppy Seed", length: "1 mm", weight: "< 1 g", emoji: "🌱", note: "Early Embryo: The amniotic sac and yolk sac are forming." },
        5: { size: "Apple Seed", length: "2 mm", weight: "< 1 g", emoji: "🍎", note: "Heartbeat: The circulatory system and heart begin to develop." },
        6: { size: "Sweet Pea", length: "4 mm", weight: "< 1 g", emoji: "🫛", note: "Features: Neural tube closes, and tiny buds for limbs appear." },
        7: { size: "Blueberry", length: "8 mm", weight: "< 1 g", emoji: "🫐", note: "Brain: Tiny brain and heart are becoming more complex." },
        8: { size: "Raspberry", length: "1.6 cm", weight: "1 g", emoji: "🍓", note: "Movement: Webbed fingers and toes are forming; baby is moving!" },
        9: { size: "Green Olive", length: "2.3 cm", weight: "2 g", emoji: "🫒", note: "Eyes: Eyelids form and the tail at the bottom of the spinal cord disappears." },
        10: { size: "Prune", length: "3.1 cm", weight: "4 g", emoji: "🫐", note: "Organs: Vital organs are now in place and starting to function." },
        11: { size: "Lime", length: "4.1 cm", weight: "7 g", emoji: "🍋‍🟩", note: "Reflexes: Baby starts to make tiny jerky movements and can open its mouth." },
        12: { size: "Plum", length: "5.4 cm", weight: "14 g", emoji: "🍑", note: "Detail: Kidneys begin producing urine and fingernails start to grow." },
        13: { size: "Lemon", length: "7.4 cm", weight: "23 g", emoji: "🍋", note: "Fingerprints: Unique fingerprints have formed on those tiny fingertips." },
        14: { size: "Nectarine", length: "8.7 cm", weight: "43 g", emoji: "🍑", note: "Expressions: Facial muscles are working; baby may squint or frown." },
        15: { size: "Apple", length: "10.1 cm", weight: "70 g", emoji: "🍎", note: "Senses: Baby can sense light from outside your tummy." },
        16: { size: "Avocado", length: "11.6 cm", weight: "100 g", emoji: "🥑", note: "Grip: Baby can now make a fist and even hold onto the umbilical cord." },
        17: { size: "Pear", length: "13 cm", weight: "140 g", emoji: "🍐", note: "Sweat: Sweat glands are developing and baby is practicing breathing." },
        18: { size: "Sweet Potato", length: "14.2 cm", weight: "190 g", emoji: "🍠", note: "Hearing: Baby can hear your heartbeat and loud noises from outside." },
        19: { size: "Mango", length: "15.3 cm", weight: "240 g", emoji: "🥭", note: "Vernix: A protective waxy coating forms to protect baby's skin." },
        20: { size: "Banana", length: "25.6 cm", weight: "300 g", emoji: "🍌", note: "Halfway: You might start feeling baby's kicks and flips clearly now." },
        21: { size: "Carrot", length: "26.7 cm", weight: "360 g", emoji: "🥕", note: "Digestion: Baby is swallowing amniotic fluid to practice swallowing." },
        22: { size: "Papaya", length: "27.8 cm", weight: "430 g", emoji: "🥭", note: "Taste: Taste buds have started to develop on the tongue." },
        23: { size: "Grapefruit", length: "28.9 cm", weight: "500 g", emoji: "🍊", note: "Lungs: The lungs are producing surfactant to prepare for breathing." },
        24: { size: "Corn", length: "30 cm", weight: "600 g", emoji: "🌽", note: "Viability: Baby has reached a critical milestone for survival outside." },
        25: { size: "Cauliflower", length: "34.6 cm", weight: "660 g", emoji: "🥦", note: "Dexterity: Baby is becoming more active and responsive to touch." },
        26: { size: "Kale", length: "35.6 cm", weight: "760 g", emoji: "🥬", note: "Eyes Open: Baby's eyes are opening and can blink." },
        27: { size: "Head of Lettuce", length: "36.6 cm", weight: "875 g", emoji: "🥗", note: "Sleep: Baby is developing more regular sleep and wake cycles." },
        28: { size: "Eggplant", length: "37.6 cm", weight: "1 kg", emoji: "🍆", note: "Dreams: Rapid Eye Movement (REM) sleep begins; baby may be dreaming." },
        29: { size: "Butternut Squash", length: "38.6 cm", weight: "1.2 kg", emoji: "🎃", note: "Brain Growth: The brain is growing rapidly and becoming wrinkled." },
        30: { size: "Cucumber", length: "39.9 cm", weight: "1.3 kg", emoji: "🥒", note: "Temperature: Baby can now regulate their own body temperature better." },
        31: { size: "Pineapple", length: "41.1 cm", weight: "1.5 kg", emoji: "🍍", note: "Space: It’s getting a bit crowded in there; movements feel different." },
        32: { size: "Jicama", length: "42.4 cm", weight: "1.7 kg", emoji: "🥔", note: "Practice: Baby is practicing breathing and swallowing intensely." },
        33: { size: "Durian", length: "43.7 cm", weight: "1.9 kg", emoji: "🍈", note: "Immunity: Baby is receiving antibodies from your blood." },
        34: { size: "Cantaloupe", length: "45 cm", weight: "2.1 kg", emoji: "🍈", note: "Bones: Bones are fully developed but remain soft and pliable." },
        35: { size: "Coconut", length: "46.2 cm", weight: "2.4 kg", emoji: "🥥", note: "Fat: Rapid weight gain as baby puts on fat for warmth." },
        36: { size: "Honeydew Melon", length: "47.4 cm", weight: "2.6 kg", emoji: "🍈", note: "Prep: Baby is likely settling into a head-down position for birth." },
        37: { size: "Swiss Chard", length: "48.6 cm", weight: "2.9 kg", emoji: "🥬", note: "Early Term: Baby is considered early term and the lungs are ready." },
        38: { size: "Leek", length: "49.8 cm", weight: "3.1 kg", emoji: "🎋", note: "Grip: The hand grip is now firm and baby is fully formed." },
        39: { size: "Watermelon", length: "50.7 cm", weight: "3.3 kg", emoji: "🍉", note: "Waiting: Baby is just gaining weight and waiting for the big arrival." },
        40: { size: "Pumpkin", length: "51.2 cm", weight: "3.5 kg", emoji: "🎃", note: "Arrival: Baby is fully grown and ready to meet the world!" }
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
