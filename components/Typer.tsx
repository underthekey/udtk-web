'use client';

import { useState, useMemo, useCallback } from 'react';
import { Sentence } from '@/app/types';
import SentenceDisplay from './SentenceDisplay';
import TypingArea from './TypingArea';
import styles from '@app/styles/Typer.module.css';

export default function Typer({ initialSentences }: { initialSentences: Sentence[] }) {
  const [sentences, setSentences] = useState<Sentence[]>(initialSentences);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const fetchMoreSentences = useCallback(async () => {
    if (isFetching) return; // 이미 fetch 중이면 중복 요청 방지
    setIsFetching(true);
    console.log('Fetching more sentences...');
    try {
      const res = await fetch('https://sentence.udtk.site/random/20', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch sentences');
      }
      const newSentences = await res.json();
      console.log('Fetched new sentences:', newSentences);
      setSentences(prevSentences => [...prevSentences, ...newSentences]);
    } catch (error) {
      console.error('Error fetching more sentences:', error);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  const handleSentenceComplete = useCallback(() => {
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= sentences.length - 2 && !isFetching) {
        fetchMoreSentences();
      }
      return nextIndex;
    });
  }, [sentences.length, fetchMoreSentences, isFetching]);

  const currentSentence = useMemo(() => sentences[currentIndex], [sentences, currentIndex]);

  return (
    <div className={styles.typer}>
      {currentSentence && (
        <>
          <SentenceDisplay sentence={currentSentence} />
          <TypingArea
            sentence={currentSentence.content}
            onComplete={handleSentenceComplete}
          />
        </>
      )}
      {/* <div>Current: {currentIndex + 1} / Total: {sentences.length}</div> */}
    </div>
  );
}
