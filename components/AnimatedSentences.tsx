import { useEffect, useState } from 'react';
import { Sentence } from '@/app/types';
import styles from '@/styles/AnimatedSentences.module.css';

interface AnimatedSentencesProps {
    sentences: Sentence[];
}

export default function AnimatedSentences({ sentences }: AnimatedSentencesProps) {
    const [visibleSentences, setVisibleSentences] = useState<Sentence[]>([]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < sentences.length) {
                setVisibleSentences(prev => [...prev, sentences[index]]);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 10);

        return () => clearInterval(interval);
    }, [sentences]);

    return (
        <div className={styles.animatedSentences}>
            {visibleSentences.map((sentence, index) => (
                <div
                    key={sentence?.id || index}
                    className={styles.animatedSentence}
                    style={{
                        animationDelay: `${index * 0.05}s`,
                        fontFamily: 'var(--font-family)', // SentenceDisplay와 동일한 글꼴 사용
                    }}
                >
                    {sentence?.content || ''}
                </div>
            ))}
        </div>
    );
}
