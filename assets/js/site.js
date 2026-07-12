const LASTFM_API_KEY = '24b984e9a14eb6140c10178159d1971f';
const LASTFM_USERNAME = 'mulksuz21';
const IDLE_TEXT = 'wele şu an bir şey dinlemiyorum..';

let audio = null;
let npTimer = null;

function fmt(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sn = Math.floor(s % 60);
    return `${m}:${String(sn).padStart(2, '0')}`;
}

function initPlayer() {
    const box = document.querySelector('.player');
    if (!box) return;
    const btn = box.querySelector('.player-btn');
    const seek = box.querySelector('.player-seek');
    const timeEl = box.querySelector('.player-time');
    const src = new URL(box.dataset.src, location.href).href;

    if (!audio) {
        audio = new Audio();
        audio.preload = 'metadata';
    }
    if (audio.src !== src) audio.src = src;

    function render() {
        const p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
        seek.value = p;
        seek.style.background = `linear-gradient(90deg, #556B2F ${p}%, rgba(232, 226, 208, 0.13) ${p}%)`;
    }

    function syncBtn() {
        const paused = audio.paused;
        btn.textContent = paused ? '[çal]' : '[dur]';
        btn.setAttribute('aria-label', paused ? 'çal' : 'dur');
    }

    btn.onclick = () => {
        if (audio.paused) audio.play(); else audio.pause();
    };

    seek.oninput = () => {
        if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
    };

    audio.onplay = syncBtn;
    audio.onpause = syncBtn;
    audio.ontimeupdate = render;
    audio.onloadedmetadata = render;
    audio.onended = () => {
        audio.currentTime = 0;
    };

    render();
    syncBtn();
}

async function fetchNowPlaying() {
    const trackEl = document.getElementById('np-track');
    const artistEl = document.getElementById('np-artist');
    const dotEl = document.getElementById('np-dot');
    const artEl = document.getElementById('np-art');
    if (!trackEl) return;

    function idle() {
        trackEl.textContent = IDLE_TEXT;
        artistEl.hidden = true;
        dotEl.classList.remove('live');
        artEl.hidden = true;
    }

    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        const track = data.recenttracks?.track?.[0];

        if (track && track['@attr']?.nowplaying === 'true') {
            trackEl.textContent = track.name;
            artistEl.textContent = track.artist['#text'];
            artistEl.hidden = false;
            dotEl.classList.add('live');
            const art = track.image?.[3]?.['#text'] || track.image?.[2]?.['#text'];
            if (art) {
                artEl.src = art;
                artEl.hidden = false;
            } else {
                artEl.hidden = true;
            }
        } else {
            idle();
        }
    } catch {
        idle();
    }
}

function initNowPlaying() {
    if (!document.getElementById('np-track')) return;
    fetchNowPlaying();
    if (!npTimer) npTimer = setInterval(fetchNowPlaying, 15000);
}

function initEposta() {
    const ep = document.querySelector('[data-eposta]');
    if (!ep || ep.href) return;
    const kutu = 'nujiyan1871';
    const sunucu = 'proton.me';
    ep.href = 'mailto:' + kutu + '@' + sunucu;
}

function initPage() {
    initPlayer();
    initNowPlaying();
    initEposta();
}

async function navigate(url, push) {
    try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) {
            location.href = url;
            return;
        }
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main');
        const curMain = document.querySelector('main');
        if (!newMain || !curMain) {
            location.href = url;
            return;
        }
        curMain.replaceWith(newMain);
        const newFoot = doc.querySelector('footer');
        const curFoot = document.querySelector('footer');
        if (newFoot && curFoot) curFoot.replaceWith(newFoot);
        document.title = doc.title;
        if (push) history.pushState(null, '', url);
        window.scrollTo(0, 0);
        initPage();
    } catch {
        location.href = url;
    }
}

document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || !a.href) return;
    if (a.target === '_blank' || a.origin !== location.origin) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!/(\.html|\/)$/.test(a.pathname)) return;
    e.preventDefault();
    navigate(a.href, true);
});

window.addEventListener('popstate', () => {
    navigate(location.href, false);
});

initPage();
