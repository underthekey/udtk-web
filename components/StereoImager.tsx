import React, { useEffect, useRef, useState } from 'react';
import styles from '@/styles/StereoImager.module.css';

interface StereoImagerProps {
    analyserNodeLeft: AnalyserNode | null;
    analyserNodeRight: AnalyserNode | null;
    panValue: number;  // 패닝 값
}

const RISE_SPEED = 0.01; // 상향 attack
const DECAY_SPEED = 0.005; // 하향 decay

const StereoImager: React.FC<StereoImagerProps> = ({ analyserNodeLeft, analyserNodeRight, panValue }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 300 });
    const previousDataRef = useRef<Float32Array | null>(null);
    const animationIdRef = useRef<number | null>(null);  // 애니메이션 프레임 ID 저장
    const dataArrayLeft = useRef<Float32Array | null>(null);  // 재사용할 수 있도록 useRef로 관리
    const dataArrayRight = useRef<Float32Array | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setCanvasSize({
                width: window.innerWidth,
                height: window.innerHeight, // 높이를 화면 높이의 절반으로 설정
            });
        };

        handleResize(); // 초기 크기 설정
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (!analyserNodeLeft || !analyserNodeRight) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvasSize.width;
        const height = canvasSize.height;

        const bufferLength = analyserNodeLeft.frequencyBinCount;

        // dataArrayLeft와 dataArrayRight가 없을 경우 초기화
        if (!dataArrayLeft.current) {
            dataArrayLeft.current = new Float32Array(bufferLength);
            dataArrayRight.current = new Float32Array(bufferLength);
        }

        if (!previousDataRef.current) {
            previousDataRef.current = new Float32Array(bufferLength * 2);
        }

        const draw = () => {
            animationIdRef.current = requestAnimationFrame(draw);  // 애니메이션 프레임 저장

            analyserNodeLeft.getFloatFrequencyData(dataArrayLeft.current!);
            analyserNodeRight.getFloatFrequencyData(dataArrayRight.current!);

            ctx.clearRect(0, 0, width, height);

            // 반원 그리기
            // ctx.beginPath();
            // ctx.arc(width / 2, height, width / 2, Math.PI, 0);
            // ctx.strokeStyle = 'rgba(0, 48, 73, 0.5)';
            // ctx.stroke();

            const step = Math.ceil(bufferLength / 270); // 약 180개의 점만 그리도록 설정

            for (let i = 0; i < bufferLength; i += step) {
                const leftValue = Math.max((dataArrayLeft.current![i] + 140) / 140, 0);
                const rightValue = Math.max((dataArrayRight.current![i] + 140) / 140, 0);

                const prevLeftValue = previousDataRef.current?.[i * 2] ?? 0;
                const prevRightValue = previousDataRef.current?.[i * 2 + 1] ?? 0;

                // 임계값 추가
                const threshold = 0.1;
                const currentLeftValue = leftValue > prevLeftValue
                    ? Math.min(prevLeftValue + RISE_SPEED, leftValue) // 부드럽게 상승
                    : prevLeftValue > threshold ? Math.max(prevLeftValue - DECAY_SPEED, 0) : 0;
                const currentRightValue = rightValue > prevRightValue
                    ? Math.min(prevRightValue + RISE_SPEED, rightValue) // 부드럽게 상승
                    : prevRightValue > threshold ? Math.max(prevRightValue - DECAY_SPEED, 0) : 0;

                if (previousDataRef.current) {
                    previousDataRef.current[i * 2] = currentLeftValue;
                    previousDataRef.current[i * 2 + 1] = currentRightValue;
                }

                const angle = (i / bufferLength) * Math.PI;

                // 패닝 값을 사용하여 좌우 강도 계산
                const panFactor = (panValue + 1) / 2;
                const leftIntensity = currentLeftValue * (1 - panFactor * 0.5);
                const rightIntensity = currentRightValue * (0.5 + panFactor * 0.5);

                // 중앙 강도 계산 추가
                const centerIntensity = (leftIntensity + rightIntensity) / 2;

                // 점 그리기 함수 수정
                const drawPoint = (intensity: number, side: number) => {
                    const maxRadius = (height / 2) * 0.95; // 최대 반지름을 반원 크기의 95%로 제한
                    const radius = Math.min(maxRadius, Math.max((height / 2) * (0.1 + intensity * 0.9), 0));
                    const adjustedAngle = Math.PI - angle; // 각도 조정
                    const x = width / 2 + Math.cos(adjustedAngle) * radius * side;
                    const y = height - Math.sin(adjustedAngle) * radius;

                    ctx.beginPath();
                    ctx.arc(x, y, Math.max(2 + intensity * 2, 0), 0, 2 * Math.PI);
                    ctx.fillStyle = `rgba(0, 48, 73, ${0.3 + intensity * 0.7})`;
                    ctx.fill();
                };

                drawPoint(leftIntensity, 1);  // 왼쪽
                drawPoint(rightIntensity, -1);  // 오른쪽

                // 중앙 포인트 그리기 수정
                const drawCenterPoint = () => {
                    const maxRadius = (height / 2) * 0.95;
                    const radius = Math.min(maxRadius, Math.max((height / 2) * (0.1 + centerIntensity * 0.9), 0));
                    const adjustedAngle = Math.PI - angle;
                    const x = width / 2 + Math.cos(adjustedAngle) * radius * panValue * 0.2;
                    const y = height - Math.sin(adjustedAngle) * radius;

                    ctx.beginPath();
                    ctx.arc(x, y, Math.max(1 + centerIntensity * 2, 0), 0, 2 * Math.PI);
                    ctx.fillStyle = `rgba(0, 48, 73, ${0.2 + centerIntensity * 0.5})`;
                    ctx.fill();
                };

                drawCenterPoint();

                // 연결선 그리기 수정
                if (i % 4 === 0) {
                    const maxRadius = (height / 2) * 0.95;
                    const leftRadius = Math.min(maxRadius, Math.max((height / 2) * (0.1 + leftIntensity * 0.9), 0));
                    const rightRadius = Math.min(maxRadius, Math.max((height / 2) * (0.1 + rightIntensity * 0.9), 0));
                    const adjustedAngle = Math.PI - angle;
                    const leftX = width / 2 - Math.cos(adjustedAngle) * leftRadius;
                    const rightX = width / 2 + Math.cos(adjustedAngle) * rightRadius;
                    const y = height - Math.sin(adjustedAngle) * ((leftRadius + rightRadius) / 2);

                    ctx.beginPath();
                    ctx.moveTo(leftX, y);
                    ctx.lineTo(rightX, y);
                    ctx.strokeStyle = `rgba(0, 48, 73, ${0.1 + (leftIntensity + rightIntensity) * 0.2})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        };

        draw();

        // 컴포넌트 언마운트 시 애니메이션 중지
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [analyserNodeLeft, analyserNodeRight, panValue, canvasSize]);

    return (
        <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className={styles.stereoImager}
        />
    );
};

export default StereoImager;
