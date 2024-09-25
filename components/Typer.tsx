'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sentence } from '@/app/types';
import SentenceDisplay from './SentenceDisplay';
import TypingArea from './TypingArea';
import SimpleEqualizer from './SimpleEqualizer';
import StereoImager from './StereoImager';
import styles from '@/styles/Typer.module.css';
import Image from 'next/image';
import SettingsModal from './SettingsModal';
import { TypingAreaRef } from './TypingArea';

const switchOptions = [
  'None',
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [lastCompletedCharIndex, setLastCompletedCharIndex] = useState(-1);
  const [isFetching, setIsFetching] = useState(false);

  const [selectedSwitch, setSelectedSwitch] = useState<string>('Default');
  const [volume, setVolume] = useState(0.5);
  const [language, setLanguage] = useState<'kor' | 'eng'>('kor');

  const typingAreaRef = useRef<TypingAreaRef>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const [equalizerFrequency, setEqualizerFrequency] = useState(0);
  const [equalizerVolume, setEqualizerVolume] = useState(0);

  const [analyserNodeLeft, setAnalyserNodeLeft] = useState<AnalyserNode | null>(null);
  const [analyserNodeRight, setAnalyserNodeRight] = useState<AnalyserNode | null>(null);
  const [panValue, setPanValue] = useState(0);  // 패닝 값 상태 추가
  const [loadedSwitches, setLoadedSwitches] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [koreanSentences, setKoreanSentences] = useState<Sentence[]>(initialSentences);
  const [englishSentences, setEnglishSentences] = useState<Sentence[]>([]);

  const sentences = useMemo(() => language === 'kor' ? koreanSentences : englishSentences, [language, koreanSentences, englishSentences]);

  const fetchSentences = useCallback(async (lang: 'kor' | 'eng', count: number) => {
    const url = lang === 'kor'
      ? 'https://sentence.underthekey.com/random?count=' + count
      : 'https://sentence.underthekey.com/language?language=eng&count=' + count;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch sentences');
    }
    return res.json();
  }, []);

  const [isLanguageChanging, setIsLanguageChanging] = useState(false);

  const handleLanguageChange = useCallback(async () => {
    setIsLanguageChanging(true);
    setLanguage(prev => {
      const newLang = prev === 'kor' ? 'eng' : 'kor';
      if (newLang === 'eng' && englishSentences.length === 0) {
        fetchSentences('eng', 20).then(newSentences => {
          setEnglishSentences(newSentences);
          setCurrentIndex(0);
          setIsLanguageChanging(false);
        });
      } else if (newLang === 'kor' && koreanSentences.length === 0) {
        fetchSentences('kor', 20).then(newSentences => {
          setKoreanSentences(newSentences);
          setCurrentIndex(0);
          setIsLanguageChanging(false);
        });
      } else {
        setCurrentIndex(0);
        setIsLanguageChanging(false);
      }
      if (typingAreaRef.current) {
        typingAreaRef.current.resetTypingSpeed();
      }
      return newLang;
    });
  }, [englishSentences.length, koreanSentences.length, fetchSentences]);

  const [audioBuffers, setAudioBuffers] = useState<{ [key: string]: AudioBuffer }>({});

  // loadAudio 함수 수정
  const loadAudio = useCallback(async (switchName: string, context: AudioContext, retryCount = 3) => {
    if (switchName === 'None') {
      return;
    }

    if (audioBuffers[switchName]) {
      audioBufferRef.current = audioBuffers[switchName];
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://storage.underthekey.com/switches/sounds/${switchName}.mp3`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      setAudioBuffers(prev => ({ ...prev, [switchName]: audioBuffer }));
      setLoadedSwitches(prev => new Set(prev).add(switchName));
    } catch (error) {
      console.error(`오디오 로드 실패 (${switchName}):`, error);
      if (switchName !== 'Default' && retryCount > 0) {
        console.log('Default 스위치로 fallback');
        await loadAudio('Default', context, retryCount - 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [audioBuffers]);

  // AudioContext 초기화를 즉시 실행
  useEffect(() => {
    const newContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(newContext);
  }, []);

  // 선택된 스위치의 오디오 로드
  useEffect(() => {
    if (audioContext && selectedSwitch) {
      loadAudio(selectedSwitch, audioContext);
    }
  }, [audioContext, selectedSwitch, loadAudio]);

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
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          frequency = 800;
          gain = 0.8;
          pan = 35;
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

    // AudioContext가 suspended 상태인 경 resume
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

        // 일반 키는 100% 필터링 신 사용
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

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('volume', newVolume.toString());
  }, []);

  const fetchMoreSentences = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const newSentences = await fetchSentences(language, 20);
      if (language === 'kor') {
        setKoreanSentences(prevSentences => [...prevSentences, ...newSentences]);
      } else {
        setEnglishSentences(prevSentences => [...prevSentences, ...newSentences]);
      }
    } catch (error) {
      console.error('Error fetching more sentences:', error);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, language, fetchSentences]);

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

  const currentSentence = useMemo(() => sentences[currentIndex] || { content: '', author: null }, [sentences, currentIndex]);

  const handleInputChange = useCallback((input: string, newCorrectChars: number, newLastCompletedCharIndex: number) => {
    // 현재 문장 길이를 초과하지 않는 경우에만 입력 업데이트
    if (input.length <= currentSentence.content.length) {
      setCurrentInput(input);
      setCorrectChars(newCorrectChars);
      setLastCompletedCharIndex(newLastCompletedCharIndex);
    }
  }, [currentSentence.content.length]);

  const handleSwitchChange = useCallback((newSwitch: string) => {
    if (newSwitch !== selectedSwitch) {
      setSelectedSwitch(newSwitch);
      localStorage.setItem('selectedSwitch', newSwitch);
    }
  }, [selectedSwitch]);

  const handleSaveSettings = useCallback((settings: { selectedSwitch: string; volume: number; language: string }) => {
    setSelectedSwitch(settings.selectedSwitch);
    setVolume(settings.volume);
    setLanguage(settings.language as 'kor' | 'eng');

    localStorage.setItem('selectedSwitch', settings.selectedSwitch);
    localStorage.setItem('volume', settings.volume.toString());
    localStorage.setItem('language', settings.language);

  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      typingAreaRef.current?.resetTypingArea();
    }
    playKeySound(event.code);
  }, [playKeySound]);

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

  useEffect(() => {
    const focusTypingArea = () => {
      if (!isSettingsOpen && !isMobileDevice()) {
        const typingInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (typingInput) {
          typingInput.focus();
        }
      }
    };

    // 컴포넌트가 마운트될 때 포커스
    focusTypingArea();

    // 윈도우가 포커스를 받을 때마다 포커스
    window.addEventListener('focus', focusTypingArea);

    // 마우스 클릭 이벤트 리스너 추가
    document.addEventListener('click', focusTypingArea);

    return () => {
      window.removeEventListener('focus', focusTypingArea);
      document.removeEventListener('click', focusTypingArea);
    };
  }, [isSettingsOpen]);

  // 모바일 기기 감지 함수 추가
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  useEffect(() => {
    // 클라이언트 사이드에서만 localStorage에 접근
    const storedSwitch = localStorage.getItem('selectedSwitch');
    if (!storedSwitch) {
      localStorage.setItem('selectedSwitch', 'Default');
    }
    setSelectedSwitch(storedSwitch || 'Default');

    const storedVolume = localStorage.getItem('volume');
    setVolume(storedVolume ? parseFloat(storedVolume) : 0.5);

    setLanguage((localStorage.getItem('language') as 'kor' | 'eng') || 'kor');
  }, []);

  const playTestSound = useCallback((newVolume: number) => {
    if (audioContext && audioBufferRef.current) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferRef.current;

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(newVolume * 2, audioContext.currentTime);

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);
    }
  }, [audioContext]);

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
            nextSentence={sentences[currentIndex + 1] || null}
            currentInput={currentInput}
            correctChars={correctChars}
            lastCompletedCharIndex={lastCompletedCharIndex}
          />
        </div>
        <div className={styles.typingAreaWrapper}>
          {isLanguageChanging ? (
            <div>언어 변경 중...</div>
          ) : (
            <TypingArea
              ref={typingAreaRef}
              sentence={currentSentence?.content || ''}
              onComplete={handleSentenceComplete}
              onInputChange={handleInputChange}
              onSkip={handleSkip}
              onPrevious={handlePrevious}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              isSettingsOpen={isSettingsOpen}
              maxLength={currentSentence?.content.length} // 최대 입력 길이 추가
            />
          )}
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
        language={language}
        onLanguageChange={handleLanguageChange}
        playTestSound={playTestSound}
      />
    </div>
  );
}
