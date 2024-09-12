import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, forwardRef, ForwardedRef } from 'react';
import styles from '@/styles/TypingArea.module.css';

interface TypingAreaProps {
  sentence: string;
  onComplete: () => void;
  onInputChange: (input: string, correctChars: number, lastCompletedCharIndex: number) => void;
  onSkip: () => void;
  onPrevious: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TypingArea = forwardRef(({
  sentence,
  onComplete,
  onInputChange,
  onSkip,
  onPrevious,
  onKeyDown,
  onKeyUp
}: TypingAreaProps, ref: ForwardedRef<HTMLInputElement>) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastCompletedCharIndex, setLastCompletedCharIndex] = useState(-1);
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
        const totalWidth = textWidth + 10; // 10px 여유 공간 추가
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
      const newInput = e.target.value;
      setInput(newInput);

      let correctChars = 0;
      let newLastCompletedCharIndex = lastCompletedCharIndex;

      for (let i = 0; i < newInput.length; i++) {
        if (newInput[i] === sentence[i]) {
          correctChars++;
        } else {
          break;
        }
      }

      if (newInput.length > lastCompletedCharIndex + 1) {
        newLastCompletedCharIndex = newInput.length - 1;
        setLastCompletedCharIndex(newLastCompletedCharIndex);
      }

      onInputChange(newInput, correctChars, newLastCompletedCharIndex);
    },
    [sentence, lastCompletedCharIndex, onInputChange]
  );

  const debouncedSkip = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onSkip();
    }, 200); // 디바운스 타임 적용
  }, [onSkip]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      if (input === sentence) {
        setIsProcessing(true);
        if (inputRef.current) {
          inputRef.current.classList.add(styles.correct);
        }
        onComplete();
        setInput('');

        setTimeout(() => {
          setIsProcessing(false);
          if (inputRef.current) {
            inputRef.current.classList.remove(styles.correct);
            focusInput();
          }
        }, 300);
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
      debouncedSkip();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onPrevious();
    }
  };

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

  return (
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
        disabled={isProcessing}
      />
    </div>
  );
});

export default TypingArea;
