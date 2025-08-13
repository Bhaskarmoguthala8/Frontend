// Cookie Consent Management System
class CookieConsent {
    constructor() {
        this.cookieName = 'ramblingHouseCookies';
        this.cookieExpiry = 365; // days
        this.init();
    }

    init() {
        // Check if user has already made a choice
        if (!this.hasUserConsented()) {
            this.showBanner();
        }
        
        // Add event listeners
        this.addEventListeners();
    }

    hasUserConsented() {
        const consent = localStorage.getItem(this.cookieName);
        return consent === 'accepted' || consent === 'declined';
    }

    showBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.display = 'block';
            // Add slide-up animation
            setTimeout(() => {
                banner.classList.add('show');
            }, 100);
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.add('hidden');
            setTimeout(() => {
                banner.style.display = 'none';
            }, 500);
        }
    }

    acceptCookies() {
        // Store user consent
        localStorage.setItem(this.cookieName, 'accepted');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        
        // Hide the banner
        this.hideBanner();
        
        // Close modal if open
        this.closeModal();
        
        // Log consent for analytics (if you add them later)
        console.log('🍪 Cookies accepted by user');
        
        // Show success message
        this.showSuccessMessage('Cookies accepted! Thank you for your consent.');
    }

    declineCookies() {
        // Store user choice
        localStorage.setItem(this.cookieName, 'declined');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        
        // Hide the banner
        this.hideBanner();
        
        // Close modal if open
        this.closeModal();
        
        // Log decline for analytics
        console.log('🍪 Cookies declined by user');
        
        // Show message about limited functionality
        this.showInfoMessage('Some features may not work properly without cookies.');
    }

    showModal() {
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.style.display = 'block';
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.style.display = 'none';
            // Restore body scroll
            document.body.style.overflow = 'auto';
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showInfoMessage(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type = 'info') {
        // Create temporary message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `cookie-message cookie-message-${type}`;
        messageDiv.textContent = message;
        
        // Style the message
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10002;
            animation: slideInRight 0.5s ease-out;
            max-width: 300px;
            font-weight: 500;
        `;
        
        document.body.appendChild(messageDiv);
        
        // Remove message after 4 seconds
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 500);
        }, 4000);
    }

    addEventListeners() {
        // Close modal when clicking outside
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // Method to check if cookies are accepted (for other scripts)
    isAccepted() {
        return localStorage.getItem(this.cookieName) === 'accepted';
    }

    // Method to get consent date
    getConsentDate() {
        return localStorage.getItem('cookieConsentDate');
    }

    // Method to reset consent (for testing)
    resetConsent() {
        localStorage.removeItem(this.cookieName);
        localStorage.removeItem('cookieConsentDate');
        this.showBanner();
    }
}

// Global functions for HTML onclick handlers
function acceptCookies() {
    if (window.cookieConsent) {
        window.cookieConsent.acceptCookies();
    }
}

function declineCookies() {
    if (window.cookieConsent) {
        window.cookieConsent.declineCookies();
    }
}

function showCookieDetails() {
    if (window.cookieConsent) {
        window.cookieConsent.showModal();
    }
}

function closeCookieModal() {
    if (window.cookieConsent) {
        window.cookieConsent.closeModal();
    }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.cookieConsent = new CookieConsent();
    
    // Add CSS animations for messages
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieConsent;
}
