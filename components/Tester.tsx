'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from '@/styles/Tester.module.css';

const Tester: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('retro');
  const [layout, setLayout] = useState<'fullSize' | 'tkl' | 'seventyFivePercent'>('fullSize');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const keyboardRef = useRef<HTMLDivElement>(null);
  const numpadRef = useRef<HTMLDivElement>(null);
  const regionsRef = useRef<HTMLDivElement[]>([]);
  const functionRegionRef = useRef<HTMLDivElement>(null);
  const controlRegionRef = useRef<HTMLDivElement>(null);
  const navigationRegionRef = useRef<HTMLDivElement>(null);
  const fourthRowRef = useRef<HTMLDivElement>(null);
  const fifthRowRef = useRef<HTMLDivElement>(null);

  const initializeTheme = useCallback(() => {
    const savedTheme = localStorage.getItem('currentTheme');
    if (savedTheme) changeTheme(savedTheme);
  }, []);

  const changeTheme = useCallback((themeName: string) => {
    setCurrentTheme(themeName);
    localStorage.setItem('currentTheme', themeName);
    document.documentElement.className = themeName;
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.code.toLowerCase();
    setPressedKeys(prevKeys => {
      const newKeys = new Set(prevKeys);
      if (event.type === 'keydown') {
        newKeys.add(key);
      } else {
        newKeys.delete(key);
      }
      return newKeys;
    });
  }, []);

  useEffect(() => {
    initializeTheme();
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('keyup', handleKeyPress);
    };
  }, [initializeTheme, handleKeyPress]);

  const updateStylesFor75 = useCallback((is75Percent: boolean) => {
    const paddingValue = is75Percent ? '0.15rem' : '0.5rem';
    const displayValue = is75Percent ? 'none' : 'flex';
    const transformValue = is75Percent ? '-68%' : '0%';

    if (keyboardRef.current) {
      keyboardRef.current.classList.toggle(styles.seventyFivePercent, is75Percent);
    }

    regionsRef.current.forEach(region => {
      if (region) region.style.padding = paddingValue;
    });

    if (functionRegionRef.current) {
      functionRegionRef.current.style.gridTemplateColumns = is75Percent
        ? '2fr 0 repeat(4, 2fr) 0 repeat(4, 2fr) 0 repeat(4,2fr)'
        : '2fr 2fr repeat(4, 2fr) 1fr repeat(4, 2fr) 1fr repeat(4,2fr)';
      functionRegionRef.current.style.width = is75Percent ? '86.7%' : '100%';
    }

    if (controlRegionRef.current) {
      controlRegionRef.current.style.width = is75Percent ? '95%' : '100%';
      controlRegionRef.current.style.transform = `translateX(${transformValue})`;
    }

    const btnScrollLock = document.querySelector(`[data-key="ScrollLock"]`) as HTMLElement;
    const btnInsert = document.querySelector(`[data-key="Insert"]`) as HTMLElement;
    const btnContextMenu = document.querySelector(`[data-key="ContextMenu"]`) as HTMLElement;
    const btnDelete = document.querySelector(`[data-key="Delete"]`) as HTMLElement;
    const btnHome = document.querySelector(`[data-key="Home"]`) as HTMLElement;
    const btnEnd = document.querySelector(`[data-key="End"]`) as HTMLElement;
    const btnPgUp = document.querySelector(`[data-key="PageUp"]`) as HTMLElement;
    const btnPgDn = document.querySelector(`[data-key="PageDown"]`) as HTMLElement;

    if (btnScrollLock) btnScrollLock.style.display = displayValue;
    if (btnInsert) btnInsert.style.display = displayValue;
    if (btnContextMenu) btnContextMenu.style.display = displayValue;

    if (btnDelete) {
      btnDelete.style.gridColumn = is75Percent ? '3' : '1';
      btnDelete.style.gridRow = is75Percent ? '1' : '2';
      btnDelete.style.transform = is75Percent ? 'translateY(-120%)' : 'translateY(0%)';
    }

    if (btnHome) {
      btnHome.style.gridColumn = is75Percent ? '3' : '2';
      btnHome.style.gridRow = is75Percent ? '1' : '1';
    }

    if (btnEnd) {
      btnEnd.style.gridColumn = is75Percent ? '3' : '2';
      btnEnd.style.gridRow = is75Percent ? '2' : '2';
    }

    if (btnPgUp) {
      btnPgUp.style.gridColumn = is75Percent ? '3' : '3';
      btnPgUp.style.gridRow = is75Percent ? '3' : '1';
    }

    if (btnPgDn) {
      btnPgDn.style.gridColumn = is75Percent ? '3' : '3';
      btnPgDn.style.gridRow = is75Percent ? '4' : '2';
    }

    if (navigationRegionRef.current) {
      navigationRegionRef.current.style.transform = `translateX(${transformValue})`;
    }

    if (fourthRowRef.current) {
      fourthRowRef.current.style.gridTemplateColumns = is75Percent
        ? '2.29fr repeat(10, 1fr) 1.75fr 1.04fr'
        : '2.29fr repeat(10, 1fr) 2.79fr';
    }

    if (fifthRowRef.current) {
      fifthRowRef.current.style.gridTemplateColumns = is75Percent
        ? 'repeat(3, 1.29fr) 6.36fr repeat(3, 1fr) 2.15fr'
        : 'repeat(3, 1.29fr) 6.36fr repeat(4, 1.29fr)';
    }
  }, []);

  const undo75 = useCallback(() => {
    updateStylesFor75(false);
  }, [updateStylesFor75]);

  const undoTKL = useCallback(() => {
    if (keyboardRef.current && numpadRef.current) {
      keyboardRef.current.classList.remove(styles.tkl);
      numpadRef.current.classList.remove(styles.hiddenStep1, styles.hiddenStep2);
    }
  }, []);

  const changeToFullSize = useCallback(() => {
    undo75();
    undoTKL();
    if (keyboardRef.current) {
      keyboardRef.current.style.maxWidth = '120rem';
      keyboardRef.current.classList.add(styles.fullSize);
    }
  }, [undo75, undoTKL]);

  const changeToTKL = useCallback(() => {
    return new Promise<void>(resolve => {
      undo75();
      if (numpadRef.current && keyboardRef.current) {
        numpadRef.current.classList.add(styles.hiddenStep1);
        keyboardRef.current.style.maxWidth = '98rem';
        setTimeout(() => {
          keyboardRef.current?.classList.remove(styles.fullSize);
          keyboardRef.current?.classList.add(styles.tkl);
          numpadRef.current?.classList.add(styles.hiddenStep2);
          resolve();
        }, 150);
      } else {
        resolve();
      }
    });
  }, [undo75]);

  const changeTo75 = useCallback(async () => {
    await changeToTKL();
    if (keyboardRef.current) {
      keyboardRef.current.style.maxWidth = '85rem';
    }
    updateStylesFor75(true);
  }, [changeToTKL, updateStylesFor75]);

  const updateLayout = useCallback((value: number) => {
    switch (value) {
      case 1:
        setLayout('fullSize');
        changeToFullSize();
        break;
      case 2:
        setLayout('tkl');
        changeToTKL();
        break;
      case 3:
        setLayout('seventyFivePercent');
        changeTo75();
        break;
      default:
        break;
    }
  }, [changeToFullSize, changeToTKL, changeTo75]);

  const renderKey = useCallback((keyCode: string, label: string, additionalClass: string = '') => {
    const isPressed = pressedKeys.has(keyCode.toLowerCase());
    const classes = `${styles.key} ${additionalClass} ${isPressed ? styles.keyPressed : ''}`;
    const isHidden = layout === 'seventyFivePercent' && (keyCode === 'ScrollLock' || keyCode === 'Insert' || keyCode === 'ContextMenu');

    return (
      <div
        className={`${classes} ${isHidden ? styles.hidden : ''}`}
        data-key={keyCode}
      >
        {label}
      </div>
    );
  }, [pressedKeys, layout]);

  const renderKeyboard = () => {
    return (
      <>
        <section className={`${styles.region} ${styles.function}`} ref={functionRegionRef}>
          {renderKey('Escape', 'Esc')}
          <div className={styles.spacer}></div>
          {renderKey('F1', 'F1')}
          {renderKey('F2', 'F2')}
          {renderKey('F3', 'F3')}
          {renderKey('F4', 'F4')}
          <div className={styles.spacer}></div>
          {renderKey('F5', 'F5')}
          {renderKey('F6', 'F6')}
          {renderKey('F7', 'F7')}
          {renderKey('F8', 'F8')}
          <div className={styles.spacer}></div>
          {renderKey('F9', 'F9')}
          {renderKey('F10', 'F10')}
          {renderKey('F11', 'F11')}
          {renderKey('F12', 'F12')}
        </section>

        <section className={`${styles.region} ${styles.systemControl}`} ref={controlRegionRef}>
          {renderKey('PrintScreen', 'Prt Sc')}
          {renderKey('ScrollLock', 'Scr Lk', layout === 'seventyFivePercent' ? styles.hidden : '')}
          {renderKey('Pause', 'Pause')}
        </section>

        <section className={`${styles.region} ${styles.typewriter}`}>
          <div className={styles.firstRow}>
            {renderKey('Backquote', '`')}
            {renderKey('Digit1', '1')}
            {renderKey('Digit2', '2')}
            {renderKey('Digit3', '3')}
            {renderKey('Digit4', '4')}
            {renderKey('Digit5', '5')}
            {renderKey('Digit6', '6')}
            {renderKey('Digit7', '7')}
            {renderKey('Digit8', '8')}
            {renderKey('Digit9', '9')}
            {renderKey('Digit0', '0')}
            {renderKey('Minus', '-')}
            {renderKey('Equal', '=')}
            {renderKey('Backspace', 'Backspace', styles.keyWide)}
          </div>
          <div className={styles.secondRow}>
            {renderKey('Tab', 'Tab', styles.keyOneHalf)}
            {renderKey('KeyQ', 'Q')}
            {renderKey('KeyW', 'W')}
            {renderKey('KeyE', 'E')}
            {renderKey('KeyR', 'R')}
            {renderKey('KeyT', 'T')}
            {renderKey('KeyY', 'Y')}
            {renderKey('KeyU', 'U')}
            {renderKey('KeyI', 'I')}
            {renderKey('KeyO', 'O')}
            {renderKey('KeyP', 'P')}
            {renderKey('BracketLeft', '[')}
            {renderKey('BracketRight', ']')}
            {renderKey('Backslash', '\\', styles.keyOneHalf)}
          </div>
          <div className={styles.thirdRow}>
            {renderKey('CapsLock', 'Caps Lock', styles.keyOneHalf)}
            {renderKey('KeyA', 'A')}
            {renderKey('KeyS', 'S')}
            {renderKey('KeyD', 'D')}
            {renderKey('KeyF', 'F')}
            {renderKey('KeyG', 'G')}
            {renderKey('KeyH', 'H')}
            {renderKey('KeyJ', 'J')}
            {renderKey('KeyK', 'K')}
            {renderKey('KeyL', 'L')}
            {renderKey('Semicolon', ';')}
            {renderKey('Quote', "'")}
            {renderKey('Enter', 'Enter', styles.keyOneHalf)}
          </div>
          <div className={styles.fourthRow} ref={fourthRowRef}>
            {renderKey('ShiftLeft', 'Shift', styles.keyWide)}
            {renderKey('KeyZ', 'Z')}
            {renderKey('KeyX', 'X')}
            {renderKey('KeyC', 'C')}
            {renderKey('KeyV', 'V')}
            {renderKey('KeyB', 'B')}
            {renderKey('KeyN', 'N')}
            {renderKey('KeyM', 'M')}
            {renderKey('Comma', ',')}
            {renderKey('Period', '.')}
            {renderKey('Slash', '/')}
            {renderKey('ShiftRight', 'Shift', styles.keyWide)}
          </div>
          <div className={styles.fifthRow} ref={fifthRowRef}>
            {renderKey('ControlLeft', 'Ctrl', styles.keyWide)}
            {renderKey('MetaLeft', 'Win', styles.keyWide)}
            {renderKey('AltLeft', 'Alt', styles.keyWide)}
            {renderKey('Space', ' ', styles.keySpace)}
            {renderKey('AltRight', 'Alt', styles.keyWide)}
            {renderKey('MetaRight', 'Win', `${styles.keyWide} ${layout === 'seventyFivePercent' ? styles.hidden : ''}`)}
            {renderKey('ContextMenu', 'Menu', `${styles.keyWide} ${layout === 'seventyFivePercent' ? styles.hidden : ''}`)}
            {renderKey('ControlRight', 'Ctrl', `${styles.keyWide} ${layout === 'seventyFivePercent' ? styles.hidden : ''}`)}
          </div>
        </section>

        <section className={`${styles.region} ${styles.navigation}`} ref={navigationRegionRef}>
          {renderKey('Insert', 'Ins', layout === 'seventyFivePercent' ? styles.hidden : '')}
          {renderKey('Home', 'Home')}
          {renderKey('PageUp', 'PgUp')}
          {renderKey('Delete', 'Del')}
          {renderKey('End', 'End')}
          {renderKey('PageDown', 'PgDn')}
          <div className={styles.spacer}></div>
          {renderKey('ArrowUp', '↑', styles.arrowUp)}
          <div className={styles.spacer}></div>
          {renderKey('ArrowLeft', '←', styles.arrowLeft)}
          {renderKey('ArrowDown', '↓', styles.arrowDown)}
          {renderKey('ArrowRight', '→', styles.arrowRight)}
        </section>

        {layout !== 'seventyFivePercent' && (
          <section className={`${styles.region} ${styles.numpad}`} ref={numpadRef}>
            {renderKey('NumLock', 'Num')}
            {renderKey('NumpadDivide', '/')}
            {renderKey('NumpadMultiply', '*')}
            {renderKey('NumpadSubtract', '-')}
            {renderKey('Numpad7', '7')}
            {renderKey('Numpad8', '8')}
            {renderKey('Numpad9', '9')}
            {renderKey('NumpadAdd', '+', styles.numpadadd)}
            {renderKey('Numpad4', '4')}
            {renderKey('Numpad5', '5')}
            {renderKey('Numpad6', '6')}
            {renderKey('Numpad1', '1')}
            {renderKey('Numpad2', '2')}
            {renderKey('Numpad3', '3')}
            {renderKey('NumpadEnter', 'Enter', styles.numpadenter)}
            {renderKey('Numpad0', '0', styles.numpad0)}
            {renderKey('NumpadDecimal', '.')}
          </section>
        )}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <header>
        <section className={styles.intro}>
          <h1 className={`${styles.headingPrimary} ${styles.title} ${styles.centerText}`}>
            <span>Test Your Keyboard</span>
          </h1>
          <p className={`${styles.paragraph} ${styles.description} ${styles.centerText}`}>
            This interactive tool is designed to help users identify and
            troubleshoot any issues with their physical keyboard or simply explore
            its layout
          </p>
        </section>
      </header>

      <main>
        <div className={styles.themeAndLayout}>
          <div></div>
          <div className={styles.layoutSection}>
            <input
              type="range"
              min="1"
              max="3"
              value={layout === 'fullSize' ? 1 : layout === 'tkl' ? 2 : 3}
              className={styles.slider}
              onChange={(e) => updateLayout(parseInt(e.target.value))}
            />
            <div className={styles.sliderValue}>
              {layout === 'fullSize' ? 'Full' : layout === 'tkl' ? 'TKL' : '75%'}
            </div>
          </div>
          <div className={styles.themeSection}>
            <div className={styles.retro} onClick={() => changeTheme('retro')}>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
            </div>
            <div className={styles.navyBlue} onClick={() => changeTheme('navy-blue')}>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
            </div>
          </div>
        </div>

        <div className={`${styles.keyboard} ${styles[layout]}`} ref={keyboardRef}>
          {renderKeyboard()}
        </div>
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  );
};

export default Tester;
