// Authentication System - Integrated with Backend API
// This provides login functionality that connects to the backend

console.log('🚀 STATIC-AUTH.JS LOADING - VERSION 4');
console.log('Loading authentication system...');

// Backend API base URL (define once globally)
window.API_BASE = window.API_BASE || 'https://reservations-backend-m4yb.onrender.com';

let authToken = null;

let currentUser = null;

// Show login modal
function showLoginModal() {
    console.log('🚨 showLoginModal() called - this should not happen automatically!');
    console.log('🚨 Stack trace:', new Error().stack);
    
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('loginEmail').focus();
        console.log('🚨 Login modal is now visible');
    }
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('loginForm').reset();
        hideLoginError();
    }
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                console.log('🔐 Attempting login...');

                const response = await fetch(`${window.API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.access_token) {
                    // Token now stored in httpOnly cookie by server
                    authToken = data.access_token;
                    window.authToken = data.access_token; // Make it globally accessible for fallback
                    currentUser = data.user || { email };
                    console.log('✅ Login successful:', currentUser);
                    closeLoginModal();
                    showLoginSuccess();
                    showLoggedInState();
                    showManagementSection();
                    
                    // Load reservations after successful login
                    if (typeof updateReservationsList === 'function') {
                        await updateReservationsList();
                    }
                } else {
                    throw new Error(data.detail || 'Login failed');
                }
            } catch (error) {
                console.error('❌ Login error:', error);
                showLoginError('Invalid email or password. Use the credentials you added to Supabase Auth.');
            }
        });
    }

    // Close modal when clicking outside
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLoginModal();
            }
        });
    }
});

// Logout function
async function logout() {
    try {
        // Call logout endpoint to clear httpOnly cookie
        await fetch(`${window.API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        currentUser = null;
        authToken = null;
        window.authToken = null; // Clear global token
        console.log('👋 User logged out successfully');
        showLoggedOutState();
        hideManagementSection();
    } catch (error) {
        console.error('❌ Logout error:', error);
    }
}

// Show logged in state
function showLoggedInState() {
    console.log('Showing logged in state...');
    
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.querySelector('.logout-btn');
    
    if (loginButton) {
        loginButton.style.display = 'none';
        console.log('Login button hidden');
    }
    
    if (logoutButton) {
        logoutButton.style.display = 'inline-block';
        console.log('Logout button shown');
    }
}

// Show logged out state
function showLoggedOutState() {
    console.log('Showing logged out state...');
    
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.querySelector('.logout-btn');
    
    if (loginButton) {
        loginButton.style.display = 'inline-block';
        console.log('Login button shown');
    }
    
    if (logoutButton) {
        logoutButton.style.display = 'none';
        console.log('Logout button hidden');
    }
}

// Show management section
function showManagementSection() {
    console.log('Showing management section...');
    const managementSection = document.getElementById('managementSection');
    if (managementSection) {
        managementSection.style.display = 'block';
        console.log('Management section shown');
    }
}

// Hide management section
function hideManagementSection() {
    console.log('Hiding management section...');
    const managementSection = document.getElementById('managementSection');
    if (managementSection) {
        managementSection.style.display = 'none';
        console.log('Management section hidden');
    }
}

// Show login success message
function showLoginSuccess() {
    console.log('Login successful!');
    // You can add a toast notification here if needed
}

// Show login error
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Hide login error
function hideLoginError() {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return !!(authToken || (function(){ try { return localStorage.getItem('authToken'); } catch (_) { return null; } })());
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

function getAuthToken() {
    // Token is now in httpOnly cookie, managed by browser
    return authToken;
}

// Restore token on load (if present)
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DOM Content Loaded - Checking authentication...');
    const existing = getAuthToken();
    console.log('🔍 Auth token found:', !!existing);
    
    if (existing) {
        console.log('✅ User is authenticated, showing admin features');
        showLoggedInState();
        showManagementSection();
        if (window.reservationAdmin && typeof window.reservationAdmin.updateReservationsList === 'function') {
            window.reservationAdmin.updateReservationsList();
        }
    } else {
        console.log('❌ No token found, showing main website (no login modal)');
        // No token: show main website by default, don't force login
        showLoggedOutState();
        hideManagementSection();
    }
    
    // Debug: Check if login modal is visible
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        console.log('🔍 Login modal display style:', loginModal.style.display);
        console.log('🔍 Login modal computed display:', window.getComputedStyle(loginModal).display);
    }
});

// Export functions for use in other scripts
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser; 
window.getAuthToken = getAuthToken;
window.API_BASE = API_BASE;
