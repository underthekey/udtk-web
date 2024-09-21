import React, { useEffect, useState } from 'react';
import styles from '@/styles/SettingsModal.module.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSwitch: string;
    onSwitchChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    volume: number;
    onVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    switchOptions: string[];
    language: string;
    onLanguageChange: () => void;
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
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isContentVisible, setIsContentVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setIsContentVisible(true), 50);
        } else {
            setIsContentVisible(false);
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
            onClose();
        }
    };

    return (
        <div
            className={`${styles.modalOverlay} ${isContentVisible ? styles.open : ''}`}
            onClick={handleOverlayClick}
        >
            <div className={`${styles.modalContent} ${isContentVisible ? styles.open : ''}`}>
                <div className={styles.modalHeader}>
                    <span className={styles.title}>Setting</span>
                </div>
                <div className={styles.settingItem}>
                    <label htmlFor="switchSelect" className={styles.settingLabel}>Switch</label>
                    <select
                        id="switchSelect"
                        value={selectedSwitch}
                        onChange={onSwitchChange}
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
                        value={volume}
                        onChange={onVolumeChange}
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
