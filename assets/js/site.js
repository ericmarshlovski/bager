const LASTFM_API_KEY = '24b984e9a14eb6140c10178159d1971f';
const LASTFM_USERNAME = 'mulksuz21';
const IDLE_TEXT = 'wele bir şey dinlemiyorum..';

const SVG_NS = 'http://www.w3.org/2000/svg';
const F91_GUN = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const F91_HANE = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];

let audio = null;
let npTimer = null;
let saatTimer = null;
let renkler = null;
let f91Ray = null;

const F91_ANAHTAR = 'bager-f91';

const f91 = {
    x: 0, y: 0, aci: 0, aciHiz: 0, hiz: 0,
    suruklu: false, yerlesti: false,
    kapX: 0, kapY: 0, sonX: 0, sonT: 0
};

function tema() {
    if (!renkler) {
        const stil = getComputedStyle(document.documentElement);
        renkler = {
            sor: stil.getPropertyValue('--sor').trim(),
            cizgi: stil.getPropertyValue('--line').trim()
        };
    }
    return renkler;
}

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
        const renk = tema();
        seek.style.background = `linear-gradient(90deg, ${renk.sor} ${p}%, ${renk.cizgi} ${p}%)`;
    }

    function syncBtn() {
        const paused = audio.paused;
        btn.textContent = paused ? 'çal' : 'dur';
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
    const artEl = document.getElementById('np-art');
    if (!trackEl) return;

    function idle() {
        trackEl.textContent = IDLE_TEXT;
        artistEl.hidden = true;
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

function initGizli() {
    const kutu = document.querySelector('.gizli');
    const img = kutu ? kutu.querySelector('.foto') : null;
    if (!kutu || !img || !img.dataset.b) return;
    const on = {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        en: img.getAttribute('width'),
        boy: img.getAttribute('height')
    };
    const arka = {
        src: img.dataset.b,
        alt: img.dataset.altB,
        en: img.dataset.en,
        boy: img.dataset.boy
    };
    kutu.onclick = () => {
        const acik = img.getAttribute('src') === arka.src;
        const yeni = acik ? on : arka;
        img.src = yeni.src;
        img.alt = yeni.alt;
        if (yeni.en) img.setAttribute('width', yeni.en);
        if (yeni.boy) img.setAttribute('height', yeni.boy);
    };
}

function segYatay(x0, x1, y0, t) {
    const y = t / 2;
    return `${x0},${y0 + y} ${x0 + y},${y0} ${x1 - y},${y0} ${x1},${y0 + y} ${x1 - y},${y0 + t} ${x0 + y},${y0 + t}`;
}

function segDikey(x0, y0, y1, t) {
    const y = t / 2;
    return `${x0 + y},${y0} ${x0 + t},${y0 + y} ${x0 + t},${y1 - y} ${x0 + y},${y1} ${x0},${y1 - y} ${x0},${y0 + y}`;
}

function cizHane(ad) {
    const w = 20;
    const h = 36;
    const t = 3.6;
    const m = h / 2;
    const kume = document.createElementNS(SVG_NS, 'g');
    const sekiller = {
        a: segYatay(0, w, 0, t),
        b: segDikey(w - t, 0, m + t / 2, t),
        c: segDikey(w - t, m - t / 2, h, t),
        d: segYatay(0, w, h - t, t),
        e: segDikey(0, m - t / 2, h, t),
        f: segDikey(0, 0, m + t / 2, t),
        g: segYatay(0, w, m - t / 2, t)
    };
    for (const harf of 'abcdefg') {
        const poli = document.createElementNS(SVG_NS, 'polygon');
        poli.setAttribute('points', sekiller[harf]);
        poli.setAttribute('class', 'f91-seg');
        poli.dataset.seg = ad + harf;
        kume.appendChild(poli);
    }
    return kume;
}

function oge(ad, ozellik) {
    const el = document.createElementNS(SVG_NS, ad);
    for (const anahtar in ozellik) el.setAttribute(anahtar, String(ozellik[anahtar]));
    return el;
}

function yaziOge(metin, ozellik, sinif) {
    const el = oge('text', ozellik);
    if (sinif) el.setAttribute('class', sinif);
    if (metin !== null) el.textContent = metin;
    return el;
}

function cizGecis(id, duraklar, yatay) {
    const gr = oge('linearGradient', {
        id,
        x1: 0, y1: 0,
        x2: yatay ? 1 : 0,
        y2: yatay ? 0 : 1
    });
    for (const [offset, renk, opak] of duraklar) {
        const d = oge('stop', { offset, 'stop-color': renk });
        if (opak !== undefined) d.setAttribute('stop-opacity', String(opak));
        gr.appendChild(d);
    }
    return gr;
}

function cizKayis(ustte) {
    const kume = oge('g', {});
    const y0 = ustte ? 0 : 292;
    const y1 = ustte ? 118 : 380;
    const dar = 42;
    const genis = 50;
    const a = ustte ? dar : genis;
    const b = ustte ? genis : dar;
    kume.appendChild(oge('path', {
        d: `M${70 - a},${y0} L${70 + a},${y0} L${70 + b},${y1} L${70 - b},${y1} Z`,
        fill: 'url(#f91-kayis)'
    }));
    const adim = (y1 - y0) / 7;
    for (let i = 1; i < 7; i++) {
        const y = y0 + adim * i;
        const t = (y - y0) / (y1 - y0);
        const w = a + (b - a) * t - 6;
        kume.appendChild(oge('rect', {
            x: 70 - w, y: y - 1.6, width: w * 2, height: 3.2,
            fill: 'rgba(0,0,0,0.55)', rx: 1.6
        }));
    }
    return kume;
}

function cizF91(kutu) {
    const svg = oge('svg', { viewBox: '0 0 140 380', class: 'f91-govde' });
    svg.setAttribute('aria-hidden', 'true');

    const tanim = oge('defs', {});
    tanim.appendChild(cizGecis('f91-kasa', [[0, '#34353a'], [0.22, '#1c1d21'], [0.7, '#0c0d10'], [1, '#050507']]));
    tanim.appendChild(cizGecis('f91-kayis', [[0, '#26272b'], [0.5, '#131417'], [1, '#0a0b0d']], true));
    tanim.appendChild(cizGecis('f91-ekran', [[0, '#c9d0c2'], [1, '#a7afa0']]));
    tanim.appendChild(cizGecis('f91-pusher', [[0, '#d4d4d4'], [0.45, '#82827f'], [1, '#3c3c3c']], true));
    svg.appendChild(tanim);

    svg.appendChild(cizKayis(true));
    svg.appendChild(cizKayis(false));

    for (const [x, y] of [[-5, 150], [-5, 228], [135, 189]]) {
        svg.appendChild(oge('rect', {
            x, y, width: 10, height: 18, rx: 2.5, fill: 'url(#f91-pusher)'
        }));
    }

    svg.appendChild(oge('rect', { x: 0, y: 100, width: 140, height: 200, rx: 30, fill: 'url(#f91-kasa)' }));
    svg.appendChild(oge('rect', {
        x: 0.8, y: 100.8, width: 138.4, height: 198.4, rx: 29.4,
        fill: 'none', stroke: 'rgba(255,255,255,0.16)', 'stroke-width': 1.6
    }));
    svg.appendChild(oge('rect', { x: 12, y: 112, width: 116, height: 176, rx: 15, fill: '#08080a' }));
    svg.appendChild(oge('rect', {
        x: 16.5, y: 116.5, width: 107, height: 167, rx: 12,
        fill: 'none', stroke: '#2d4f9e', 'stroke-width': 1.6
    }));

    svg.appendChild(yaziOge('CASIO', { x: 30, y: 140 }, 'f91-marka'));
    svg.appendChild(yaziOge('F-91W', { x: 112, y: 139, 'text-anchor': 'end' }, 'f91-model'));

    svg.appendChild(oge('rect', { x: 22, y: 150, width: 96, height: 64, rx: 3, fill: 'url(#f91-ekran)' }));

    svg.appendChild(yaziOge(null, { x: 31, y: 167 }, 'f91-lcd-ust f91-gun'));
    svg.appendChild(yaziOge(null, { x: 109, y: 167, 'text-anchor': 'end' }, 'f91-lcd-ust f91-tarih'));

    const ana = oge('g', { transform: 'translate(28,172) scale(0.6)' });
    for (const [ad, x] of [['s1', 0], ['s2', 25], ['d1', 64], ['d2', 89]]) {
        const hane = cizHane(ad);
        hane.setAttribute('transform', `translate(${x},0)`);
        ana.appendChild(hane);
    }
    const kolon = oge('g', { class: 'f91-kolon' });
    for (const y of [10, 24]) {
        kolon.appendChild(oge('rect', { x: 54, y, width: 4, height: 4 }));
    }
    ana.appendChild(kolon);
    svg.appendChild(ana);

    const saniye = oge('g', { transform: 'translate(97,182.4) scale(0.31)' });
    for (const [ad, x] of [['n1', 0], ['n2', 25]]) {
        const hane = cizHane(ad);
        hane.setAttribute('transform', `translate(${x},0)`);
        saniye.appendChild(hane);
    }
    svg.appendChild(saniye);

    svg.appendChild(oge('rect', {
        x: 22, y: 150, width: 96, height: 64, rx: 3,
        fill: 'none', stroke: 'rgba(0,0,0,0.32)', 'stroke-width': 1.2
    }));

    svg.appendChild(oge('rect', {
        x: 50, y: 248, width: 40, height: 17, rx: 8.5,
        fill: '#0d0d10', stroke: '#2d4f9e', 'stroke-width': 1.4
    }));
    svg.appendChild(yaziOge('WR', { x: 70, y: 260.5, 'text-anchor': 'middle' }, 'f91-wr'));

    kutu.appendChild(svg);
}

function yazHane(kutu, ad, rakam) {
    const acik = F91_HANE[rakam];
    for (const harf of 'abcdefg') {
        const seg = kutu.querySelector(`[data-seg="${ad}${harf}"]`);
        if (seg) seg.classList.toggle('on', acik.includes(harf));
    }
}

function yazSaat() {
    const kutu = document.getElementById('f91');
    if (!kutu || !kutu.querySelector('svg')) return;
    const simdi = new Date();
    const saat = String(simdi.getHours()).padStart(2, '0');
    const dakika = String(simdi.getMinutes()).padStart(2, '0');
    const saniye = String(simdi.getSeconds()).padStart(2, '0');
    yazHane(kutu, 's1', +saat[0]);
    yazHane(kutu, 's2', +saat[1]);
    yazHane(kutu, 'd1', +dakika[0]);
    yazHane(kutu, 'd2', +dakika[1]);
    yazHane(kutu, 'n1', +saniye[0]);
    yazHane(kutu, 'n2', +saniye[1]);
    kutu.querySelector('.f91-gun').textContent = F91_GUN[simdi.getDay()];
    kutu.querySelector('.f91-tarih').textContent = String(simdi.getDate());
    kutu.setAttribute('aria-label', `saat ${saat}:${dakika}`);
}

function f91Sinirla(kutu) {
    const enSinir = Math.max(6, window.innerWidth - kutu.offsetWidth - 6);
    const boySinir = Math.max(6, window.innerHeight - kutu.offsetHeight - 6);
    f91.x = Math.max(6, Math.min(f91.x, enSinir));
    f91.y = Math.max(6, Math.min(f91.y, boySinir));
}

function f91Kaydet() {
    try {
        localStorage.setItem(F91_ANAHTAR, JSON.stringify({ x: Math.round(f91.x), y: Math.round(f91.y) }));
    } catch {}
}

function f91Yerlestir(kutu) {
    let kayit = null;
    try {
        kayit = JSON.parse(localStorage.getItem(F91_ANAHTAR));
    } catch {
        kayit = null;
    }
    if (kayit && Number.isFinite(kayit.x) && Number.isFinite(kayit.y)) {
        f91.x = kayit.x;
        f91.y = kayit.y;
    } else {
        f91.x = window.innerWidth - kutu.offsetWidth - Math.min(90, window.innerWidth * 0.09);
        f91.y = Math.min(150, window.innerHeight * 0.2);
        f91.aci = -7;
    }
    f91Sinirla(kutu);
    f91.yerlesti = true;
}

function f91Dongu() {
    const kutu = document.getElementById('f91');
    if (!kutu) {
        f91Ray = null;
        return;
    }

    if (f91.suruklu) {
        const hedef = Math.max(-20, Math.min(20, f91.hiz * 1.5));
        f91.aci += (hedef - f91.aci) * 0.2;
        f91.aciHiz = 0;
    } else {
        f91.aciHiz += -0.022 * f91.aci - 0.12 * f91.aciHiz;
        f91.aci += f91.aciHiz;
    }

    kutu.style.transform =
        `translate3d(${f91.x.toFixed(1)}px, ${f91.y.toFixed(1)}px, 0) rotate(${f91.aci.toFixed(2)}deg)`;

    f91Ray = requestAnimationFrame(f91Dongu);
}

function initF91Surukle(kutu) {
    kutu.onpointerdown = (e) => {
        f91.suruklu = true;
        f91.kapX = e.clientX - f91.x;
        f91.kapY = e.clientY - f91.y;
        f91.sonX = e.clientX;
        f91.sonT = performance.now();
        kutu.setPointerCapture(e.pointerId);
        kutu.classList.add('tutuluyor');
        e.preventDefault();
    };

    kutu.onpointermove = (e) => {
        if (!f91.suruklu) return;
        f91.x = e.clientX - f91.kapX;
        f91.y = e.clientY - f91.kapY;
        const simdi = performance.now();
        const gecen = Math.max(simdi - f91.sonT, 8);
        f91.hiz = ((e.clientX - f91.sonX) / gecen) * 16;
        f91.sonX = e.clientX;
        f91.sonT = simdi;
    };

    const birak = (e) => {
        if (!f91.suruklu) return;
        f91.suruklu = false;
        f91.hiz = 0;
        kutu.classList.remove('tutuluyor');
        f91Sinirla(kutu);
        f91Kaydet();
        if (e && e.pointerId !== undefined && kutu.hasPointerCapture(e.pointerId)) {
            kutu.releasePointerCapture(e.pointerId);
        }
    };
    kutu.onpointerup = birak;
    kutu.onpointercancel = birak;
}

function initSaat() {
    const kutu = document.getElementById('f91');
    if (!kutu) return;
    if (!kutu.querySelector('svg')) cizF91(kutu);
    if (!f91.yerlesti) f91Yerlestir(kutu);
    yazSaat();
    initF91Surukle(kutu);
    if (!saatTimer) saatTimer = setInterval(yazSaat, 1000);
    if (!f91Ray) f91Ray = requestAnimationFrame(f91Dongu);
}

window.addEventListener('resize', () => {
    const kutu = document.getElementById('f91');
    if (kutu && f91.yerlesti) f91Sinirla(kutu);
});


function initPage() {
    initPlayer();
    initNowPlaying();
    initEposta();
    initGizli();
    initSaat();
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
