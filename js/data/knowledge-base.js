/**
 * Knowledge Base Data Repository
 * Contains all educational articles and their metadata for dynamic rendering.
 */
const KnowledgeBase = {
    categories: [
        {
            id: 'conception',
            title: 'Conception & Planning',
            articles: [
                {
                    id: 'article-fertility',
                    cardTitle: 'Fertility Basics',
                    cardDesc: 'DNA and conception essentials for your journey.',
                    icon: 'bi-dna',
                    bgColor: '#E3F2FD',
                    iconClass: 'text-primary',
                    detail: {
                        title: '🧬 Fertility Basics',
                        lead: 'Understanding your body and the science of conception is the first step...',
                        contentHtml: `
                            <section class="mb-5">
                                <h4 class="fw-bold text-primary mb-3">The Journey to Pregnancy</h4>
                                <div class="premium-card p-4 border-0 bg-light mb-3">
                                    <h6 class="fw-bold">How long does it take to get pregnant?</h6>
                                    <p class="small text-muted mb-0">Most healthy couples (about 84%) conceive within a year of regular unprotected sex.</p>
                                </div>
                                <div class="premium-card p-4 border-0 bg-light">
                                    <h6 class="fw-bold">What is the best age to get pregnant?</h6>
                                    <p class="small text-muted mb-0">Biologically, fertility is highest in your 20s. After 35, the quantity and quality of eggs decrease more rapidly.</p>
                                </div>
                            </section>
                            <section class="mb-5">
                                <h4 class="fw-bold text-accent mb-3">Timing & Your Cycle</h4>
                                <div class="row g-3">
                                    <div class="col-md-6"><div class="premium-card p-3 border-0 bg-soft-rose h-100"><h6 class="fw-bold small">Days After Periods</h6><p class="x-small mb-0 text-muted">You can get pregnant as soon as 1-2 days after your period ends.</p></div></div>
                                    <div class="col-md-6"><div class="premium-card p-3 border-0 bg-soft-primary h-100"><h6 class="fw-bold small">Fertile Window</h6><p class="x-small mb-0 text-muted">A 6-day window including the 5 days before ovulation.</p></div></div>
                                </div>
                            </section>
                        `,
                        sidebarHtml: `
                            <h5 class="fw-bold mb-3">Plan Your Cycle</h5>
                            <button class="btn btn-primary w-100 rounded-pill mb-2" onclick="Companion.UI.Calculators.Ovulation.open()">Ovulation Calculator</button>
                        `
                    }
                },
                {
                    id: 'article-sex',
                    cardTitle: 'Sex & Timing',
                    cardDesc: 'Practical advice on intimacy for your journey.',
                    icon: 'bi-heart-fill',
                    bgColor: '#FFEBEE',
                    iconClass: 'text-danger',
                    detail: {
                        title: '❤️ Sex & Timing',
                        lead: 'Optimizing intimacy is about more than just physics—it\'s about understanding biological windows.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-danger mb-3">Maximizing Chances</h4><div class="premium-card p-4 border-0 bg-light mb-4"><h6 class="fw-bold">Best positions to get pregnant?</h6><p class="small text-muted mb-0">No scientific evidence suggests that one position is superior for conception. The most important factor is the deposit of sperm at or near the cervix.</p></div></section>`,
                        sidebarHtml: `<button class="btn btn-danger w-100 rounded-pill" onclick="Companion.UI.Calculators.Ovulation.open()">Ovulation Pro</button>`
                    }
                },
                {
                    id: 'article-myths',
                    cardTitle: 'Common Myths',
                    cardDesc: 'Debunking misconceptions about your fertile journey.',
                    icon: 'bi-question-circle',
                    bgColor: '#FFF9C4',
                    iconClass: 'text-warning',
                    detail: {
                        title: '❓ Common Myths',
                        lead: 'Distinguishing fact from fiction is essential for a stress-free conception journey.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-warning mb-3">Physical Misconceptions</h4><div class="premium-card p-4 border-0 bg-light mb-4"><h6 class="fw-bold">Can washing after sex prevent pregnancy?</h6><p class="small text-muted mb-0">No. Sperm reach the cervical canal within seconds of ejaculation. Douching or washing does not prevent pregnancy.</p></div></section>`,
                        sidebarHtml: `<button class="btn btn-warning w-100 rounded-pill" onclick="Companion.UI.showModule('journal')">Log Your Symptoms</button>`
                    }
                },
                {
                    id: 'article-lifestyle',
                    cardTitle: 'Lifestyle & Diet',
                    cardDesc: 'Fuel your fertility with the right habits and nutrition.',
                    icon: 'bi-basket',
                    bgColor: '#E8F5E9',
                    iconClass: 'text-success',
                    detail: {
                        title: '🥗 Lifestyle & Diet',
                        lead: 'What you eat and how you live can significantly impact your reproductive health.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-success mb-3">Fertility Superfoods</h4><div class="premium-card p-4 border-0 bg-light mb-4"><h6 class="fw-bold">What to eat to get pregnant fast?</h6><p class="small text-muted mb-0">Focus on the "Fertility Diet": whole grains, plant-based proteins, and healthy fats like avocados.</p></div></section>`,
                        sidebarHtml: `<button class="btn btn-success w-100 rounded-pill" onclick="Companion.UI.showModule('article-eating')">Full Eating Guide</button>`
                    }
                },
                {
                    id: 'article-ovulation',
                    cardTitle: 'Ovulation & Cycle',
                    cardDesc: 'Master your body\'s natural timing and signals.',
                    icon: 'bi-calendar-check',
                    bgColor: '#FCE4EC',
                    iconClass: 'text-primary-rose',
                    detail: {
                        title: '🩸 Ovulation & Cycle',
                        lead: 'Mastering the signals of your menstrual cycle is key to understanding your fertility.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-accent mb-3">Identifying Ovulation</h4><div class="premium-card p-4 border-0 bg-light mb-4"><h6 class="fw-bold">How to know ovulation day?</h6><p class="small text-muted mb-0">Track your Basal Body Temperature, use Ovulation Predictor Kits, or observe changes in cervical mucus.</p></div></section>`,
                        sidebarHtml: `<button class="btn btn-primary-rose w-100 rounded-pill text-white" onclick="Companion.UI.Calculators.Ovulation.open()">Ovulation Calc</button>`
                    }
                },
                {
                    id: 'article-medical',
                    cardTitle: 'Medical & Tests',
                    cardDesc: 'Scientific benchmarks and screening for your journey.',
                    icon: 'bi-shield-plus',
                    bgColor: '#F3E5F5',
                    iconClass: 'text-purple',
                    detail: {
                        title: '💊 Medical & Tests',
                        lead: 'Science-backed guidance on medical benchmarks and reproductive health conditions.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-purple mb-3">Clinical Benchmarks</h4><div class="premium-card p-4 border-0 bg-light mb-4"><h6 class="fw-bold">When to see a doctor for infertility?</h6><p class="small text-muted mb-0">After 12 months if under 35, or after 6 months if 35 or older.</p></div></section>`,
                        sidebarHtml: `<button class="btn btn-purple w-100 rounded-pill text-white" onclick="Companion.UI.showModule('lab')">Medical Vault</button>`
                    }
                }
            ]
        },
        {
            id: 'pregnancy',
            title: 'Pregnancy Journey',
            articles: [
                {
                    id: 'article-eating',
                    cardTitle: 'Healthy Eating',
                    cardDesc: 'Essential vitamins and nutrients for your pregnancy.',
                    icon: 'bi-egg-fried',
                    bgColor: 'var(--primary-rose-soft)',
                    iconClass: 'text-primary-rose',
                    detail: {
                        title: 'Healthy Eating Guide',
                        lead: 'A balanced diet is essential for your baby\'s development and your own well-being.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-accent">Essential Nutrients</h4><div class="row g-3 mt-3"><div class="col-md-6"><div class="premium-card p-3 border-0 bg-soft-rose"><h6 class="fw-bold mb-2">Folic Acid</h6><p class="small mb-0 text-muted">Protects against neural tube defects.</p></div></div><div class="col-md-6"><div class="premium-card p-3 border-0 bg-soft-primary"><h6 class="fw-bold mb-2">Calcium</h6><p class="small mb-0 text-muted">Builds strong bones and teeth.</p></div></div></div></section>`,
                        sidebarHtml: `<button class="btn btn-premium w-100 rounded-pill" onclick="Companion.UI.Tools.Hydration.open()">Track Hydration</button>`
                    }
                },
                {
                    id: 'article-yoga',
                    cardTitle: 'Yoga & Breathing',
                    cardDesc: 'Gentle exercises to keep you calm and flexible.',
                    icon: 'bi-wind',
                    bgColor: 'var(--accent-blue-soft)',
                    iconClass: 'text-accent',
                    detail: {
                        title: 'Yoga & Breathing',
                        lead: 'Stay calm, flexible, and connected with your baby through gentle movement.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-accent">Gentle Poses</h4><div class="premium-card p-4 border-0 bg-light flex-row d-flex align-items-center gap-4"><div class="fs-1">🧘‍♀️</div><div><h6 class="fw-bold mb-1">Cat-Cow Pose</h6><p class="small mb-0 text-muted">Relieves back tension.</p></div></div></section>`,
                        sidebarHtml: `<button class="btn btn-premium w-100 rounded-pill" onclick="Companion.UI.showModule('sleep')">Sleep Insights</button>`
                    }
                },
                {
                    id: 'article-sleep',
                    cardTitle: 'Sleep & Rest',
                    cardDesc: 'Tips for better sleep and managing fatigue.',
                    icon: 'bi-moon-stars',
                    bgColor: '#E0F2F1',
                    iconClass: 'text-teal',
                    detail: {
                        title: 'Sleep & Rest',
                        lead: 'Quality sleep is vital for your health and baby\'s growth.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-accent">Positions</h4><div class="premium-card p-4 border-0 bg-soft-primary mt-3"><h6 class="fw-bold">The Left Side Advantage</h6><p class="small text-muted mb-0">Sleeping on your left side improves circulation to the heart and baby.</p></div></section>`,
                        sidebarHtml: `<button class="btn btn-premium w-100 rounded-pill" onclick="Companion.UI.showModule('sleep')">Open Sleep Tracker</button>`
                    }
                },
                {
                    id: 'article-mental',
                    cardTitle: 'Mental Wellness',
                    cardDesc: 'Managing stress and emotional well-being.',
                    icon: 'bi-heart-pulse',
                    bgColor: '#FFF3E0',
                    iconClass: 'text-warning',
                    detail: {
                        title: 'Mental Wellness',
                        lead: 'Your emotional health is just as important as your physical health.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-accent">Managing Anxiety</h4><p class="text-muted">Mindful journaling and social connection are key.</p></section>`,
                        sidebarHtml: `<button class="btn btn-premium w-100 rounded-pill" onclick="Companion.UI.showModule('journal')">Daily Journal</button>`
                    }
                },
                {
                    id: 'article-bag',
                    cardTitle: 'Hospital Bag',
                    cardDesc: 'Essential items to pack for the big day.',
                    icon: 'bi-bag-check',
                    bgColor: '#F3E5F5',
                    iconClass: 'text-purple',
                    detail: {
                        title: 'Hospital Bag Checklist',
                        lead: 'Be ready for the big day by packing your essentials early.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-accent">For the Mother</h4><div class="row g-3"><div class="col-md-4"><div class="premium-card p-3 text-center border-0 bg-light">📄<h6 class="small fw-bold">ID & Records</h6></div></div></div></section>`,
                        sidebarHtml: `<button class="btn btn-premium w-100 rounded-pill" onclick="Companion.UI.showModule('hospital-bag')">Open Hospital Bag</button>`
                    }
                },
                {
                    id: 'article-preg-basics',
                    cardTitle: 'Pregnancy Basics',
                    cardDesc: 'Essential guide for your 40-week journey.',
                    icon: 'bi-calendar-heart',
                    bgColor: '#E0F7FA',
                    iconClass: 'text-info',
                    detail: {
                        title: '📅 Pregnancy Basics',
                        lead: 'Your guide to the transformative 40-week journey of pregnancy.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-info mb-3">Early Symptoms</h4><p class="small text-muted">Missed period, nausea, fatigue, and breast tenderness.</p></section>`,
                        sidebarHtml: `<button class="btn btn-info w-100 rounded-pill text-white" onclick="Companion.UI.showModule('planning')">Due Date Calc</button>`
                    }
                },
                {
                    id: 'article-preg-safety',
                    cardTitle: 'Health & Safety',
                    cardDesc: 'Critical guidance on safety and common concerns.',
                    icon: 'bi-shield-exclamation',
                    bgColor: '#FFEBEE',
                    iconClass: 'text-danger',
                    detail: {
                        title: '🩺 Health & Safety',
                        lead: 'Critical guidance on physical health signals, common concerns, and understanding risks.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-danger mb-3">Bleeding & Spotting</h4><p class="small text-muted">Light bleeding is common, but heavy bleeding should be reported.</p></section>`,
                        sidebarHtml: `<button class="btn btn-danger w-100 rounded-pill text-white" onclick="Companion.UI.showModule('emergency')">Emergency Card</button>`
                    }
                },
                {
                    id: 'article-preg-diet',
                    cardTitle: 'Diet & Nutrition',
                    cardDesc: 'Essential guide to eating for two (the smart way).',
                    icon: 'bi-apple',
                    bgColor: '#E8F5E9',
                    iconClass: 'text-success',
                    detail: {
                        title: '🍎 Diet & Nutrition',
                        lead: 'Fueling your body with the right nutrients is impactful.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-success mb-3">Safe Eating</h4><p class="small text-muted">Avoid raw seafood, unpasteurized dairy, and high-mercury fish.</p></section>`,
                        sidebarHtml: `<button class="btn btn-success w-100 rounded-pill text-white" onclick="Companion.UI.showModule('water-tracker')">Water Tracker</button>`
                    }
                },
                {
                    id: 'article-preg-lifestyle',
                    cardTitle: 'Lifestyle',
                    cardDesc: 'Stay active and comfortable throughout your pregnancy.',
                    icon: 'bi-bicycle',
                    bgColor: '#FFF3E0',
                    iconClass: 'text-warning',
                    detail: {
                        title: '🏃 Lifestyle',
                        lead: 'Maintaining an active lifestyle is key to a healthy pregnancy.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-warning mb-3">Activity</h4><p class="small text-muted">Aims for 30 minutes of moderate activity like brisk walking.</p></section>`,
                        sidebarHtml: `<button class="btn btn-warning w-100 rounded-pill text-dark fw-bold" onclick="Companion.UI.showModule('sleep-tracker')">Sleep Tracker</button>`
                    }
                },
                {
                    id: 'article-preg-symptoms',
                    cardTitle: 'Symptoms & Discomforts',
                    cardDesc: 'Understanding and managing common pregnancy signals.',
                    icon: 'bi-thermometer-high',
                    bgColor: '#E0F2F1',
                    iconClass: 'text-teal',
                    detail: {
                        title: '🧠 Symptoms & Discomforts',
                        lead: 'Pregnancy brings many changes. Understanding the "why" can help.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-teal mb-3">Nausea</h4><p class="small text-muted">Caused by rapid hormone rises. Small, frequent meals help.</p></section>`,
                        sidebarHtml: `<button class="btn btn-teal w-100 rounded-pill text-white fw-bold" onclick="Companion.UI.showModule('journal')">Log Symptoms</button>`
                    }
                },
                {
                    id: 'article-preg-baby',
                    cardTitle: 'Baby Development',
                    cardDesc: 'Tracking milestones from first heartbeat to first kick.',
                    icon: 'bi-baby',
                    bgColor: '#E3F2FD',
                    iconClass: 'text-primary',
                    detail: {
                        title: '👶 Baby Development',
                        lead: 'From a tiny cluster of cells to a fully formed human.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-primary mb-3">Milestones</h4><p class="small text-muted">The heart beats at 5-6 weeks. Movement felt at 18-24 weeks.</p></section>`,
                        sidebarHtml: `<button class="btn btn-primary w-100 rounded-pill text-white fw-bold" onclick="Companion.UI.showModule('weekly-dev')">Weekly Growth</button>`
                    }
                },
                {
                    id: 'article-preg-sex',
                    cardTitle: 'Sex & Relationships',
                    cardDesc: 'Navigating intimacy and safety during your pregnancy.',
                    icon: 'bi-heart-pulse',
                    bgColor: '#FCE4EC',
                    iconClass: 'text-primary-rose',
                    detail: {
                        title: '💑 Sex & Relationships',
                        lead: 'Intimacy is natural during pregnancy.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-primary-rose mb-3">Safety</h4><p class="small text-muted">In most cases, sex is safe at every stage of pregnancy.</p></section>`,
                        sidebarHtml: `<button class="btn btn-primary-rose w-100 rounded-pill text-white fw-bold" onclick="Companion.UI.showModule('mental')">Wellness Support</button>`
                    }
                },
                {
                    id: 'article-preg-medical',
                    cardTitle: 'Medical Care',
                    cardDesc: 'Your roadmap to scans, tests, and clinical benchmarks.',
                    icon: 'bi-hospital',
                    bgColor: '#E1F5FE',
                    iconClass: 'text-info',
                    detail: {
                        title: '🏥 Medical Care',
                        lead: 'Navigating the clinical side of pregnancy.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-info mb-3">Scans</h4><p class="small text-muted">Typicially includes dating and anomaly scans.</p></section>`,
                        sidebarHtml: `<button class="btn btn-info w-100 rounded-pill text-white fw-bold" onclick="Companion.UI.showModule('lab-vault')">Lab Vault</button>`
                    }
                }
            ]
        },
        {
            id: 'postpartum',
            title: 'Postpartum & Baby Care',
            articles: [
                {
                    id: 'article-post-recovery',
                    cardTitle: 'Mother Recovery',
                    cardDesc: 'Essential guide for your healing journey after childbirth.',
                    icon: 'bi-person-heart',
                    bgColor: '#FFFDE7',
                    iconClass: 'text-warning',
                    detail: {
                        title: '🤱 Mother Recovery',
                        lead: 'The fourth trimester is a time of profound healing.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-warning mb-3">Healing</h4><p class="small text-muted">Initial recovery takes 6-8 weeks. Listen to your body.</p></section>`,
                        sidebarHtml: `<button class="btn btn-warning w-100 rounded-pill text-dark fw-bold" onclick="Companion.UI.showModule('journal')">Daily Journal</button>`
                    }
                },
                {
                    id: 'article-post-breastfeeding',
                    cardTitle: 'Breastfeeding',
                    cardDesc: 'Navigating the "liquid gold" journey for you and your baby.',
                    icon: 'bi-droplet-fill',
                    bgColor: '#E8F5E9',
                    iconClass: 'text-success',
                    detail: {
                        title: '🍼 Breastfeeding',
                        lead: 'Breastfeeding is a natural process with a learning curve.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-success mb-3">Basics</h4><p class="small text-muted">Feed 8-12 times daily. Skin-to-skin helps supply.</p></section>`,
                        sidebarHtml: `<button class="btn btn-success w-100 rounded-pill text-white fw-bold" onclick="Companion.UI.showModule('feeding-log')">Log Feeding</button>`
                    }
                },
                {
                    id: 'article-post-baby-care',
                    cardTitle: 'Baby Care',
                    cardDesc: 'Newborn essentials: Sleep, hygiene, and the first milestones.',
                    icon: 'bi-stars',
                    bgColor: '#E0F7FA',
                    iconClass: 'text-info',
                    detail: {
                        title: '👶 Baby Care',
                        lead: 'Newborn essentials and transition guidance.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-info mb-3">Hygiene</h4><p class="small text-muted">Sponge baths until chord falls off. Newborns sleep 14-17 hours.</p></section>`,
                        sidebarHtml: `<button class="btn btn-info w-100 rounded-pill text-white fw-bold" onclick="Companion.UI.showModule('sleep-tracker')">Sleep Tracker</button>`
                    }
                },
                {
                    id: 'article-post-baby-safety',
                    cardTitle: 'Health & Safety',
                    cardDesc: 'Vaccinations, burping tips, and managing newborn health.',
                    icon: 'bi-shield-plus',
                    bgColor: '#F3E5F5',
                    iconClass: 'text-purple',
                    detail: {
                        title: '💉 Health & Safety',
                        lead: 'Keep your baby healthy in the early months.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-purple mb-3">Medical</h4><p class="small text-muted">Vaccinations start at birth. Fever in newborns is urgent.</p></section>`,
                        sidebarHtml: `<button class="btn btn-purple w-100 rounded-pill text-white fw-bold" onclick="Companion.UI.showModule('emergency-card')">Emergency Card</button>`
                    }
                },
                {
                    id: 'article-post-family-planning',
                    cardTitle: 'Family Planning',
                    cardDesc: 'Understanding your fertility and safe spacing after delivery.',
                    icon: 'bi-heart-pulse',
                    bgColor: '#FCE4EC',
                    iconClass: 'text-primary-rose',
                    detail: {
                        title: '❤️ Family Planning',
                        lead: 'Fertility after childbirth guidance.',
                        contentHtml: `<section class="mb-5"><h4 class="fw-bold text-primary-rose mb-3">Spacing</h4><p class="small text-muted">Possible to conceive as early as 4-6 weeks after birth.</p></section>`,
                        sidebarHtml: `<button class="btn btn-primary-rose w-100 rounded-pill text-white fw-bold" onclick="Companion.UI.showModule('calc-ovulation')">Ovulation Calc</button>`
                    }
                }
            ]
        }
    ]
};
