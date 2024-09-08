import { useEffect, useState } from 'react';
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

  return (
    <div className={styles.sentenceDisplay}>
      <p className={`${styles.content} ${visible ? styles.visible : ''}`}>
        {sentence.content.split('').map((char, index) => {
          let className = '';
          if (index < currentInput.length) {
            if (index < lastCompletedCharIndex) {
              className = currentInput[index] !== char ? styles.incorrect : '';
            }
          }
          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </p>
    </div>
  );
}
