'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Sentence } from '@/app/types';
import SentenceDisplay from './SentenceDisplay';
import TypingArea from './TypingArea';
import AnimatedSentences from './AnimatedSentences';
import styles from '@app/styles/Typer.module.css';

export default function Typer({ initialSentences }: { initialSentences: Sentence[] }) {
  const [sentences, setSentences] = useState<Sentence[]>(initialSentences);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [currentInput, setCurrentInput] = useState('');
  const [lastCompletedIndex, setLastCompletedIndex] = useState(-1);
  const [isCorrect, setIsCorrect] = useState(true);
  const [completedChars, setCompletedChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [lastCompletedCharIndex, setLastCompletedCharIndex] = useState(-1);

  const fetchMoreSentences = useCallback(async () => {
    if (isFetching) return; // 이미 fetch 중이면 중복 요청 방지
    setIsFetching(true);
    console.log('Fetching more sentences...');
    try {
      const res = await fetch('https://sentence.udtk.site/random?count=20', { cache: 'no-store' });
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
    setCurrentInput(''); // 새 문장으로 넘어갈 때 currentInput 초기화
  }, [sentences.length, fetchMoreSentences, isFetching]);

  const currentSentence = useMemo(() => sentences[currentIndex], [sentences, currentIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (input: string, newCorrectChars: number, newLastCompletedCharIndex: number) => {
    setCurrentInput(input);
    setCorrectChars(newCorrectChars);
    setLastCompletedCharIndex(newLastCompletedCharIndex);
  };

  // currentSentence가 변경될 때마다 currentInput과 correctChars 초기화
  useEffect(() => {
    setCurrentInput('');
    setCorrectChars(0);
  }, [currentSentence]);

  return (
    <div className={styles.typer}>
      {showAnimation && <AnimatedSentences sentences={sentences.slice(0, 20)} />}
      {currentSentence && (
        <>
          <SentenceDisplay
            sentence={currentSentence}
            currentInput={currentInput}
            correctChars={correctChars}
            lastCompletedCharIndex={lastCompletedCharIndex}
          />
          <TypingArea
            sentence={currentSentence.content}
            onComplete={handleSentenceComplete}
            onInputChange={handleInputChange}
          />
        </>
      )}
    </div>
  );
}
