import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, forwardRef } from 'react';
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

const TypingArea = forwardRef<HTMLInputElement, TypingAreaProps>(({
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
  const charactersTypedRef = useRef(0);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이핑 영역 너비 조정
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
  }, [sentence, adjustInputWidth]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  // 타이핑 입력 값 변경 처리 (디바운스 적용)
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      // 최대 길이를 초과하지 않는 경우에만 입력 처리
      if (input.length <= (maxLength || Infinity)) {
        if (input.length === 1 && startTimeRef.current === null) {
          startTimeRef.current = Date.now();
          lastUpdateTimeRef.current = Date.now();
          setFinalSpeed(0); // 새로운 입력 시작 시 finalSpeed 리셋
        }
        const currentTime = Date.now();
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
          lastUpdateTimeRef.current = currentTime;
          setFinalSpeed(0); // 새로운 입력 시작 시 finalSpeed 리셋
        }
        charactersTypedRef.current = input.length;
        setInput(input);

        // 입력이 있을 때마다 속도 계산
        calculateTypingSpeed();

        let correctChars = 0;
        let newLastCompletedCharIndex = -1;

        for (let i = 0; i < input.length - 1; i++) {
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

  const debouncedSkip = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onSkip();
    }, 200); // 디바운스 타임 적용
  }, [onSkip]);

  const calculateTypingSpeed = useCallback(() => {
    if (startTimeRef.current === null) return;
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - startTimeRef.current) / 1000;

    if (elapsedSeconds > 0) {
      const cpm = Math.round((charactersTypedRef.current / elapsedSeconds) * 60);
      setTypingSpeed(Math.min(cpm, 1000));
    }

    lastUpdateTimeRef.current = currentTime;
  }, []);

  useEffect(() => {
    const intervalId = setInterval(calculateTypingSpeed, 100); // 100ms마다 업데이트
    return () => clearInterval(intervalId);
  }, [calculateTypingSpeed]);

  const resetTypingSpeed = useCallback(() => {
    setTypingSpeed(0);
    startTimeRef.current = null;
    lastUpdateTimeRef.current = null;
    charactersTypedRef.current = 0;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || (e.key === ' ' && input === sentence)) && !isProcessing) {
      if (input === sentence) {
        setIsProcessing(true);
        setFinalSpeed(typingSpeed); // 최종 속도 저장
        onComplete();
        setInput('');

        (async () => {
          await new Promise(resolve => setTimeout(resolve, 300));
          setIsProcessing(false);
          if (inputRef.current) {
            inputRef.current.focus();
          }
          // resetTypingSpeed를 여기서 호출하지 않습니다.
        })();
      } else {
        if (inputRef.current) {
          inputRef.current.classList.add(styles.incorrect);
          setTimeout(() => {
            inputRef.current?.classList.remove(styles.incorrect);
          }, 200);
        }
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      debouncedSkip();
      setFinalSpeed(0);
      resetTypingSpeed();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onPrevious();
      setFinalSpeed(0);
      resetTypingSpeed();
    }

    // 다른 키 입력 시 onKeyDown 호출
    if (typeof onKeyDown === 'function') {
      onKeyDown(e);
    }
  }, [input, sentence, isProcessing, onComplete, debouncedSkip, onPrevious, onKeyDown, typingSpeed]);

  // 포커스 유지를 위한 useEffect 추가
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

  // 새로운 useEffect 추가
  useEffect(() => {
    if (!isProcessing && input === '') {
      resetTypingSpeed();
    }
  }, [isProcessing, input, resetTypingSpeed]);

  return (
    <div className={styles.typingAreaWrapper}>
      <div className={styles.typingArea}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          placeholder={sentence}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={onKeyUp}
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
