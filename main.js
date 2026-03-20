document.addEventListener("DOMContentLoaded", () => {
    console.log("Wiki loaded in neon retro mode.");

    const SITE_VERSION = "V.2.0";

    // === Версия сайта ===
    const versionLabel = document.querySelector(".version-label");
    if (versionLabel) versionLabel.textContent = SITE_VERSION;

    // =====================================================
    // ===================== МУЗЫКА ========================
    // =====================================================

    // tracks берём из music.js
    let currentAudio = null;

    function playTrackByName(name) {
        if (typeof tracks === "undefined") return false; // если tracks нет
        const track = tracks.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (!track) return false;

        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        currentAudio = new Audio(track.file);
        currentAudio.play();
        return true;
    }

    // === Секретные треки (не отображаются на сайте) ===
    const secretTracks = [
        { name: "insanity", file: "music/sans-insanity.mp3" },
        { name: "sonata",   file: "music/moonlightsonata-cid.mp3" },
        { name: "kira",     file: "music/death-note.mp3" },
        { name: "jazz",     file: "music/жабий-джаз.mp3" },
        { name: "connibal", file: "music/sim-connibal.mp3" }
    ];

    // =====================================================
    // ===================== КОНСОЛЬ ========================
    // =====================================================

    const consoles = document.querySelectorAll(".console-container");

    consoles.forEach(c => {
        const input = c.querySelector(".consoleInput");
        const btn = c.querySelector(".consoleBtn");
        const output = c.querySelector(".consoleOutput");

        function updateOutput(msg) {
            if (output) output.textContent = msg;
        }

        btn.addEventListener("click", () => {
            const cmd = input.value.trim();
            if (!cmd) return;

            input.value = "";
            const cmdLower = cmd.toLowerCase();

            // ===== Навигация =====
            if (cmdLower === "что добавили?") {
                window.location.href = "changelog.html";
                return;
            }

            if (cmdLower === "chapter0") {
                window.location.href = "lore/chapter0.html";
                return;
            }

            if (cmdLower === "chapter1") {
                window.location.href = "lore/chapter1.html";
                return;
            }

            // ===== Переход в игру =====
            if (cmdLower === "game") {
                window.location.href = "game/game.html";
                return;
            }

            // ===== Музыка =====
            if (/^mhs[\d,\.]*$/i.test(cmd) || cmdLower === "rin" || cmdLower === "sim" || secretTracks.some(t => t.name.toLowerCase() === cmdLower)) {
                let trackName;

                if (cmdLower === "rin") {
                    trackName = "TravelersTheme";
                } else if (cmdLower === "sim") {
                    trackName = "CandyRain";
                } else {
                    trackName = cmdLower; // для секретных треков используем код команды
                }

                // сначала ищем в обычных треках
                let success = playTrackByName(trackName);

                // если не найдено, ищем в секретных
                if (!success && typeof secretTracks !== "undefined") {
                    const track = secretTracks.find(t => t.name.toLowerCase() === trackName.toLowerCase());
                    if (track) {
                        if (currentAudio) {
                            currentAudio.pause();
                            currentAudio.currentTime = 0;
                        }
                        currentAudio = new Audio(track.file);
                        currentAudio.play();
                        success = true;
                    }
                }

                if (success)
                    updateOutput(`Воспроизводится трек: ${trackName}`);
                else
                    updateOutput(`Трек ${trackName} не найден.`);

                return;
            }

            // ===== Остановить музыку =====
            if (cmdLower === "mute") {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    updateOutput("Музыка остановлена.");
                } else {
                    updateOutput("Музыка не воспроизводится.");
                }
                return;
            }

            // ===== Арты =====
            if (cmdLower === "arts") {
                if (window.enableArtsMode) window.enableArtsMode();
                updateOutput("Режим редактирования включён.");
                return;
            }

            // ===== Служебные команды =====
            switch (cmdLower) {
                case "info":
                    updateOutput("Доступные команды: info, version, MHS1-MHS15, Rin, sim, mute, что добавили?, chapter0, chapter1, game");
                    break;

                case "version":
                    updateOutput(`Текущая версия сайта: ${SITE_VERSION}`);
                    break;

                default:
                    updateOutput("Неизвестная команда... попробуйте команду info 💙");
            }
        });

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") btn.click();
        });
    });
});