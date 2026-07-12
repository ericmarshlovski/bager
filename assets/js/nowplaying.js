const LASTFM_API_KEY = '24b984e9a14eb6140c10178159d1971f';
const LASTFM_USERNAME = 'mulksuz21';
const IDLE_TEXT = 'wele şu an bir şey dinlemiyorum..';

async function getNowPlaying() {
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
            const art = track.image?.[2]?.['#text'];
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

getNowPlaying();
setInterval(getNowPlaying, 15000);
