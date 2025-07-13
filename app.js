// app.js - Final Version with all features

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
    const downloadCounts = JSON.parse(localStorage.getItem('downloadCounts')) || {};

    function createWallpaperElement(data, iteration) {
        const uniqueId = `${data.id}-${iteration}`;
        const imageUrl = `${data.id}.jpg.jpg`;
        const container = document.createElement('div');
        container.className = 'wallpaper-container';
        container.dataset.id = uniqueId;
        container.dataset.category = data.cat;
        container.id = uniqueId; // डीप लिंकिंग के लिए ID

        const isLiked = likedItems[uniqueId];
        const heartIconClass = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        const likeCount = isLiked ? '1' : '0';
        const currentDownloadCount = downloadCounts[uniqueId] || 0;

        container.innerHTML = `
            <img src="${imageUrl}" alt="Wallpaper" loading="lazy">
            <div class="action-buttons">
                <button class="like-btn ${isLiked ? 'liked' : ''}"><i class="${heartIconClass}"></i><span class="like-count">${likeCount}</span></button>
                <button class="share-btn"><i class="fa-solid fa-share-nodes"></i></button>
                <button class="download-counter-btn" title="Total Downloads by You"><i class="fa-solid fa-circle-down"></i><span class="download-count">${currentDownloadCount}</span></button>
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

    function filterAndDisplayWallpapers(scrollToId = null) {
        visibleCount = 0;
        let itemsShown = 0;
        const filteredWallpapers = allWallpaperElements.filter(w => activeCategory === 'all-god' || w.dataset.category.includes(activeCategory));
        
        allWallpaperElements.forEach(w => w.classList.add('hidden'));

        let targetElement = null;
        let targetFound = false;
        
        // डीप लिंकिंग के लिए सभी जरूरी वॉलपेपर दिखाएँ
        if(scrollToId) {
            filteredWallpapers.forEach(w => {
                 w.classList.remove('hidden');
                 itemsShown++;
                 if(w.id === scrollToId) {
                    targetElement = w;
                    targetFound = true;
                 }
                 if(targetFound) return; // एक बार मिल गया तो बाकी को नहीं दिखाना
            });
             if(!targetFound) itemsShown = 0; // अगर नहीं मिला तो रीसेट
        }

        // सामान्य लोड
        if(!targetFound){
            filteredWallpapers.forEach(w => {
                if (itemsShown < itemsPerLoad) {
                    w.classList.remove('hidden');
                    itemsShown++;
                }
            });
        }
        
        visibleCount = itemsShown;
        loadMoreBtn.classList.toggle('hidden', visibleCount >= filteredWallpapers.length);

        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.style.transition = 'box-shadow 0.3s';
                targetElement.style.boxShadow = '0 0 15px 5px rgba(0, 123, 255, 0.7)';
                setTimeout(() => {
                    targetElement.style.boxShadow = '3px 3px 8px #888888';
                }, 2500);
            }, 100);
        }
    }

    loadMoreBtn.addEventListener('click', () => { /* ... पहले जैसा ही ... */ });
    document.querySelectorAll('.category-link').forEach(link => { /* ... पहले जैसा ही ... */ });

    gallery.addEventListener('click', async function(event) {
        const target = event.target.closest('button, a.download-button');
        if (!target) return;
        
        const container = target.closest('.wallpaper-container');
        if (!container) return;

        const wallpaperId = container.dataset.id;

        // --- लाइक बटन ---
        if (target.classList.contains('like-btn')) { /* ... पहले जैसा ही ... */ }
        
        // --- नया शेयर बटन का लॉजिक ---
        if (target.classList.contains('share-btn')) {
            const pageUrl = window.location.origin + window.location.pathname + '#' + wallpaperId;
            const shareData = {
                title: 'Check out this Wallpaper!',
                text: 'I found this awesome wallpaper. Have a look:',
                url: pageUrl,
            };
            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    navigator.clipboard.writeText(pageUrl)
                        .then(() => alert('Link Copied to Clipboard!'))
                        .catch(err => console.error('Failed to copy: ', err));
                }
            } catch (err) {
                console.error("Share failed:", err.message);
            }
        }
        
        // --- नया डाउनलोड बटन का लॉजिक ---
        if (target.matches('a.download-button')) {
            event.preventDefault();

            // डाउनलोड काउंट बढ़ाएँ
            const currentCount = downloadCounts[wallpaperId] || 0;
            downloadCounts[wallpaperId] = currentCount + 1;
            localStorage.setItem('downloadCounts', JSON.stringify(downloadCounts));
            
            // UI पर काउंट अपडेट करें
            container.querySelector('.download-count').textContent = downloadCounts[wallpaperId];

            // टाइमर पेज पर भेजें
            const imageUrl = target.dataset.imageUrl;
            const extraLink = target.dataset.extraLink;
            if (imageUrl) {
                const encodedImageUrl = encodeURIComponent(imageUrl);
                const encodedExtraLink = encodeURIComponent(extraLink);
                window.open(`timer.html?image=${encodedImageUrl}&redirect=${encodedExtraLink}`, '_blank');
            }
        }
    });
    
    // --- पेज लोड होने पर डीप लिंक चेक करें ---
    function handleDeepLink() {
        if (window.location.hash) {
            const wallpaperId = window.location.hash.substring(1);
            const element = document.getElementById(wallpaperId);
            if(element) {
                const category = element.dataset.category.split(' ')[0];
                activeCategory = category;
                filterAndDisplayWallpapers(wallpaperId);
            } else {
                 filterAndDisplayWallpapers();
            }
        } else {
             filterAndDisplayWallpapers();
        }
    }
    
    generateWallpapers();
    handleDeepLink(); // सामान्य लोड की जगह इसे कॉल करें
});