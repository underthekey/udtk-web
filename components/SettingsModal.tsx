import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from '@/styles/SettingsModal.module.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSwitch: string;
    onSwitchChange: (switchName: string) => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
    switchOptions: string[];
    language: string;
    onLanguageChange: () => void;
    playTestSound: (volume: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    selectedSwitch,
    onSwitchChange,
    volume,
    onVolumeChange,
    switchOptions,
    language,
    onLanguageChange,
    playTestSound,
}) => {
    const [tempSelectedSwitch, setTempSelectedSwitch] = useState(selectedSwitch);
    const [tempVolume, setTempVolume] = useState(volume);
    const [tempLanguage, setTempLanguage] = useState(language);

    useEffect(() => {
        if (isOpen) {
            setTempSelectedSwitch(selectedSwitch);
            setTempVolume(volume);
            setTempLanguage(language);
        }
    }, [isOpen, selectedSwitch, volume, language]);

    const handleSwitchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSwitch = event.target.value;
        if (newSwitch !== selectedSwitch) {
            onSwitchChange(newSwitch);
        }
    };

    const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value);
        setTempVolume(newVolume);
        onVolumeChange(newVolume);

        const adjustedVolume = newVolume * 1.5 * 10;
        playTestSound(adjustedVolume);
    }, [onVolumeChange, playTestSound]);

    const handleLanguageChange = useCallback(() => {
        setTempLanguage(prev => prev === 'kor' ? 'eng' : 'kor');
        onLanguageChange();
    }, [onLanguageChange]);

    const [isVisible, setIsVisible] = useState(false);
    const [isContentVisible, setIsContentVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.classList.add('modal-open');
            setTimeout(() => {
                setIsContentVisible(true);
                // 모달이 열릴 때 포커스를 모달로 이동
                modalRef.current?.focus();
            }, 50);
        } else {
            setIsContentVisible(false);
            document.body.classList.remove('modal-open');
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    if (!isVisible) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            e.preventDefault();
            onClose();
        }
    };

    return (
        <div
            className={`${styles.modalOverlay} ${isContentVisible ? styles.open : ''}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`${styles.modalContent} ${isContentVisible ? styles.open : ''}`}
                ref={modalRef}
                tabIndex={-1} // 포커스를 받을 수 있도록 설정
            >
                <div className={styles.modalHeader}>
                    <span className={styles.title}>Setting</span>
                </div>
                <div className={styles.settingItem}>
                    <label htmlFor="switchSelect" className={styles.settingLabel}>Switch</label>
                    <select
                        id="switchSelect"
                        value={selectedSwitch}
                        onChange={handleSwitchChange}
                        className={styles.switchSelect}
                    >
                        {switchOptions.map(option => (
                            <option key={option} value={option}>
                                {option.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.settingItem}>
                    <span className={styles.settingLabel}>Volume</span>
                    <input
                        id="volumeSlider"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={tempVolume}
                        onChange={handleVolumeChange}
                        className={styles.volumeSlider}
                    />
                </div>
                <div className={styles.buttonGroup}>
                    <button onClick={onLanguageChange} className={styles.languageButton}>
                        {language === 'kor' ? 'English' : '한국어'}
                    </button>
                    <button onClick={onClose} className={styles.closeButton}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
