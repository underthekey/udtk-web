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
    if (keyboardRef.current) {
      keyboardRef.current.className = `${styles.keyboard} ${styles[layout]} ${styles[`theme${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`]}`;
    }
  }, [layout]);

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

  const applyFullSizeStyles = useCallback(() => {
    if (keyboardRef.current) {
      keyboardRef.current.style.maxWidth = '122rem';
      keyboardRef.current.style.gridTemplateColumns = '215fr 2fr 45fr 1fr 60fr';
    }
    if (numpadRef.current) {
      numpadRef.current.style.display = 'grid';
    }
    updateCommonStyles('fullSize');
  }, []);

  const applyTKLStyles = useCallback(() => {
    if (keyboardRef.current) {
      keyboardRef.current.style.maxWidth = '100rem';
      keyboardRef.current.style.gridTemplateColumns = '215fr 7fr 45fr';
    }
    if (numpadRef.current) {
      numpadRef.current.style.display = 'none';
    }
    updateCommonStyles('tkl');
    // 75%에서 TKL로 전환할 때 numpad를 숨기는 로직 추가
    const numpadSection = document.querySelector(`.${styles.numpad}`) as HTMLElement;
    if (numpadSection) {
      numpadSection.style.display = 'none';
    }
  }, []);

  const apply75Styles = useCallback(() => {
    if (keyboardRef.current) {
      keyboardRef.current.style.maxWidth = '86rem';
      keyboardRef.current.style.gridTemplateColumns = '79rem 0 16.5rem';
    }
    if (numpadRef.current) {
      numpadRef.current.style.display = 'none';
    }
    updateCommonStyles('seventyFivePercent');
    updateStylesFor75(true);
  }, []);

  const updateCommonStyles = useCallback((layoutType: 'fullSize' | 'tkl' | 'seventyFivePercent') => {
    const isFullSize = layoutType === 'fullSize';
    const isTKL = layoutType === 'tkl';
    const is75 = layoutType === 'seventyFivePercent';

    if (functionRegionRef.current) {
      functionRegionRef.current.style.gridTemplateColumns = is75
        ? '2fr 0 repeat(4, 2fr) 0 repeat(4, 2fr) 0 repeat(4,2fr)'
        : '2fr 2fr repeat(4, 2fr) 1fr repeat(4, 2fr) 1fr repeat(4,2fr)';
      functionRegionRef.current.style.width = is75 ? '86.7%' : '100%';
    }

    if (controlRegionRef.current) {
      controlRegionRef.current.style.width = is75 ? '95%' : '100%';
      controlRegionRef.current.style.transform = is75 ? 'translateX(-68%)' : 'translateX(0%)';
    }

    if (navigationRegionRef.current) {
      navigationRegionRef.current.style.transform = is75 ? 'translateX(-68%)' : 'translateX(0%)';
    }

    const hiddenKeys = ['ScrollLock', 'Insert', 'ContextMenu'];
    hiddenKeys.forEach(key => {
      const keyElement = document.querySelector(`[data-key="${key}"]`) as HTMLElement;
      if (keyElement) {
        keyElement.style.display = is75 ? 'none' : 'flex';
      }
    });

    // 나머지 키 위치 조정
    const keyPositions: { [key: string]: { col: string, row: string, transform?: string } } = {
      'Delete': { col: is75 ? '3' : '1', row: is75 ? '1' : '2', transform: is75 ? 'translateY(-120%)' : 'translateY(0%)' },
      'Home': { col: is75 ? '3' : '2', row: is75 ? '1' : '1' },
      'End': { col: is75 ? '3' : '2', row: is75 ? '2' : '2' },
      'PageUp': { col: is75 ? '3' : '3', row: is75 ? '3' : '1' },
      'PageDown': { col: is75 ? '3' : '3', row: is75 ? '4' : '2' },
    };

    Object.entries(keyPositions).forEach(([key, position]) => {
      const keyElement = document.querySelector(`[data-key="${key}"]`) as HTMLElement;
      if (keyElement) {
        keyElement.style.gridColumn = position.col;
        keyElement.style.gridRow = position.row;
        if (position.transform) {
          keyElement.style.transform = position.transform;
        }
      }
    });

    if (fourthRowRef.current) {
      fourthRowRef.current.style.gridTemplateColumns = is75
        ? '2.29fr repeat(10, 1fr) 1.75fr 1.04fr'
        : '2.29fr repeat(10, 1fr) 2.79fr';
    }

    if (fifthRowRef.current) {
      fifthRowRef.current.style.gridTemplateColumns = is75
        ? 'repeat(3, 1.29fr) 6.36fr repeat(3, 1fr) 2.15fr'
        : 'repeat(3, 1.29fr) 6.36fr repeat(4, 1.29fr)';
    }
  }, []);

  const changeToFullSize = useCallback(() => {
    setLayout('fullSize');
    applyFullSizeStyles();
  }, [applyFullSizeStyles]);

  const changeToTKL = useCallback(() => {
    setLayout('tkl');
    applyTKLStyles();
  }, [applyTKLStyles]);

  const changeTo75 = useCallback(() => {
    setLayout('seventyFivePercent');
    apply75Styles();
  }, [apply75Styles]);

  const updateLayout = useCallback((value: number) => {
    switch (value) {
      case 1:
        changeToFullSize();
        break;
      case 2:
        changeToTKL();
        break;
      case 3:
        changeTo75();
        break;
      default:
        break;
    }
  }, [changeToFullSize, changeToTKL, changeTo75]);

  const renderKey = useCallback((keyCode: string, label: string, additionalClass: string = '') => {
    const isPressed = pressedKeys.has(keyCode.toLowerCase());
    const isAccentKey = ['Backquote', 'Backspace', 'Tab', 'CapsLock', 'Enter', 'Space', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'ContextMenu', 'Insert', 'Home', 'PageUp', 'Delete', 'End', 'PageDown', 'NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract', 'NumpadAdd', 'NumpadEnter', 'PrintScreen', 'ScrollLock', 'Pause', 'Backslash'].includes(keyCode);
    const classes = `${styles.key} ${additionalClass} ${isPressed ? styles.keyPressed : ''} ${isAccentKey ? styles.keyAccentColor : ''}`;

    return (
      <div key={keyCode} className={classes} data-key={keyCode}>
        {label}
      </div>
    );
  }, [pressedKeys]);

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

        <section
          className={`${styles.region} ${styles.numpad}`}
          ref={numpadRef}
          style={{ display: layout === 'fullSize' ? 'grid' : 'none' }}
        >
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
      </>
    );
  };

  const updateFontSize = useCallback(() => {
    const width = window.innerWidth;
    let fontSize;

    if (width > 1392) fontSize = '62.5%';
    else if (width > 1264) fontSize = '56.25%';
    else if (width > 1056) fontSize = '50%';
    else if (width > 928) fontSize = '43.75%';
    else if (width > 784) fontSize = '37.5%';
    else if (width > 640) fontSize = '31.25%';
    else if (width > 512) fontSize = '25%';
    else if (width > 384) fontSize = '18.75%';
    else fontSize = '16%';

    document.documentElement.style.fontSize = fontSize;
  }, []);

  useEffect(() => {
    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, [updateFontSize]);

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
            <div className={styles.retro} onClick={() => changeTheme('Retro')}>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
            </div>
            <div className={styles.navyBlue} onClick={() => changeTheme('NavyBlue')}>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
              <div className={styles.themeColor}></div>
            </div>
          </div>
        </div>

        <div
          className={`${styles.keyboard} ${styles[layout]} ${styles[`theme${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`]}`}
          ref={keyboardRef}
        >
          {renderKeyboard()}
        </div>
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  );
};

export default Tester;
