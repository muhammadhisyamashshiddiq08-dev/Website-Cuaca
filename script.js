// =====================================================
// DEBUG: Cek apakah script dimuat
// =====================================================
console.log('✅ Script.js berhasil dimuat!');

// =====================================================
// KONFIGURASI
// =====================================================
const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const NOMOR_WA = '6288219687504';

// =====================================================
// INISIALISASI AOS
// =====================================================
try {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false,
            offset: 100
        });
        console.log('✅ AOS berhasil diinisialisasi');
    }
} catch (e) {
    console.error('❌ Error AOS:', e);
}

// =====================================================
// INISIALISASI PETA
// =====================================================
let map = null;
let marker = null;

try {
    if (typeof L !== 'undefined') {
        map = L.map('mainMap', {
            center: [-2.5489, 118.0149],
            zoom: 5,
            zoomControl: true,
            attributionControl: true
        });

        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
            referrerPolicy: 'strict-origin-when-cross-origin',
            crossOrigin: true
        });

        const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            referrerPolicy: 'strict-origin-when-cross-origin'
        });

        osmLayer.addTo(map);

        let tileErrorCount = 0;
        osmLayer.on('tileerror', function() {
            tileErrorCount++;
            if (tileErrorCount > 2) {
                console.warn('⚠️ OSM diblokir, beralih ke CartoDB...');
                map.removeLayer(osmLayer);
                cartoLayer.addTo(map);
            }
        });
        console.log('✅ Peta berhasil diinisialisasi');
    }
} catch (e) {
    console.error('❌ Error Peta:', e);
}

// =====================================================
// JAM REAL-TIME
// =====================================================
function updateClock() {
    try {
        const now = new Date();
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        
        const dateEl = document.getElementById('currentDate');
        const timeEl = document.getElementById('currentTime');
        
        if (dateEl) dateEl.innerText = now.toLocaleDateString('id-ID', optionsDate);
        if (timeEl) timeEl.innerText = now.toLocaleTimeString('id-ID', optionsTime);
    } catch (e) {
        console.error('❌ Error Clock:', e);
    }
}
setInterval(updateClock, 1000);
updateClock();

// =====================================================
// MAPPING KODE CUACA
// =====================================================
function getWeatherInfo(code) {
    const weatherCodes = {
        0: { desc: 'Cerah', icon: 'fas fa-sun', color: 'text-warning' },
        1: { desc: 'Cerah Berawan', icon: 'fas fa-cloud-sun', color: 'text-warning' },
        2: { desc: 'Berawan', icon: 'fas fa-cloud', color: 'text-secondary' },
        3: { desc: 'Mendung', icon: 'fas fa-cloud', color: 'text-secondary' },
        45: { desc: 'Berkabut', icon: 'fas fa-smog', color: 'text-secondary' },
        48: { desc: 'Kabut Tebal', icon: 'fas fa-smog', color: 'text-secondary' },
        51: { desc: 'Gerimis Ringan', icon: 'fas fa-cloud-rain', color: 'text-primary' },
        53: { desc: 'Gerimis', icon: 'fas fa-cloud-rain', color: 'text-primary' },
        55: { desc: 'Gerimis Lebat', icon: 'fas fa-cloud-rain', color: 'text-primary' },
        61: { desc: 'Hujan Ringan', icon: 'fas fa-cloud-showers-heavy', color: 'text-primary' },
        63: { desc: 'Hujan Sedang', icon: 'fas fa-cloud-showers-heavy', color: 'text-primary' },
        65: { desc: 'Hujan Lebat', icon: 'fas fa-cloud-showers-heavy', color: 'text-primary' },
        95: { desc: 'Badai Petir', icon: 'fas fa-bolt', color: 'text-danger' },
        96: { desc: 'Badai Petir Hujan Es', icon: 'fas fa-bolt', color: 'text-danger' },
        99: { desc: 'Badai Petir Hebat', icon: 'fas fa-bolt', color: 'text-danger' }
    };
    return weatherCodes[code] || { desc: 'Tidak Diketahui', icon: 'fas fa-question', color: 'text-muted' };
}

// =====================================================
// SCROLLSPY CUSTOM + NAVBAR EFFECT (FIXED-TOP)
// =====================================================
function initScrollSpyAndNavbar() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#navMenu .nav-link');
    const nav = document.getElementById('mainNav');
    const body = document.body;
    
    if (sections.length === 0 || navLinks.length === 0 || !nav) {
        console.warn('⚠️ ScrollSpy: Element tidak ditemukan');
        return;
    }

    console.log('✅ ScrollSpy aktif untuk', sections.length, 'section');

    function getNavbarHeight() {
        return nav.offsetHeight;
    }

    // Set padding-top body sesuai tinggi navbar fixed
    function setBodyPadding() {
        const navHeight = getNavbarHeight();
        body.style.paddingTop = `${navHeight}px`;
        console.log('📏 Body padding-top:', navHeight + 'px');
    }

    // Update active link berdasarkan posisi scroll
    function updateActiveLink() {
        const navHeight = getNavbarHeight();
        const scrollPosition = window.scrollY + navHeight + 50;
        let currentSectionId = 'hero';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (window.scrollY < 100) {
            currentSectionId = 'hero';
        }

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) currentSectionId = lastSection.getAttribute('id');
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Throttle dengan requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                
                updateActiveLink();
                
                if (scrollY > 50) nav.classList.add('scrolled');
                else nav.classList.remove('scrolled');
                
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
                nav.style.setProperty('--scroll-progress', `${scrollPercent}%`);
                
                ticking = false;
            });
            ticking = true;
        }
    });

    // Set padding saat load
    setBodyPadding();
    
    window.addEventListener('resize', setBodyPadding);
    
    updateActiveLink();
    
    // Re-calculate padding setelah library dimuat
    setTimeout(setBodyPadding, 500);
    setTimeout(setBodyPadding, 1500);
}
initScrollSpyAndNavbar();

// =====================================================
// HERO PARALLAX
// =====================================================
function initParallax() {
    try {
        const parallaxElements = document.querySelectorAll('[data-parallax-speed]');
        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.dataset.parallaxSpeed) || 0.5;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
            });
        }
    } catch (e) {
        console.error('❌ Error Parallax:', e);
    }
}
initParallax();

// =====================================================
// SMOOTH SCROLL (FIXED-TOP VERSION)
// =====================================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            const nav = document.getElementById('mainNav');
            
            if (targetElement && nav) {
                e.preventDefault();
                
                const navHeight = nav.offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Tutup navbar collapse di mobile
                const navbarCollapse = document.getElementById('navbarNav');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    new bootstrap.Collapse(navbarCollapse).hide();
                }
            }
        });
    });
}

// =====================================================
// DATA PROVINSI DAN KOTA
// =====================================================
const PROVINSI_INDONESIA = [
    { id: 11, nama: "Aceh" }, { id: 12, nama: "Sumatera Utara" },
    { id: 13, nama: "Sumatera Barat" }, { id: 14, nama: "Riau" },
    { id: 15, nama: "Jambi" }, { id: 16, nama: "Sumatera Selatan" },
    { id: 17, nama: "Bengkulu" }, { id: 18, nama: "Lampung" },
    { id: 19, nama: "Kepulauan Bangka Belitung" }, { id: 21, nama: "Kepulauan Riau" },
    { id: 31, nama: "DKI Jakarta" }, { id: 32, nama: "Jawa Barat" },
    { id: 33, nama: "Jawa Tengah" }, { id: 34, nama: "DI Yogyakarta" },
    { id: 35, nama: "Jawa Timur" }, { id: 36, nama: "Banten" },
    { id: 51, nama: "Bali" }, { id: 52, nama: "Nusa Tenggara Barat" },
    { id: 53, nama: "Nusa Tenggara Timur" }, { id: 61, nama: "Kalimantan Barat" },
    { id: 62, nama: "Kalimantan Tengah" }, { id: 63, nama: "Kalimantan Selatan" },
    { id: 64, nama: "Kalimantan Timur" }, { id: 65, nama: "Kalimantan Utara" },
    { id: 71, nama: "Sulawesi Utara" }, { id: 72, nama: "Sulawesi Tengah" },
    { id: 73, nama: "Sulawesi Selatan" }, { id: 74, nama: "Sulawesi Tenggara" },
    { id: 75, nama: "Gorontalo" }, { id: 76, nama: "Sulawesi Barat" },
    { id: 81, nama: "Maluku" }, { id: 82, nama: "Maluku Utara" },
    { id: 91, nama: "Papua" }, { id: 92, nama: "Papua Barat" },
    { id: 93, nama: "Papua Selatan" }, { id: 94, nama: "Papua Tengah" },
    { id: 95, nama: "Papua Pegunungan" }, { id: 96, nama: "Papua Barat Daya" }
];

const KOTA_PER_PROVINSI = {
    11: [{ nama: "Banda Aceh", lat: 5.5483, lon: 95.3238 }, { nama: "Lhokseumawe", lat: 5.1801, lon: 97.1507 }, { nama: "Langsa", lat: 4.4683, lon: 97.9683 }],
    12: [{ nama: "Medan", lat: 3.5952, lon: 98.6722 }, { nama: "Binjai", lat: 3.6001, lon: 98.4850 }, { nama: "Pematang Siantar", lat: 2.9595, lon: 99.0687 }, { nama: "Tebing Tinggi", lat: 3.3285, lon: 99.1625 }],
    13: [{ nama: "Padang", lat: -0.9471, lon: 100.4172 }, { nama: "Bukittinggi", lat: -0.3055, lon: 100.3695 }, { nama: "Payakumbuh", lat: -0.2298, lon: 100.6320 }],
    14: [{ nama: "Pekanbaru", lat: 0.5071, lon: 101.4478 }, { nama: "Dumai", lat: 1.6667, lon: 101.4500 }],
    15: [{ nama: "Jambi", lat: -1.6101, lon: 103.6131 }, { nama: "Sungai Penuh", lat: -2.0667, lon: 101.3833 }],
    16: [{ nama: "Palembang", lat: -2.9761, lon: 104.7754 }, { nama: "Prabumulih", lat: -3.4328, lon: 104.2357 }, { nama: "Lubuklinggau", lat: -3.2967, lon: 102.8617 }],
    17: [{ nama: "Bengkulu", lat: -3.8004, lon: 102.2655 }],
    18: [{ nama: "Bandar Lampung", lat: -5.3971, lon: 105.2668 }, { nama: "Metro", lat: -5.1131, lon: 105.3067 }],
    19: [{ nama: "Pangkal Pinang", lat: -2.1291, lon: 106.1136 }],
    21: [{ nama: "Batam", lat: 1.0456, lon: 104.0305 }, { nama: "Tanjung Pinang", lat: 0.9186, lon: 104.4666 }],
    31: [{ nama: "Jakarta Pusat", lat: -6.1805, lon: 106.8284 }, { nama: "Jakarta Utara", lat: -6.1214, lon: 106.7741 }, { nama: "Jakarta Barat", lat: -6.1683, lon: 106.7588 }, { nama: "Jakarta Selatan", lat: -6.2615, lon: 106.8106 }, { nama: "Jakarta Timur", lat: -6.2250, lon: 106.9004 }],
    32: [{ nama: "Bandung", lat: -6.9175, lon: 107.6191 }, { nama: "Bekasi", lat: -6.2383, lon: 106.9756 }, { nama: "Depok", lat: -6.4025, lon: 106.7942 }, { nama: "Bogor", lat: -6.5950, lon: 106.8166 }, { nama: "Cimahi", lat: -6.8722, lon: 107.5425 }, { nama: "Sukabumi", lat: -6.9277, lon: 106.9300 }, { nama: "Cirebon", lat: -6.7320, lon: 108.5523 }],
    33: [{ nama: "Semarang", lat: -6.9932, lon: 110.4203 }, { nama: "Surakarta", lat: -7.5755, lon: 110.8243 }, { nama: "Magelang", lat: -7.4698, lon: 110.2177 }, { nama: "Salatiga", lat: -7.3305, lon: 110.5084 }, { nama: "Pekalongan", lat: -6.8886, lon: 109.6753 }, { nama: "Tegal", lat: -6.8694, lon: 109.1402 }],
    34: [{ nama: "Yogyakarta", lat: -7.7956, lon: 110.3695 }],
    35: [{ nama: "Surabaya", lat: -7.2575, lon: 112.7521 }, { nama: "Malang", lat: -7.9666, lon: 112.6326 }, { nama: "Kediri", lat: -7.8480, lon: 112.0178 }, { nama: "Madiun", lat: -7.6298, lon: 111.5239 }, { nama: "Probolinggo", lat: -7.7543, lon: 113.2159 }, { nama: "Batu", lat: -7.8672, lon: 112.5239 }],
    36: [{ nama: "Serang", lat: -6.1104, lon: 106.1503 }, { nama: "Tangerang", lat: -6.1781, lon: 106.6300 }, { nama: "Cilegon", lat: -6.0027, lon: 106.0114 }],
    51: [{ nama: "Denpasar", lat: -8.6705, lon: 115.2126 }],
    52: [{ nama: "Mataram", lat: -8.5833, lon: 116.1167 }, { nama: "Bima", lat: -8.4604, lon: 118.7268 }],
    53: [{ nama: "Kupang", lat: -10.1772, lon: 123.6070 }],
    61: [{ nama: "Pontianak", lat: -0.0263, lon: 109.3425 }, { nama: "Singkawang", lat: 0.9066, lon: 108.9846 }],
    62: [{ nama: "Palangka Raya", lat: -2.2080, lon: 113.9165 }],
    63: [{ nama: "Banjarmasin", lat: -3.3186, lon: 114.5944 }, { nama: "Banjarbaru", lat: -3.4572, lon: 114.8111 }],
    64: [{ nama: "Samarinda", lat: -0.5022, lon: 117.1536 }, { nama: "Balikpapan", lat: -1.2379, lon: 116.8529 }, { nama: "Bontang", lat: 0.1246, lon: 117.4953 }],
    65: [{ nama: "Tarakan", lat: 3.3273, lon: 117.5760 }],
    71: [{ nama: "Manado", lat: 1.4748, lon: 124.8421 }, { nama: "Bitung", lat: 1.4404, lon: 125.1216 }, { nama: "Tomohon", lat: 1.3348, lon: 124.8388 }],
    72: [{ nama: "Palu", lat: -0.8917, lon: 119.8707 }],
    73: [{ nama: "Makassar", lat: -5.1477, lon: 119.4327 }, { nama: "Palopo", lat: -2.9925, lon: 120.1965 }, { nama: "Parepare", lat: -4.0135, lon: 119.6255 }],
    74: [{ nama: "Kendari", lat: -3.9985, lon: 122.5127 }, { nama: "Baubau", lat: -5.4667, lon: 122.6167 }],
    75: [{ nama: "Gorontalo", lat: 0.5435, lon: 123.0568 }],
    76: [{ nama: "Mamuju", lat: -2.6748, lon: 118.8888 }],
    81: [{ nama: "Ambon", lat: -3.6954, lon: 128.1814 }, { nama: "Tual", lat: -5.6296, lon: 132.7420 }],
    82: [{ nama: "Ternate", lat: 0.7900, lon: 127.3800 }, { nama: "Tidore Kepulauan", lat: 0.6843, lon: 127.4456 }],
    91: [{ nama: "Jayapura", lat: -2.5916, lon: 140.6690 }],
    92: [{ nama: "Manokwari", lat: -0.8615, lon: 134.0620 }, { nama: "Sorong", lat: -0.8762, lon: 131.2558 }],
    93: [{ nama: "Merauke", lat: -8.4932, lon: 140.4018 }],
    94: [{ nama: "Nabire", lat: -3.3585, lon: 135.4948 }],
    95: [{ nama: "Jayawijaya", lat: -4.0833, lon: 139.0833 }],
    96: [{ nama: "Sorong", lat: -0.8762, lon: 131.2558 }]
};

// =====================================================
// FUNGSI PENCARIAN CUACA
// =====================================================
async function searchWeather(cityName) {
    const resultContainer = document.getElementById('weatherResult');
    if (!resultContainer) return;

    resultContainer.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-navy"></div><p class="mt-2 text-muted">Mencari data untuk "${cityName}"...</p></div>`;

    try {
        const geoResponse = await fetch(`${GEO_API_URL}?name=${cityName}&count=1&language=id&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Kota tidak ditemukan.');
        }

        const location = geoData.results[0];
        const weatherUrl = `${WEATHER_API_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        displayWeatherResult(weatherData, location);
        displayForecast(weatherData.daily);
        updateMap(location.latitude, location.longitude, location.name);
        updateSidebar(weatherData, location);
        updateHeroCard(weatherData, location);

    } catch (error) {
        resultContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger"><i class="fas fa-exclamation-circle me-2"></i> ${error.message}</div></div>`;
    }
}

// =====================================================
// UPDATE HERO CARD
// =====================================================
function updateHeroCard(data, location) {
    try {
        const current = data.current;
        const info = getWeatherInfo(current.weather_code);

        const heroCity = document.getElementById('heroCity');
        const heroTemp = document.getElementById('heroTemp');
        const heroDesc = document.getElementById('heroDesc');
        const heroHumidity = document.getElementById('heroHumidity');
        const heroWind = document.getElementById('heroWind');
        const heroPressure = document.getElementById('heroPressure');
        const heroIcon = document.getElementById('heroIcon');

        if (heroCity) heroCity.innerText = location.name;
        if (heroTemp) heroTemp.innerText = `${Math.round(current.temperature_2m)}°C`;
        if (heroDesc) heroDesc.innerText = info.desc;
        if (heroHumidity) heroHumidity.innerText = `${current.relative_humidity_2m}%`;
        if (heroWind) heroWind.innerText = `${current.wind_speed_10m} km/j`;
        if (heroPressure) heroPressure.innerText = `${current.surface_pressure}`;
        
        if (heroIcon) {
            heroIcon.className = `${info.icon} hero-weather-icon ${info.color}`;
        }
    } catch (e) {
        console.error('❌ Error updateHeroCard:', e);
    }
}

// =====================================================
// MENAMPILKAN HASIL CUACA
// =====================================================
function displayWeatherResult(data, location) {
    try {
        const current = data.current;
        const info = getWeatherInfo(current.weather_code);
        const resultContainer = document.getElementById('weatherResult');

        resultContainer.innerHTML = `
            <div class="col-lg-8 mx-auto" data-aos="fade-up">
                <div class="weather-card-bmkg p-4">
                    <div class="row align-items-center">
                        <div class="col-md-6 text-center text-md-start border-end-md">
                            <h3 class="fw-bold text-navy mb-1">${location.name}</h3>
                            <p class="text-muted mb-3">${location.admin1 ? location.admin1 + ', ' : ''}${location.country}</p>
                            <div class="d-flex align-items-center justify-content-center justify-content-md-start">
                                <i class="${info.icon} weather-icon-lg me-3 ${info.color}"></i>
                                <div>
                                    <h1 class="display-4 fw-bold mb-0">${Math.round(current.temperature_2m)}°C</h1>
                                    <p class="mb-0 fw-bold text-capitalize">${info.desc}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mt-4 mt-md-0">
                            <div class="row g-2 text-center">
                                <div class="col-6"><div class="p-2 border rounded bg-light"><small class="text-muted d-block">Terasa Seperti</small><strong>${Math.round(current.apparent_temperature)}°C</strong></div></div>
                                <div class="col-6"><div class="p-2 border rounded bg-light"><small class="text-muted d-block">Kelembapan</small><strong>${current.relative_humidity_2m}%</strong></div></div>
                                <div class="col-6"><div class="p-2 border rounded bg-light"><small class="text-muted d-block">Angin</small><strong>${current.wind_speed_10m} km/j</strong></div></div>
                                <div class="col-6"><div class="p-2 border rounded bg-light"><small class="text-muted d-block">Tekanan</small><strong>${current.surface_pressure} hPa</strong></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const updateEl = document.getElementById('lastUpdate');
        if (updateEl) updateEl.innerText = `Update: ${new Date().toLocaleTimeString('id-ID')} WIB`;
        
        if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (e) {
        console.error('❌ Error displayWeatherResult:', e);
    }
}

// =====================================================
// MENAMPILKAN PRAKIRAAN 5 HARI
// =====================================================
function displayForecast(daily) {
    try {
        const container = document.getElementById('forecastContainer');
        if (!container) return;
        container.innerHTML = '';
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        for (let i = 0; i < 5; i++) {
            const date = new Date(daily.time[i]);
            const dayName = days[date.getDay()];
            const info = getWeatherInfo(daily.weather_code[i]);
            const maxTemp = Math.round(daily.temperature_2m_max[i]);
            const minTemp = Math.round(daily.temperature_2m_min[i]);

            container.innerHTML += `
                <div class="col-md-2 col-6" data-aos="fade-up" data-aos-delay="${i * 100}">
                    <div class="forecast-card-bmkg">
                        <h6 class="fw-bold mb-1">${dayName}</h6>
                        <small class="text-muted d-block mb-2">${date.getDate()}/${date.getMonth()+1}</small>
                        <i class="${info.icon} fa-2x mb-2 ${info.color}"></i>
                        <h5 class="fw-bold mb-1">${maxTemp}°C</h5>
                        <small class="text-muted">${minTemp}°C</small>
                        <p class="small mb-0 mt-1 text-truncate">${info.desc}</p>
                    </div>
                </div>
            `;
        }
        if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (e) {
        console.error('❌ Error displayForecast:', e);
    }
}

// =====================================================
// UPDATE PETA
// =====================================================
function updateMap(lat, lon, cityName) {
    try {
        if (!map) return;
        map.setView([lat, lon], 10);
        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${cityName}</b>`).openPopup();
    } catch (e) {
        console.error('❌ Error updateMap:', e);
    }
}

// =====================================================
// UPDATE SIDEBAR
// =====================================================
function updateSidebar(data, location) {
    try {
        const current = data.current;
        const info = getWeatherInfo(current.weather_code);
        const sidebar = document.getElementById('sidebarContent');
        if (!sidebar) return;

        sidebar.innerHTML = `
            <h5 class="fw-bold text-navy mb-1">${location.name}</h5>
            <p class="small text-muted mb-3">${location.country}</p>
            <i class="${info.icon} fa-3x mb-2 ${info.color}"></i>
            <h3 class="fw-bold">${Math.round(current.temperature_2m)}°C</h3>
            <p class="text-capitalize fw-bold">${info.desc}</p>
            <div class="d-flex justify-content-around mt-3 border-top pt-3">
                <div><small class="text-muted d-block">Angin</small><strong>${current.wind_speed_10m} km/j</strong></div>
                <div><small class="text-muted d-block">Lembap</small><strong>${current.relative_humidity_2m}%</strong></div>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error updateSidebar:', e);
    }
}

// =====================================================
// LOAD 5 KOTA BESAR
// =====================================================
async function loadBigCities() {
    const cities = [
        { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
        { name: 'Surabaya', lat: -7.2575, lon: 112.7521 },
        { name: 'Bandung', lat: -6.9175, lon: 107.6191 },
        { name: 'Medan', lat: 3.5952, lon: 98.6722 },
        { name: 'Makassar', lat: -5.1477, lon: 119.4327 }
    ];
    const container = document.getElementById('bigCitiesContainer');
    if (!container) return;
    container.innerHTML = '';

    for (const city of cities) {
        try {
            const data = await fetch(`${WEATHER_API_URL}?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`).then(res => res.json());
            const current = data.current;
            const info = getWeatherInfo(current.weather_code);
            container.innerHTML += `
                <div class="col-lg-2 col-md-4 col-6" data-aos="zoom-in">
                    <div class="city-card h-100">
                        <h6 class="fw-bold">${city.name}</h6>
                        <i class="${info.icon} fa-2x my-2 ${info.color}"></i>
                        <h4 class="fw-bold">${Math.round(current.temperature_2m)}°C</h4>
                        <p class="small text-muted mb-0">${info.desc}</p>
                        <p class="small text-muted">${current.relative_humidity_2m}% RH</p>
                    </div>
                </div>
            `;
        } catch (e) { console.error('Error city:', city.name, e); }
    }
    if (typeof AOS !== 'undefined') AOS.refresh();
}

// =====================================================
// LOAD PROVINSI
// =====================================================
function loadProvinceList() {
    const select = document.getElementById('provinceSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- Pilih Provinsi --</option>';

    PROVINSI_INDONESIA.forEach(prov => {
        const option = document.createElement('option');
        option.value = prov.id;
        option.textContent = prov.nama;
        select.appendChild(option);
    });
}

// =====================================================
// LOAD KOTA PER PROVINSI
// =====================================================
async function loadCitiesWeather() {
    const provinceId = document.getElementById('provinceSelect').value;
    const container = document.getElementById('allCitiesContainer');

    if (!provinceId) {
        alert('Silakan pilih provinsi terlebih dahulu!');
        return;
    }

    const cities = KOTA_PER_PROVINSI[provinceId] || [];
    
    if (cities.length === 0) {
        container.innerHTML = `<div class="col-12"><div class="alert alert-info">Data kota untuk provinsi ini belum tersedia.</div></div>`;
        return;
    }

    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-navy" role="status"></div>
            <p class="mt-2 text-muted">Memuat cuaca untuk ${cities.length} kota...</p>
        </div>
    `;

    let html = '';
    let completed = 0;

    for (const city of cities) {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const url = `${WEATHER_API_URL}?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
            const response = await fetch(url);
            const data = await response.json();
            const current = data.current;
            const info = getWeatherInfo(current.weather_code);

            let borderColor = 'border-primary';
            if (current.temperature_2m > 32) borderColor = 'border-danger';
            else if (current.temperature_2m < 20) borderColor = 'border-info';

            html += `
                <div class="col-lg-3 col-md-4 col-6">
                    <div class="city-card h-100 border-start border-4 ${borderColor}">
                        <h6 class="fw-bold text-navy mb-1">${city.nama}</h6>
                        <i class="${info.icon} fa-2x my-2 ${info.color}"></i>
                        <h4 class="fw-bold mb-1">${Math.round(current.temperature_2m)}°C</h4>
                        <p class="small text-muted mb-0">${info.desc}</p>
                        <div class="d-flex justify-content-between mt-2 small">
                            <span><i class="fas fa-tint me-1"></i>${current.relative_humidity_2m}%</span>
                            <span><i class="fas fa-wind me-1"></i>${current.wind_speed_10m} km/j</span>
                        </div>
                    </div>
                </div>
            `;
            completed++;
        } catch (error) {
            console.error(`Gagal memuat ${city.nama}:`, error);
            html += `
                <div class="col-lg-3 col-md-4 col-6">
                    <div class="city-card h-100 border-start border-4 border-secondary">
                        <h6 class="fw-bold text-navy mb-1">${city.nama}</h6>
                        <p class="small text-muted mb-0">Data tidak tersedia</p>
                    </div>
                </div>
            `;
        }
    }

    html += `<div class="col-12 text-center mt-4"><p class="text-success"><i class="fas fa-check-circle me-2"></i>Berhasil memuat ${completed} dari ${cities.length} kota.</p></div>`;
    container.innerHTML = html;
    if (typeof AOS !== 'undefined') AOS.refresh();
}

// =====================================================
// DATA GEMPA
// =====================================================
function loadEarthquakeData() {
    const gempaData = [
        { waktu: '20 Nov 2023, 14:30:15 WIB', mag: '5.2', kedalaman: '10 km', lokasi: '112 km BaratDaya BANTUL-DIY', potensi: 'Tidak berpotensi tsunami' },
        { waktu: '20 Nov 2023, 10:15:22 WIB', mag: '3.8', kedalaman: '5 km', lokasi: '45 km TimurLaut CIANJUR-JABAR', potensi: 'Tidak berpotensi tsunami' },
        { waktu: '19 Nov 2023, 22:45:10 WIB', mag: '6.1', kedalaman: '25 km', lokasi: '150 km Tenggara KUPANG-NTT', potensi: 'Tidak berpotensi tsunami' },
        { waktu: '19 Nov 2023, 08:20:05 WIB', mag: '4.5', kedalaman: '12 km', lokasi: '80 km BaratLaut SUMBAWA-NTB', potensi: 'Tidak berpotensi tsunami' }
    ];
    const tableBody = document.getElementById('gempaTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    gempaData.forEach(g => {
        tableBody.innerHTML += `<tr><td>${g.waktu}</td><td><span class="badge bg-danger">${g.mag} SR</span></td><td>${g.kedalaman}</td><td>${g.lokasi}</td><td>${g.potensi}</td></tr>`;
    });
}

// =====================================================
// EVENT LISTENERS
// =====================================================
function setupEventListeners() {
    // Form Pencarian
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const city = document.getElementById('cityInput').value.trim();
            if (city) searchWeather(city);
        });
    }

    // Tombol Load Province
    const loadBtn = document.getElementById('loadProvinceBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', loadCitiesWeather);
    }

    // Dropdown Provinsi
    const provinceSelect = document.getElementById('provinceSelect');
    if (provinceSelect) {
        provinceSelect.addEventListener('change', () => {
            if (provinceSelect.value) {
                loadCitiesWeather();
            }
        });
    }

    // Contact Form (WhatsApp)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nama = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const pesan = document.getElementById('message').value.trim();

            if (!nama || !email || !pesan) {
                alert('Mohon lengkapi semua field terlebih dahulu!');
                return;
            }

            const teksPesan = `*PESAN BARU DARI WEBSITE CUACA*%0A%0A*Nama:* ${nama}%0A*Email:* ${email}%0A%0A*Pesan:*%0A${pesan}`;
            const urlWA = `https://wa.me/${NOMOR_WA}?text=${teksPesan}`;
            window.open(urlWA, '_blank');
            this.reset();
            alert('Pesan Anda sedang diteruskan ke WhatsApp. Terima kasih!');
        });
    }
}

// =====================================================
// INISIALISASI UTAMA
// =====================================================
window.addEventListener('load', function() {
    console.log('🚀 Halaman selesai dimuat, memulai inisialisasi...');
    
    try {
        setupEventListeners();
        initSmoothScroll();
        loadEarthquakeData();
        loadProvinceList();
        loadBigCities();
        searchWeather('Jakarta');
        
        console.log('✅ Semua inisialisasi selesai!');
    } catch (e) {
        console.error('❌ Error saat inisialisasi:', e);
    }
});