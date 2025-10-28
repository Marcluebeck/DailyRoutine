let voiceEnabled = false;
let voiceGender = 'child';

export function setVoiceEnabled(enabled) {
  voiceEnabled = enabled;
}

export function setVoiceProfile(profile) {
  voiceGender = profile;
}

export function speak(text) {
  if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find((voice) => voice.lang.startsWith('de') && voice.name.toLowerCase().includes(voiceGender));
  if (targetVoice) {
    utterance.voice = targetVoice;
  }
  utterance.rate = 1;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  window.speechSynthesis.cancel();
}
