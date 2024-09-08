import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '@/styles/TypingArea.module.css';

interface TypingAreaProps {
  sentence: string;
  onComplete: () => void;
}

export default function TypingArea({ sentence, onComplete }: TypingAreaProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    // requestAnimationFrame을 사용하여 다음 렌더링 주기에 포커스 설정
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [sentence, adjustInputWidth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      if (input === sentence) {
        // 정답일 경우
        setIsProcessing(true);
        if (inputRef.current) {
          inputRef.current.classList.add(styles.correct);
        }
        onComplete(); // 다음 문장으로 즉시 넘어감
        setInput(''); // 입력 필드 초기화

        // 짧은 지연 후 처리 상태 해제
        setTimeout(() => {
          setIsProcessing(false);
          if (inputRef.current) {
            inputRef.current.classList.remove(styles.correct);
            // requestAnimationFrame을 사용하여 다음 렌더링 주기에 포커스 설정
            requestAnimationFrame(() => {
              inputRef.current?.focus();
            });
          }
        }, 300); // 300ms 동안 추가 입력 무시
      } else {
        // 오답일 경우
        if (inputRef.current) {
          inputRef.current.classList.add(styles.incorrect);
          setTimeout(() => {
            inputRef.current?.classList.remove(styles.incorrect);
          }, 200);
        }
      }
    }
  };

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
        disabled={isProcessing} // 처리 중일 때 입력 필드 비활성화
      />
    </div>
  );
}
