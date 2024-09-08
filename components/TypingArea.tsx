import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '@/styles/TypingArea.module.css';

interface TypingAreaProps {
  sentence: string;
  onComplete: () => void;
  onInputChange: (input: string, correctChars: number, lastCompletedCharIndex: number) => void;
}

export default function TypingArea({ sentence, onComplete, onInputChange }: TypingAreaProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastCompletedCharIndex, setLastCompletedCharIndex] = useState(-1);

  const adjustInputWidth = useCallback(() => {
    if (inputRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        const computedStyle = window.getComputedStyle(inputRef.current);
        const font = computedStyle.font;
        context.font = font;
        const textWidth = context.measureText(sentence).width;
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);
        const borderLeft = parseFloat(computedStyle.borderLeftWidth);
        const borderRight = parseFloat(computedStyle.borderRightWidth);

        const totalWidth = textWidth + paddingLeft + paddingRight + borderLeft + borderRight + 5; // 5px 추가 여백
        inputRef.current.style.width = `${totalWidth}px`;
      }
    }
  }, [sentence]);

  useEffect(() => {
    adjustInputWidth();
    setInput('');
    setLastCompletedCharIndex(-1);
    focusInput();
  }, [sentence, adjustInputWidth]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);

    let correctChars = 0;
    let newLastCompletedCharIndex = lastCompletedCharIndex;

    for (let i = 0; i <= newLastCompletedCharIndex; i++) {
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
  };

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
    }
  };

  // 컴포넌트가 마운트되거나 업데이트될 때마다 포커스를 유지
  useEffect(() => {
    focusInput();
  });

  return (
    <div className={styles.typingArea}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        placeholder={sentence}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={styles.input}
        disabled={isProcessing}
        onBlur={focusInput} // 포커스를 잃었을 때 다시 포커스
      />
    </div>
  );
}
