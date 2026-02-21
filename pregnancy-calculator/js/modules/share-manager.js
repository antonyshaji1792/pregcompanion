/**
 * share-manager.js - Data export and sharing features
 * Namespace: Companion.Share
 */
window.Companion = window.Companion || {};

Companion.Share = (function () {

    return {
        init: function () {
            this.bindEvents();
        },

        bindEvents: function () {
            $('#share-card-btn').on('click', () => this.generateShareImage());
            $('#export-pdf-btn').on('click', () => this.generatePDF());
            $('#backup-data-btn').on('click', () => this.downloadBackup());
        },

        generateShareImage: function () {
            const card = document.getElementById('pregnancy-summary-card');
            if (!card) return;

            Companion.UI.showAlert('Generating your shareable card...', 'info');

            html2canvas(card, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Pregnancy_Card_Week_${$('#weeks-display').text()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                Companion.UI.showAlert('Card image downloaded!', 'success');
            }).catch(err => {
                console.error('Image Generation Error:', err);
                Companion.UI.showAlert('Failed to generate image.', 'danger');
            });
        },

        generatePDF: function () {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const profile = Companion.Data.get('profile');
            const weeks = $('#weeks-display').text();
            const days = $('#days-display').text();
            const edd = $('#edd-display').text();

            Companion.UI.showAlert('Preparing your PDF summary...', 'info');

            // Header
            doc.setFontSize(22); doc.setTextColor(240, 98, 146); // Accent Pink
            doc.text("Pregnancy Companion Summary", 105, 20, { align: "center" });

            doc.setFontSize(12); doc.setTextColor(100, 116, 139); // Text Muted
            doc.text(`Generated on ${dayjs().format('MMMM D, YYYY')}`, 105, 30, { align: "center" });

            // Stats Section
            doc.setDrawColor(241, 245, 249); doc.setFillColor(248, 250, 252);
            doc.roundedRect(10, 40, 190, 40, 5, 5, 'FD');

            doc.setFontSize(14); doc.setTextColor(30, 41, 59); doc.setFont(undefined, 'bold');
            doc.text("Current Gestation", 20, 50);
            doc.setFont(undefined, 'normal'); doc.setFontSize(12);
            doc.text(`${weeks} Weeks, ${days} Days`, 20, 60);

            doc.setFont(undefined, 'bold'); doc.text("Due Date (EDD)", 110, 50);
            doc.setFont(undefined, 'normal'); doc.text(edd, 110, 60);

            // Detailed Data
            doc.setFontSize(14); doc.setFont(undefined, 'bold');
            doc.text("Health Logs Overview", 20, 100);

            const weightData = Companion.Weight.getData();
            doc.setFontSize(11); doc.setFont(undefined, 'normal');
            doc.text(`Total Weight Logs: ${weightData.logs.length}`, 20, 110);
            if (weightData.settings) {
                doc.text(`Current BMI: ${weightData.settings.bmi} (${weightData.settings.category})`, 20, 117);
            }

            const bpLogs = Companion.Health.getBPLogs();
            doc.text(`Blood Pressure Logs: ${bpLogs.length}`, 20, 127);

            const bsLogs = Companion.Health.getBSLogs();
            doc.text(`Blood Sugar Logs: ${bsLogs.length}`, 20, 134);

            // Footer
            doc.setFontSize(10); doc.setTextColor(148, 163, 184);
            doc.text("This is an automatically generated summary from your Digital Pregnancy Companion.", 105, 280, { align: "center" });

            doc.save(`Pregnancy_Summary_Week_${weeks}.pdf`);
            Companion.UI.showAlert('PDF Summary downloaded!', 'success');
        },

        downloadBackup: function () {
            const backupData = Companion.Data.exportAll();
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `Pregnancy_Backup_${dayjs().format('YYYY-MM-DD')}.json`;
            link.click();

            setTimeout(() => URL.revokeObjectURL(url), 100);
            Companion.UI.showAlert('JSON Backup downloaded!', 'success');
        }
    };
})();
