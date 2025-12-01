console.log("Wiki loaded in neon retro mode.");

const SITE_VERSION = "V.0.1";
const SERVER_URL = "https://mf-wiki-server.onrender.com"; // твой Render URL

document.addEventListener("DOMContentLoaded", () => {

    const versionLabel = document.querySelector(".version-label");
    if (versionLabel) versionLabel.textContent = SITE_VERSION;

    const gallery = document.querySelector(".gallery");
    if (!gallery) return;

    const consoleInput = document.getElementById("consoleInput");
    const consoleBtn = document.getElementById("consoleBtn");
    const consoleOutput = document.getElementById("consoleOutput");
    const uploadBtn = document.querySelector(".upload-btn");

    let artsMode = false;

    function updateUploadButtonState() {
        if (artsMode) uploadBtn.classList.remove("disabled-upload");
        else uploadBtn.classList.add("disabled-upload");
    }

    // === Добавление изображения в галерею ===
    function addImage(url, id) {
        const wrap = document.createElement("div");
        wrap.classList.add("img-wrapper");
        wrap.style.position = "relative";

        const img = document.createElement("img");
        img.src = url;
        wrap.appendChild(img);

        if (artsMode) {
            const delBtn = document.createElement("button");
            delBtn.classList.add("del-btn");
            delBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>`;

            delBtn.onclick = () => {
                fetch(`${SERVER_URL}/delete?id=${encodeURIComponent(id)}`, { method: "DELETE" })
                    .then(res => res.json())
                    .then(() => loadServerImages())
                    .catch(() => alert("Ошибка удаления"));
            };

            wrap.appendChild(delBtn);
        }

        gallery.appendChild(wrap);
    }

    // === Получаем список изображений с сервера ===
    function loadServerImages() {
        fetch(`${SERVER_URL}/list`)
            .then(res => res.json())
            .then(list => {
                gallery.innerHTML = "";
                list.forEach(img => addImage(img.url, img.id));
            })
            .catch(() => consoleOutput.textContent = "Не удалось загрузить изображения с сервера.");
    }

    // === Элемент выбора файла ===
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    // === Загрузка изображения на сервер ===
    fileInput.onchange = () => {
        if (!artsMode) return;
        const file = fileInput.files[0];
        if (!file) return;

        const form = new FormData();
        form.append("image", file);

        fetch(`${SERVER_URL}/upload`, {
            method: "POST",
            body: form
        })
        .then(res => res.json())
        .then(data => {
            loadServerImages();
        })
        .catch(() => alert("Ошибка загрузки"));
    };

    uploadBtn.onclick = () => {
        if (!artsMode) return;
        fileInput.click();
    };

    // === Консольная команда ===
    consoleBtn.onclick = () => {
        const cmd = consoleInput.value.trim().toLowerCase();

        if (cmd === "arts") {
            artsMode = true;
            updateUploadButtonState();
            loadServerImages();
            consoleOutput.textContent = "Режим редактирования включён.";
        } else {
            consoleOutput.textContent = "Неизвестная команда. 😡";
        }

        consoleInput.value = "";
    };

    loadServerImages();
    updateUploadButtonState();
});
