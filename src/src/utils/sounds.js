// Syntetyczne efekty dwikowe uywajce Web Audio API

let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (frequency, type, duration, vol = 0.1) => {
  if (localStorage.getItem('pnz-sounds') === 'off') return;
  try {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
};

// Dwiki dla poszczegƈlnych akcji
export const playPlum = () => {
  // Delikatny, mikki "plum" (zmiana motywu)
  playTone(300, 'sine', 0.2, 0.15);
  setTimeout(() => playTone(450, 'sine', 0.3, 0.1), 50);
};

export const playDing = () => {
  // Radosne "ding" (zrobione zadanie)
  playTone(800, 'sine', 0.1, 0.1);
  setTimeout(() => playTone(1200, 'sine', 0.4, 0.15), 100);
};

export const playPop = () => {
  // Krƈtki pop (zaznaczenie kalendarza)
  playTone(600, 'triangle', 0.1, 0.1);
};

export const playPaper = () => {
  // Symulacja szelestu papieru przez szum biay (Notatki)
  if (localStorage.getItem('pnz-sounds') === 'off') return;
  try {
    const ctx = initAudio();
    const bufferSize = ctx.sampleRate * 0.15; // 150ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Bandpass filter to make it sound like paper
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  } catch(e) {}
};
