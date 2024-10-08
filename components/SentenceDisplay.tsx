import { useEffect, useState, useCallback } from 'react';
import { Sentence } from '@/app/types';
import styles from '@/styles/SentenceDisplay.module.css';

interface SentenceDisplayProps {
  sentence: Sentence;
  nextSentence: Sentence | null; // 다음 문장 추가
  currentInput: string;
  correctChars: number;
  lastCompletedCharIndex: number;
}

export default function SentenceDisplay({ sentence, nextSentence, currentInput, correctChars, lastCompletedCharIndex }: SentenceDisplayProps) {
  const [nextVisible, setNextVisible] = useState(false);

  useEffect(() => {
    setNextVisible(false);
    const nextTimer = setTimeout(() => setNextVisible(true), 100);
    return () => {
      clearTimeout(nextTimer);
    };
  }, [sentence, nextSentence]);

  const preventSelection = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className={styles.sentenceDisplay}
      onMouseDown={preventSelection}
      onTouchStart={preventSelection}
    >
      <div className={styles.sentenceWrapper}>
        {nextSentence && (
          <p className={`${styles.nextSentence} ${styles.noSelect} ${nextVisible ? styles.fadeIn : ''}`}>
            {nextSentence.content}
          </p>
        )}
        <p
          className={`${styles.content} ${styles.noSelect}`}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
        >
          {sentence.content.split('').map((char, index) => {
            let className = '';
            if (index < currentInput.length - 1) {
              if (currentInput[index] !== char) {
                className = char === ' ' ? styles.incorrectSpace : styles.incorrect;
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
    </div>
  );
}
