// Static Database System - Replaces Firestore
// This provides local storage-based data management without Firebase dependencies

console.log('Loading static database system...');

// Initialize local storage keys
const RESERVATIONS_KEY = 'ramblinghouse_reservations';
const NEWSLETTER_KEY = 'ramblinghouse_newsletter';

// ======================================
// RESERVATION DATABASE OPERATIONS
// ======================================

// Save reservation to local storage
async function saveReservationToStorage(reservationData) {
    try {
        console.log('Saving reservation to local storage:', reservationData);
        
        // Validate required fields before saving
        const requiredFields = ['name', 'email', 'phone', 'guests', 'date', 'time'];
        const missingFields = requiredFields.filter(field => !reservationData[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        // Ensure we don't save empty strings
        if (!reservationData.name.trim() || !reservationData.email.trim()) {
            throw new Error('Name and email cannot be empty');
        }
        
        // Get existing reservations
        const existingReservations = JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || '[]');
        
        // Add timestamp and ID
        const reservationWithTimestamp = {
            ...reservationData,
            id: reservationData.id || Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: reservationData.status || 'pending'
        };
        
        // Add to existing reservations
        existingReservations.push(reservationWithTimestamp);
        
        // Save back to localStorage
        localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(existingReservations));
        
        console.log('Reservation saved with ID:', reservationWithTimestamp.id);
        return reservationWithTimestamp.id;
    } catch (error) {
        console.error('Error saving reservation to storage:', error);
        throw error;
    }
}

// Get all reservations from local storage
async function getReservationsFromStorage() {
    try {
        console.log('Fetching reservations from local storage...');
        const reservations = JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || '[]');
        
        console.log(`Fetched ${reservations.length} reservations from storage`);
        return reservations;
    } catch (error) {
        console.error('Error fetching reservations from storage:', error);
        return [];
    }
}

// Update reservation status in local storage
async function updateReservationStatusInStorage(reservationId, newStatus) {
    try {
        console.log(`Updating reservation ${reservationId} status to ${newStatus}`);
        
        const reservations = JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || '[]');
        const reservationIndex = reservations.findIndex(r => r.id == reservationId);
        
        if (reservationIndex === -1) {
            throw new Error(`Reservation with ID ${reservationId} not found.`);
        }
        
        // Update the reservation
        reservations[reservationIndex].status = newStatus;
        reservations[reservationIndex].updatedAt = new Date().toISOString();
        
        // Save back to localStorage
        localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
        
        console.log('Reservation status updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating reservation status:', error);
        throw error;
    }
}

// Delete reservation from local storage
async function deleteReservationFromStorage(reservationId) {
    try {
        console.log(`Deleting reservation ${reservationId}`);
        
        const reservations = JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || '[]');
        const filteredReservations = reservations.filter(r => r.id != reservationId);
        
        if (filteredReservations.length === reservations.length) {
            throw new Error(`Reservation with ID ${reservationId} not found.`);
        }
        
        // Save back to localStorage
        localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(filteredReservations));
        
        console.log('Reservation deleted successfully');
        return true;
    } catch (error) {
        console.error('Error deleting reservation:', error);
        throw error;
    }
}

// Real-time listener simulation (polling)
function listenToReservations(callback) {
    try {
        console.log('Setting up storage listener for reservations...');
        
        // Simulate real-time updates by polling every 5 seconds
        const interval = setInterval(() => {
            const reservations = JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || '[]');
            callback(reservations);
        }, 5000);
        
        // Return a function to stop listening
        return () => clearInterval(interval);
    } catch (error) {
        console.error('Error setting up storage listener:', error);
    }
}

// ======================================
// NEWSLETTER DATABASE OPERATIONS
// ======================================

// Save newsletter subscription to local storage
async function saveNewsletterToStorage(email) {
    try {
        console.log('Saving newsletter subscription to storage:', email);
        
        const subscriptions = JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || '[]');
        
        // Check if email already exists
        const existingSubscription = subscriptions.find(s => s.email === email);
        
        if (existingSubscription) {
            console.log('Email already subscribed');
            return { success: false, message: 'Email already subscribed to newsletter' };
        }
        
        // Add new subscription
        const subscriptionData = {
            email: email,
            subscribeDate: new Date().toISOString(),
            active: true,
            source: 'website'
        };
        
        subscriptions.push(subscriptionData);
        localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(subscriptions));
        
        console.log('Newsletter subscription saved');
        return { success: true, id: Date.now().toString() };
    } catch (error) {
        console.error('Error saving newsletter subscription:', error);
        throw error;
    }
}

// ======================================
// DEMO DATA INITIALIZATION
// ======================================

// Initialize with some demo reservations if none exist
function initializeDemoData() {
    const existingReservations = JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || '[]');
    
    if (existingReservations.length === 0) {
        console.log('Initializing demo reservations...');
        
        const demoReservations = [
            {
                id: '1',
                name: 'John Smith',
                email: 'john.smith@email.com',
                phone: '+353 87 123 4567',
                guests: '4',
                date: '2024-12-25',
                time: '19:00',
                occasion: 'Christmas Dinner',
                specialRequests: 'Window seat preferred',
                status: 'confirmed',
                createdAt: '2024-12-20T10:30:00.000Z'
            },
            {
                id: '2',
                name: 'Mary O\'Connor',
                email: 'mary.oconnor@email.com',
                phone: '+353 86 987 6543',
                guests: '2',
                date: '2024-12-26',
                time: '18:00',
                occasion: 'Anniversary',
                specialRequests: 'Quiet table please',
                status: 'pending',
                createdAt: '2024-12-21T14:15:00.000Z'
            },
            {
                id: '3',
                name: 'Pat Murphy',
                email: 'pat.murphy@email.com',
                phone: '+353 85 555 1234',
                guests: '6',
                date: '2024-12-27',
                time: '20:00',
                occasion: 'Birthday',
                specialRequests: 'Birthday cake if possible',
                status: 'confirmed',
                createdAt: '2024-12-22T09:45:00.000Z'
            }
        ];
        
        localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(demoReservations));
        console.log('Demo reservations initialized');
    }
}

// ======================================
// EXPORT FUNCTIONS
// ======================================

// Export functions for global use
window.staticDB = {
    // Reservations
    saveReservation: saveReservationToStorage,
    getReservations: getReservationsFromStorage,
    updateReservationStatus: updateReservationStatusInStorage,
    deleteReservation: deleteReservationFromStorage,
    listenToReservations: listenToReservations,
    
    // Newsletter
    saveNewsletter: saveNewsletterToStorage,
    
    // Demo data
    initializeDemoData: initializeDemoData
};

console.log('✅ Static database functions ready and exported to window.staticDB');

// Initialize demo data on first load
document.addEventListener('DOMContentLoaded', () => {
    initializeDemoData();
}); 