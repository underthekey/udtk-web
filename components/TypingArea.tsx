import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useLayoutEffect } from 'react';
import styles from '@/styles/TypingArea.module.css';

interface TypingAreaProps {
  sentence: string;
  onComplete: () => void;
  onInputChange: (input: string, correctChars: number, lastCompletedCharIndex: number) => void;
  onSkip: () => void;
  onPrevious: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  isSettingsOpen: boolean;
  maxLength?: number;
}

export interface TypingAreaRef {
  resetTypingSpeed: () => void;
  resetTypingArea: () => void;
}

const TypingArea = forwardRef<TypingAreaRef, TypingAreaProps>(({
  sentence,
  onComplete,
  onInputChange,
  onSkip,
  onPrevious,
  onKeyDown,
  onKeyUp,
  isSettingsOpen,
  maxLength
}, ref) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCompletedCharIndex, setLastCompletedCharIndex] = useState(-1);
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [finalSpeed, setFinalSpeed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const syllablesTypedRef = useRef(0);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const arrowDownPressedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  const isKoreanSyllable = (char: string) => {
    if (!char) return false; // 빈 문자열 체크
    const code = char.charCodeAt(0);
    return code >= 0xAC00 && code <= 0xD7A3;
  };

  const isEnglishChar = (char: string) => {
    if (!char) return false;
    const code = char.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  };

  const isKoreanJamo = (char: string) => {
    const code = char.charCodeAt(0);
    return (code >= 0x1100 && code <= 0x11FF) || // 한글 자음, 모음
      (code >= 0x3130 && code <= 0x318F);   // 호환용 한글 자음, 모음
  };

  const countKoreanJamo = (char: string) => {
    if (!isKoreanSyllable(char)) return 0;
    const code = char.charCodeAt(0) - 0xAC00;
    const jong = code % 28;
    return jong ? 3 : 2; // 종성이 있으면 3, 없으면 2
  };


  const adjustInputWidth = useCallback(() => {
    if (inputRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        const computedStyle = window.getComputedStyle(inputRef.current);
        context.font = computedStyle.font;
        const textWidth = context.measureText(sentence).width;
        const totalWidth = textWidth + 10;
        inputRef.current.style.width = `${totalWidth}px`;
      }
    }
  }, [sentence]);

  useEffect(() => {
    adjustInputWidth();
    setInput('');
    setLastCompletedCharIndex(-1);
    resetTypingSpeed();
  }, [sentence, adjustInputWidth]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      if (input.length <= (maxLength || Infinity)) {
        if (input.length === 1 && startTimeRef.current === null) {
          startTimeRef.current = Date.now();
          lastUpdateTimeRef.current = Date.now();
          setFinalSpeed(0);
        }
        setInput(input);

        let correctJamo = 0;
        for (let i = 0; i < input.length; i++) {
          if (input[i] === sentence[i]) {
            if (isKoreanSyllable(input[i])) {
              correctJamo += countKoreanJamo(input[i]);
            } else if (isKoreanJamo(input[i]) || isEnglishChar(input[i])) {
              correctJamo += 1;
            }
          } else {
            break;
          }
        }
        syllablesTypedRef.current = correctJamo;

        calculateTypingSpeed();

        let correctChars = 0;
        let newLastCompletedCharIndex = -1;

        for (let i = 0; i < input.length; i++) {
          if (input[i] === sentence[i]) {
            correctChars++;
            newLastCompletedCharIndex = i;
          } else {
            break;
          }
        }

        setLastCompletedCharIndex(newLastCompletedCharIndex);
        onInputChange(input, correctChars, newLastCompletedCharIndex);
      }
    },
    [sentence, onInputChange, maxLength]
  );

  const calculateTypingSpeed = useCallback(() => {
    if (startTimeRef.current === null) return;
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - startTimeRef.current) / 1000;

    if (elapsedSeconds > 0) {
      const cpm = Math.round((syllablesTypedRef.current / elapsedSeconds) * 60);
      setTypingSpeed(Math.min(cpm, 1000));
    }

    lastUpdateTimeRef.current = currentTime;
  }, []);

  useEffect(() => {
    const intervalId = setInterval(calculateTypingSpeed, 100);
    return () => clearInterval(intervalId);
  }, [calculateTypingSpeed]);

  const resetTypingSpeed = useCallback(() => {
    setTypingSpeed(0);
    startTimeRef.current = null;
    lastUpdateTimeRef.current = null;
    syllablesTypedRef.current = 0;
  }, []);

  const resetTypingArea = useCallback(() => {
    setInput('');
    setLastCompletedCharIndex(-1);
    resetTypingSpeed();
    if (inputRef.current) {
      inputRef.current.focus();
    }
    onInputChange('', 0, -1);  // 입력 초기화를 부모 컴포넌트에 알림
  }, [resetTypingSpeed, onInputChange]);

  useImperativeHandle(ref, () => ({
    resetTypingSpeed,
    resetTypingArea
  }));

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl 또는 Command 키와 함께 사용되는 특정 단축키 방지
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y', 'r', 'f', 'p', 's'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      return;
    }

    // Shift + 방향키 조합 방지
    if (e.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // 나머지 키 처리 로직
    if (e.key === 'Escape') {
      e.preventDefault();
      resetTypingArea();
      return;
    }

    if ((e.key === 'Enter' || (e.key === ' ' && input === sentence)) && !isProcessing) {
      if (input === sentence) {
        e.preventDefault();
        setIsProcessing(true);
        setFinalSpeed(typingSpeed);
        onComplete();

        (async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          setInput('');
          setIsProcessing(false);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        })();
      } else {
        if (inputRef.current) {
          inputRef.current.classList.add(styles.incorrect);
          setTimeout(() => {
            inputRef.current?.classList.remove(styles.incorrect);
          }, 200);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!arrowDownPressedRef.current && !debounceTimerRef.current) {
        arrowDownPressedRef.current = true;
        onSkip();
        debounceTimerRef.current = setTimeout(() => {
          debounceTimerRef.current = null;
        }, 200); // 디바운스 시간 설정
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onPrevious();
      setFinalSpeed(0);
      resetTypingSpeed();
    }

    // 모든 키 입력에 대해 onKeyDown 콜백 호출
    if (typeof onKeyDown === 'function') {
      onKeyDown(e);
    }
  }, [input, sentence, isProcessing, onComplete, onSkip, onPrevious, onKeyDown, typingSpeed, resetTypingSpeed, resetTypingArea]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      arrowDownPressedRef.current = false;
    }
    if (typeof onKeyUp === 'function') {
      onKeyUp(e);
    }
  }, [onKeyUp]);

  useEffect(() => {
    if (inputRef.current && !isProcessing) {
      inputRef.current.focus();
    }
  }, [isProcessing, sentence]);

  useLayoutEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [sentence]);

  return (
    <div className={`${styles.typingAreaWrapper} ${visible ? styles.visible : styles.hidden}`}>
      <div className={styles.typingArea}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          placeholder={sentence}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onCopy={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          className={styles.input}
          disabled={isProcessing || isSettingsOpen}
          style={{ caretColor: isSettingsOpen ? 'transparent' : 'auto' }}
          maxLength={maxLength}
          spellCheck="false"
        />
        <div className={styles.typingSpeed}>
          {finalSpeed > 0 ? `${finalSpeed} CPM` : `${typingSpeed} CPM`}
        </div>
      </div>
    </div>
  );
});

export default TypingArea;
