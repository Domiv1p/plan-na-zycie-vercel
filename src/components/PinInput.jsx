import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';

const PinInput = forwardRef(({ onComplete, error, onClear }, ref) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useImperativeHandle(ref, () => ({
    clear: () => {
      setPin(['', '', '', '']);
      setActiveIndex(0);
      inputRefs[0].current?.focus();
    }
  }));

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    if (value && index < 3) {
      setActiveIndex(index + 1);
      inputRefs[index + 1].current?.focus();
    }

    if (newPin.every(digit => digit !== '')) {
      onComplete(newPin.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        setActiveIndex(index - 1);
        inputRefs[index - 1].current?.focus();
      } else {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
      if (onClear) onClear();
    }
  };

  const handleFocus = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div 
        className="flex gap-3 justify-center"
        animate={error ? { x: [0, -10, 10, -10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {pin.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => handleFocus(index)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-center text-2xl font-bold bg-[var(--glass-bg)] backdrop-blur-md outline-none transition-all ${
              error 
                ? 'border-2 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                : activeIndex === index
                  ? 'border-2 border-[var(--accent)] text-[var(--accent)] shadow-[0_0_15px_var(--accent-glow)]'
                  : 'border border-[var(--glass-border)] text-[var(--text-primary)]'
            }`}
          />
        ))}
      </motion.div>
      
      {error && (
        <span className="text-red-500 text-sm font-medium">{error}</span>
      )}
    </div>
  );
});

PinInput.displayName = 'PinInput';
export default PinInput;
