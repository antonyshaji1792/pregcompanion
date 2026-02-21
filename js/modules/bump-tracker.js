/**
 * bump-tracker.js - Weekly Bump Photo Gallery
 * Namespace: Companion.Bump
 * Note: Uses aggressive image compression to fit within localStorage limits.
 */
window.Companion = window.Companion || {};

Companion.Bump = (function () {
    const STORAGE_KEY = 'bump_gallery';
    const MAX_WIDTH = 800; // Resize images to max 800px width
    const QUALITY = 0.7;   // JPEG quality

    return {
        /**
         * Get all photos sorted by week
         */
        getPhotos: function () {
            const photos = Companion.Data.get(STORAGE_KEY, []);
            return photos.sort((a, b) => a.week - b.week);
        },

        /**
         * Add a new bump photo
         */
        addPhoto: function (week, imageData, caption) {
            const photos = this.getPhotos();
            
            // Remove existing photo for this week if exists (one per week)
            const existingIndex = photos.findIndex(p => p.week == week);
            if (existingIndex !== -1) {
                photos.splice(existingIndex, 1);
            }

            const newPhoto = {
                id: Date.now(),
                date: dayjs().format('YYYY-MM-DD'),
                week: parseInt(week),
                image: imageData, // Expecting optimized base64
                caption: caption || `Week ${week}`
            };

            photos.push(newPhoto);
            
            try {
                Companion.Data.save(STORAGE_KEY, photos);
                return { success: true };
            } catch (e) {
                console.error("Storage limit reached", e);
                return { success: false, error: 'Storage full. Please delete some old photos.' };
            }
        },

        /**
         * Delete a photo by ID
         */
        deletePhoto: function (id) {
            let photos = this.getPhotos();
            photos = photos.filter(p => p.id !== id);
            Companion.Data.save(STORAGE_KEY, photos);
        },

        /**
         * Get a specific photo
         */
        getPhotoById: function (id) {
            return this.getPhotos().find(p => p.id === id);
        },

        /**
         * Process image file: Resize and convert to Base64
         */
        processImage: function (file, callback) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = function (event) {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Compress to JPEG
                    const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
                    callback(dataUrl);
                };
            };
        },

        /**
         * Generate a filename for export
         */
        getExportFilename: function () {
            return `bump-journey-${dayjs().format('YYYY-MM-DD')}.pdf`;
        }
    };
})();
