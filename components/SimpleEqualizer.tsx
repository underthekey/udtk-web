import React, { useEffect, useRef } from 'react';
import styles from '@/styles/SimpleEqualizer.module.css';

interface SimpleEqualizerProps {
    analyserNode: AnalyserNode | null;
}

const SimpleEqualizer: React.FC<SimpleEqualizerProps> = ({ analyserNode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const previousDataRef = useRef<Uint8Array | null>(null);

    useEffect(() => {
        if (!analyserNode) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        const bufferLength = analyserNode.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        previousDataRef.current = new Uint8Array(bufferLength);

        // CSS 변수에서 색상 가져오기
        const mainColor = getComputedStyle(document.documentElement).getPropertyValue('--main-text-color').trim();

        const draw = () => {
            requestAnimationFrame(draw);

            analyserNode.getByteFrequencyData(dataArrayRef.current!);

            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                // 현재 값과 이전 값 중 큰 값을 사용하되, 천천히 감소시킵니다.
                const value = Math.max(dataArrayRef.current![i], (previousDataRef.current![i] * 0.995));
                previousDataRef.current![i] = value;

                const barHeight = value / 2;

                // 메인 색상 사용
                ctx.fillStyle = mainColor;
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    }, [analyserNode]);

    return (
        <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className={styles.equalizer}
        />
    );
};

export default SimpleEqualizer;