document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
    ===================================================== */
    const SERVER_URL = "https://mf-wiki-server.onrender.com";

    let artsMode = false;
    let imagesList = [];
    let currentIndex = 0;

    const gallery = document.querySelector(".gallery");
    const galleryCount = document.querySelector(".gallery-count");
    const uploadBtn = document.querySelector(".upload-btn");

    /* =====================================================
       LIGHTBOX
    ===================================================== */
    const lightbox = document.createElement("div");
    lightbox.className = "art-lightbox";

    lightbox.innerHTML = `
        <button class="lb-close">✕</button>
        <button class="lb-prev">◀</button>
        <div class="lb-number"></div>
        <img class="lb-img">
        <button class="lb-next">▶</button>
    `;

    const lbImg = lightbox.querySelector(".lb-img");
    const lbClose = lightbox.querySelector(".lb-close");
    const lbPrev = lightbox.querySelector(".lb-prev");
    const lbNext = lightbox.querySelector(".lb-next");
    const lbNumber = lightbox.querySelector(".lb-number");

    document.body.appendChild(lightbox);

    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        lbImg.src = "";
        lbNumber.textContent = "";
        document.body.style.overflow = "";
    }

    function updateLightbox() {
        lbImg.src = imagesList[currentIndex];
        lbNumber.textContent = `${currentIndex + 1} / ${imagesList.length}`;
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
        updateLightbox();
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % imagesList.length;
        updateLightbox();
    }

    lbClose.onclick = closeLightbox;
    lbPrev.onclick = (e) => { e.stopPropagation(); showPrev(); };
    lbNext.onclick = (e) => { e.stopPropagation(); showNext(); };

    lightbox.onclick = (e) => {
        if (e.target === lightbox) closeLightbox();
    };

    document.addEventListener("keydown", (e) => {
        if (lightbox.style.display !== "flex") return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showPrev();
        if (e.key === "ArrowRight") showNext();
    });

    /* =====================================================
       UI HELPERS
    ===================================================== */
    function updateUploadButtonState() {
        if (!uploadBtn) return;
        uploadBtn.classList.toggle("disabled-upload", !artsMode);
    }

    function updateGalleryCount() {
        if (!galleryCount) return;
        galleryCount.textContent = `Всего артов: ${imagesList.length}`;
    }

    /* =====================================================
       GALLERY
    ===================================================== */
    function addImage(url, id) {
        const wrap = document.createElement("div");
        wrap.className = "img-wrapper";

        const img = document.createElement("img");
        img.src = url;
        img.loading = "lazy";
        img.alt = "Арт";

        // плавное появление
        img.onload = () => {
            img.classList.add("loaded");
        };

        // динамический индекс (без багов)
        img.onclick = () => {
            const index = imagesList.indexOf(url);
            openLightbox(index);
        };

        wrap.appendChild(img);

        if (artsMode) {
            const delBtn = document.createElement("button");
            delBtn.className = "del-btn";
            delBtn.textContent = "✕";

            delBtn.onclick = (e) => {
                e.stopPropagation();

                if (!confirm("Удалить арт?")) return;

                fetch(`${SERVER_URL}/delete?id=${encodeURIComponent(id)}`, {
                    method: "DELETE"
                }).then(loadServerImages);
            };

            wrap.appendChild(delBtn);
        }

        gallery.appendChild(wrap);
    }

    function loadServerImages() {
        gallery.innerHTML = "<p>Загрузка...</p>";

        fetch(`${SERVER_URL}/list`)
            .then(res => res.json())
            .then(list => {
                gallery.innerHTML = "";
                imagesList = list.map(x => x.url);

                list.forEach(img => addImage(img.url, img.id));

                updateGalleryCount();
            })
            .catch(() => {
                gallery.innerHTML = "<p>Ошибка загрузки</p>";
            });
    }

    /* =====================================================
       UPLOAD
    ===================================================== */
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    document.body.appendChild(fileInput);

    fileInput.onchange = () => {
        if (!artsMode) return;

        const file = fileInput.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("Макс размер 5MB");
            return;
        }

        const form = new FormData();
        form.append("image", file);

        fetch(`${SERVER_URL}/upload`, {
            method: "POST",
            body: form
        }).then(loadServerImages);
    };

    uploadBtn.addEventListener("click", () => {
        if (artsMode) fileInput.click();
    });

    /* =====================================================
       EXTERNAL CONTROL
    ===================================================== */
    window.enableArtsMode = () => {
        artsMode = true;
        updateUploadButtonState();
        loadServerImages();
    };

    /* =====================================================
       INIT
    ===================================================== */
    updateUploadButtonState();
    loadServerImages();
});