// Text-to-Speech utility using Web Speech API
export class TextToSpeech {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    // Wait for voices to load
    if (this.synth.getVoices().length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.loadVoice();
      });
    } else {
      this.loadVoice();
    }
  }

  private loadVoice() {
    const voices = this.synth.getVoices();
    // Try to find a good English voice
    this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  speak(text: string, rate: number = 1.0, pitch: number = 1.0) {
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

    console.log('Speaking:', text);
    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

// Singleton instance
let ttsInstance: TextToSpeech | null = null;

export const getTextToSpeech = (): TextToSpeech => {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeech();
  }
  return ttsInstance;
};
