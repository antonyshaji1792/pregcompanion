/**
 * tracker.js - Weekly pregnancy developmental data
 */
const WeeklyTracker = {
    data: {
        1: { size: "Microscopic", desc: "Your body is preparing for ovulation and potential conception." },
        2: { size: "Microscopic", desc: "Ovulation occurs. If fertilization happens, life begins!" },
        3: { size: "Pinhead", desc: "The fertilized egg is traveling to the uterus and dividing rapidly." },
        4: { size: "Poppy Seed", desc: "Implantation occurs. The embryo is officially at home in your uterus." },
        5: { size: "Apple Seed", desc: "The heart and circulatory system are starting to form." },
        6: { size: "Sweet Pea", desc: "The neural tube closes, and tiny buds that will become limbs appear." },
        7: { size: "Blueberry", desc: "The brain is growing quickly, and the face begins to take shape." },
        8: { size: "Raspberry", desc: "Webbed fingers and toes are forming. Baby is moving, though you can't feel it yet." },
        9: { size: "Green Olive", desc: "The tail at the bottom of the spinal cord disappears. Organs are forming." },
        10: { size: "Prune", desc: "The embryonic period ends; baby is now a fetus. Bones and cartilage form." },
        11: { size: "Lime", desc: "Baby's hands will soon start to open and close into fists." },
        12: { size: "Plum", desc: "Kidneys are starting to produce urine. Most critical development is done." },
        13: { size: "Lemon", desc: "Vocal cords are forming. The second trimester begins next week!" },
        14: { size: "Peach", desc: "Baby can now make facial expressions and may be sucking their thumb." },
        15: { size: "Apple", desc: "Baby is sensitive to light. The skeleton is continuing to harden." },
        16: { size: "Avocado", desc: "The nervous system is starting to take control. Limbs are well-developed." },
        17: { size: "Pomegranate", desc: "Fat stores are beginning to develop under the baby's skin." },
        18: { size: "Bell Pepper", desc: "Baby can now hear your heartbeat and even loud noises outside." },
        19: { size: "Tomato", desc: "A protective coating called vernix caseosa begins to cover the skin." },
        20: { size: "Banana", desc: "Halfway point! Baby is swallowing amniotic fluid to practice for the digestive system." },
        21: { size: "Carrot", desc: "Baby's movements go from flutters to full-on kicks." },
        22: { size: "Papaya", desc: "Taste buds are starting to form. The baby looks like a miniature newborn." },
        23: { size: "Mango", desc: "The sense of movement and balance is developing. Skin is still wrinkled." },
        24: { size: "Corn", desc: "The baby is viable! Lungs are developing branches for breathing." },
        25: { size: "Rutabaga", desc: "The baby's hair grows. They are starting to have regular sleep cycles." },
        26: { size: "Scallion", desc: "Eyes are beginning to open. Baby may respond to light and sound." },
        27: { size: "Cauliflower", desc: "The brain is very active now. Lungs are capable of breathing air." },
        28: { size: "Eggplant", desc: "Third trimester begins! Baby is gaining weight rapidly." },
        29: { size: "Butternut Squash", desc: "The baby's head is growing to make room for the developing brain." },
        30: { size: "Cabbage", desc: "Baby is shedding the fine hair (lanugo) that covered their body." },
        31: { size: "Coconut", desc: "The baby can turn their head from side to side." },
        32: { size: "Jicama", desc: "Baby is practicing breathing and getting ready for the outside world." },
        33: { size: "Pineapple", desc: "The baby's brain/skull is still soft to allow for birth." },
        34: { size: "Cantaloupe", desc: "Central nervous system and lungs are maturing." },
        35: { size: "Honeydew", desc: "Baby is putting on lots of weight. Most major physical development is complete." },
        36: { size: "Romaine Lettuce", desc: "Baby is dropping lower into the pelvis (lightening)." },
        37: { size: "Winter Melon", desc: "Early term! The baby is almost ready for birth." },
        38: { size: "Pumpkin", desc: "Lungs are mature and ready to breathe. Baby is practicing their grip." },
        39: { size: "Watermelon", desc: "Full term! The placenta continues to provide nutrients and antibodies." },
        40: { size: "Jackfruit", desc: "Due date! Baby is about the size of a pumpkin and ready to meet you." }
    },

    getInfo: function (week) {
        if (week < 1) return this.data[1];
        if (week > 40) return this.data[40];
        return this.data[week] || this.data[40];
    }
};
