"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">
          <div className={styles.logoContainer}>
            <div className={styles.logoImageWrapper}>
              <Image
                src="/images/logo-line-ivory.png"
                alt="underthekey logo"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'contain' }}
                className={styles.logoImage}
              />
            </div>
            <span className={styles.logoText}>underthekey</span>
          </div>
        </Link>
      </div>
      <button className={styles.menuButton} onClick={toggleMenu}>
        ☰
      </button>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li><Link href="/community">community</Link></li>
          <li><Link href="/custom">custom</Link></li>
          <li><Link href="/typer">typer</Link></li>
          <li><Link href="/tester">tester</Link></li>
          <li><Link href="/via">via</Link></li>
          <li><Link href="/recommender">recommender</Link></li>
        </ul>
      </nav>
      <div className={`${styles.sideMenu} ${isMenuOpen ? styles.open : ''}`}>
        <button className={styles.closeButton} onClick={toggleMenu}>
          ×
        </button>
        <nav>
          <ul className={styles.navList}>
            <li><Link href="/via" onClick={toggleMenu}>community</Link></li>
            <li><Link href="/custom" onClick={toggleMenu}>custom</Link></li>
            <li><Link href="/typer" onClick={toggleMenu}>typer</Link></li>
            <li><Link href="/tester" onClick={toggleMenu}>tester</Link></li>
            <li><Link href="/via" onClick={toggleMenu}>via</Link></li>
            <li><Link href="/recommender" onClick={toggleMenu}>recommender</Link></li>
          </ul>
        </nav>
      </div>
      {isMenuOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}
    </header>
  );
}
