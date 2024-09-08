import { useEffect, useState } from 'react';
import { Sentence } from '@/app/types';
import styles from '@/styles/SentenceDisplay.module.css';

interface SentenceDisplayProps {
  sentence: Sentence;
}

export default function SentenceDisplay({ sentence }: SentenceDisplayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [sentence]);

  return (
    <div className={styles.sentenceDisplay}>
      <p className={`${styles.content} ${visible ? styles.visible : ''}`}>{sentence.content}</p>
    </div>
  );
}
