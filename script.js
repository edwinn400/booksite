document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Add click event listeners to all tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Initialize map if New Entry tab is now active
            if (targetTab === 'new-entry') {
                setTimeout(initializeMap, 300);
            }
        });
    });

    // World Map functionality
    let worldMap;
    let worldMarkers = [];

    // Initialize world map
    function initializeWorldMap() {
        const mapContainer = document.getElementById('world-map-container');
        
        if (!worldMap && mapContainer) {
            try {
                worldMap = L.map('world-map-container').setView([20, 0], 2); // World view
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(worldMap);
                
                // Force map to refresh its size
                setTimeout(() => {
                    if (worldMap) {
                        worldMap.invalidateSize();
                    }
                }, 100);
                
                console.log('World map initialized successfully');
                
                // Load existing book locations
                loadBookLocations();
            } catch (error) {
                console.error('Error initializing world map:', error);
            }
        }
    }

    // Show world map when World Map tab is clicked
    document.querySelector('[data-tab="world-map"]').addEventListener('click', function() {
        setTimeout(initializeWorldMap, 300);
    });

    // Also initialize world map if it's already active (on page load)
    if (document.getElementById('world-map').classList.contains('active')) {
        setTimeout(initializeWorldMap, 500);
    }

    // All Entries functionality
    let currentSort = 'title';

    // Show entries when All Entries tab is clicked
    document.querySelector('[data-tab="all-entries"]').addEventListener('click', function() {
        setTimeout(loadAllEntries, 100);
    });

    // Also load entries if All Entries tab is already active (on page load)
    if (document.getElementById('all-entries').classList.contains('active')) {
        setTimeout(loadAllEntries, 500);
    }

    // Handle sort button clicks
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sortType = this.getAttribute('data-sort');
            
            // Update active button
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update sort and reload entries
            currentSort = sortType;
            loadAllEntries();
        });
    });

    function loadAllEntries() {
        const entriesContainer = document.getElementById('entries-container');
        const entries = getAllEntries();
        
        if (entries.length === 0) {
            entriesContainer.innerHTML = '<p class="no-entries">No entries yet. Add your first book in the New Entry tab!</p>';
            generateAlphabetSidebar('all-entries-alphabet', []);
            return;
        }

        // Sort entries
        const sortedEntries = entries.sort((a, b) => {
            if (currentSort === 'title') {
                return a.title.localeCompare(b.title);
            } else if (currentSort === 'author') {
                // Extract last name for sorting
                const aLastName = a.author.split(' ').pop().toLowerCase();
                const bLastName = b.author.split(' ').pop().toLowerCase();
                return aLastName.localeCompare(bLastName);
            }
            return 0;
        });

        // Generate alphabet sidebar
        generateAlphabetSidebar('all-entries-alphabet', sortedEntries, currentSort);

        // Generate HTML for entries with data attributes for jumping
        const entriesHTML = sortedEntries.map((entry, index) => {
            const favoriteBadge = entry.favorite === 'yes' ? '<span class="entry-favorite">★ Favorite</span>' : '';
            
            // Get the first letter for jumping
            let firstLetter;
            if (currentSort === 'title') {
                firstLetter = entry.title.charAt(0).toUpperCase();
            } else {
                firstLetter = entry.author.split(' ').pop().charAt(0).toUpperCase();
            }
            
            return `
                <div class="entry-card" data-letter="${firstLetter}" data-index="${index}" data-entry-id="${entry.id}">
                    <div class="entry-header">
                        <h4 class="entry-title">${entry.title}</h4>
                        <div class="entry-actions">
                            ${favoriteBadge}
                            <button class="edit-btn" onclick="editEntry('${entry.id}')">Edit</button>
                            <button class="delete-btn" onclick="deleteEntry('${entry.id}', '${entry.title.replace(/'/g, "\\'")}')">Delete</button>
                        </div>
                    </div>
                    <div class="entry-details">
                        <div class="entry-detail">
                            <span class="entry-detail-label">Author</span>
                            <span class="entry-detail-value">${entry.author}</span>
                        </div>
                        <div class="entry-detail">
                            <span class="entry-detail-label">Publication Year</span>
                            <span class="entry-detail-value">${entry.publicationYear}</span>
                        </div>
                        <div class="entry-detail">
                            <span class="entry-detail-label">Year Read</span>
                            <span class="entry-detail-value">${entry.yearRead || 'Not specified'}</span>
                        </div>
                        <div class="entry-detail">
                            <span class="entry-detail-label">Genres</span>
                            <span class="entry-detail-value">${entry.genres && entry.genres.length > 0 ? entry.genres.join(', ') : 'Not specified'}</span>
                        </div>
                    </div>
                    ${entry.thoughts ? `
                        <div class="entry-thoughts">
                            <div class="entry-thoughts-label">Thoughts</div>
                            <div class="entry-thoughts-text">${entry.thoughts}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        entriesContainer.innerHTML = entriesHTML;
        
        // Add click handlers for alphabet letters
        addAlphabetClickHandlers('all-entries-alphabet', 'entries-container');
    }

    // Favorites functionality
    let currentFavoritesSort = 'title';

    // Show favorites when Favorites tab is clicked
    document.querySelector('[data-tab="favorites"]').addEventListener('click', function() {
        setTimeout(loadFavorites, 100);
    });

    // Also load favorites if Favorites tab is already active (on page load)
    if (document.getElementById('favorites').classList.contains('active')) {
        setTimeout(loadFavorites, 500);
    }

    // Handle favorites sort button clicks
    document.querySelectorAll('#favorites .sort-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sortType = this.getAttribute('data-sort');
            
            // Update active button
            document.querySelectorAll('#favorites .sort-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update sort and reload favorites
            currentFavoritesSort = sortType;
            loadFavorites();
        });
    });

    function loadFavorites() {
        const favoritesContainer = document.getElementById('favorites-container');
        const allEntries = getAllEntries();
        const favorites = allEntries.filter(entry => entry.favorite === 'yes');
        
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p class="no-entries">No favorite books yet. Mark some books as favorites in the New Entry tab!</p>';
            generateAlphabetSidebar('favorites-alphabet', []);
            return;
        }

        // Sort favorites
        const sortedFavorites = favorites.sort((a, b) => {
            if (currentFavoritesSort === 'title') {
                return a.title.localeCompare(b.title);
            } else if (currentFavoritesSort === 'author') {
                // Extract last name for sorting
                const aLastName = a.author.split(' ').pop().toLowerCase();
                const bLastName = b.author.split(' ').pop().toLowerCase();
                return aLastName.localeCompare(bLastName);
            }
            return 0;
        });

        // Generate alphabet sidebar
        generateAlphabetSidebar('favorites-alphabet', sortedFavorites, currentFavoritesSort);

        // Generate HTML for favorites with data attributes for jumping
        const favoritesHTML = sortedFavorites.map((entry, index) => {
            // Get the first letter for jumping
            let firstLetter;
            if (currentFavoritesSort === 'title') {
                firstLetter = entry.title.charAt(0).toUpperCase();
            } else {
                firstLetter = entry.author.split(' ').pop().charAt(0).toUpperCase();
            }
            
            return `
                <div class="entry-card" data-letter="${firstLetter}" data-index="${index}" data-entry-id="${entry.id}">
                    <div class="entry-header">
                        <h4 class="entry-title">${entry.title}</h4>
                        <div class="entry-actions">
                            <span class="entry-favorite">★ Favorite</span>
                            <button class="edit-btn" onclick="editEntry('${entry.id}')">Edit</button>
                            <button class="delete-btn" onclick="deleteEntry('${entry.id}', '${entry.title.replace(/'/g, "\\'")}')">Delete</button>
                        </div>
                    </div>
                    <div class="entry-details">
                        <div class="entry-detail">
                            <span class="entry-detail-label">Author</span>
                            <span class="entry-detail-value">${entry.author}</span>
                        </div>
                        <div class="entry-detail">
                            <span class="entry-detail-label">Publication Year</span>
                            <span class="entry-detail-value">${entry.publicationYear}</span>
                        </div>
                        <div class="entry-detail">
                            <span class="entry-detail-label">Year Read</span>
                            <span class="entry-detail-value">${entry.yearRead || 'Not specified'}</span>
                        </div>
                        <div class="entry-detail">
                            <span class="entry-detail-label">Genres</span>
                            <span class="entry-detail-value">${entry.genres && entry.genres.length > 0 ? entry.genres.join(', ') : 'Not specified'}</span>
                        </div>
                    </div>
                    ${entry.thoughts ? `
                        <div class="entry-thoughts">
                            <div class="entry-thoughts-label">Thoughts</div>
                            <div class="entry-thoughts-text">${entry.thoughts}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        favoritesContainer.innerHTML = favoritesHTML;
        
        // Add click handlers for alphabet letters
        addAlphabetClickHandlers('favorites-alphabet', 'favorites-container');
    }

    // Helper function to generate alphabet sidebar
    function generateAlphabetSidebar(containerId, entries, sortType) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Get all available first letters
        const availableLetters = new Set();
        entries.forEach(entry => {
            let firstLetter;
            if (sortType === 'title') {
                firstLetter = entry.title.charAt(0).toUpperCase();
            } else {
                firstLetter = entry.author.split(' ').pop().charAt(0).toUpperCase();
            }
            if (/[A-Z]/.test(firstLetter)) {
                availableLetters.add(firstLetter);
            }
        });

        // Generate alphabet HTML
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const alphabetHTML = alphabet.map(letter => {
            const isAvailable = availableLetters.has(letter);
            const className = isAvailable ? 'alphabet-letter' : 'alphabet-letter disabled';
            return `<div class="${className}" data-letter="${letter}">${letter}</div>`;
        }).join('');

        container.innerHTML = alphabetHTML;
    }

    // Helper function to add click handlers for alphabet letters
    function addAlphabetClickHandlers(alphabetContainerId, entriesContainerId) {
        const alphabetContainer = document.getElementById(alphabetContainerId);
        const entriesContainer = document.getElementById(entriesContainerId);
        
        if (!alphabetContainer || !entriesContainer) return;

        // Remove existing click handlers
        const letters = alphabetContainer.querySelectorAll('.alphabet-letter');
        letters.forEach(letter => {
            letter.removeEventListener('click', letter.clickHandler);
        });

        // Add new click handlers
        letters.forEach(letter => {
            letter.clickHandler = function() {
                const targetLetter = this.getAttribute('data-letter');
                
                // Skip if letter is disabled
                if (this.classList.contains('disabled')) return;

                // Find the first entry with this letter
                const targetEntry = entriesContainer.querySelector(`[data-letter="${targetLetter}"]`);
                
                if (targetEntry) {
                    // Scroll to the entry
                    targetEntry.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });

                    // Highlight the entry briefly
                    targetEntry.style.backgroundColor = '#FFD700';
                    targetEntry.style.transition = 'background-color 0.3s ease';
                    
                    setTimeout(() => {
                        targetEntry.style.backgroundColor = '';
                    }, 2000);

                    // Update active letter in sidebar
                    letters.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            };
            
            letter.addEventListener('click', letter.clickHandler);
        });
    }

    // Load and display all book locations on the world map
    function loadBookLocations() {
        if (!worldMap) return;
        
        // Clear existing markers
        worldMarkers.forEach(marker => {
            worldMap.removeLayer(marker);
        });
        worldMarkers = [];
        
        // Get all entries from localStorage
        const entries = getAllEntries();
        
        // Add markers for entries with coordinates
        entries.forEach(entry => {
            if (entry.latitude && entry.longitude) {
                const lat = parseFloat(entry.latitude);
                const lng = parseFloat(entry.longitude);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    // Create custom icon based on favorite status
                    const isFavorite = entry.favorite === 'yes';
                    const iconColor = isFavorite ? '#FFD700' : '#FF0000'; // Gold for favorites, red for others
                    
                    let iconHtml;
                    if (isFavorite) {
                        // Star icon for favorites
                        iconHtml = `<div style="color: ${iconColor}; font-size: 24px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">★</div>`;
                    } else {
                        // Circle for non-favorites
                        iconHtml = `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`;
                    }
                    
                    const customIcon = L.divIcon({
                        className: 'custom-marker',
                        html: iconHtml,
                        iconSize: isFavorite ? [24, 24] : [20, 20],
                        iconAnchor: isFavorite ? [12, 12] : [10, 10]
                    });
                    
                    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(worldMap);
                    
                    // Create popup content with all book information
                    const popupContent = `
                        <div class="book-popup">
                            <h4>${entry.title}</h4>
                            <p><strong>Author:</strong> ${entry.author}</p>
                            <p><strong>Publication Year:</strong> ${entry.publicationYear}</p>
                            ${entry.yearRead ? `<p><strong>Year Read:</strong> ${entry.yearRead}</p>` : ''}
                            ${entry.genres && entry.genres.length > 0 ? `<p><strong>Genres:</strong> ${entry.genres.join(', ')}</p>` : ''}
                            ${entry.thoughts ? `<p><strong>Thoughts:</strong> ${entry.thoughts}</p>` : ''}
                        </div>
                    `;
                    
                    marker.bindPopup(popupContent);
                    worldMarkers.push(marker);
                }
            }
        });
        
        // Fit map to show all markers if there are any
        if (worldMarkers.length > 0) {
            const group = new L.featureGroup(worldMarkers);
            worldMap.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // Handle form submission
    const newEntryForm = document.getElementById('new-entry-form');
    const successMessage = document.getElementById('success-message');

    // Add auto-fill coordinates functionality for existing authors
    const authorInput = document.getElementById('author');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');

    authorInput.addEventListener('blur', function() {
        const enteredAuthor = this.value.trim();
        if (enteredAuthor) {
            const entries = getAllEntries();
            const existingEntry = entries.find(entry => 
                entry.author && entry.author.toLowerCase() === enteredAuthor.toLowerCase()
            );
            
            if (existingEntry && existingEntry.latitude && existingEntry.longitude) {
                latitudeInput.value = existingEntry.latitude;
                longitudeInput.value = existingEntry.longitude;
                
                // Show a subtle notification
                const notification = document.createElement('div');
                notification.className = 'auto-fill-notification';
                notification.textContent = `Auto-filled coordinates for ${existingEntry.author}`;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    font-size: 14px;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    animation: slideIn 0.3s ease-out;
                `;
                
                // Add CSS animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
                
                document.body.appendChild(notification);
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 3000);
            }
        }
    });

    // --- TIME SCALE DOT SAVE/RENDER ---

    // Save dot position as percent in new entry
    function getTimeDotPercent() {
        const img = document.getElementById('time-scale-image');
        if (!img) return { x: 0.5, y: 0.5 };
        const w = img.width;
        const h = img.height;
        if (!w || !h) return { x: 0.5, y: 0.5 };
        return {
            x: currentTimePosition.x / w,
            y: currentTimePosition.y / h
        };
    }

    // Patch new entry form submission to save dot position
    const origNewEntrySubmit = newEntryForm.onsubmit;
    newEntryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(newEntryForm);
        
        // Collect selected genres
        const selectedGenres = [];
        const genreCheckboxes = newEntryForm.querySelectorAll('input[name="genre"]:checked');
        genreCheckboxes.forEach(checkbox => {
            selectedGenres.push(checkbox.value);
        });
        
        const entry = {
            id: Date.now(), // Unique ID for each entry
            title: formData.get('title'),
            author: formData.get('author'),
            publicationYear: formData.get('publication-year'),
            yearRead: formData.get('year-read'),
            genres: selectedGenres,
            favorite: formData.get('favorite'),
            thoughts: formData.get('thoughts'),
            latitude: formData.get('latitude'),
            longitude: formData.get('longitude')
        };

        // Save to localStorage
        saveEntry(entry);
        
        // Show success message
        successMessage.style.display = 'block';
        
        // Reset form
        newEntryForm.reset();
        
        // Refresh world map if it's currently visible
        if (worldMap) {
            loadBookLocations();
        }
        
        // Refresh all entries if it's currently visible
        if (document.getElementById('all-entries').classList.contains('active')) {
            loadAllEntries();
        }
        
        // Refresh favorites if it's currently visible
        if (document.getElementById('favorites').classList.contains('active')) {
            loadFavorites();
        }
        
        // Reset time dot
        resetTimeDot();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);

        const img = document.getElementById('time-scale-image');
        if (img && img.complete && img.width && img.height) {
            const dotPercent = getTimeDotPercent();
            entry.timeScaleDot = dotPercent;
            console.log('[SUBMIT] Saving dot:', currentTimePosition, 'img:', img.width, img.height, 'percent:', dotPercent);
        } else {
            entry.timeScaleDot = { x: 0.5, y: 0.5 };
            console.log('[SUBMIT] Image not loaded, saving center dot.');
        }
    });

    // Handle form reset
    newEntryForm.addEventListener('reset', function() {
        setTimeout(() => {
            resetTimeDot();
        }, 100);
    });

    // Time Scale functionality
    let isDragging = false;
    let timeDot = null;
    let timeScaleContainer = null;
    let timeScaleImage = null;
    let currentTimePosition = { x: 0, y: 0 };

    function initializeTimeScale() {
        timeDot = document.getElementById('time-dot');
        timeScaleContainer = document.querySelector('.time-scale-container');
        timeScaleImage = document.getElementById('time-scale-image');

        if (!timeDot || !timeScaleContainer || !timeScaleImage) {
            console.log('Time scale elements not found');
            return;
        }

        console.log('Initializing time scale...');

        // Set initial position immediately
        currentTimePosition = { x: 50, y: 25 };
        updateTimeDotPosition();

        // Wait for image to load and then adjust position
        if (timeScaleImage.complete) {
            setDotToCenter();
        } else {
            timeScaleImage.onload = function() {
                setDotToCenter();
            };
        }

        // Mouse events for dragging - make container clickable
        timeScaleContainer.addEventListener('mousedown', startDragging);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);

        // Touch events for mobile
        timeScaleContainer.addEventListener('touchstart', startDragging);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', stopDragging);

        console.log('Time scale initialized');
    }

    function setDotToCenter() {
        if (!timeScaleContainer || !timeScaleImage) return;
        
        const containerRect = timeScaleContainer.getBoundingClientRect();
        const imageRect = timeScaleImage.getBoundingClientRect();
        
        currentTimePosition = {
            x: imageRect.width / 2,
            y: imageRect.height / 2
        };
        
        updateTimeDotPosition();
        console.log('Dot positioned at center:', currentTimePosition);
    }

    function startDragging(e) {
        e.preventDefault();
        isDragging = true;
        timeDot.classList.add('dragging');
        console.log('Started dragging');
        
        // Immediately move dot to click position
        const rect = timeScaleContainer.getBoundingClientRect();
        let clientX, clientY;

        if (e.type === 'mousedown') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type === 'touchstart' && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        if (clientX && clientY) {
            let x = clientX - rect.left;
            let y = clientY - rect.top;

            // Constrain to container bounds
            x = Math.max(10, Math.min(x, rect.width - 10));
            y = Math.max(10, Math.min(y, rect.height - 10));

            currentTimePosition = { x, y };
            updateTimeDotPosition();
        }
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const rect = timeScaleContainer.getBoundingClientRect();
        let clientX, clientY;

        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type === 'touchmove' && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            return;
        }

        // Calculate position relative to the container
        let x = clientX - rect.left;
        let y = clientY - rect.top;

        // Constrain to container bounds
        x = Math.max(10, Math.min(x, rect.width - 10));
        y = Math.max(10, Math.min(y, rect.height - 10));

        currentTimePosition = { x, y };
        updateTimeDotPosition();
        console.log('Dragging to:', currentTimePosition);
    }

    function stopDragging() {
        if (isDragging) {
            isDragging = false;
            timeDot.classList.remove('dragging');
            console.log('Stopped dragging');
        }
    }

    function updateTimeDotPosition() {
        if (!timeDot) return;
        timeDot.style.left = currentTimePosition.x + 'px';
        timeDot.style.top = currentTimePosition.y + 'px';
    }

    function resetTimeDot() {
        if (timeScaleImage && timeScaleImage.complete) {
            const rect = timeScaleContainer.getBoundingClientRect();
            const imageRect = timeScaleImage.getBoundingClientRect();
            
            currentTimePosition = {
                x: imageRect.width / 2,
                y: imageRect.height / 2
            };
            updateTimeDotPosition();
        }
    }

    // Initialize time scale when New Entry tab is shown
    document.querySelector('[data-tab="new-entry"]').addEventListener('click', function() {
        setTimeout(initializeTimeScale, 100);
    });

    // Also initialize if New Entry tab is already active
    if (document.getElementById('new-entry').classList.contains('active')) {
        setTimeout(initializeTimeScale, 500);
    }

    // Render all dots on the Time Scale tab
    function renderTimeScaleDots() {
        const img = document.getElementById('time-scale-tab-image');
        const dotsDiv = document.getElementById('time-scale-dots');
        if (!img || !dotsDiv) { console.log('Missing img or dotsDiv'); return; }
        if (!img.complete || !img.width || !img.height) { console.log('Image not loaded or has no size'); return; }
        dotsDiv.innerHTML = '';
        const entries = getAllEntries();
        const w = img.width;
        const h = img.height;
        console.log('[RENDER] Rendering dots. Image size:', w, h, 'Entries:', entries.length, entries);
        entries.forEach(entry => {
            let dotData = entry.timeScaleDot;
            if (!dotData || typeof dotData.x !== 'number' || typeof dotData.y !== 'number') {
                // fallback: center
                dotData = { x: 0.5, y: 0.5 };
            }
            const x = dotData.x * w;
            const y = dotData.y * h;
            const dot = document.createElement('div');
            dot.className = 'time-scale-dot' + (entry.favorite === 'yes' ? ' favorite' : '');
            dot.style.left = `${x - 9}px`;
            dot.style.top = `${y - 9}px`;
            dot.tabIndex = 0;
            // Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'time-scale-tooltip';
            tooltip.innerHTML = `<strong>${entry.title || '(No Title)'}</strong><br>${entry.author || ''}${entry.publicationYear ? '<br>' + entry.publicationYear : ''}${entry.favorite === 'yes' ? '<br>★ Favorite' : ''}`;
            dot.appendChild(tooltip);
            dotsDiv.appendChild(dot);
            console.log('[RENDER] Dot for entry:', entry.title, 'at', x, y, 'favorite:', entry.favorite, 'dotData:', dotData);
        });
    }

    // Re-render dots when Time Scale tab is shown or resized
    function setupTimeScaleTab() {
        const img = document.getElementById('time-scale-tab-image');
        if (!img) return;
        if (img.complete) renderTimeScaleDots();
        img.onload = renderTimeScaleDots;
        window.addEventListener('resize', renderTimeScaleDots);
    }
    document.querySelector('[data-tab="time-scale"]').addEventListener('click', function() {
        setTimeout(setupTimeScaleTab, 100);
    });
    if (document.getElementById('time-scale').classList.contains('active')) {
        setTimeout(setupTimeScaleTab, 500);
    }
});

// Function to save entry to localStorage
function saveEntry(entry) {
    let entries = JSON.parse(localStorage.getItem('bookEntries') || '[]');
    entries.push(entry);
    localStorage.setItem('bookEntries', JSON.stringify(entries));
}

    // Function to get all entries from localStorage
    function getAllEntries() {
        return JSON.parse(localStorage.getItem('bookEntries') || '[]');
    }

    // Edit entry functionality
    function editEntry(entryId) {
        const entries = getAllEntries();
        const entry = entries.find(e => e.id == entryId);
        
        if (!entry) {
            alert('Entry not found!');
            return;
        }

        // Populate the edit form
        document.getElementById('edit-entry-id').value = entry.id;
        document.getElementById('edit-title').value = entry.title;
        document.getElementById('edit-author').value = entry.author;
        document.getElementById('edit-publication-year').value = entry.publicationYear;
        document.getElementById('edit-year-read').value = entry.yearRead || '';
        
        // Populate genre checkboxes
        const editGenreCheckboxes = document.querySelectorAll('input[name="edit-genre"]');
        editGenreCheckboxes.forEach(checkbox => {
            checkbox.checked = entry.genres && entry.genres.includes(checkbox.value);
        });
        
        document.getElementById('edit-latitude').value = entry.latitude || '';
        document.getElementById('edit-longitude').value = entry.longitude || '';
        document.getElementById('edit-favorite').value = entry.favorite;
        document.getElementById('edit-thoughts').value = entry.thoughts || '';

        // Show the edit modal
        document.getElementById('edit-modal').style.display = 'block';
    }

    // Delete entry functionality
    function deleteEntry(entryId, bookTitle) {
        // Populate the delete confirmation modal
        document.getElementById('delete-book-title').textContent = bookTitle;
        document.getElementById('delete-modal').style.display = 'block';
        
        // Store the entry ID for confirmation
        document.getElementById('confirm-delete').setAttribute('data-entry-id', entryId);
    }

    // Modal event handlers
    document.addEventListener('DOMContentLoaded', function() {
        // Close modals when clicking the X button
        document.getElementById('close-edit-modal').addEventListener('click', function() {
            document.getElementById('edit-modal').style.display = 'none';
        });

        document.getElementById('close-delete-modal').addEventListener('click', function() {
            document.getElementById('delete-modal').style.display = 'none';
        });

        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            const editModal = document.getElementById('edit-modal');
            const deleteModal = document.getElementById('delete-modal');
            
            if (event.target === editModal) {
                editModal.style.display = 'none';
            }
            if (event.target === deleteModal) {
                deleteModal.style.display = 'none';
            }
        });

        // Cancel buttons
        document.getElementById('cancel-edit').addEventListener('click', function() {
            document.getElementById('edit-modal').style.display = 'none';
        });

        document.getElementById('cancel-delete').addEventListener('click', function() {
            document.getElementById('delete-modal').style.display = 'none';
        });

        // Handle edit form submission
        document.getElementById('edit-entry-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const entryId = parseInt(formData.get('id'));
            
            // Collect selected genres
            const selectedGenres = [];
            const editGenreCheckboxes = this.querySelectorAll('input[name="edit-genre"]:checked');
            editGenreCheckboxes.forEach(checkbox => {
                selectedGenres.push(checkbox.value);
            });
            
            // Get current entries
            let entries = getAllEntries();
            const entryIndex = entries.findIndex(e => e.id === entryId);
            
            if (entryIndex === -1) {
                alert('Entry not found!');
                return;
            }

            // Update the entry
            entries[entryIndex] = {
                id: entryId,
                title: formData.get('title'),
                author: formData.get('author'),
                publicationYear: formData.get('publication-year'),
                yearRead: formData.get('year-read'),
                genres: selectedGenres,
                favorite: formData.get('favorite'),
                thoughts: formData.get('thoughts'),
                latitude: formData.get('latitude'),
                longitude: formData.get('longitude')
            };

            // Save back to localStorage
            localStorage.setItem('bookEntries', JSON.stringify(entries));

            // Close modal
            document.getElementById('edit-modal').style.display = 'none';

            // Refresh current views
            if (document.getElementById('all-entries').classList.contains('active')) {
                loadAllEntries();
            }
            if (document.getElementById('favorites').classList.contains('active')) {
                loadFavorites();
            }
            if (worldMap) {
                loadBookLocations();
            }

            // Show success message
            alert('Entry updated successfully!');
        });

        // Handle delete confirmation
        document.getElementById('confirm-delete').addEventListener('click', function() {
            const entryId = parseInt(this.getAttribute('data-entry-id'));
            
            // Get current entries
            let entries = getAllEntries();
            const entryIndex = entries.findIndex(e => e.id === entryId);
            
            if (entryIndex === -1) {
                alert('Entry not found!');
                return;
            }

            // Remove the entry
            entries.splice(entryIndex, 1);

            // Save back to localStorage
            localStorage.setItem('bookEntries', JSON.stringify(entries));

            // Close modal
            document.getElementById('delete-modal').style.display = 'none';

            // Refresh current views
            if (document.getElementById('all-entries').classList.contains('active')) {
                loadAllEntries();
            }
            if (document.getElementById('favorites').classList.contains('active')) {
                loadFavorites();
            }
            if (worldMap) {
                loadBookLocations();
            }

            // Show success message
            alert('Entry deleted successfully!');
        });
    }); 