'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sentence } from '@/app/types';
import SentenceDisplay from './SentenceDisplay';
import TypingArea from './TypingArea';
import AnimatedSentences from './AnimatedSentences';
import styles from '@/styles/Typer.module.css';

export default function Typer({ initialSentences }: { initialSentences: Sentence[] }) {
  const [sentences, setSentences] = useState<Sentence[]>(initialSentences);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [lastCompletedCharIndex, setLastCompletedCharIndex] = useState(-1);
  const [showAnimation, setShowAnimation] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchMoreSentences = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const res = await fetch('https://sentence.udtk.site/random?count=20', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch sentences');
      }
      const newSentences = await res.json();
      setSentences(prevSentences => [...prevSentences, ...newSentences]);
    } catch (error) {
      console.error('Error fetching more sentences:', error);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  const moveToNextSentence = useCallback(async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= sentences.length - 2 && !isFetching) {
      await fetchMoreSentences();
    }
    setCurrentIndex(nextIndex);
    setCurrentInput('');
    setCorrectChars(0);
    setLastCompletedCharIndex(-1);
  }, [currentIndex, sentences.length, isFetching, fetchMoreSentences]);

  const handleSentenceComplete = useCallback(() => {
    moveToNextSentence();
  }, [moveToNextSentence]);

  const handleSkip = useCallback(async () => {
    if (currentIndex < sentences.length - 1) {
      await moveToNextSentence();
    }
  }, [currentIndex, sentences.length, moveToNextSentence]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
      setCurrentInput('');
      setCorrectChars(0);
      setLastCompletedCharIndex(-1);
    }
  }, [currentIndex]);

  const handleInputChange = useCallback((input: string, newCorrectChars: number, newLastCompletedCharIndex: number) => {
    setCurrentInput(input);
    setCorrectChars(newCorrectChars);
    setLastCompletedCharIndex(newLastCompletedCharIndex);
  }, []);

  const currentSentence = useMemo(() => sentences[currentIndex], [sentences, currentIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log('Current index:', currentIndex);
    console.log('Sentences length:', sentences.length);
    console.log('Is fetching:', isFetching);
  }, [currentIndex, sentences.length, isFetching]);

  return (
    <div className={styles.typer}>
      {showAnimation && <AnimatedSentences sentences={sentences.slice(0, 20)} />}
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
        onSkip={handleSkip}
        onPrevious={handlePrevious}
      />
    </div>
  );
}
