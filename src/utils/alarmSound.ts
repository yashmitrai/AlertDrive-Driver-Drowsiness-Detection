// Alarm sound generator using Web Audio API
export class AlarmSound {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  play(duration: number = 10000) {
    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    const currentTime = this.audioContext!.currentTime;

    // Create oscillator for alarm sound
    this.oscillator = this.audioContext!.createOscillator();
    this.gainNode = this.audioContext!.createGain();

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext!.destination);

    // Set alarm frequency (alternating tones)
    this.oscillator.type = 'square';
    this.oscillator.frequency.setValueAtTime(800, currentTime);
    
    // Alternate between two frequencies for classic alarm sound
    for (let i = 0; i < duration / 500; i++) {
      const time = currentTime + (i * 0.5);
      this.oscillator.frequency.setValueAtTime(i % 2 === 0 ? 800 : 1000, time);
    }

    this.gainNode.gain.setValueAtTime(0.3, currentTime);
    
    this.oscillator.start(currentTime);
    this.oscillator.stop(currentTime + duration / 1000);

    this.oscillator.onended = () => {
      this.isPlaying = false;
    };

    console.log('Alarm sound playing for', duration, 'ms');
  }

  stop() {
    if (this.oscillator && this.isPlaying) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.gainNode?.disconnect();
      } catch (e) {
        // Already stopped
      }
      this.isPlaying = false;
      this.oscillator = null;
      this.gainNode = null;
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance
let alarmInstance: AlarmSound | null = null;

export const getAlarmSound = (): AlarmSound => {
  if (!alarmInstance) {
    alarmInstance = new AlarmSound();
  }
  return alarmInstance;
};
