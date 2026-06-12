/**
 * Phaser bootstrap. Scenes and systems are classic-script globals for now;
 * a bundler can be introduced later without touching game code.
 */
const GAME_WIDTH = 960;
const GAME_HEIGHT = 544; // 30 x 17 tiles at 32px

window.addEventListener('load', () => {
  console.log('[boot] Luminary renderer starting — Phaser', Phaser.VERSION);

  // Settings cache so widgets (e.g. DialogueBox text speed) read synchronously.
  // SettingsScene keeps this object up to date as the player adjusts values.
  window.GameSettings = { musicVolume: 7, sfxVolume: 7, textSpeed: 'normal' };
  window.LuminaryNative.settings.get().then((s) => Object.assign(window.GameSettings, s));

  // Playtest mode: drive the game loop with setTimeout instead of rAF so an
  // unfocused/occluded window cannot throttle tweens (see main.js).
  const playtest = new URLSearchParams(location.search).has('playtest');

  window.game = new Phaser.Game({
    type: Phaser.AUTO,
    fps: playtest ? { forceSetTimeOut: true, target: 60 } : undefined,
    parent: 'game-root',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#070b14',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [TitleScene, NewGameScene, SettingsScene, WorldScene, BattleScene],
  });
});
