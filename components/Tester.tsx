"use client";
import React, { useState, useEffect, useCallback } from 'react';
import styles from '@/styles/Tester.module.css';

const KeyboardTester: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('themeRetro');
  const [layout, setLayout] = useState<'fullSize' | 'tkl' | 'seventyFivePercent'>('fullSize');
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
    let newLayout: 'fullSize' | 'tkl' | 'seventyFivePercent' = 'fullSize';
    let newSliderValue = 'Full';
    switch (layoutValue) {
      case 1:
        newLayout = 'fullSize';
        newSliderValue = 'Full';
        break;
      case 2:
        newLayout = 'tkl';
        newSliderValue = 'TKL';
        break;
      case 3:
        newLayout = 'seventyFivePercent';
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
        { code: 'EmptySpace1', label: '', className: styles.emptySpaceBetweenKeys },
        { code: 'F1', label: 'F1' },
        { code: 'F2', label: 'F2' },
        { code: 'F3', label: 'F3' },
        { code: 'F4', label: 'F4' },
        { code: 'EmptySpace2', label: '', className: styles.emptySpaceBetweenKeys },
        { code: 'F5', label: 'F5' },
        { code: 'F6', label: 'F6' },
        { code: 'F7', label: 'F7' },
        { code: 'F8', label: 'F8' },
        { code: 'EmptySpace3', label: '', className: styles.emptySpaceBetweenKeys },
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
          { code: 'Backspace', label: 'Backspace', className: 'keyAccentColor' },
        ],
        [
          { code: 'Tab', label: 'Tab', className: 'keyAccentColor' },
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
          { code: 'CapsLock', label: 'Caps Lock', className: 'keyAccentColor' },
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
          { code: 'Enter', label: 'Enter', className: 'keyAccentColor' },
        ],
        [
          { code: 'ShiftLeft', label: 'Shift', className: 'keyAccentColor' },
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
          { code: 'ShiftRight', label: 'Shift', className: 'keyAccentColor' },
        ],
        [
          { code: 'ControlLeft', label: 'Ctrl', className: 'keyAccentColor' },
          { code: 'MetaLeft', label: 'Win', className: 'keyAccentColor' },
          { code: 'AltLeft', label: 'Alt', className: 'keyAccentColor' },
          { code: 'Space', label: 'Space' },
          { code: 'AltRight', label: 'Alt', className: 'keyAccentColor' },
          { code: 'ContextMenu', label: 'Menu', className: 'keyAccentColor' },
          { code: 'ControlRight', label: 'Ctrl', className: 'keyAccentColor' },
        ],
      ],
      navigation: [
        { code: 'Insert', label: 'Insert', className: 'keyAccentColor' },
        { code: 'Home', label: 'Home', className: 'keyAccentColor' },
        { code: 'PageUp', label: 'Pg Up', className: 'keyAccentColor' },
        { code: 'Delete', label: 'Delete', className: 'keyAccentColor' },
        { code: 'End', label: 'End', className: 'keyAccentColor' },
        { code: 'PageDown', label: 'Pg Dn', className: 'keyAccentColor' },
        { code: 'ArrowUp', label: '↑', className: 'keyAccentColor arrowup' },
        { code: 'ArrowLeft', label: '←', className: 'keyAccentColor arrowleft' },
        { code: 'ArrowDown', label: '↓', className: 'keyAccentColor arrowdown' },
        { code: 'ArrowRight', label: '→', className: 'keyAccentColor arrowright' },
      ],
      numpad: [
        { code: 'NumLock', label: 'Num Lock', className: 'keyAccentColor' },
        { code: 'NumpadDivide', label: '/', className: 'keyAccentColor' },
        { code: 'NumpadMultiply', label: '*', className: 'keyAccentColor' },
        { code: 'NumpadSubtract', label: '-', className: 'keyAccentColor' },
        { code: 'Numpad7', label: '7' },
        { code: 'Numpad8', label: '8' },
        { code: 'Numpad9', label: '9' },
        { code: 'NumpadAdd', label: '+', className: 'numpadadd keyAccentColor' },
        { code: 'Numpad4', label: '4' },
        { code: 'Numpad5', label: '5' },
        { code: 'Numpad6', label: '6' },
        { code: 'Numpad1', label: '1' },
        { code: 'Numpad2', label: '2' },
        { code: 'Numpad3', label: '3' },
        { code: 'NumpadEnter', label: 'Enter', className: 'numpadenter keyAccentColor' },
        { code: 'Numpad0', label: '0', className: 'numpad0' },
        { code: 'NumpadDecimal', label: '.' },
      ],
    };

    return (
      <div className={`${styles.keyboard} ${styles[layout]}`}>
        <div className={`${styles.region} ${styles.function}`} style={{
          gridTemplateColumns: layout === 'seventyFivePercent'
            ? '2fr 0 repeat(4, 2fr) 0 repeat(4, 2fr) 0 repeat(4,2fr)'
            : '2fr 2fr repeat(4, 2fr) 1fr repeat(4, 2fr) 1fr repeat(4,2fr)'
        }}>
          {keyboardLayout.function.map((key) => (
            <div
              key={key.code}
              className={`${getKeyClassName(key.code, 'keyAccentColor')} ${key.className || ''}`}
              data-key={key.code.toLowerCase()}
              style={{
                display: layout === 'seventyFivePercent' && key.className === styles.emptySpaceBetweenKeys ? 'none' : 'flex'
              }}
            >
              {key.label}
            </div>
          ))}
        </div>

        {layout !== 'seventyFivePercent' && (
          <div className={`${styles.region} ${styles.systemControl}`}>
            {keyboardLayout.systemControl.map((key) => (
              <div key={key.code} className={getKeyClassName(key.code, 'keyAccentColor')} data-key={key.code.toLowerCase()}>
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
          <div className={getKeyClassName('Insert', 'keyAccentColor')} data-key="insert">Insert</div>
          <div className={getKeyClassName('Home', 'keyAccentColor')} data-key="home">Home</div>
          <div className={getKeyClassName('PageUp', 'keyAccentColor')} data-key="pageup">Pg Up</div>
          <div className={getKeyClassName('Delete', 'keyAccentColor')} data-key="delete">Delete</div>
          <div className={getKeyClassName('End', 'keyAccentColor')} data-key="end">End</div>
          <div className={getKeyClassName('PageDown', 'keyAccentColor')} data-key="pagedown">Pg Dn</div>
          <div className={getKeyClassName('ArrowUp', 'arrowup')} data-key="arrowup" aria-label="Up Arrow key">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-label="Up Arrow">
              <path d="M18.221,7.206l9.585,9.585c0.879,0.879,0.879,2.317,0,3.195l-0.8,0.801c-0.877,0.878-2.316,0.878-3.194,0  l-7.315-7.315l-7.315,7.315c-0.878,0.878-2.317,0.878-3.194,0l-0.8-0.801c-0.879-0.878-0.879-2.316,0-3.195l9.587-9.585  c0.471-0.472,1.103-0.682,1.723-0.647C17.115,6.524,17.748,6.734,18.221,7.206z" />
            </svg>
          </div>
          <div className={getKeyClassName('ArrowLeft', 'arrowleft')} data-key="arrowleft" aria-label="Left Arrow key">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-label="Left Arrow">
              <path d="M7.701,14.276l9.586-9.585c0.879-0.878,2.317-0.878,3.195,0l0.801,0.8c0.878,0.877,0.878,2.316,0,3.194  L13.968,16l7.315,7.315c0.878,0.878,0.878,2.317,0,3.194l-0.801,0.8c-0.878,0.879-2.316,0.879-3.195,0l-9.586-9.587  C7.229,17.252,7.02,16.62,7.054,16C7.02,15.38,7.229,14.748,7.701,14.276z" />
            </svg>
          </div>
          <div className={getKeyClassName('ArrowDown', 'arrowdown')} data-key="arrowdown" aria-label="Down Arrow key">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-label="Down Arrow">
              <path d="M14.77,23.795L5.185,14.21c-0.879-0.879-0.879-2.317,0-3.195l0.8-0.801c0.877-0.878,2.316-0.878,3.194,0  l7.315,7.315l7.316-7.315c0.878-0.878,2.317-0.878,3.194,0l0.8,0.801c0.879,0.878,0.879,2.316,0,3.195l-9.587,9.585  c-0.471,0.472-1.104,0.682-1.723,0.647C15.875,24.477,15.243,24.267,14.77,23.795z" />
            </svg>
          </div>
          <div className={getKeyClassName('ArrowRight', 'arrowright')} data-key="arrowright" aria-label="Right Arrow key">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-label="Right Arrow">
              <path d="M24.291,14.276L14.705,4.69c-0.878-0.878-2.317-0.878-3.195,0l-0.8,0.8c-0.878,0.877-0.878,2.316,0,3.194  L18.024,16l-7.315,7.315c-0.878,0.878-0.878,2.317,0,3.194l0.8,0.8c0.878,0.879,2.317,0.879,3.195,0l9.586-9.587  c0.472-0.471,0.682-1.103,0.647-1.723C24.973,15.38,24.763,14.748,24.291,14.276z" />
            </svg>
          </div>
        </div>

        {layout === 'fullSize' && (
          <div className={`${styles.region} ${styles.numpad}`}>
            <div className={getKeyClassName('NumLock', 'keyAccentColor')} data-key="numlock">Num Lk</div>
            <div className={getKeyClassName('NumpadDivide', 'keyAccentColor')} data-key="numpaddivide">/</div>
            <div className={getKeyClassName('NumpadMultiply', 'keyAccentColor')} data-key="numpadmultiply">*</div>
            <div className={getKeyClassName('NumpadSubtract', 'keyAccentColor')} data-key="numpadsubtract">-</div>
            <div className={getKeyClassName('Numpad7')} data-key="numpad7">7</div>
            <div className={getKeyClassName('Numpad8')} data-key="numpad8">8</div>
            <div className={getKeyClassName('Numpad9')} data-key="numpad9">9</div>
            <div className={getKeyClassName('NumpadAdd', 'numpadadd keyAccentColor')} data-key="numpadadd">+</div>
            <div className={getKeyClassName('Numpad4')} data-key="numpad4">4</div>
            <div className={getKeyClassName('Numpad5')} data-key="numpad5">5</div>
            <div className={getKeyClassName('Numpad6')} data-key="numpad6">6</div>
            <div className={getKeyClassName('Numpad1')} data-key="numpad1">1</div>
            <div className={getKeyClassName('Numpad2')} data-key="numpad2">2</div>
            <div className={getKeyClassName('Numpad3')} data-key="numpad3">3</div>
            <div className={getKeyClassName('NumpadEnter', 'numpadenter keyAccentColor')} data-key="numpadenter">Enter</div>
            <div className={getKeyClassName('Numpad0', 'numpad0')} data-key="numpad0">0</div>
            <div className={getKeyClassName('NumpadDecimal')} data-key="numpaddecimal">.</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.testerWrapper}`}>
      <div className={`${styles.testerContainer} ${styles[currentTheme]}`}>
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
            <div className={styles.sliderContainer}>
              <output className={styles.sliderValue}>{sliderValue}</output>
              <input
                type="range"
                min="1"
                max="3"
                value={layout === 'fullSize' ? '1' : layout === 'tkl' ? '2' : '3'}
                className={styles.slider}
                onChange={(e) => updateLayout(e.target.value)}
              />
            </div>
            {renderThemeSelector()}
          </div>
          {renderKeyboard()}
        </main>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            Made with ❤️ by <a href="https://github.com/Mostafa-Abbasi" target="_blank" rel="noopener noreferrer">Mostafa Abbasi</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default KeyboardTester;
