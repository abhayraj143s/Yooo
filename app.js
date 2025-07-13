document.addEventListener('DOMContentLoaded', function() {
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mainMenu = document.getElementById('main-menu');
    menuToggleBtn.addEventListener('click', () => mainMenu.classList.add('menu-open'));
    closeMenuBtn.addEventListener('click', () => mainMenu.classList.remove('menu-open'));

    const gallery = document.querySelector('.wallpaper-gallery');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const pageTitle = document.getElementById('page-title');
    const itemsPerLoad = 30;

    let allWallpaperElements = [];
    let activeCategory = 'all-god';
    let visibleCount = 0;

    function createWallpaperElement(data, iteration) {
        const uniqueId = `${data.id}-${iteration}`;
        const imageUrl = `${data.id}.jpg.jpg`;
        const container = document.createElement('div');
        container.className = 'wallpaper-container';
        container.dataset.id = uniqueId;
        container.dataset.category = data.cat;
        container.innerHTML = `
            <img src="${imageUrl}" alt="Wallpaper" loading="lazy">
            <div class="action-buttons">
                <button class="like-btn"><i class="fa-regular fa-heart"></i><span class="like-count">0</span></button>
                <button class="share-btn"><i class="fa-solid fa-share-nodes"></i></button>
                <button class="comment-btn"><i class="fa-regular fa-comment"></i></button>
            </div>
            <a href="#" class="download-button" data-image-url="${imageUrl}" data-extra-link="${data.link}">Download</a>`;
        return container;
    }

    function generateWallpapers() {
        const totalWallpapers = 330;
        for (let i = 0; i < totalWallpapers; i++) {
            const data = wallpaperData[i % wallpaperData.length];
            const iteration = Math.floor(i / wallpaperData.length) + 1;
            const el = createWallpaperElement(data, iteration);
            gallery.appendChild(el);
        }
        allWallpaperElements = Array.from(gallery.querySelectorAll('.wallpaper-container'));
    }

    function filterAndDisplayWallpapers() {
        visibleCount = 0;
        let itemsShown = 0;
        const filteredWallpapers = allWallpaperElements.filter(w => activeCategory === 'all-god' || w.dataset.category.includes(activeCategory));
        
        allWallpaperElements.forEach(w => w.classList.add('hidden'));

        filteredWallpapers.forEach(w => {
            if (itemsShown < itemsPerLoad) {
                w.classList.remove('hidden');
                itemsShown++;
            }
        });
        
        visibleCount = itemsShown;
        loadMoreBtn.classList.toggle('hidden', visibleCount >= filteredWallpapers.length);
    }

    loadMoreBtn.addEventListener('click', () => {
        let itemsShown = 0;
        const filteredWallpapers = allWallpaperElements.filter(w => w.dataset.category.includes(activeCategory));
        filteredWallpapers.forEach(w => {
            if (w.classList.contains('hidden') && itemsShown < itemsPerLoad) {
                w.classList.remove('hidden');
                itemsShown++;
            }
        });
        visibleCount += itemsShown;
        loadMoreBtn.classList.toggle('hidden', visibleCount >= filteredWallpapers.length);
    });

    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            activeCategory = e.target.dataset.category;
            pageTitle.textContent = e.target.textContent;
            mainMenu.classList.remove('menu-open');
            filterAndDisplayWallpapers();
        });
    });

    // Event Delegation for action buttons
    gallery.addEventListener('click', function(event) {
        const target = event.target.closest('button, a.download-button');
        if (!target) return;
        
        const container = target.closest('.wallpaper-container');
        if (!container) return;

        if (target.matches('a.download-button')) {
            event.preventDefault();
            const imageUrl = target.dataset.imageUrl;
            const extraLink = target.dataset.extraLink;
            if (imageUrl) {
                const encodedImageUrl = encodeURIComponent(imageUrl);
                const encodedExtraLink = encodeURIComponent(extraLink);
                window.open(`timer.html?image=${encodedImageUrl}&redirect=${encodedExtraLink}`, '_blank');
            }
        }
        // ... (Like, Share, Comment logic)
    });

    generateWallpapers();
    filterAndDisplayWallpapers();
});