// Simple Photo Gallery JavaScript - Slideshow Style
class SimplePhotoGallery {
    constructor() {
        this.currentPhotoIndex = 0;
        this.allPhotos = [];
        this.init();
    }
    
    init() {
        this.loadPhotos();
        this.setupEventListeners();
        this.createLightbox();
        this.renderGallery();
    }
    
    // Load photos from your Gallery folder
    loadPhotos() {
        // Your actual photos from the Gallery folder
        this.allPhotos = [
            { id: 1, src: 'assets/images/Gallery/a-Rambling_HOUSE_BUILDING.jpg', alt: 'Rambling House Building' },
            { id: 2, src: 'assets/images/Gallery/b-rAMBLING_HOUSE_INSIDE.jpg', alt: 'Rambling House Inside' },
            { id: 3, src: 'assets/images/Gallery/c-iRISH HOSPITALITY AWARDS.jpg', alt: 'Irish Hospitality Awards' },
            { id: 4, src: 'assets/images/Gallery/d-BAR1.jpg', alt: 'Bar Area 1' },
            { id: 5, src: 'assets/images/Gallery/e-BAR2.jpg', alt: 'Bar Area 2' },
            { id: 6, src: 'assets/images/Gallery/f-BAR3.jpg', alt: 'Bar Area 3' },
            { id: 7, src: 'assets/images/Gallery/g-CHRISTENING.JPG', alt: 'Christening Celebration' },
            { id: 8, src: 'assets/images/Gallery/h-CHRISTENING2.JPG', alt: 'Christening Celebration 2' },
            { id: 9, src: 'assets/images/Gallery/i-BIRTHDAY1.jpg', alt: 'Birthday Celebration 1' },
            { id: 10, src: 'assets/images/Gallery/j-bIRTHDAY2.jpg', alt: 'Birthday Celebration 2' },
            { id: 11, src: 'assets/images/Gallery/k-ATHLETICS.jpg', alt: 'Athletics' },
            { id: 12, src: 'assets/images/Gallery/l-PPL1.JPG', alt: 'People 1' },
            { id: 13, src: 'assets/images/Gallery/m-PPL2.jpg', alt: 'People 2' }
        ];
    }
    
    setupEventListeners() {
        // Navigation buttons
        const prevBtn = document.getElementById('galleryPrev');
        const nextBtn = document.getElementById('galleryNext');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPhoto());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPhoto());
        }
        
        // Gallery photo click to open lightbox
        const galleryPhoto = document.getElementById('galleryPhoto');
        if (galleryPhoto) {
            galleryPhoto.addEventListener('click', () => {
                this.openLightbox(this.currentPhotoIndex);
            });
        }
    }
    
    renderGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;
        
        // Show only one photo at a time with navigation
        galleryGrid.innerHTML = `
            <div class="gallery-slideshow">
                <div class="gallery-photo-container">
                    <img id="galleryPhoto" src="${this.allPhotos[0].src}" alt="${this.allPhotos[0].alt}" loading="lazy">
                </div>
                <div class="gallery-navigation">
                    <button id="galleryPrev" class="gallery-nav-btn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="gallery-counter">1 / ${this.allPhotos.length}</span>
                    <button id="galleryNext" class="gallery-nav-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Re-setup event listeners after rendering
        this.setupEventListeners();
    }
    
    previousPhoto() {
        this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.allPhotos.length) % this.allPhotos.length;
        this.updateDisplayedPhoto();
    }
    
    nextPhoto() {
        this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.allPhotos.length;
        this.updateDisplayedPhoto();
    }
    
    updateDisplayedPhoto() {
        const photo = this.allPhotos[this.currentPhotoIndex];
        const photoImg = document.getElementById('galleryPhoto');
        const counter = document.querySelector('.gallery-counter');
        
        if (photoImg) {
            photoImg.src = photo.src;
            photoImg.alt = photo.alt;
        }
        
        if (counter) {
            counter.textContent = `${this.currentPhotoIndex + 1} / ${this.allPhotos.length}`;
        }
    }
    
    createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <img class="lightbox-img" src="" alt="">
                <button class="lightbox-nav lightbox-prev">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="lightbox-nav lightbox-next">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        
        // Lightbox event listeners
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        closeBtn.addEventListener('click', () => this.closeLightbox());
        prevBtn.addEventListener('click', () => this.previousPhotoLightbox());
        nextBtn.addEventListener('click', () => this.nextPhotoLightbox());
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                this.closeLightbox();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.previousPhotoLightbox();
                    break;
                case 'ArrowRight':
                    this.nextPhotoLightbox();
                    break;
            }
        });
    }
    
    openLightbox(photoIndex) {
        const photo = this.allPhotos[photoIndex];
        if (!photo) return;
        
        this.currentPhotoIndex = photoIndex;
        
        const lightbox = document.querySelector('.lightbox');
        const img = lightbox.querySelector('.lightbox-img');
        
        img.src = photo.src;
        img.alt = photo.alt;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeLightbox() {
        const lightbox = document.querySelector('.lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    previousPhotoLightbox() {
        this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.allPhotos.length) % this.allPhotos.length;
        this.updateLightboxPhoto();
    }
    
    nextPhotoLightbox() {
        this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.allPhotos.length;
        this.updateLightboxPhoto();
    }
    
    updateLightboxPhoto() {
        const photo = this.allPhotos[this.currentPhotoIndex];
        const lightbox = document.querySelector('.lightbox');
        const img = lightbox.querySelector('.lightbox-img');
        
        if (img && photo) {
            img.src = photo.src;
            img.alt = photo.alt;
        }
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SimplePhotoGallery();
});
