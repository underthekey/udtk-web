'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sentence } from '@/app/types';
import SentenceDisplay from './SentenceDisplay';
import TypingArea from './TypingArea';
import AnimatedSentences from './AnimatedSentences';
import styles from '@/styles/Typer.module.css';

const switchOptions = [
  "Default", "Cherry_MX_Black", "Cherry_MX_Blue", "Cherry_MX_Brown", "Cherry_MX_Clear",
  "Cherry_MX_Green", "Cherry_MX_Red", "Cherry_MX_Silver", "Cherry_MX_Speed_Silver",
  "Cherry_MX_Silent_Red", "Cherry_MX_White"
];

export default function Typer({ initialSentences }: { initialSentences: Sentence[] }) {
  const [sentences, setSentences] = useState<Sentence[]>(initialSentences);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [lastCompletedCharIndex, setLastCompletedCharIndex] = useState(-1);
  const [showAnimation, setShowAnimation] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [selectedSwitch, setSelectedSwitch] = useState<string>('Default');

  const typingAreaRef = useRef<HTMLTextAreaElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const initAudioContext = useCallback(() => {
    if (!audioContext) {
      const newContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(newContext);
      loadAudio(selectedSwitch, newContext);
    }
  }, [audioContext, selectedSwitch]);

  useEffect(() => {
    if (audioContext) {
      loadAudio(selectedSwitch, audioContext);
    }
  }, [selectedSwitch, audioContext]);

  const loadAudio = async (switchName: string, context: AudioContext) => {
    if (switchName === 'Default') {
      audioBufferRef.current = null;
      return;
    }

    try {
      const response = await fetch(`https://storage.udtk.site/switches/sounds/${switchName}.mp3`);
      const arrayBuffer = await response.arrayBuffer();
      audioBufferRef.current = await context.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('오디오 로드 실패:', error);
    }
  };

  const playKeySound = useCallback((keyType: string) => {
    if (!audioContext || !audioBufferRef.current) {
      return;
    }

    try {
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferRef.current;

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(volume * 1.5, audioContext.currentTime);

      const filter = audioContext.createBiquadFilter();
      const panNode = audioContext.createStereoPanner();

      const { frequency, pan, gain } = getKeyProperties(keyType);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
      filter.Q.setValueAtTime(0.5, audioContext.currentTime);

      panNode.pan.setValueAtTime(pan, audioContext.currentTime);
      gainNode.gain.setValueAtTime(gain * volume * 10, audioContext.currentTime);

      source.connect(filter);
      filter.connect(panNode);
      panNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);
      source.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.error('오디오 재생 중 오류 발생:', error);
    }
  }, [audioContext, volume]);

  const getKeyProperties = (key: string): { frequency: number; pan: number; gain: number } => {
    const lowerKey = key.toLowerCase();
    let frequency = 1000;
    let pan = 0;
    let gain = 1;

    if ('`1234567890-='.includes(lowerKey)) {
      frequency = 1100;
    } else if ('qwertyuiop[]\\'.includes(lowerKey)) {
      frequency = 1000;
    } else if ('asdfghjkl;\''.includes(lowerKey)) {
      frequency = 900;
    } else if ('zxcvbnm,./'.includes(lowerKey)) {
      frequency = 800;
    }

    const keyboardLayout = [
      '`1234567890-=',
      'qwertyuiop[]\\',
      'asdfghjkl;\'',
      'zxcvbnm,./'
    ];
    for (let i = 0; i < keyboardLayout.length; i++) {
      const rowIndex = keyboardLayout[i].indexOf(lowerKey);
      if (rowIndex !== -1) {
        pan = ((rowIndex - (keyboardLayout[i].length - 1) / 2) / ((keyboardLayout[i].length - 1) / 2)) * 0.9;
        pan = Math.sign(pan) * Math.pow(Math.abs(pan), 0.5) * 0.9;
        break;
      }
    }

    switch (key) {
      case ' ':
        frequency = 700;
        gain = 1.1;
        pan = 0;
        break;
      case 'ShiftLeft':
        frequency = 800;
        gain = 1.05;
        pan = -0.6;
        break;
      case 'ShiftRight':
        frequency = 800;
        gain = 1.05;
        pan = 0.6;
        break;
      case 'CapsLock':
        frequency = 850;
        gain = 1.05;
        pan = -0.6;
        break;
      case 'Backspace':
        frequency = 950;
        gain = 1.1;
        pan = 0.6;
        break;
      case 'Enter':
        frequency = 900;
        gain = 1.15;
        pan = 0.5;
        break;
      case 'ControlLeft':
        frequency = 750;
        gain = 1.05;
        pan = -0.6;
        break;
      case 'ControlRight':
        frequency = 750;
        gain = 1.05;
        pan = 0.5;
        break;
      case 'AltLeft':
        frequency = 780;
        gain = 1.05;
        pan = -0.4;
        break;
      case 'AltRight':
        frequency = 780;
        gain = 1.05;
        pan = 0.4;
        break;
    }

    return { frequency, pan, gain };
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  const fetchMoreSentences = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const res = await fetch('https://sentence.udtk.site/random?count=20', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch sentences');
      }
      const newSentences = await res.json();
      setSentences(prevSentences => [...prevSentences, ...newSentences]);
    } catch (error) {
      console.error('Error fetching more sentences:', error);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  const moveToNextSentence = useCallback(async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= sentences.length - 2 && !isFetching) {
      await fetchMoreSentences();
    }
    setCurrentIndex(nextIndex);
    setCurrentInput('');
    setCorrectChars(0);
    setLastCompletedCharIndex(-1);
  }, [currentIndex, sentences.length, isFetching, fetchMoreSentences]);

  const handleSentenceComplete = useCallback(() => {
    moveToNextSentence();
  }, [moveToNextSentence]);

  const handleSkip = useCallback(async () => {
    if (currentIndex < sentences.length - 1) {
      await moveToNextSentence();
    }
  }, [currentIndex, sentences.length, moveToNextSentence]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
      setCurrentInput('');
      setCorrectChars(0);
      setLastCompletedCharIndex(-1);
    }
  }, [currentIndex]);

  const handleInputChange = useCallback((input: string, newCorrectChars: number, newLastCompletedCharIndex: number) => {
    setCurrentInput(input);
    setCorrectChars(newCorrectChars);
    setLastCompletedCharIndex(newLastCompletedCharIndex);

    // 입력된 문자의 소리 재생 로직은 여기서 제거
  }, []);

  const currentSentence = useMemo(() => sentences[currentIndex], [sentences, currentIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSwitchChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSwitch = event.target.value;
    setSelectedSwitch(newSwitch);
    if (audioContext) {
      loadAudio(newSwitch, audioContext);
    }
  }, [audioContext]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!event.repeat) {
      playKeySound(event.code);
    }

    if (event.key === 'Shift') {
      setIsShiftPressed(true);
    } else if (event.key === 'CapsLock') {
      setIsCapsLockOn(prev => !prev);
    }
  }, [playKeySound, setIsShiftPressed, setIsCapsLockOn]);

  const handleKeyUp = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(event.code);
      return newSet;
    });

    if (event.key === 'Shift') {
      setIsShiftPressed(false);
    }
  }, [setIsShiftPressed]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!pressedKeys.has(event.code)) {
        setPressedKeys(prev => new Set(prev).add(event.code));
        playKeySound(event.code);
      }
    };

    const handleGlobalKeyUp = (event: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.code);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [playKeySound, pressedKeys]);

  return (
    <div className={styles.typer} onClick={initAudioContext}>
      {showAnimation && <AnimatedSentences sentences={sentences.slice(0, 20)} />}
      <SentenceDisplay
        sentence={currentSentence}
        currentInput={currentInput}
        correctChars={correctChars}
        lastCompletedCharIndex={lastCompletedCharIndex}
      />
      <TypingArea
        sentence={currentSentence.content}
        onComplete={handleSentenceComplete}
        onInputChange={handleInputChange}
        onSkip={handleSkip}
        onPrevious={handlePrevious}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      />
      <div className={styles.switchSelector}>
        <label htmlFor="switchSelect">키보드 스위치 선택: </label>
        <select
          id="switchSelect"
          value={selectedSwitch}
          onChange={handleSwitchChange}
          className={styles.switchSelect}
        >
          {switchOptions.map(option => (
            <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
      <div className={styles.volumeControl}>
        <label htmlFor="volumeSlider">볼륨: </label>
        <input
          id="volumeSlider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
        />
      </div>
    </div>
  );
}
