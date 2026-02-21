/**
 * app.js - Main Application Entry Point
 * Orchestrates the initialization flow and global event handling.
 */

$(document).ready(function () {
    /**
     * 1. Initialize UI Environment
     * This wires up core UI events like form submission and reset.
     */
    try {
        UI.init();
    } catch (e) {
        console.error("UI Initialization failed:", e);
    }

    /**
     * 2. Load Saved Data and Auto-Calculate
     * Checks localStorage for existing pregnancy details to restore the session.
     */
    const savedData = Storage.getPregnancyData();
    if (savedData && savedData.lmp) {
        // Populate inputs
        $('#lmp-date').val(savedData.lmp);
        $('#cycle-length').val(savedData.cycle || 28);

        // Auto-calculate and render all modules (Results, Milestones, Reminders)
        const results = Calculator.calculate(savedData.lmp, savedData.cycle);
        UI.renderResults(results);
    }

    /**
     * 3. Global Event Bindings
     * Handling interactions for modals and dynamic lists.
     */

    // Custom Reminder Creation
    $('#save-reminder').on('click', function () {
        const title = $('#reminder-text').val().trim();
        const date = $('#reminder-date').val();

        if (title && date) {
            Reminders.addCustom(title, date);

            // Refresh UI components
            UI.renderReminders();

            // Close modal safely
            const modalEl = document.querySelector('#reminderModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            // Clear inputs
            $('#reminder-text').val('');
            $('#reminder-date').val('');
        } else {
            // Simple visual feedback if fields are empty
            $('#reminder-text, #reminder-date').addClass('is-invalid');
            setTimeout(() => $('.is-invalid').removeClass('is-invalid'), 2000);
        }
    });

    // Milestone Reminder Toggle Control
    $(document).on('change', '.milestone-toggle', function () {
        const $this = $(this);
        const settings = {
            id: `ms_${$this.data('week')}`,
            title: $this.data('title'),
            eventDate: $this.data('date'),
            reminderEnabled: $this.is(':checked'),
            remindBeforeDays: parseInt($(`.milestone-days[data-week="${$this.data('week')}"]`).val()) || 1
        };

        // Toggle visibility of the days selector
        $(`#settings-ms-${$this.data('week')}`).toggleClass('d-none', !settings.reminderEnabled);

        // Persist change
        Reminders.save(settings);
    });

    // Milestone Reminder "Days Before" Selector
    $(document).on('change', '.milestone-days', function () {
        const week = $(this).data('week');
        const $toggle = $(`.milestone-toggle[data-week="${week}"]`);

        const settings = {
            id: `ms_${week}`,
            title: $toggle.data('title'),
            eventDate: $toggle.data('date'),
            reminderEnabled: $toggle.is(':checked'),
            remindBeforeDays: parseInt($(this).val())
        };

        Reminders.save(settings);
    });

    // Deleting Custom Reminders
    $(document).on('click', '.delete-reminder', function () {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this reminder?')) {
            Reminders.delete(id);
            UI.renderReminders();
        }
    });

    /**
     * 4. Safe Initialization Complete
     * The app is now ready and monitoring for user input.
     */
    console.log("Pregnancy Calculator successfully initialized.");
});
