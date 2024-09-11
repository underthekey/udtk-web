import { useEffect, useState } from 'react';
import { Sentence } from '@/app/types';
import styles from '@/styles/AnimatedSentences.module.css';

interface AnimatedSentencesProps {
    sentences: Sentence[];
    shouldAnimate: boolean;
}

export default function AnimatedSentences({ sentences, shouldAnimate }: AnimatedSentencesProps) {
    const [visibleSentences, setVisibleSentences] = useState<Sentence[]>([]);

    useEffect(() => {
        if (!shouldAnimate) {
            setVisibleSentences([]);
            return;
        }

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
    }, [sentences, shouldAnimate]);

    if (!shouldAnimate) return null;

    return (
        <div className={styles.animatedSentences}>
            {visibleSentences.map((sentence, index) => (
                <div
                    key={sentence?.id || index}
                    className={styles.animatedSentence}
                    style={{
                        animationDelay: `${index * 0.05}s`,
                        fontFamily: 'var(--font-family)',
                    }}
                >
                    {sentence?.content || ''}
                </div>
            ))}
        </div>
    );
}
