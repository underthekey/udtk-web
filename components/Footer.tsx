import React from 'react';
import styles from '@/styles/Footer.module.css';

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.githubIconWrapper}>
                <a href="https://github.com/underthekey" target="_blank" rel="noopener noreferrer">
                    <svg className={styles.githubIcon} viewBox="0 0 24 24">
                        <use xlinkHref="/images/icon/github.svg#icon" />
                    </svg>
                </a>
            </div>
        </footer>
    );
};

export default Footer;
