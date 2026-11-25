// === 2. ЗАКРЫТИЕ ПО ESC ===
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.location.hash = 'close';
        document.getElementById('navToggle').checked = false;
        const editVideo = document.querySelector('#modal-edit video');
        if (editVideo) editVideo.pause();
    }
});

// === 3. ГЛОБАЛЬНАЯ СТАТИСТИКА ЗА ВСЮ КАРЬЕРУ ===
Promise.all([
    fetch('https://api.jolpi.ca/ergast/f1/drivers/max_verstappen/seasons.json?limit=1').then(r => r.json()),
    fetch('https://api.jolpi.ca/ergast/f1/drivers/max_verstappen/results.json?limit=1').then(r => r.json()),
    fetch('https://api.jolpi.ca/ergast/f1/drivers/max_verstappen/results/1.json?limit=1').then(r => r.json())
])
    .then(([seasonsData, startsData, winsData]) => {
        document.getElementById('mv-seasons').textContent = seasonsData.MRData.total;
        document.getElementById('mv-starts').textContent = startsData.MRData.total;
        document.getElementById('mv-wins').textContent = winsData.MRData.total;
    })
    .catch(() => {
        document.getElementById('mv-starts').textContent = 'Ошибка';
    });

// === 4. ЗАПУСК И ЗАКРЫТИЕ ВСЕХ МОДАЛЬНЫХ ОКОН (КАРТИНКИ + ЭДИТ) ===
const watchEditBtn = document.querySelector('#card a[href="#modal-edit"]');
const editVideo = document.querySelector('#modal-edit video');

if (watchEditBtn && editVideo) {
    watchEditBtn.addEventListener('click', () => {
        editVideo.currentTime = 0;
        editVideo.play();
    });
}

document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.classList.contains('close-btn')) {
            if (editVideo) editVideo.pause();
            window.location.hash = 'close';
        }
    });
});

// === 5. ЗАКРЫТИЕ БОКОВОГО МЕНЮ ПРИ КЛИКЕ МИМО ===
const navToggle = document.getElementById('navToggle');
const sideNav = document.querySelector('.side-nav');
const hamburger = document.querySelector('.hamburger');

document.addEventListener('click', (event) => {
    if (
        navToggle.checked &&
        !sideNav.contains(event.target) &&
        !hamburger.contains(event.target) &&
        event.target !== navToggle
    ) {
        navToggle.checked = false;
    }
});

// === 6. ПЕРЕКЛЮЧЕНИЕ И СОХРАНЕНИЕ ТЕМЫ (ПО КНОПКЕ) ===
const themeBtn = document.getElementById('theme-btn');

function updateThemeButton() {
    if (!themeBtn) return;
    const isOrange = document.body.classList.contains('orange-mode');
    themeBtn.textContent = isOrange ? '🔵 Red Bull' : '🟠 Orange Army';
}

if (localStorage.getItem('theme') === 'orange') {
    document.body.classList.add('orange-mode');
}
updateThemeButton();

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('orange-mode');
        const isOrange = document.body.classList.contains('orange-mode');
        localStorage.setItem('theme', isOrange ? 'orange' : 'redbull');
        updateThemeButton();
    });
}

// === 7. ЖИВОЙ ТАЙМЕР ДО СЛЕДУЮЩЕЙ ГОНКИ (JOLPICA F1 API) ===
fetch('https://api.jolpi.ca/ergast/f1/current/next.json')
    .then(res => res.json())
    .then(data => {
        const race = data.MRData.RaceTable.Races[0];
        if (!race) {
            document.getElementById('race-name').textContent = 'Off-Season';
            document.getElementById('race-circuit').textContent = 'Waiting for the next F1 calendar';
            return;
        }

        document.getElementById('race-name').textContent = race.raceName;
        document.getElementById('race-circuit').textContent = race.Circuit.circuitName;

        const targetDate = new Date(`${race.date}T${race.time || '12:00:00Z'}`);

        function updateTimer() {
            const diff = targetDate - new Date();
            if (diff <= 0) {
                document.getElementById('race-circuit').textContent = 'Race Weekend is LIVE!';
                return;
            }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
            document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
            document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
            document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
        }

        updateTimer();
        setInterval(updateTimer, 1000);
    })
    .catch(() => {
        document.getElementById('race-name').textContent = 'Schedule unavailable';
    });

// === 8. КНОПКА «НАВЕРХ ↑» ===
const scrollTopBtn = document.getElementById('scroll-top-btn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// === ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ЭПОХ РЕГЛАМЕНТА ===
const eraButtons = document.querySelectorAll('.era-btn');
const eraGrids = document.querySelectorAll('.era-grid');

eraButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        //1. Снимаем active со всех кнопок и сеток
        eraButtons.forEach((b) => b.classList.remove('active'));
        eraGrids.forEach((g) => g.classList.remove('active'));

        //2. Активируем нажатую кнопку и нужный блок по data-era
        btn.classList.add('active');
        const targetId = btn.dataset.era;
        document.getElementById(targetId).classList.add('active');
    });
});

// === МОДАЛЬНОЕ ОКНО МАШИН СО СТРЕЛКАМИ И ЭПОХОЙ ===
const allCarCards = Array.from(document.querySelectorAll('.car-card'));
const carModalImg = document.getElementById('modal-car-img');
const carModalEra = document.getElementById('modal-car-era');
const carModalYear = document.getElementById('modal-car-year');
const carModalTitle = document.getElementById('modal-car-title');
const carModalDesc = document.getElementById('modal-car-desc');
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');
let currentCarIndex = 0;

function showCar(index, animate = true) {
    currentCarIndex = (index + allCarCards.length) % allCarCards.length;
    const card = allCarCards[currentCarIndex];

    const gridId = card.closest('.era-grid').id;
    const eraBtn = document.querySelector(`.era-btn[data-era="${gridId}"]`);

    const applyContent = () => {
        carModalImg.src = card.querySelector('img').src;
        carModalImg.alt = card.querySelector('img').alt;
        carModalEra.textContent = eraBtn ? eraBtn.textContent : '';
        carModalYear.textContent = card.querySelector('.car-year').textContent;
        carModalTitle.textContent = card.querySelector('h3').textContent;
        carModalDesc.textContent = card.querySelector('p').textContent;
        carModalImg.style.opacity = '1';
    };

    if (animate) {
        carModalImg.style.opacity = '0';
        setTimeout(applyContent, 150);
    } else {
        applyContent();
    }
}

allCarCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        showCar(index, false);
        window.location.hash = 'modal-car';
    });
});

if (modalPrev) modalPrev.addEventListener('click', () => showCar(currentCarIndex - 1));
if (modalNext) modalNext.addEventListener('click', () => showCar(currentCarIndex + 1));

// Листание стрелками ← и → на клавиатуре, пока открыто окно
document.addEventListener('keydown', (event) => {
    if (window.location.hash === '#modal-car') {
        if (event.key === 'ArrowLeft') showCar(currentCarIndex - 1);
        if (event.key === 'ArrowRight') showCar(currentCarIndex + 1);
    }
});