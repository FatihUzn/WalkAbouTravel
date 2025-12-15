/* ================================================
   WALKABOUT TRAVEL - TOUR DATA & FUNCTIONALITY
   ================================================ */
    
    // Update hero section
    document.getElementById('tourHeroImage').src = tour.image;
    document.getElementById('tourBadge').textContent = tour.category;
    document.getElementById('tourTitle').textContent = tour.title;
    
    // Update meta info
    document.getElementById('tourMeta').innerHTML = `
        <div class="tour-meta-item">
            <i class="fas fa-clock"></i>
            <span>${tour.duration}</span>
        </div>
        <div class="tour-meta-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${tour.location}</span>
        </div>
        <div class="tour-meta-item">
            <i class="fas fa-tag"></i>
            <span>${tour.price}</span>
        </div>
    `;
    
    // Update description
    document.getElementById('tourDescription').innerHTML = tour.description;
    
    // Update price
    document.getElementById('tourPrice').textContent = tour.price;
    
    // Update info list
    document.getElementById('tourInfoList').innerHTML = `
        <li>
            <span class="tour-info-label">Süre</span>
            <span class="tour-info-value">${tour.duration}</span>
        </li>
        <li>
            <span class="tour-info-label">Lokasyon</span>
            <span class="tour-info-value">${tour.location}</span>
        </li>
        <li>
            <span class="tour-info-label">Bölge</span>
            <span class="tour-info-value">${tour.area}</span>
        </li>
        <li>
            <span class="tour-info-label">Kategori</span>
            <span class="tour-info-value">${tour.category}</span>
        </li>
    `;
    
    // Update gallery
    galleryImages = tour.images || [tour.image];
    const galleryHtml = galleryImages.map((img, index) => `
        <div class="gallery-item" onclick="openLightbox(${index})">
            <img src="${img}" alt="${tour.title}" onerror="this.src='https://placehold.co/400x300/0ea5e9/FFF?text=Tour'">
        </div>
    `).join('');
    document.getElementById('tourGallery').innerHTML = galleryHtml;
    
    // Update booking buttons
    const emailSubject = encodeURIComponent(`${tour.title} Hakkında Bilgi`);
    const emailBody = encodeURIComponent(`Merhaba,\n\n${tour.title} (${tour.price}) hakkında detaylı bilgi almak istiyorum.\n\nTeşekkürler.`);
    document.getElementById('emailBtn').href = `mailto:info@walkaboutravel.com?subject=${emailSubject}&body=${emailBody}`;
    
    const whatsappText = encodeURIComponent(`Merhaba! ${tour.title} hakkında bilgi almak istiyorum.`);
    document.getElementById('whatsappBtn').href = `https://wa.me/5491135870045?text=${whatsappText}`;
    
    // Update page title
    document.title = `${tour.title} - WalkAbout Travel`;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TOUR_DATA, loadTourDetail };
}
