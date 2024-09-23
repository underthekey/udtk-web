"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Header.module.css';
import { useRouter } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleMenuItemClick = useCallback((e: React.MouseEvent, path: string) => {
    e.preventDefault();
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isCurrentPage = pathname === path;

    if (!isCurrentPage) {
      if (isMobile) {
        window.location.href = path;
      } else {
        router.push(path);
      }
    }

    closeMenu();  // 항상 메뉴를 닫습니다.
  }, [pathname, router, closeMenu]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  useEffect(() => {
    const menuItems = document.querySelectorAll(`.${styles.menuItem}`);
    const itemCount = menuItems.length;

    menuItems.forEach((item, index) => {
      const element = item as HTMLElement;
      element.style.setProperty('--menu-item-index', index.toString());
      element.style.setProperty('--menu-item-count', itemCount.toString());
    });
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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
                alt="underthekey logo | 언더더키"
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
      >
        <svg viewBox="0 0 64 64">
          <use xlinkHref={isMenuOpen ? "/images/icon/close.svg#icon" : "/images/icon/menu.svg#icon"} />
        </svg>
      </button>
      <div className={`${styles.menuDropdown} ${isMenuOpen ? styles.open : ''}`}>
        {menuItems.map((item, index) => (
          <Link
            href={item.path}
            key={item.path}
            className={`${styles.menuItem} ${pathname === item.path ? styles.active : ''}`}
            onClick={(e) => handleMenuItemClick(e, item.path)}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <div className={styles.menuIconWrapper}>
              <svg className={styles.menuIcon} viewBox="0 0 64 64">
                <use xlinkHref={`${item.icon}#icon`} />
              </svg>
            </div>
            <span className={styles.menuLabel}>{item.label}</span>
          </Link>
        ))}
      </div>
    </header>
  );
};

export default Header;
