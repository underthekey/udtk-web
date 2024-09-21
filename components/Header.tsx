"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Header.module.css';

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? styles.active : '';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const menuItems = [
    { path: '/', icon: '/images/icon/typer.svg', label: 'Typer' },
    { path: '/tester', icon: '/images/icon/keyboard.svg', label: 'Tester' },
    { path: '/custom', icon: '/images/icon/switch.svg', label: 'Custom' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <div className={styles.logo}>
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
      <button
        className={styles.menuButton}
        onClick={toggleMenu}
        aria-label="메뉴 열기"
        style={{ fontSize: '30px' }} // 여기에 인라인 스타일 추가
      >
        ☰
      </button>
      <div className={`${styles.menuDropdown} ${isMenuOpen ? styles.open : ''}`}>
        {menuItems.map((item, index) => (
          <Link href={item.path} key={item.path} className={`${styles.menuItem} ${isActive(item.path)}`} onClick={toggleMenu} style={{ transitionDelay: `${index * 50}ms` }}>
            <svg className={styles.menuIcon} viewBox="0 0 64 64">
              <use xlinkHref={`${item.icon}#icon`} />
            </svg>
            <span className={styles.menuLabel}>{item.label}</span>
          </Link>
        ))}
      </div>
    </header>
  );
};

export default Header;
