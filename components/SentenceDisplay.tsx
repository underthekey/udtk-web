import { Sentence } from '@/app/types';
import styles from '@/styles/SentenceDisplay.module.css';

interface SentenceDisplayProps {
  sentence: Sentence;
}

export default function SentenceDisplay({ sentence }: SentenceDisplayProps) {
  return (
    <div className={styles.sentenceDisplay}>
      <p className={styles.content}>{sentence.content}</p>
      {sentence.author && <p className={styles.author}>- {sentence.author}</p>}
    </div>
  );
}
