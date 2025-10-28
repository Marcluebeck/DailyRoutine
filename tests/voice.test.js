import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('voice helpers', () => {
  let voice;
  let speakMock;
  let cancelMock;

  beforeEach(async () => {
    vi.resetModules();
    speakMock = vi.fn();
    cancelMock = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: vi.fn(() => [
          { lang: 'de-DE', name: 'Sunny Child' },
          { lang: 'de-DE', name: 'Sanfte Erwachsene' }
        ]),
        speak: speakMock,
        cancel: cancelMock
      }
    });
    globalThis.SpeechSynthesisUtterance = function (text) {
      this.text = text;
      this.voice = null;
      this.rate = null;
      this.pitch = null;
    };
    voice = await import('../src/js/voice.js');
  });

  afterEach(() => {
    delete window.speechSynthesis;
    delete globalThis.SpeechSynthesisUtterance;
  });

  it('does not speak when voice output is disabled', () => {
    voice.setVoiceEnabled(false);
    voice.speak('Guten Morgen');
    expect(speakMock).not.toHaveBeenCalled();
  });

  it('speaks with a matching German child voice when enabled', () => {
    voice.setVoiceEnabled(true);
    voice.speak('Auf geht\'s!');
    expect(speakMock).toHaveBeenCalledTimes(1);
    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.text).toBe("Auf geht's!");
    expect(utterance.voice.name).toBe('Sunny Child');
  });

  it('cancels ongoing speech safely', () => {
    voice.stopSpeaking();
    expect(cancelMock).toHaveBeenCalledTimes(1);
  });
});
