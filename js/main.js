// Mobile menu functionality
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('.header');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    // Animation for hamburger icon when active
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'translateY(8px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        
        // Reset hamburger icon when closing menu
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            
            // Reset hamburger icon
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// Header Scroll Effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        // Scrolling down
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        // Scrolling up
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Newsletter Form Submission -> Backend API (/subscribe)
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value.trim() : '';

        if (!email) {
            alert('Please enter a valid email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        try {
            const response = await fetch(`${window.API_BASE}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            if (response.status === 201) {
                alert('Thank you for subscribing to our newsletter!');
                newsletterForm.reset();
                return;
            }

            if (response.status === 409) {
                alert('You are already subscribed to our newsletter.');
                return;
            }

            const err = await response.text();
            throw new Error(err || `Subscription failed (HTTP ${response.status})`);
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            alert('Sorry, there was an error subscribing. Please try again later.');
        }
    });
}

// Reservation form handling
const reservationForm = document.querySelector('#reservationForm');
const adminSection = document.querySelector('#managementSection');
const reservationsList = document.querySelector('#reservationsList');

// Function to format date and time
function formatDateTime(date, time) {
    try {
        console.log('Formatting date and time:', { date, time });
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-IE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return `${formattedDate} at ${time}`;
    } catch (error) {
        console.error('Error formatting date and time:', error);
        return 'Date/Time not specified';
    }
}

// Backend API base URL (singleton)
window.API_BASE = window.API_BASE || 'http://127.0.0.1:8000';

// --------------- Security helpers ---------------
if (!window.escapeHtml) {
  window.escapeHtml = function escapeHtml(value) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };
    return String(value ?? '').replace(/[&<>"'`]/g, (ch) => map[ch]);
  };
}

// Function to save reservation to API
async function saveReservation(reservationData) {
    try {
        console.log('Saving reservation to API:', reservationData);
        
        // Prepare data for API (convert field names to match backend expectations)
        const apiData = {
            name: reservationData.name,
            email: reservationData.email,
            phone: reservationData.phone,
            guests: reservationData.guests,
            date: reservationData.date,
            time: reservationData.time,
            occasion: reservationData.occasion || null,
            special_requests: reservationData.specialRequests || null
        };
        
        // Call the FastAPI backend
        const response = await fetch(`${window.API_BASE}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(apiData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Reservation saved to API with ID:', result.id);
        
        return result.id;
    } catch (error) {
        console.error('Error saving reservation to API:', error);
        throw error;
    }
}

// Function to display reservation in admin section
function displayReservation(reservation) {
    console.log('Displaying reservation:', reservation); // Debug log
    const card = document.createElement('div');
    card.className = 'reservation-card';
    const statusText = (reservation.status || 'pending');
    const statusClass = statusText.toLowerCase();
    card.innerHTML = `
        <div class="reservation-header">
            <h4>${escapeHtml(reservation.name)}</h4>
            <span class="status ${statusClass}">${statusText}</span>
        </div>
        <div class="reservation-details">
            <p><i class="fas fa-calendar"></i> ${escapeHtml(formatDateTime(reservation.date, reservation.time))}</p>
            <p><i class="fas fa-users"></i> ${escapeHtml(reservation.guests)} guests</p>
            <p><i class="fas fa-envelope"></i> ${escapeHtml(reservation.email)}</p>
            <p><i class="fas fa-phone"></i> ${escapeHtml(reservation.phone)}</p>
            ${reservation.occasion ? `<p><i class="fas fa-gift"></i> ${escapeHtml(reservation.occasion)}</p>` : ''}
            ${((reservation.special_requests) || (reservation.specialRequests)) ? `<p><i class=\"fas fa-comment\"></i> ${escapeHtml(reservation.special_requests || reservation.specialRequests)}</p>` : ''}
        </div>
        <div class="reservation-actions">
            <button onclick="updateReservationStatus('${reservation.id}', 'confirmed')" 
                    class="btn confirm-btn" ${statusClass === 'confirmed' ? 'disabled' : ''}>
                Confirm
            </button>
            <button onclick="updateReservationStatus('${reservation.id}', 'cancelled')"
                    class="btn cancel-btn" ${statusClass === 'cancelled' || statusClass === 'confirmed' ? 'disabled' : ''}>
                Cancel
            </button>
            <button onclick="deleteReservation('${reservation.id}')" class="btn delete-btn">
                Delete
            </button>
        </div>
    `;
    return card;
}

// Email handling moved to backend SendGrid - no client-side email sending needed

// Email handling moved to backend SendGrid - no client-side email sending needed

// Email handling moved to backend SendGrid - no client-side email sending needed

// Update the form submission handler
reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        console.log('Form submitted, processing reservation...');
        
        // Get form data using FormData API
        const form = e.target;
        const formData = new FormData(form);
        
        // Log all form field values for debugging
        console.log('Form fields:');
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        // Convert FormData to object and trim values
        const reservationData = {
            name: formData.get('name')?.trim(),
            email: formData.get('email')?.trim(),
            phone: formData.get('phone')?.trim(),
            date: formData.get('date'),
            time: formData.get('time'),
            guests: formData.get('guests'),
            occasion: formData.get('occasion'),
            specialRequests: formData.get('specialRequests')?.trim(),
            timestamp: new Date().toISOString(),
            id: Date.now(),
            status: 'Pending'  // Always start as Pending
        };

        // Log the captured form data
        console.log('Captured form data:', reservationData);

        // Validate email specifically
        if (!reservationData.email) {
            console.error('Email validation failed: Email is empty');
            throw new Error('Email is required');
        }

        // Validate required fields
        const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'guests'];
        const missingFields = requiredFields.filter(field => !reservationData[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Validate date and time
        const selectedDateTime = new Date(`${reservationData.date} ${reservationData.time}`);
        if (isNaN(selectedDateTime.getTime())) {
            console.error('Invalid date/time:', { date: reservationData.date, time: reservationData.time });
            alert('Please enter a valid date and time.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(reservationData.email)) {
            console.error('Invalid email format:', reservationData.email);
            alert('Please enter a valid email address.');
            return;
        }

        console.log('Form data validated successfully');
        console.log('Selected date and time:', selectedDateTime);

        // Save reservation to API
        const reservationId = await saveReservation(reservationData);
        console.log('Reservation saved to API with ID:', reservationId);
        
        // Update reservation data with the actual ID from API
        reservationData.id = reservationId;

        // Show success message
        alert('Thank you for your reservation! We have received your booking request and will confirm it shortly. You will receive a confirmation email shortly.');
        
        // Reset the form
        form.reset();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error processing reservation:', error);
        alert(`Error processing your reservation: ${error.message}. Please try again or contact us directly.`);
    }
});

// Admin functionality now handled by Static Authentication
// The admin section is now called 'managementSection' and protected by Static Auth

// Enhanced admin functionality
let filteredReservations = [];

// Function to display all reservations in admin panel - Updated to use new system
async function displayAdminReservations() {
    console.log('Displaying admin reservations - delegating to reservation admin system...');
    
    // Use the new reservation admin system
    if (window.reservationAdmin && window.reservationAdmin.updateReservationsList) {
        await window.reservationAdmin.updateReservationsList();
    } else {
        console.error('Reservation admin system not loaded yet, retrying...');
        // Retry after a short delay
        setTimeout(() => {
            if (window.reservationAdmin && window.reservationAdmin.updateReservationsList) {
                window.reservationAdmin.updateReservationsList();
            }
        }, 2000);
    }
}

// Function to update reservation status - Updated to delegate to new system
async function updateReservationStatus(id, newStatus) {
    // Delegate to the new reservation admin system
    if (window.reservationAdmin && window.reservationAdmin.updateReservationStatus) {
        await window.reservationAdmin.updateReservationStatus(id, newStatus);
    } else {
        console.error('Reservation admin system not available');
        alert('Error: Reservation admin system not available. Please refresh the page.');
    }
}

// Function to delete reservation - Updated to delegate to new system
async function deleteReservation(id) {
    // Delegate to the new reservation admin system
    if (window.reservationAdmin && window.reservationAdmin.deleteReservation) {
        await window.reservationAdmin.deleteReservation(id);
    } else {
        console.error('Reservation admin system not available');
        alert('Error: Reservation admin system not available. Please refresh the page.');
    }
}

// Add event listener for management section visibility
document.addEventListener('DOMContentLoaded', () => {
    const managementSection = document.getElementById('managementSection');
    if (managementSection) {
        // Check if management section is visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    if (managementSection.style.display !== 'none') {
                        console.log('Management section became visible, loading reservations...'); // Debug log
                        displayAdminReservations();
                    }
                }
            });
        });

        observer.observe(managementSection, { attributes: true });
    }
});

// Add animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.feature, .menu-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Initialize animation properties
document.querySelectorAll('.feature, .menu-item').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'all 0.6s ease-out';
});

// Listen for scroll events
window.addEventListener('scroll', animateOnScroll);
// Initial check for elements in view
animateOnScroll();

// Function to find reservations by email
function findReservation() {
    const searchEmail = document.getElementById('searchEmail').value.trim();
    const resultDiv = document.getElementById('reservationResult');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchEmail) {
        resultDiv.innerHTML = `
            <div class="no-reservation">
                Please enter your email address
            </div>
        `;
        return;
    }

    // Show loading state
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    resultDiv.innerHTML = `
        <div class="loading-reservation">
            <i class="fas fa-spinner fa-spin"></i> Looking up your reservation...
        </div>
    `;

    // Query backend
    (async () => {
        try {
            const resp = await fetch(`${window.API_BASE}/reservations/${encodeURIComponent(searchEmail)}`, {
                credentials: 'include'
            });
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }
            const userReservations = await resp.json();

            if (!Array.isArray(userReservations) || userReservations.length === 0) {
                resultDiv.innerHTML = `
                    <div class="no-reservation">
                        No reservations found for this email address
                    </div>
                `;
            } else {
                resultDiv.innerHTML = userReservations.map(reservation => `
                    <div class="found-reservation">
                        <h4>Reservation Details</h4>
                        <div class="reservation-info">
                            <p><strong>Name:</strong> ${reservation.name}</p>
                            <p><strong>Date & Time:</strong> ${formatDateTime(reservation.date, reservation.time)}</p>
                            <p><strong>Number of Guests:</strong> ${reservation.guests}</p>
                            <p><strong>Status:</strong> <span class="status-badge ${(reservation.status||'pending').toLowerCase()}">${reservation.status||'pending'}</span></p>
                            ${reservation.occasion ? `<p><strong>Occasion:</strong> ${reservation.occasion}</p>` : ''}
                            ${reservation.special_requests ? `<p><strong>Special Requests:</strong> ${reservation.special_requests}</p>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        } catch (err) {
            console.error('Find reservation error:', err);
            resultDiv.innerHTML = `
                <div class="no-reservation">
                    Error looking up reservations. Please try again later.
                </div>
            `;
        } finally {
            // Reset search button
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Find Reservation';
        }
    })();
}

// Clear search results when email input is cleared
const searchEmailInput = document.getElementById('searchEmail');
if (searchEmailInput) {
    searchEmailInput.addEventListener('input', function(e) {
        if (!e.target.value.trim()) {
            const reservationResult = document.getElementById('reservationResult');
            if (reservationResult) {
                reservationResult.innerHTML = '';
            }
        }
    });
} else {
    console.log('Search email input element not found (this is normal if not on admin page)');
}

// Function to handle admin login - now redirects to Static authentication
function showAdminLogin() {
    // This function is deprecated - login is now handled by Static Authentication
    // Redirect to the new login modal
    if (typeof showLoginModal === 'function') {
        showLoginModal();
    } else {
        console.error('Static authentication not loaded');
    }
}

// Make sure functions are available in global scope
window.updateReservationStatus = updateReservationStatus;
window.deleteReservation = deleteReservation;
window.displayAdminReservations = displayAdminReservations;
window.showAdminLogin = showAdminLogin;
window.findReservation = findReservation;

// Force refresh reservations function
window.forceRefreshReservations = async function() {
    try {
        console.log('🔄 Force refreshing reservations...');
        
        // Method 1: Use reservation admin system (preferred)
        if (window.reservationAdmin && window.reservationAdmin.updateReservationsList) {
            console.log('📊 Using reservation admin system for force refresh');
            await window.reservationAdmin.updateReservationsList();
        } 
        // Method 2: Use legacy display function as fallback
        else if (window.displayAdminReservations) {
            console.log('📊 Using legacy admin display as fallback');
            await window.displayAdminReservations();
        }
        // Method 3: Manual refresh
        else {
            console.log('📊 No admin system available, manual refresh');
            const managementSection = document.getElementById('managementSection');
            if (managementSection && managementSection.style.display !== 'none') {
                // Show loading state
                const reservationsList = document.getElementById('reservationsList');
                if (reservationsList) {
                    reservationsList.innerHTML = '<div style="text-align: center; padding: 20px;">🔄 Refreshing...</div>';
                }
                
                // Try to reload after a short delay
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        }
        
        console.log('✅ Force refresh completed');
    } catch (error) {
        console.error('❌ Error in force refresh:', error);
        alert('Error refreshing reservations. Please try again.');
    }
};

// Function to initialize menu tabs
function initializeMenuTabs() {
    console.log('Initializing menu tabs...');
    const menuTabs = document.querySelectorAll('.menu-tabs .tab');
    const menuContents = document.querySelectorAll('.menu-content');
    
    console.log(`Found ${menuTabs.length} tabs and ${menuContents.length} content sections`);
    
    // First, hide all menu content
    menuContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    menuTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Set first tab as active if available
    if (menuTabs.length > 0) {
        menuTabs[0].classList.add('active');
        const firstTabId = menuTabs[0].getAttribute('data-tab');
        const firstContent = document.getElementById(`${firstTabId}-menu`);
        if (firstContent) {
            firstContent.classList.add('active');
        }
    }
    
    // Add click event to each tab
    menuTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('data-tab');
            console.log(`Tab clicked: ${targetId}`);
            
            // Remove active class from all tabs and contents
            menuTabs.forEach(t => t.classList.remove('active'));
            menuContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const targetContent = document.getElementById(`${targetId}-menu`);
            if (targetContent) {
                targetContent.classList.add('active');
                console.log(`Showing menu: ${targetId}-menu`);
            } else {
                console.error(`Menu content for ${targetId} not found!`);
            }
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing functions...');
    // Re-expose functions to ensure they're available
    window.updateReservationStatus = updateReservationStatus;
    window.deleteReservation = deleteReservation;
    window.displayAdminReservations = displayAdminReservations;
    window.showAdminLogin = showAdminLogin;
    window.findReservation = findReservation;
    window.exportReservationsData = exportReservationsData;
    
            // Email handling moved to backend SendGrid
        console.log('Email handling moved to backend SendGrid');

    // Connect export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportReservationsData);
    }
    
    // Initialize menu tabs
    initializeMenuTabs();
    
    // Initialize View More buttons for menu sections
    initializeViewMoreButtons();

    // Add keyboard shortcut for staff login (Ctrl+Alt+L)
    document.addEventListener('keydown', function(e) {
        // Check for Ctrl+Alt+L shortcut
        if (e.ctrlKey && e.altKey && e.key === 'l') {
            e.preventDefault(); // Prevent default action
            
            // If user is already authenticated, toggle management panel
            if (typeof isAuthenticated === 'function' && isAuthenticated()) {
                const managementSection = document.getElementById('managementSection');
                if (managementSection) {
                    managementSection.style.display = managementSection.style.display === 'none' ? 'block' : 'none';
                    if (managementSection.style.display === 'block') {
                        displayAdminReservations();
                    }
                }
            } else {
                // Show login modal
                if (typeof showLoginModal === 'function') {
                    showLoginModal();
                }
            }
        }
    });

    // Safety: ensure reservation form never falls back to default GET submit
    const reservationFormEl = document.getElementById('reservationForm');
    if (reservationFormEl) {
        const submitBtn = reservationFormEl.querySelector('button[type="submit"], .submit-btn');
        if (submitBtn && !submitBtn.dataset.prevented) {
            submitBtn.addEventListener('click', (e) => {
                // Prevent default browser submit (which would be GET)
                e.preventDefault();
                // Trigger our JS submit handler
                reservationFormEl.dispatchEvent(new Event('submit', { cancelable: true }));
            });
            submitBtn.dataset.prevented = '1';
        }
    }

    // ---------------- Date restrictions ----------------
    const dateInput = document.getElementById('date');
    if (dateInput) {
        // Disallow selecting past dates
        const todayIso = new Date().toISOString().slice(0, 10);
        if (!dateInput.min || dateInput.min < todayIso) {
            dateInput.min = todayIso;
        }

        // Holidays (closed) — specific dates
        const closedDates = new Set([
            '2025-12-25', // Christmas Day
            '2025-12-26', // St Stephen’s Day
        ]);

        function toIsoUTC(dateObj) {
            const y = dateObj.getUTCFullYear();
            const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        function getFirstMonday(year, monthIndex) {
            // monthIndex: 0=Jan ... 11=Dec
            const d = new Date(Date.UTC(year, monthIndex, 1));
            const day = d.getUTCDay();
            const delta = (day === 0) ? 1 : (8 - day); // days to next Monday
            d.setUTCDate(d.getUTCDate() + (day === 1 ? 0 : delta));
            return d;
        }

        function getLastMonday(year, monthIndex) {
            const last = new Date(Date.UTC(year, monthIndex + 1, 0)); // last day of month
            const day = last.getUTCDay();
            const diff = (day >= 1) ? (day - 1) : (6);
            last.setUTCDate(last.getUTCDate() - diff);
            return last;
        }

        function easterMondayISO(year) {
            // Anonymous Gregorian algorithm for Easter Sunday
            const a = year % 19;
            const b = Math.floor(year / 100);
            const c = year % 100;
            const d = Math.floor(b / 4);
            const e = b % 4;
            const f = Math.floor((b + 8) / 25);
            const g = Math.floor((b - f + 1) / 3);
            const h = (19 * a + b - d - g + 15) % 30;
            const i = Math.floor(c / 4);
            const k = c % 4;
            const l = (32 + 2 * e + 2 * i - h - k) % 7;
            const m = Math.floor((a + 11 * h + 22 * l) / 451);
            const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0=Jan
            const day = ((h + l - 7 * m + 114) % 31) + 1; // Easter Sunday
            const easter = new Date(Date.UTC(year, month, day));
            easter.setUTCDate(easter.getUTCDate() + 1); // Monday after
            return toIsoUTC(easter);
        }

        function mondayBankHolidaysISO(year) {
            // Irish Monday bank holidays typically: St Brigid (first Mon Feb), May (first Mon),
            // June (first Mon), August (first Mon), October (last Mon), Easter Monday, plus
            // if St Patrick's Day (Mar 17) is Monday.
            const set = new Set();
            set.add(toIsoUTC(getFirstMonday(year, 1)));  // Feb
            set.add(toIsoUTC(getFirstMonday(year, 4)));  // May
            set.add(toIsoUTC(getFirstMonday(year, 5)));  // June
            set.add(toIsoUTC(getFirstMonday(year, 7)));  // August
            set.add(toIsoUTC(getLastMonday(year, 9)));   // October
            set.add(easterMondayISO(year));              // Easter Monday

            // St Patrick's Day if Monday
            const stp = new Date(Date.UTC(year, 2, 17));
            if (stp.getUTCDay() === 1) set.add(toIsoUTC(stp));
            return set;
        }

        function isClosedDate(dateStr) {
            if (!dateStr) return false;
            if (closedDates.has(dateStr)) return true;

            const d = new Date(`${dateStr}T00:00:00Z`);
            if (isNaN(d.getTime())) return false;
            const dow = d.getUTCDay(); // 0 Sun, 1 Mon, 2 Tue, ...

            // Exception: Irish Monday bank holidays are OPEN
            if (dow === 1) { // Monday
                const exceptions = mondayBankHolidaysISO(d.getUTCFullYear());
                return !exceptions.has(dateStr);
            }
            if (dow === 2) { // Tuesday always closed
                return true;
            }
            return false;
        }

        function validateDateField() {
            const v = dateInput.value;
            if (isClosedDate(v)) {
                const msg = 'Restaurant is closed on Mondays and Tuesdays, except on Irish Monday bank holidays. Please select another date.';
                dateInput.setCustomValidity(msg);
                dateInput.reportValidity();
            } else {
                dateInput.setCustomValidity('');
            }
        }

        dateInput.addEventListener('change', validateDateField);
        dateInput.addEventListener('input', validateDateField);
    }
});

// MENU FILTERS (placeholder, add logic as needed)
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Filtering logic here
  });
});

// MULTI-STEP RESERVATION FORM
const steps = document.querySelectorAll('.form-step');
const nextBtns = document.querySelectorAll('.next-btn');
const prevBtns = document.querySelectorAll('.prev-btn');
const progressBar = document.querySelector('.progress-bar');
const form = document.getElementById('reservationForm');
const confirmationModal = document.querySelector('.confirmation-modal');
let currentStep = 0;
function showStep(idx) {
  steps.forEach((step, i) => step.classList.toggle('active', i === idx));
  progressBar.style.width = ((idx+1)/steps.length*100) + '%';
}
nextBtns.forEach(btn => btn.addEventListener('click', () => {
  if (currentStep < steps.length - 1) {
    currentStep++;
    showStep(currentStep);
  }
}));
prevBtns.forEach(btn => btn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
}));
form.addEventListener('submit', e => {
  e.preventDefault();
  if (confirmationModal) {
    confirmationModal.style.display = '';
    form.style.display = 'none';
  }
});
// Accessibility: focus trap for modal (optional)

// Initialize AOS (Animate On Scroll) if available
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
}

// Form Validation Helper
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Error Message Helper
function showError(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    element.parentNode.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Success Message Helper
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Export functions for use in other modules
window.utils = {
    validateForm,
    showError,
    showSuccess
};

// Menu Items
const menuItems = {
    food: [
        {
            name: "Traditional Irish Stew",
            description: "Tender lamb, root vegetables, and herbs in a rich Guinness broth",
            price: "€16.95",
            image: "assets/images/menu/irish-stew.jpg",
            dietary: ["GF"]
        },
        {
            name: "Fish & Chips",
            description: "Fresh cod in crispy batter, served with hand-cut chips and mushy peas",
            price: "€15.95",
            image: "assets/images/menu/fish-chips.jpg",
            dietary: []
        },
        {
            name: "Shepherd's Pie",
            description: "Ground lamb and vegetables topped with creamy mashed potatoes",
            price: "€14.95",
            image: "assets/images/menu/shepherds-pie.jpg",
            dietary: []
        },
        {
            name: "Bangers & Mash",
            description: "Traditional Irish sausages with creamy mashed potatoes and onion gravy",
            price: "€13.95",
            image: "assets/images/menu/bangers-mash.jpg",
            dietary: []
        },
        {
            name: "Irish Breakfast",
            description: "Full Irish breakfast with eggs, bacon, sausage, black pudding, and more",
            price: "€17.95",
            image: "assets/images/menu/irish-breakfast.jpg",
            dietary: []
        },
        {
            name: "Colcannon",
            description: "Traditional Irish mashed potatoes with cabbage and spring onions",
            price: "€8.95",
            image: "assets/images/menu/colcannon.jpg",
            dietary: ["V", "GF"]
        }
    ],
    drinks: [
        {
            name: "Guinness",
            description: "The perfect pint of Ireland's famous stout",
            price: "€6.50",
            image: "assets/images/menu/guinness.jpg",
            dietary: ["GF"]
        },
        {
            name: "Irish Whiskey Flight",
            description: "Selection of three premium Irish whiskeys",
            price: "€18.95",
            image: "assets/images/menu/whiskey-flight.jpg",
            dietary: ["GF"]
        },
        {
            name: "Irish Coffee",
            description: "Hot coffee with Irish whiskey and fresh cream",
            price: "€8.95",
            image: "assets/images/menu/irish-coffee.jpg",
            dietary: []
        },
        {
            name: "Black & Tan",
            description: "Perfect blend of Guinness and Harp Lager",
            price: "€7.50",
            image: "assets/images/menu/black-tan.jpg",
            dietary: ["GF"]
        },
        {
            name: "Irish Cider",
            description: "Crisp and refreshing Irish apple cider",
            price: "€6.95",
            image: "assets/images/menu/irish-cider.jpg",
            dietary: ["GF"]
        },
        {
            name: "Irish Cream Liqueur",
            description: "Smooth and creamy Irish whiskey liqueur",
            price: "€7.95",
            image: "assets/images/menu/irish-cream.jpg",
            dietary: []
        }
    ]
};

// Function to display menu items
function displayMenuItems() {
    const foodContainer = document.getElementById('menu-food');
    const drinksContainer = document.getElementById('menu-drinks');

    // Check if containers exist before trying to use them
    if (!foodContainer || !drinksContainer) {
        console.log('Menu containers not found, skipping menu display');
        return;
    }

    // Display food items
    if (menuItems.food && Array.isArray(menuItems.food)) {
        menuItems.food.forEach(item => {
            const menuItem = createMenuItem(item);
            foodContainer.appendChild(menuItem);
        });
    }

    // Display drink items
    if (menuItems.drinks && Array.isArray(menuItems.drinks)) {
        menuItems.drinks.forEach(item => {
            const menuItem = createMenuItem(item);
            drinksContainer.appendChild(menuItem);
        });
    }
}

// Function to create menu item element
function createMenuItem(item) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p class="description">${item.description}</p>
        <p class="price">${item.price}</p>
        ${item.dietary.length > 0 ? `
            <div class="dietary">
                ${item.dietary.map(diet => `<span>${diet}</span>`).join('')}
            </div>
        ` : ''}
    `;
    return div;
}

// Function to initialize View More buttons
function initializeViewMoreButtons() {
    const viewMoreButtons = document.querySelectorAll('.view-more-btn');
    
    viewMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            const parent = this.closest('.menu-2x2-grid');
            const hiddenBox = parent.querySelector('.hidden-box');
            const hiddenItems = parent.querySelectorAll('.hidden-item');
            const isMobile = window.innerWidth <= 768;
            
            if (hiddenBox && hiddenBox.classList.contains('hidden-box')) {
                // SHOWING ITEMS
                hiddenBox.classList.remove('hidden-box');
                hiddenBox.style.display = 'block'; // Ensure it's displayed
                this.textContent = 'View Less';
                
                // Apply device-specific styling
                if (isMobile) {
                    // MOBILE: Apply mobile-specific styling
                    hiddenBox.style.margin = '0';
                    hiddenBox.style.padding = '0';
                    parent.style.gridTemplateColumns = '1fr';
                    parent.style.gap = '10px';
                    parent.classList.add('mobile-expanded');
                    
                    // Make each hidden item visible with mobile styling
                    hiddenItems.forEach(item => {
                        item.classList.remove('hidden-item');
                        item.style.display = 'flex';
                        item.style.flexDirection = 'column';
                        item.style.marginBottom = '8px';
                        item.style.padding = '10px';
                        item.style.width = '100%';
                        
                        // Fix styling of child elements
                        const itemDetails = item.querySelector('.item-details');
                        if (itemDetails) {
                            itemDetails.style.width = '100%';
                            itemDetails.style.padding = '0 0 8px 0';
                        }
                        
                        const price = item.querySelector('.price');
                        if (price) {
                            price.style.alignSelf = 'flex-end';
                        }
                    });
                    
                    // Compact layout to eliminate gaps
                    const ulElements = parent.querySelectorAll('ul');
                    ulElements.forEach(ul => {
                        ul.style.margin = '0';
                        ul.style.padding = '0';
                        ul.style.gap = '8px';
                    });
                } else {
                    // DESKTOP: Apply desktop styling
                    parent.classList.remove('collapsed');
                    parent.style.gridTemplateColumns = 'repeat(2, 1fr)';
                    parent.style.gap = '15px';
                    
                    // Fix spacing for desktop view
                    hiddenBox.style.margin = '0';
                    hiddenBox.style.padding = '8px';
                    
                    // Make hidden items visible with desktop styling
                    hiddenItems.forEach(item => {
                        item.classList.remove('hidden-item');
                        item.style.display = 'flex';
                        item.style.flexDirection = 'row';
                        item.style.justifyContent = 'space-between';
                        item.style.alignItems = 'flex-start';
                        item.style.marginBottom = '10px';
                        item.style.padding = '12px';
                        item.style.width = '100%';
                        
                        // Fix child elements for desktop layout
                        const itemDetails = item.querySelector('.item-details');
                        if (itemDetails) {
                            itemDetails.style.flex = '1';
                            itemDetails.style.paddingRight = '10px';
                        }
                        
                        const price = item.querySelector('.price');
                        if (price) {
                            price.style.alignSelf = 'center';
                        }
                    });
                    
                    // Fix spacing of ul elements
                    const ulElements = parent.querySelectorAll('ul');
                    ulElements.forEach(ul => {
                        ul.style.margin = '0';
                        ul.style.padding = '0';
                        ul.style.gap = '10px';
                    });
                }
                
                // Force reflow and trigger resize to update layout
                void parent.offsetWidth;
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 50);
            } else {
                // HIDING ITEMS
                hiddenBox.classList.add('hidden-box');
                hiddenBox.style.display = 'none';
                this.textContent = 'View More';
                
                // Reset device-specific classes and styles
                parent.classList.remove('mobile-expanded');
                parent.classList.add('collapsed');
                
                hiddenItems.forEach(item => {
                    item.classList.add('hidden-item');
                    item.style.display = '';
                });
                
                // Reset grid columns based on device
                if (isMobile) {
                    parent.style.gridTemplateColumns = '1fr';
                    parent.style.gap = '10px';
                } else {
                    parent.style.gridTemplateColumns = 'repeat(2, 1fr)';
                    parent.style.gap = '15px';
                }
                
                // Force reflow and trigger resize
                void parent.offsetWidth;
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 50);
            }
        });
    });
}

// Initialize menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    displayMenuItems();
    // ... existing initialization code ...
});

// Make email functions globally available for the reservation admin system
        // Email handling moved to backend SendGrid

// Add global refresh function for admin panel
window.forceRefreshReservations = async function() {
    console.log('🔄 Manual refresh triggered...');
    
    try {
        // First try the new reservation admin system
        if (window.reservationAdmin && window.reservationAdmin.updateReservationsList) {
            console.log('Using reservation admin system...');
            await window.reservationAdmin.updateReservationsList();
            return;
        }
        
        // Fallback to direct static database call
        if (window.staticDB) {
            console.log('Using direct static database call...');
            const reservationsList = document.getElementById('reservationsList');
            if (!reservationsList) {
                console.error('Reservations list element not found!');
                return;
            }
            
            reservationsList.innerHTML = '<div style="text-align: center; padding: 20px;">🔄 Loading reservations...</div>';
            
            const reservations = await window.staticDB.getReservations();
            console.log(`Found ${reservations.length} reservations`);
            
            if (reservations.length === 0) {
                reservationsList.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #666;">
                        <p>📝 No reservations found</p>
                        <p><small>Reservations will appear here when customers make bookings.</small></p>
                    </div>
                `;
            } else {
                reservationsList.innerHTML = reservations.map(res => `
                    <div class="reservation-card" data-id="${res.id}" style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007bff;">
                        <div class="reservation-header">
                            <h4>${res.name}</h4>
                            <span class="status ${(res.status || 'pending').toLowerCase()}" style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: #e9ecef;">${res.status || 'Pending'}</span>
                        </div>
                        <div class="reservation-details" style="margin: 10px 0;">
                            <p><i class="fas fa-calendar"></i> ${res.date} at ${res.time}</p>
                            <p><i class="fas fa-users"></i> ${res.guests} guests</p>
                            <p><i class="fas fa-envelope"></i> ${res.email}</p>
                            <p><i class="fas fa-phone"></i> ${res.phone}</p>
                            ${res.occasion ? `<p><i class="fas fa-gift"></i> ${res.occasion}</p>` : ''}
                            ${res.specialRequests ? `<p><i class="fas fa-comment"></i> ${res.specialRequests}</p>` : ''}
                            <p><i class="fas fa-clock"></i> Created: ${new Date(res.createdAt).toLocaleString()}</p>
                        </div>
                        <div class="reservation-actions" style="margin-top: 10px;">
                            <button onclick="updateReservationStatus('${res.id}', 'confirmed')" 
                                    class="btn" style="background: #28a745; color: white; margin: 2px; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;" ${(res.status || '').toLowerCase() === 'confirmed' ? 'disabled' : ''}>
                                Confirm
                            </button>
                            <button onclick="updateReservationStatus('${res.id}', 'cancelled')"
                                    class="btn" style="background: #dc3545; color: white; margin: 2px; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;" ${(res.status || '').toLowerCase() === 'cancelled' || (res.status || '').toLowerCase() === 'confirmed' ? 'disabled' : ''}>
                                Cancel
                            </button>
                            <button onclick="deleteReservation('${res.id}')" 
                                    class="btn" style="background: #6c757d; color: white; margin: 2px; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">
                                Delete
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            console.error('Static database not available');
            const reservationsList = document.getElementById('reservationsList');
            if (reservationsList) {
                reservationsList.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #dc3545;">
                        <p>❌ Database connection error</p>
                        <p><small>Unable to load reservations. Please check your internet connection and try again.</small></p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error refreshing reservations:', error);
        const reservationsList = document.getElementById('reservationsList');
        if (reservationsList) {
            reservationsList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #dc3545;">
                    <p>❌ Error loading reservations</p>
                    <p><small>${error.message}</small></p>
                    <button onclick="forceRefreshReservations()" style="margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Try Again</button>
                </div>
            `;
        }
    }
}; 