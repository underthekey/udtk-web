"use client";
import React, { useState, useEffect, useCallback } from 'react';
import styles from '@/styles/Tester.module.css';

const KeyboardTester: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('themeRetro');
  const [layout, setLayout] = useState<'full' | 'tkl' | '75'>('full');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sliderValue, setSliderValue] = useState<string>('Full');

  useEffect(() => {
    initializeTheme();
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('keyup', handleKeyPress);
    };
  }, []);

  const initializeTheme = useCallback(() => {
    const savedTheme = localStorage.getItem('currentTheme');
    if (savedTheme) changeTheme(savedTheme);
  }, []);

  const changeTheme = useCallback((themeName: string) => {
    setCurrentTheme(`theme${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`);
    localStorage.setItem('currentTheme', themeName);
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

  const updateLayout = useCallback((value: string) => {
    const layoutValue = parseInt(value);
    let newLayout: 'full' | 'tkl' | '75' = 'full';
    let newSliderValue = 'Full';
    switch (layoutValue) {
      case 1:
        newLayout = 'full';
        newSliderValue = 'Full';
        break;
      case 2:
        newLayout = 'tkl';
        newSliderValue = 'TKL';
        break;
      case 3:
        newLayout = '75';
        newSliderValue = '75%';
        break;
    }
    setLayout(newLayout);
    setSliderValue(newSliderValue);
  }, []);

  const getKeyClassName = useCallback((keyCode: string, additionalClass?: string) => {
    const baseClass = styles.key;
    const pressedClass = pressedKeys.has(keyCode.toLowerCase()) ? styles.keyPressed : '';
    const accentClass = additionalClass ? styles[additionalClass] : '';
    return `${baseClass} ${pressedClass} ${accentClass}`.trim();
  }, [pressedKeys]);

  const renderThemeSelector = () => (
    <div className={styles.themeSection}>
      <div className={`${styles.theme} ${styles.retro}`} onClick={() => changeTheme('retro')}>
        <div className={styles.themeColor}></div>
        <div className={styles.themeColor}></div>
        <div className={styles.themeColor}></div>
        <div className={styles.themeColor}></div>
      </div>
      <div className={`${styles.theme} ${styles.navyBlue}`} onClick={() => changeTheme('navyBlue')}>
        <div className={styles.themeColor}></div>
        <div className={styles.themeColor}></div>
        <div className={styles.themeColor}></div>
        <div className={styles.themeColor}></div>
      </div>
    </div>
  );

  const renderKeyboard = () => {
    const keyboardLayout = {
      function: [
        { code: 'Escape', label: 'Esc' },
        { code: 'F1', label: 'F1' },
        { code: 'F2', label: 'F2' },
        { code: 'F3', label: 'F3' },
        { code: 'F4', label: 'F4' },
        { code: 'F5', label: 'F5' },
        { code: 'F6', label: 'F6' },
        { code: 'F7', label: 'F7' },
        { code: 'F8', label: 'F8' },
        { code: 'F9', label: 'F9' },
        { code: 'F10', label: 'F10' },
        { code: 'F11', label: 'F11' },
        { code: 'F12', label: 'F12' },
      ],
      systemControl: [
        { code: 'PrintScreen', label: 'Prt Sc' },
        { code: 'ScrollLock', label: 'Scr Lk' },
        { code: 'Pause', label: 'Pause' },
      ],
      typewriter: [
        [
          { code: 'Backquote', label: '`' },
          { code: 'Digit1', label: '1' },
          { code: 'Digit2', label: '2' },
          { code: 'Digit3', label: '3' },
          { code: 'Digit4', label: '4' },
          { code: 'Digit5', label: '5' },
          { code: 'Digit6', label: '6' },
          { code: 'Digit7', label: '7' },
          { code: 'Digit8', label: '8' },
          { code: 'Digit9', label: '9' },
          { code: 'Digit0', label: '0' },
          { code: 'Minus', label: '-' },
          { code: 'Equal', label: '=' },
          { code: 'Backspace', label: 'Backspace', className: 'backspace' },
        ],
        [
          { code: 'Tab', label: 'Tab', className: 'tab' },
          { code: 'KeyQ', label: 'Q' },
          { code: 'KeyW', label: 'W' },
          { code: 'KeyE', label: 'E' },
          { code: 'KeyR', label: 'R' },
          { code: 'KeyT', label: 'T' },
          { code: 'KeyY', label: 'Y' },
          { code: 'KeyU', label: 'U' },
          { code: 'KeyI', label: 'I' },
          { code: 'KeyO', label: 'O' },
          { code: 'KeyP', label: 'P' },
          { code: 'BracketLeft', label: '[' },
          { code: 'BracketRight', label: ']' },
          { code: 'Backslash', label: '\\' },
        ],
        [
          { code: 'CapsLock', label: 'Caps Lock', className: 'capsLock' },
          { code: 'KeyA', label: 'A' },
          { code: 'KeyS', label: 'S' },
          { code: 'KeyD', label: 'D' },
          { code: 'KeyF', label: 'F' },
          { code: 'KeyG', label: 'G' },
          { code: 'KeyH', label: 'H' },
          { code: 'KeyJ', label: 'J' },
          { code: 'KeyK', label: 'K' },
          { code: 'KeyL', label: 'L' },
          { code: 'Semicolon', label: ';' },
          { code: 'Quote', label: "'" },
          { code: 'Enter', label: 'Enter', className: 'enter' },
        ],
        [
          { code: 'ShiftLeft', label: 'Shift', className: 'shiftLeft' },
          { code: 'KeyZ', label: 'Z' },
          { code: 'KeyX', label: 'X' },
          { code: 'KeyC', label: 'C' },
          { code: 'KeyV', label: 'V' },
          { code: 'KeyB', label: 'B' },
          { code: 'KeyN', label: 'N' },
          { code: 'KeyM', label: 'M' },
          { code: 'Comma', label: ',' },
          { code: 'Period', label: '.' },
          { code: 'Slash', label: '/' },
          { code: 'ShiftRight', label: 'Shift', className: 'shiftRight' },
        ],
        [
          { code: 'ControlLeft', label: 'Ctrl', className: 'controlLeft' },
          { code: 'MetaLeft', label: 'Win', className: 'metaLeft' },
          { code: 'AltLeft', label: 'Alt' },
          { code: 'Space', label: 'Space', className: 'space' },
          { code: 'AltRight', label: 'Alt' },
          { code: 'ContextMenu', label: 'Menu' },
          { code: 'ControlRight', label: 'Ctrl', className: 'controlRight' },
        ],
      ],
      navigation: [
        { code: 'Insert', label: 'Insert' },
        { code: 'Home', label: 'Home' },
        { code: 'PageUp', label: 'Pg Up' },
        { code: 'Delete', label: 'Delete' },
        { code: 'End', label: 'End' },
        { code: 'PageDown', label: 'Pg Dn' },
        { code: 'ArrowUp', label: '↑' },
        { code: 'ArrowLeft', label: '←' },
        { code: 'ArrowDown', label: '↓' },
        { code: 'ArrowRight', label: '→' },
      ],
      numpad: [
        { code: 'NumLock', label: 'Num Lock' },
        { code: 'NumpadDivide', label: '/' },
        { code: 'NumpadMultiply', label: '*' },
        { code: 'NumpadSubtract', label: '-' },
        { code: 'Numpad7', label: '7' },
        { code: 'Numpad8', label: '8' },
        { code: 'Numpad9', label: '9' },
        { code: 'NumpadAdd', label: '+', className: 'numpadAdd' },
        { code: 'Numpad4', label: '4' },
        { code: 'Numpad5', label: '5' },
        { code: 'Numpad6', label: '6' },
        { code: 'Numpad1', label: '1' },
        { code: 'Numpad2', label: '2' },
        { code: 'Numpad3', label: '3' },
        { code: 'NumpadEnter', label: 'Enter', className: 'numpadEnter' },
        { code: 'Numpad0', label: '0', className: 'numpad0' },
        { code: 'NumpadDecimal', label: '.' },
      ],
    };

    return (
      <div className={`${styles.keyboard} ${styles[layout]}`}>
        <div className={`${styles.region} ${styles.function}`}>
          {keyboardLayout.function.map((key) => (
            <div key={key.code} className={getKeyClassName(key.code)} data-key={key.code.toLowerCase()}>
              {key.label}
            </div>
          ))}
        </div>

        {layout !== '75' && (
          <div className={`${styles.region} ${styles.systemControl}`}>
            {keyboardLayout.systemControl.map((key) => (
              <div key={key.code} className={getKeyClassName(key.code)} data-key={key.code.toLowerCase()}>
                {key.label}
              </div>
            ))}
          </div>
        )}

        <div className={`${styles.region} ${styles.typewriter}`}>
          {keyboardLayout.typewriter.map((row, rowIndex) => (
            <div key={rowIndex} className={styles[`row${rowIndex + 1}`]}>
              {row.map((key) => (
                <div key={key.code} className={getKeyClassName(key.code, key.className)} data-key={key.code.toLowerCase()}>
                  {key.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className={`${styles.region} ${styles.navigation}`}>
          {keyboardLayout.navigation.map((key) => (
            <div key={key.code} className={getKeyClassName(key.code)} data-key={key.code.toLowerCase()}>
              {key.label}
            </div>
          ))}
        </div>

        {layout === 'full' && (
          <div className={`${styles.region} ${styles.numpad}`}>
            {keyboardLayout.numpad.map((key) => (
              <div key={key.code} className={getKeyClassName(key.code, key.className)} data-key={key.code.toLowerCase()}>
                {key.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.testerContainer} ${styles[currentTheme]}`}>
      <header>
        <section className={styles.intro}>
          <h1 className={`${styles.title} ${styles.centerText}`}>
            <span>Test Your Keyboard</span>
          </h1>
          <p className={`${styles.description} ${styles.centerText}`}>
            This interactive tool is designed to help users identify and
            troubleshoot any issues with their physical keyboard or simply explore
            its layout
          </p>
        </section>
      </header>

      <main>
        <div className={styles.themeAndLayout}>
          {renderThemeSelector()}
          <div className={styles.sliderContainer}>
            <output className={styles.sliderValue}>{sliderValue}</output>
            <input
              type="range"
              min="1"
              max="3"
              value={layout === 'full' ? '1' : layout === 'tkl' ? '2' : '3'}
              className={styles.slider}
              onChange={(e) => updateLayout(e.target.value)}
            />
          </div>
        </div>
        {renderKeyboard()}
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Made with ❤️ by <a href="https://github.com/Mostafa-Abbasi" target="_blank" rel="noopener noreferrer">Mostafa Abbasi</a>
        </p>
      </footer>
    </div>
  );
};

export default KeyboardTester;
