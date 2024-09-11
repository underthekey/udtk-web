import { useEffect, useState, useCallback } from 'react';
import { Sentence } from '@/app/types';
import styles from '@/styles/SentenceDisplay.module.css';

interface SentenceDisplayProps {
  sentence: Sentence;
  currentInput: string;
  correctChars: number;
  lastCompletedCharIndex: number;
}

export default function SentenceDisplay({ sentence, currentInput, correctChars, lastCompletedCharIndex }: SentenceDisplayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [sentence]);

  const preventSelection = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className={styles.sentenceDisplay}
      onMouseDown={preventSelection}
      onTouchStart={preventSelection}
    >
      <p
        className={`${styles.content} ${visible ? styles.visible : ''} ${styles.noSelect}`}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
      >
        {sentence.content.split('').map((char, index) => {
          let className = '';
          if (index < currentInput.length) {
            if (index < lastCompletedCharIndex) {
              if (currentInput[index] !== char) {
                className = char === ' ' ? styles.incorrectSpace : styles.incorrect;
              }
            }
          }
          return (
            <span key={index} className={className}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </p>
    </div>
  );
}
