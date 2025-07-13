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
    const likedItems = JSON.parse(localStorage.getItem('likedWallpapers')) || {};

    function createWallpaperElement(data, iteration) {
        const uniqueId = `${data.id}-${iteration}`;
        const imageUrl = `${data.id}.jpg.jpg`;
        const container = document.createElement('div');
        container.className = 'wallpaper-container';
        container.dataset.id = uniqueId;
        container.dataset.category = data.cat;
        
        const isLiked = likedItems[uniqueId];
        const heartIconClass = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        const likeCount = isLiked ? '1' : '0';

        container.innerHTML = `
            <img src="${imageUrl}" alt="Wallpaper" loading="lazy">
            <div class="action-buttons">
                <button class="like-btn ${isLiked ? 'liked' : ''}"><i class="${heartIconClass}"></i><span class="like-count">${likeCount}</span></button>
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
        const filteredWallpapers = allWallpaperElements.filter(w => w.dataset.category.includes(activeCategory));
        
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

    gallery.addEventListener('click', async function(event) {
        const target = event.target.closest('button, a.download-button');
        if (!target) return;
        
        const container = target.closest('.wallpaper-container');
        if (!container) return;

        // --- लाइक बटन का लॉजिक ---
        if (target.classList.contains('like-btn')) {
            const wallpaperId = container.dataset.id;
            const countSpan = target.querySelector('.like-count');
            const icon = target.querySelector('i');
            const isLiked = target.classList.toggle('liked');
            
            if (isLiked) {
                likedItems[wallpaperId] = true;
                countSpan.textContent = '1';
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
            } else {
                delete likedItems[wallpaperId];
                countSpan.textContent = '0';
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
            }
            localStorage.setItem('likedWallpapers', JSON.stringify(likedItems));
        }
        
        // --- शेयर बटन का लॉजिक ---
        if (target.classList.contains('share-btn')) {
            const downloadBtn = container.querySelector('.download-button');
            const imageUrl = downloadBtn.dataset.imageUrl;
            
            if (navigator.share) {
                try {
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const file = new File([blob], imageUrl.split('/').pop(), { type: blob.type });
                    await navigator.share({ title: document.title, text: 'Check out this awesome wallpaper!', files: [file] });
                } catch (error) { console.error('Error sharing:', error); alert('Could not share the image.'); }
            } else {
                navigator.clipboard.writeText(window.location.origin + window.location.pathname + imageUrl)
                    .then(() => alert('Image Link Copied to Clipboard!'))
                    .catch(err => console.error('Failed to copy: ', err));
            }
        }
        
        // --- कमेंट बटन का लॉजिक ---
        if (target.classList.contains('comment-btn')) {
            alert('Commenting feature is under development!');
        }

        // --- डाउनलोड बटन का लॉजिक ---
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
    });

    generateWallpapers();
    filterAndDisplayWallpapers();
});