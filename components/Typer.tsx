'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sentence } from '@/app/types';
import SentenceDisplay from './SentenceDisplay';
import TypingArea from './TypingArea';
import SimpleEqualizer from './SimpleEqualizer';
import StereoImager from './StereoImager';
import styles from '@/styles/Typer.module.css';
import Image from 'next/image';
import SettingsModal from './SettingsModal';

const switchOptions = [
  'Default',
  'Cherry_MX_Black',
  'Cherry_MX_Blue',
  'Cherry_MX_Brown',
  'Cherry_MX_Clear',
  'Cherry_MX_Green',
  'Cherry_MX_Red',
  'Cherry_MX_RGB_Silver',
  'Cherry_MX_Silent_Black',
  'Cherry_MX_Silent_Red',
  'Cherry_MX_Silent_Silver',
  'Cherry_MX_Tactile_Gray',
  'Cherry_MX_White'
];

export default function Typer({ initialSentences }: { initialSentences: Sentence[] }) {
  const [sentences, setSentences] = useState<Sentence[]>(initialSentences);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [lastCompletedCharIndex, setLastCompletedCharIndex] = useState(-1);
  const [isFetching, setIsFetching] = useState(false);

  const [selectedSwitch, setSelectedSwitch] = useState<string>('Default');

  const typingAreaRef = useRef<HTMLInputElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const [equalizerFrequency, setEqualizerFrequency] = useState(0);
  const [equalizerVolume, setEqualizerVolume] = useState(0);

  const [analyserNodeLeft, setAnalyserNodeLeft] = useState<AnalyserNode | null>(null);
  const [analyserNodeRight, setAnalyserNodeRight] = useState<AnalyserNode | null>(null);
  const [panValue, setPanValue] = useState(0);  // 패닝 값 상태 추가
  const [loadedSwitches, setLoadedSwitches] = useState<Set<string>>(new Set(['Default']));
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AudioContext 초기화를 사용자 상호작용 후로 이동
  const initializeAudioContext = useCallback(() => {
    if (!audioContext) {
      const newContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(newContext);
    }
  }, [audioContext]);

  // 사용자 상호작용 이벤트 핸들러에 AudioContext 초기화 추가
  const handleUserInteraction = useCallback(() => {
    initializeAudioContext();
    // 기존의 다른 로직들...
  }, [initializeAudioContext]);

  useEffect(() => {
    // 페이지에 사용자 상호작용 이벤트 리스너 추가
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [handleUserInteraction]);

  useEffect(() => {
    if (audioContext) {
      const analyserLeft = audioContext.createAnalyser();
      const analyserRight = audioContext.createAnalyser();
      analyserLeft.fftSize = 256;
      analyserRight.fftSize = 256;
      setAnalyserNodeLeft(analyserLeft);
      setAnalyserNodeRight(analyserRight);

      // 스테레오 분리 및 연결
      const splitter = audioContext.createChannelSplitter(2);
      const merger = audioContext.createChannelMerger(2);

      splitter.connect(analyserLeft, 0);
      splitter.connect(analyserRight, 1);
      analyserLeft.connect(merger, 0, 0);
      analyserRight.connect(merger, 0, 1);
      merger.connect(audioContext.destination);
    }
  }, [audioContext]);

  const loadAudio = useCallback(async (switchName: string, context: AudioContext, retryCount = 3) => {
    if (switchName === 'Default' || loadedSwitches.has(switchName)) {
      return;
    }

    const attemptLoad = async (attempt: number): Promise<void> => {
      try {
        const response = await fetch(`https://storage.udtk.site/switches/sounds/${switchName}.mp3`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;
        setLoadedSwitches(prev => new Set(prev).add(switchName));
      } catch (error) {
        console.error(`오디오 로드 실패 (시도 ${attempt}/${retryCount}):`, error);
        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, 1000));  // 1초 대기 후 재시도
          return attemptLoad(attempt + 1);
        }
        console.error('모든 시도 실패:', error);
      }
    };

    setIsLoading(true);
    await attemptLoad(1);
    setIsLoading(false);
  }, [loadedSwitches]);

  const getKeyProperties = (key: string): { frequency: number; pan: number; gain: number; isSpecialKey: boolean } => {
    // 키 매핑 객체 추가
    const keyMap: { [key: string]: string } = {
      'Semicolon': ';',
      'Comma': ',',
      'Period': '.',
      'BracketLeft': '[',
      'BracketRight': ']',
      'Backslash': '\\',
      'Quote': '\'',
      'Minus': '-',
      'Equal': '=',
      'Backquote': '`',
      'Slash': '/',
      'Digit1': '1',
      'Digit2': '2',
      'Digit3': '3',
      'Digit4': '4',
      'Digit5': '5',
      'Digit6': '6',
      'Digit7': '7',
      'Digit8': '8',
      'Digit9': '9',
      'Digit0': '0'
    };

    // key에서 실제 문자 추출
    let actualKey = keyMap[key] || (key.length === 1 ? key : key.replace('Key', '')).toLowerCase();

    let frequency = 1000;
    let pan = 0;
    let gain = 1;
    let isSpecialKey = false;

    // 패닝 설정 수정
    const keyboardLayout = [
      '`1234567890-=',
      'qwertyuiop[]\\',
      'asdfghjkl;\'',
      'zxcvbnm,./'
    ];

    let found = false;
    for (let i = 0; i < keyboardLayout.length; i++) {
      const rowIndex = keyboardLayout[i].indexOf(actualKey);
      if (rowIndex !== -1) {
        const rowLength = keyboardLayout[i].length;
        // 일반 키의 패닝을 -20에서 20 사이의 값으로 정규화
        pan = Math.round(((rowIndex / (rowLength - 1)) * 40) - 20);
        found = true;
        break;
      }
    }

    // 특수 키 설정
    if (!found) {
      switch (key) {
        case 'Space':
          frequency = 300;
          gain = 0.8;
          pan = 0;
          isSpecialKey = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          frequency = 800;
          gain = 0.7;
          pan = key === 'ShiftLeft' ? -30 : 30;
          isSpecialKey = true;
          break;
        case 'CapsLock':
          frequency = 1000;
          gain = 0.7;
          pan = -30;
          isSpecialKey = true;
          break;
        case 'Backspace':
          frequency = 900;
          gain = 0.6;
          pan = 35;
          isSpecialKey = true;
          break;
        case 'Enter':
          frequency = 700;
          gain = 0.7;
          pan = 35;
          isSpecialKey = true;
          break;
        case 'ControlLeft':
        case 'ControlRight':
          frequency = 800;
          gain = 1;
          pan = key === 'ControlLeft' ? -30 : 30;
          break;
        case 'AltLeft':
        case 'AltRight':
          frequency = 800;
          gain = 1;
          pan = key === 'AltLeft' ? -18 : 18;
          break;
      }
    }

    // 주파수 설정
    if ('`1234567890-='.includes(actualKey)) {
      frequency = 1100;
    } else if ('qwertyuiop[]\\'.includes(actualKey)) {
      frequency = 1000;
    } else if ('asdfghjkl;\''.includes(actualKey)) {
      frequency = 900;
    } else if ('zxcvbnm,./'.includes(actualKey)) {
      frequency = 800;
    }

    // console.log(`Key: ${key}, ActualKey: ${actualKey}, Frequency: ${frequency}, Pan: ${pan}, IsSpecial: ${isSpecialKey}`);  // 디버깅용

    return { frequency, pan, gain, isSpecialKey };
  };

  const playKeySound = useCallback((keyType: string) => {
    if (!audioContext || !audioBufferRef.current || !loadedSwitches.has(selectedSwitch)) {
      return;
    }

    // AudioContext가 suspended 상태인 경우 resume
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    try {
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferRef.current;

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(volume * 1.5, audioContext.currentTime);

      const filter = audioContext.createBiquadFilter();
      const panNode = audioContext.createStereoPanner();

      const { frequency, pan, gain, isSpecialKey } = getKeyProperties(keyType);

      // 필터 믹스 노드 추가
      const originalGain = audioContext.createGain();
      const filteredGain = audioContext.createGain();
      const mixerGain = audioContext.createGain();

      if (isSpecialKey) {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
        filter.Q.setValueAtTime(0.1, audioContext.currentTime);

        // 특수 키에 대한 필터 믹스 양 설정 (0에서 1 사이의 값)
        const filterMix = 0.9;
        originalGain.gain.setValueAtTime(1 - filterMix, audioContext.currentTime);
        filteredGain.gain.setValueAtTime(filterMix, audioContext.currentTime);
      } else {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, audioContext.currentTime);

        // 일반 키는 100% 필터링된 신 사용
        originalGain.gain.setValueAtTime(0, audioContext.currentTime);
        filteredGain.gain.setValueAtTime(1, audioContext.currentTime);
      }

      // pan 값을 -1에서 1 사이로 정규화
      panNode.pan.setValueAtTime(pan / 100, audioContext.currentTime);
      gainNode.gain.setValueAtTime(gain * volume * 10, audioContext.currentTime);

      // 연결 구조 변경
      source.connect(originalGain);
      source.connect(filter);
      filter.connect(filteredGain);
      originalGain.connect(mixerGain);
      filteredGain.connect(mixerGain);
      mixerGain.connect(panNode);
      panNode.connect(gainNode);
      gainNode.connect(analyserNodeLeft!);
      gainNode.connect(analyserNodeRight!);
      analyserNodeLeft!.connect(audioContext.destination);
      analyserNodeRight!.connect(audioContext.destination);

      source.start(0);
      source.stop(audioContext.currentTime + 1);

      setEqualizerFrequency(frequency);
      setEqualizerVolume(gain * volume);
      setPanValue(pan);
    } catch (error) {
      console.error('오디오 재생 중 오류 발생:', error);
    }
  }, [audioContext, volume, analyserNodeLeft, analyserNodeRight, selectedSwitch, loadedSwitches]);

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
  }, []);

  const currentSentence = useMemo(() => sentences[currentIndex], [sentences, currentIndex]);

  const handleSwitchChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSwitch = event.target.value;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setSelectedSwitch(newSwitch);
    if (audioContext && !loadedSwitches.has(newSwitch)) {
      loadAudio(newSwitch, audioContext);
    }
    // 스위치 선택 후 타이핑 영역으로 포커스 이동
    if (isMobile) {
      setTimeout(() => {
        const typingInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (typingInput) {
          typingInput.focus();
        }
      }, 300); // 모바일에서 더 긴 딜레이를 설정
    } else {
      // PC에서는 즉시 포커스
      setTimeout(() => {
        const typingInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (typingInput) {
          typingInput.focus();
        }
      }, 0);
    }
  }, [audioContext, loadAudio, loadedSwitches]);

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

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div className={styles.typer}>
      <div className={styles.visualizerContainer}>
        {/* <SimpleEqualizer analyserNode={analyserNodeLeft} /> */}
        <StereoImager
          analyserNodeLeft={analyserNodeLeft}
          analyserNodeRight={analyserNodeRight}
          panValue={panValue}
        />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.sentenceDisplayWrapper}>
          <SentenceDisplay
            sentence={currentSentence}
            currentInput={currentInput}
            correctChars={correctChars}
            lastCompletedCharIndex={lastCompletedCharIndex}
          />
        </div>
        <div className={styles.typingAreaWrapper}>
          <TypingArea
            ref={typingAreaRef}
            sentence={currentSentence.content}
            onComplete={handleSentenceComplete}
            onInputChange={handleInputChange}
            onSkip={handleSkip}
            onPrevious={handlePrevious}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          />
        </div>
      </div>
      <div className={styles.settingIconWrapper} onClick={() => setIsSettingsOpen(true)}>
        <svg className={styles.settingIcon} viewBox="0 0 64 64">
          <use xlinkHref="/images/icon/setting.svg#icon" />
        </svg>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={toggleSettings}
        selectedSwitch={selectedSwitch}
        onSwitchChange={handleSwitchChange}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        switchOptions={switchOptions}
      />
    </div>
  );
}
