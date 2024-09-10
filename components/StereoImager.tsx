import React, { useEffect, useRef } from 'react';
import styles from '@/styles/StereoImager.module.css';

interface StereoImagerProps {
    analyserNodeLeft: AnalyserNode | null;
    analyserNodeRight: AnalyserNode | null;
    panValue: number;  // 패닝 값
}

const DECAY_SPEED = 0.001;

const StereoImager: React.FC<StereoImagerProps> = ({ analyserNodeLeft, analyserNodeRight, panValue }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previousDataRef = useRef<Float32Array | null>(null);

    useEffect(() => {
        if (!analyserNodeLeft || !analyserNodeRight) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        const bufferLength = analyserNodeLeft.frequencyBinCount;
        const dataArrayLeft = new Float32Array(bufferLength);
        const dataArrayRight = new Float32Array(bufferLength);

        if (!previousDataRef.current) {
            previousDataRef.current = new Float32Array(bufferLength * 2);
        }

        const draw = () => {
            requestAnimationFrame(draw);

            analyserNodeLeft.getFloatFrequencyData(dataArrayLeft);
            analyserNodeRight.getFloatFrequencyData(dataArrayRight);

            ctx.clearRect(0, 0, width, height);

            // 반원 그리기
            ctx.beginPath();
            ctx.arc(width / 2, height, width / 2, Math.PI, 0);
            ctx.strokeStyle = 'rgba(0, 48, 73, 0.5)';
            ctx.stroke();

            // 주파수 데이터 그리기
            for (let i = 0; i < bufferLength; i++) {
                const leftValue = Math.max((dataArrayLeft[i] + 140) / 140, 0);
                const rightValue = Math.max((dataArrayRight[i] + 140) / 140, 0);

                const prevLeftValue = previousDataRef.current[i * 2];
                const prevRightValue = previousDataRef.current[i * 2 + 1];

                const currentLeftValue = Math.max(leftValue, prevLeftValue * (1 - DECAY_SPEED));
                const currentRightValue = Math.max(rightValue, prevRightValue * (1 - DECAY_SPEED));

                previousDataRef.current[i * 2] = currentLeftValue;
                previousDataRef.current[i * 2 + 1] = currentRightValue;

                const angle = (i / bufferLength) * Math.PI;

                // 전달받은 패닝 값을 시각적으로 반영
                const stereoPower = panValue;  // 패닝 값 반영
                const intensity = (currentLeftValue + currentRightValue) / 2;
                const radius = (height / 2) * (0.1 + intensity * 0.9);

                const x = width / 2 + Math.cos(angle) * radius * (1 + stereoPower * 2);  // 패닝 값 강화
                const y = height - Math.sin(angle) * radius;

                // 점 그리기
                ctx.beginPath();
                ctx.arc(x, y, 2 + intensity * 2, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(0, 48, 73, ${0.5 + intensity * 0.5})`;
                ctx.fill();
            }
        };

        draw();
    }, [analyserNodeLeft, analyserNodeRight, panValue]);  // 패닝 값 변화 감지

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={300}
            className={styles.stereoImager}
        />
    );
};

export default StereoImager;
