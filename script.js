document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LOGIKA MULTI-SLIDER (Dukung Banyak Cerita) ---
    const containers = document.querySelectorAll('.slider-container');

    containers.forEach(container => {
        const slider = container.querySelector('.comic-slider');
        const nextBtn = container.querySelector('.next-btn');
        const prevBtn = container.querySelector('.prev-btn');

        if (slider && nextBtn && prevBtn) {
            nextBtn.onclick = () => slider.scrollBy({ left: 320, behavior: 'smooth' });
            prevBtn.onclick = () => slider.scrollBy({ left: -320, behavior: 'smooth' });
        }
    });

    // ===== MODAL DENGAN FITUR ZOOM IN/OUT =====
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("imgFull");
    const closeModal = document.querySelector(".close-modal");
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    const zoomResetBtn = document.getElementById("zoomReset");

    let currentZoom = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    // Fungsi untuk membuka modal dan menampilkan gambar
    if (modal && modalImg) {
        document.querySelectorAll('.comic-img-large').forEach(img => {
            img.addEventListener('click', function() {
                modal.style.display = "block";
                modalImg.src = this.src;
                
                // Reset zoom dan posisi saat membuka gambar baru
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
                updateImageTransform();
                
                // Tambahkan caption jika ada teks di alt atau panel number
                const panelNumber = this.closest('.comic-slide-item')?.querySelector('.panel-number')?.textContent;
                const captionEl = document.getElementById('caption-modal');
                if (captionEl) {
                    if (panelNumber) {
                        captionEl.textContent = `Panel ${panelNumber}`;
                    } else {
                        captionEl.textContent = 'Klik gambar untuk zoom, scroll untuk memperbesar/memperkecil';
                    }
                }
            });
        });
    }

    // Fungsi untuk update transformasi gambar
    function updateImageTransform() {
        if (modalImg) {
            modalImg.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
            
            // Tambah/tidak class zoomed
            if (currentZoom > 1) {
                modalImg.classList.add('zoomed');
            } else {
                modalImg.classList.remove('zoomed');
            }
        }
    }

    // Zoom In
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (currentZoom < 3) { // Batas maksimal zoom 3x
                currentZoom += 0.2;
                updateImageTransform();
            }
        });
    }

    // Zoom Out
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (currentZoom > 0.5) { // Batas minimal zoom 0.5x
                currentZoom -= 0.2;
                // Reset posisi jika terlalu kecil
                if (currentZoom <= 1) {
                    translateX = 0;
                    translateY = 0;
                }
                updateImageTransform();
            }
        });
    }

    // Reset Zoom
    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', () => {
            currentZoom = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
        });
    }

    // Zoom dengan scroll mouse
    if (modalImg) {
        modalImg.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Tentukan arah scroll
            if (e.deltaY < 0) {
                // Scroll up = zoom in
                if (currentZoom < 3) {
                    currentZoom += 0.1;
                }
            } else {
                // Scroll down = zoom out
                if (currentZoom > 0.5) {
                    currentZoom -= 0.1;
                }
            }
            
            updateImageTransform();
        });
    }

    // Fitur drag untuk geser gambar saat zoom
    if (modalImg) {
        modalImg.addEventListener('mousedown', (e) => {
            if (currentZoom > 1) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                modalImg.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging && currentZoom > 1) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                
                // Batasi pergeseran agar gambar tidak keluar dari viewport
                const maxTranslateX = (modalImg.width * (currentZoom - 1)) / 2;
                const maxTranslateY = (modalImg.height * (currentZoom - 1)) / 2;
                
                translateX = Math.min(Math.max(translateX, -maxTranslateX), maxTranslateX);
                translateY = Math.min(Math.max(translateY, -maxTranslateY), maxTranslateY);
                
                updateImageTransform();
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            if (modalImg) {
                modalImg.style.cursor = currentZoom > 1 ? 'grab' : 'zoom-in';
            }
        });
    }

    // Dukungan touch untuk HP
    if (modalImg) {
        modalImg.addEventListener('touchstart', (e) => {
            if (currentZoom > 1 && e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
                e.preventDefault();
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (isDragging && currentZoom > 1 && e.touches.length === 1) {
                translateX = e.touches[0].clientX - startX;
                translateY = e.touches[0].clientY - startY;
                
                const maxTranslateX = (modalImg.width * (currentZoom - 1)) / 2;
                const maxTranslateY = (modalImg.height * (currentZoom - 1)) / 2;
                
                translateX = Math.min(Math.max(translateX, -maxTranslateX), maxTranslateX);
                translateY = Math.min(Math.max(translateY, -maxTranslateY), maxTranslateY);
                
                updateImageTransform();
                e.preventDefault();
            }
        });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // Pinch zoom untuk HP
    let initialDistance = null;
    let initialZoom = 1;

    if (modalImg) {
        modalImg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = getDistance(e.touches[0], e.touches[1]);
                initialZoom = currentZoom;
                e.preventDefault();
            }
        });

        modalImg.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && initialDistance) {
                const currentDistance = getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                currentZoom = Math.min(Math.max(initialZoom * scale, 0.5), 3);
                updateImageTransform();
                e.preventDefault();
            }
        });

        modalImg.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                initialDistance = null;
            }
        });
    }

    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Tutup modal
    if (closeModal) {
        closeModal.onclick = function() {
            modal.style.display = "none";
            // Reset zoom
            currentZoom = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
        };
    }

    // Tutup modal jika klik di luar gambar
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            // Reset zoom
            currentZoom = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
        }
    };

    // --- 3. LOGIKA SMOOTH SCROLL NAVIGASI ---
    document.querySelectorAll('.main-nav a').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 110,
                    behavior: 'smooth',
                });
            }
        });
    });

    // --- 4. LOGIKA KUIS DENGAN EFEK SUARA ---
    const soundCorrect = new Audio('correct.mp3');
    const soundIncorrect = new Audio('incorrect.mp3');

    document.querySelectorAll('.quiz-card').forEach((quizCard) => {
        const options = quizCard.querySelectorAll('.quiz-option');
        const feedback = quizCard.querySelector('.quiz-feedback');

        options.forEach((btn) => {
            btn.addEventListener('click', () => {
                // Reset tampilan pilihan
                options.forEach((b) => b.classList.remove('correct', 'incorrect'));
                
                const isCorrect = btn.dataset.correct === 'true';
                
                if (isCorrect) {
                    btn.classList.add('correct');
                    // Putar suara benar
                    soundCorrect.currentTime = 0;
                    soundCorrect.play().catch(e => console.log('Audio play failed:', e));
                    
                    if (feedback) feedback.textContent = 'Bagus sekali! Kamu hebat!';
                } else {
                    btn.classList.add('incorrect');
                    // Putar suara salah
                    soundIncorrect.currentTime = 0;
                    soundIncorrect.play().catch(e => console.log('Audio play failed:', e));
                    
                    if (feedback) feedback.textContent = 'Coba lagi ya, jangan menyerah!';
                }
            });
        });
    });

    // --- 5. LOGIKA GAME DRAG & DROP DENGAN ANIMASI KARAKTER ---
    const wallet = document.getElementById('wallet');
    const dropzones = document.querySelectorAll('.dropzone');
    const gameMessage = document.getElementById('game-message');
    const reactionEmoji = document.getElementById('reaction-emoji');

    if (wallet && dropzones.length && gameMessage && reactionEmoji) {
        wallet.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'wallet');
        });

        dropzones.forEach((zone) => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const data = e.dataTransfer.getData('text/plain');

                if (data === 'wallet') {
                    zone.appendChild(wallet);
                    const isCorrect = zone.dataset.correct === 'true';

                    if (isCorrect) {
                        reactionEmoji.innerHTML = '<img src="feedback_correct2.png" style="width:150px;">';
                        reactionEmoji.classList.add('show', 'animate');
                        gameMessage.textContent = 'Hebat! Kamu melapor ke tempat yang benar.';
                        gameMessage.className = 'game-message success';
                    } else {
                        reactionEmoji.innerHTML = '<img src="feedback_incorrect.jpeg" style="width:150px;">';
                        reactionEmoji.classList.add('show');
                        gameMessage.textContent = 'Hmm, coba lagi ya...';
                        gameMessage.className = 'game-message error';
                    }

                    setTimeout(() => {
                        reactionEmoji.classList.remove('show', 'animate');
                    }, 2000);
                }
            });
        });
    }

    // --- 6. FITUR RESET GAME ---
    const resetBtn = document.getElementById('reset-game');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            const wallet = document.getElementById('wallet');
            const dropzones = document.querySelector('.dropzones');
            const gameArea = document.querySelector('.game-area');
            const gameMessage = document.getElementById('game-message');
            const reactionEmoji = document.getElementById('reaction-emoji');

            // Kembalikan wallet ke posisi awal (sebelum dropzones)
            if (wallet && dropzones && gameArea) {
                gameArea.insertBefore(wallet, dropzones);
            }

            // Reset pesan dan emoji
            if (gameMessage) {
                gameMessage.textContent = '';
                gameMessage.className = 'game-message';
            }
            if (reactionEmoji) {
                reactionEmoji.innerHTML = '';
                reactionEmoji.classList.remove('show', 'animate');
            }
        });
    }

}); // <-- INI PENUTUP UNTUK DOMContentLoaded PERTAMA

// ===== FUNGSI GLOBAL UNTUK LAGU (HARUS DI LUAR DOMContentLoaded) =====
let activeAudio = null;
let activeCard = null;
const musicCharacter = document.getElementById('musicCharacter');
const currentSongTitle = document.getElementById('currentSongTitle');

function toggleLirik(element) {
    const audioFile = element.getAttribute('data-audio');
    const songTitle = element.querySelector('h3')?.textContent || 'Lagu Anak Baik';

    // Hentikan lagu lain yang sedang berputar jika ada
    if (activeCard && activeCard !== element) {
        activeCard.classList.remove('active');
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0;
        }
    }

    // Buka atau tutup lirik
    element.classList.toggle('active');

    // Logika Play / Stop
    if (element.classList.contains('active')) {
        // Jika lirik dibuka, putar musik
        if (!element.audio) {
            element.audio = new Audio(audioFile);
            element.audio.loop = true; // Loop audio
        }
        
        // Putar audio
        element.audio.play().catch(e => console.log('Audio play failed:', e));
        
        // Set sebagai active
        activeAudio = element.audio;
        activeCard = element;
        
        // Tampilkan karakter animasi
        if (musicCharacter) {
            musicCharacter.classList.remove('hidden');
            if (currentSongTitle) {
                currentSongTitle.textContent = songTitle;
            }
            
            // Reset animasi untuk memicu ulang
            const character = musicCharacter.querySelector('.character-container');
            if (character) {
                character.style.animation = 'none';
                character.offsetHeight; // Trigger reflow
                character.style.animation = 'dance 0.8s infinite alternate ease-in-out';
            }
        }
    } else {
        // Jika lirik ditutup, matikan musik
        if (element.audio) {
            element.audio.pause();
            element.audio.currentTime = 0;
        }
        
        // Hapus active jika ini adalah active card
        if (activeCard === element) {
            activeAudio = null;
            activeCard = null;
            
            // Sembunyikan karakter animasi
            if (musicCharacter) {
                musicCharacter.classList.add('hidden');
            }
        }
    }
}