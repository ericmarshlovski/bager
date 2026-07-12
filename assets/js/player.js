const audio = document.getElementById('player-audio');
const playerBtn = document.getElementById('player-btn');
const seek = document.getElementById('player-seek');
const timeEl = document.getElementById('player-time');

function fmt(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sn = Math.floor(s % 60);
    return `${m}:${String(sn).padStart(2, '0')}`;
}

function render() {
    const p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    seek.value = p;
    seek.style.background = `linear-gradient(90deg, #c94b3f ${p}%, rgba(232, 226, 208, 0.13) ${p}%)`;
}

playerBtn.addEventListener('click', () => {
    if (audio.paused) audio.play(); else audio.pause();
});

audio.addEventListener('play', () => {
    playerBtn.textContent = '[dur]';
    playerBtn.setAttribute('aria-label', 'dur');
});

audio.addEventListener('pause', () => {
    playerBtn.textContent = '[çal]';
    playerBtn.setAttribute('aria-label', 'çal');
});

audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    render();
});

audio.addEventListener('timeupdate', render);
audio.addEventListener('loadedmetadata', render);

seek.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
});

render();
