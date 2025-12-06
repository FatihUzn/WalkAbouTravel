import { PATHS } from '../config/constants.js';

const state = {
    images: [],
    currentIndex: 0
};

export function openGallery(images, startIndex = 0) {
    if (!images || images.length === 0) return;
    
    state.images = images;
    state.currentIndex = startIndex;
    
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.style.display = 'flex';
        updateView();
    }
}

export function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.style.display = 'none';
}

export function showNextImage() {
    if (state.images.length === 0) return;
    state.currentIndex = (state.currentIndex + 1) % state.images.length;
    updateView();
}

export function showPrevImage() {
    if (state.images.length === 0) return;
    state.currentIndex = (state.currentIndex - 1 + state.images.length) % state.images.length;
    updateView();
}

function updateView() {
    const imgElement = document.getElementById('lightbox-image');
    const counter = document.getElementById('lightbox-counter');
    
    if (imgElement) {
        imgElement.style.opacity = '0.5';
        
        // Kısa bir gecikme ile geçiş efekti
        setTimeout(() => {
            imgElement.src = state.images[state.currentIndex];
            imgElement.onerror = function() { 
                this.src = PATHS.FALLBACK_IMAGE; 
                this.onerror = null; 
            };
            imgElement.style.opacity = '1';
        }, 150);
    }
    
    if (counter) {
        counter.innerText = `${state.currentIndex + 1} / ${state.images.length}`;
    }
}