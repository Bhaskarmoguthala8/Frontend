// Clean Menu Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu organized JavaScript loaded');
    
    // Initialize menu tabs
    initializeMenuTabs();
    
    // Add smooth animations
    addMenuAnimations();
});

function initializeMenuTabs() {
    const menuTabs = document.querySelectorAll('.menu-tabs .tab');
    const menuContents = document.querySelectorAll('.menu-content');
    
    console.log(`Found ${menuTabs.length} tabs and ${menuContents.length} content sections`);
    
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
            
            // Show corresponding content with animation
            const targetContent = document.getElementById(`${targetId}-menu`);
            if (targetContent) {
                // Add a small delay for better animation effect
                setTimeout(() => {
                    targetContent.classList.add('active');
                }, 100);
                console.log(`Showing menu: ${targetId}-menu`);
            } else {
                console.error(`Menu content for ${targetId} not found!`);
            }
        });
    });
}

function addMenuAnimations() {
    // Add intersection observer for menu items to animate them when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Initially hide menu items for animation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
    
    // Add hover effects for menu categories
    const menuCategories = document.querySelectorAll('.menu-category');
    menuCategories.forEach(category => {
        category.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        category.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Export functions for use in other modules if needed
window.menuOrganized = {
    initializeMenuTabs,
    addMenuAnimations
}; 