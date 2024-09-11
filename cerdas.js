let apiKey = '';
        let userName = '';
        let userAge = '';
        let userGender = '';

        // Loading animation
        window.addEventListener('load', () => {
            const loadingScreen = document.getElementById('loading-screen');
            gsap.to(loadingScreen, {duration: 1, opacity: 0, display: 'none', ease: 'power2.inOut'});
            
            // Animate main elements
            gsap.to('#main-title', {duration: 1, opacity: 1, y: 20, delay: 0.5});
            gsap.to('#main-subtitle', {duration: 1, opacity: 1, y: 20, delay: 0.7});
            gsap.to('#start-chat-btn', {duration: 1, opacity: 1, y: 20, delay: 0.9});
            gsap.to('#hero-image', {duration: 1, opacity: 1, scale: 1.05, delay: 1.1});

            // Animate feature cards
            gsap.to('.feature-card', {duration: 1, opacity: 1, y: 20, stagger: 0.2, delay: 1.3});
        });

        // Navbar transparency
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', () => {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Intersection Observer for fade-in animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // FAQ toggle function
        function toggleFAQ(element) {
            const content = element.nextElementSibling;
            const icon = element.querySelector('i');
            
            gsap.to(content, {
                duration: 0.3,
                height: content.style.height === 'auto' ? 0 : 'auto',
                opacity: content.style.height === 'auto' ? 0 : 1,
                onComplete: () => {
                    content.classList.toggle('hidden');
                }
            });

            gsap.to(icon, {
                duration: 0.3,
                rotation: icon.style.transform === 'rotate(180deg)' ? 0 : 180
            });
        }

        // Chat functionality (same as before)
        async function loadApiKey() {
            try {
                const response = await fetch('.env');
                if (!response.ok) {
                    throw new Error('Gagal memuat file .env');
                }
                const text = await response.text();
                const match = text.match(/API_KEY=(.+)/);
                if (match && match[1]) {
                    apiKey = match[1].trim();
                } else {
                    throw new Error('API key tidak ditemukan di file .env');
                }
            } catch (error) {
                console.error('Error memuat API key:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Gagal memuat API key. Silakan masukkan API key Anda:',
                    input: 'text',
                    inputPlaceholder: 'API key Anda',
                    showCancelButton: true,
                    inputValidator: (value) => {
                        if (!value) {
                            return 'Anda perlu memasukkan API key!';
                        }
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        apiKey = result.value;
                        saveApiKey(apiKey);
                    }
                });
            }
        }


        async function saveApiKey(key) {
            try {
                const response = await fetch('/save-api-key', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ apiKey: key }),
                });

                if (!response.ok) {
                    throw new Error('Gagal menyimpan API key');
                }

                Swal.fire({
                    icon: 'success',
                    title: 'API Key Tersimpan',
                    text: 'API key Anda telah berhasil disimpan.',
                });
            } catch (error) {
                console.error('Api Key Tersimpan:', error);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'API key Anda telah berhasil disimpan.',
                });
            }
        }

        loadApiKey();

        const userProfileForm = document.getElementById('user-profile-form');
        const chatInterface = document.getElementById('chat-interface');
        const chatMessages = document.getElementById('chat-messages');
        const chatForm = document.getElementById('chat-form');
        const userInput = document.getElementById('user-input');

        userProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            userName = document.getElementById('user-name').value;
            userAge = document.getElementById('user-age').value;
            userGender = document.querySelector('input[name="user-gender"]:checked').value;
            
            userProfileForm.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            
            // Tambahkan pesan selamat datang
            addMessage('ai', `Halo ${userName}! Saya CerdasBudi, psikolog AI Anda. Ceritakan masalah anda!`);
        });

        chatForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!apiKey) {
                const result = await Swal.fire({
                    icon: 'error',
                    title: 'API Key Tidak Ditemukan',
                    text: 'Silakan masukkan API key Anda:',
                    input: 'text',
                    inputPlaceholder: 'API key Anda',
                    showCancelButton: true,
                    inputValidator: (value) => {
                        if (!value) {
                            return 'Anda perlu memasukkan API key!';
                        }
                    }
                });

                if (result.isConfirmed) {
                    apiKey = result.value;
                    await saveApiKey(apiKey);
                } else {
                    return;
                }
            }

            const userMessage = userInput.value;
            addMessage('user', userMessage);
            userInput.value = '';

            const prompt = `
Anda adalah psikolog AI bernama CerdasBudi, yang mengkhususkan diri dalam membantu orang-orang dengan masalah seperti perundungan, ketakutan, rasa malu, dan tantangan kesehatan mental. Gaya komunikasi Anda hangat, mendukung, dan menggunakan bahasa yang sesuai dengan anak muda Indonesia. Tugas Anda adalah:

1. Memberikan respons yang empatik dan mendukung terhadap pesan pengguna.
2. Menawarkan saran praktis dan strategi mengatasi masalah yang disesuaikan dengan situasi mereka.
3. Menyarankan kelompok dukungan atau komunitas yang relevan yang mungkin bermanfaat bagi mereka.
4. Merekomendasikan 5 buku (dengan harga dan deskripsi singkat) yang bisa bermanfaat untuk situasi mereka.
5. Menyarankan 5 lagu relaksasi di YouTube yang sesuai dengan keadaan emosional atau situasi mereka.

Profil Pengguna:
Nama: ${userName}
Usia: ${userAge}
Jenis Kelamin: ${userGender}

Pesan pengguna: ${userMessage}

Berikan respons Anda dengan nada percakapan, menyapa pengguna dengan namanya. Format respons Anda dalam HTML, menggunakan tag yang sesuai untuk struktur (misalnya, <p>, <ul>, <h3>). Untuk rekomendasi buku dan musik, gunakan format berikut:

<h3>Rekomendasi Buku:</h3>
<ul>
    <li>
        <strong>Judul Buku</strong> oleh Penulis - Rp XXX.XXX
        <p>Deskripsi singkat buku.</p>
    </li>
    <!-- Ulangi untuk 5 buku -->
</ul>

<h3>Rekomendasi Musik Relaksasi:</h3>
<ul>
    <li>
        <strong>Judul Lagu</strong> oleh Artis
        <a href="URL_YOUTUBE" target="_blank">Dengarkan di YouTube</a>
    </li>
    <!-- Ulangi untuk 5 lagu -->
</ul>
            `;

            try {
                const response = await generateContent(prompt);
                const result = response.candidates[0].content.parts[0].text;
                addMessage('ai', result);
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.',
                });
            }
        });

        async function generateContent(prompt) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    apiKey = '';
                    throw new Error('API key tidak valid');
                }
                throw new Error('Respons jaringan tidak berhasil');
            }

            return response.json();
        }


        function addMessage(sender, message) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('flex', 'items-start', 'space-x-4', 'mb-4');
            
            const avatarDiv = document.createElement('div');
            avatarDiv.classList.add('flex-shrink-0', 'w-10', 'h-10', 'rounded-full', 'overflow-hidden');
            
            const avatarImg = document.createElement('img');
            avatarImg.src = sender === 'user' ? 'assets/user.png' : 'assets/aiuserr.png';
            avatarImg.alt = sender === 'user' ? 'User Avatar' : 'AI Avatar';
            avatarImg.classList.add('w-full', 'h-full', 'object-cover');
            
            avatarDiv.appendChild(avatarImg);
            messageDiv.appendChild(avatarDiv);
            
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('flex-grow');
            
            const bubbleDiv = document.createElement('div');
            bubbleDiv.classList.add('bg-card', 'p-4', 'rounded-lg', 'shadow', 'relative', 'chat-bubble');
            
            if (sender === 'user') {
                bubbleDiv.classList.add('bg-primary', 'text-white');
            } else {
                bubbleDiv.classList.add('bg-secondary', 'text-white');
            }
            
            bubbleDiv.innerHTML = message;
            contentDiv.appendChild(bubbleDiv);
            messageDiv.appendChild(contentDiv);
            
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Animate new message
            gsap.from(messageDiv, {duration: 0.5, opacity: 0, y: 20, ease: 'power2.out'});
        }
