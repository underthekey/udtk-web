"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Header.module.css';

const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? styles.active : '';
  };

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
                src="/images/image-logo/3d/logo-3d-512.png"
                alt="underthekey logo"
                width={256}
                height={256}
                sizes="(max-width: 768px) 100px, (max-width: 1200px) 150px, 200px"
                style={{ objectFit: 'contain' }}
                className={styles.logoImage}
              />
            </div>
            <span className={styles.logoText}>underthekey</span>
          </div>
        </Link>
      </div>
      <nav className={styles.nav}>
        <div className={styles.menuContainer}>
          <Link href="/community" className={`${styles.menuItem} ${isActive('/community')}`}>
            Community
          </Link>
          <div className={styles.divider}></div>
          <Link href="/custom" className={`${styles.menuItem} ${isActive('/custom')}`}>
            Custom
          </Link>
          <div className={styles.divider}></div>
          <Link href="/typer" className={`${styles.menuItem} ${isActive('/typer')}`}>
            Typer
          </Link>
          <div className={styles.divider}></div>
          <Link href="/tester" className={`${styles.menuItem} ${isActive('/tester')}`}>
            Tester
          </Link>
          <div className={styles.divider}></div>
          <Link href="/via" className={`${styles.menuItem} ${isActive('/via')}`}>
            VIA
          </Link>
          <div className={styles.divider}></div>
          <Link href="/recommender" className={`${styles.menuItem} ${isActive('/recommender')}`}>
            Recommender
          </Link>
        </div>
      </nav>
      <button className={styles.menuButton} onClick={toggleMenu} aria-label="메뉴 열기">
        ☰
      </button>
      <div className={`${styles.sideMenu} ${isMenuOpen ? styles.open : ''}`}>
        <button className={styles.closeButton} onClick={toggleMenu}>
          ×
        </button>
        <nav>
          <ul className={styles.navList}>
            <li><Link href="/community" className={`${styles.menuItem} ${isActive('/community')}`} onClick={toggleMenu}>Community</Link></li>
            <li><Link href="/custom" className={`${styles.menuItem} ${isActive('/custom')}`} onClick={toggleMenu}>Custom</Link></li>
            <li><Link href="/typer" className={`${styles.menuItem} ${isActive('/typer')}`} onClick={toggleMenu}>Typer</Link></li>
            <li><Link href="/tester" className={`${styles.menuItem} ${isActive('/tester')}`} onClick={toggleMenu}>Tester</Link></li>
            <li><Link href="/via" className={`${styles.menuItem} ${isActive('/via')}`} onClick={toggleMenu}>VIA</Link></li>
            <li><Link href="/recommender" className={`${styles.menuItem} ${isActive('/recommender')}`} onClick={toggleMenu}>Recommender</Link></li>
          </ul>
        </nav>
      </div>
      {isMenuOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}
    </header>
  );
};

export default Header;
