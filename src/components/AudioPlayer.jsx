import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Volume2 } from 'lucide-react';

const SOUNDS = [
  { id: 'rain', name: '🌧️ Deszcz' },
  { id: 'lofi', name: '🎵 Lo-Fi Chill' },
  { id: 'synthwave', name: '🌆 Synthwave' }
];

export default function AudioPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(SOUNDS[0].id);
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodesRef = useRef([]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      playAudio(currentTrack);
    } else {
      stopAudio();
    }
  }, [isPlaying, currentTrack]);

  const stopAudio = () => {
    sourceNodesRef.current.forEach(node => {
      try { node.stop(); } catch (e) {}
      node.disconnect();
    });
    sourceNodesRef.current = [];
  };

  const playAudio = (trackId) => {
    stopAudio();
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (!gainNodeRef.current) {
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.connect(ctx.destination);
    }
    gainNodeRef.current.gain.value = volume;

    if (trackId === 'rain') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      noise.connect(filter);
      filter.connect(gainNodeRef.current);
      noise.start();
      sourceNodesRef.current.push(noise);
    } else if (trackId === 'lofi') {
      const frequencies = [261.63, 329.63, 392.00]; // C4, E4, G4
      frequencies.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.2 + Math.random() * 0.1;
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.1;
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.1;
        
        osc.connect(oscGain);
        oscGain.connect(gainNodeRef.current);
        
        osc.start();
        lfo.start();
        sourceNodesRef.current.push(osc, lfo);
      });
    } else if (trackId === 'synthwave') {
      const freq = 110; // A2
      
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = freq;
      
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.value = freq * 1.01;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.5;
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 800;
      
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.15;
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(gainNodeRef.current);
      
      osc1.start();
      osc2.start();
      lfo.start();
      
      sourceNodesRef.current.push(osc1, osc2, lfo);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-30">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-64 bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--glass-border)] rounded-2xl shadow-2xl p-4 mb-2 flex flex-col gap-4"
          >
            <h3 className="font-semibold text-[var(--accent)] text-center text-lg">🎧 Ambient</h3>
            
            <div className="flex flex-col gap-2">
              {SOUNDS.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => {
                    setCurrentTrack(sound.id);
                    if (!isPlaying) setIsPlaying(true);
                  }}
                  className={`p-2 rounded-xl text-left transition-all ${
                    currentTrack === sound.id 
                      ? 'bg-[var(--glass-bg)] border border-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]' 
                      : 'hover:bg-[var(--glass-bg)] border border-transparent'
                  }`}
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">{sound.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Volume2 size={16} className="text-[var(--text-muted)]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-[var(--glass-border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
              />
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 mx-auto mt-2 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)] hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] flex items-center justify-center text-[var(--accent)] shadow-lg hover:bg-[var(--bg-card)] transition-colors relative"
      >
        {isPlaying && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 blur-[8px]"
          />
        )}
        <Music size={24} />
      </button>
    </div>
  );
}
