/**
 * GoldStamp Real-Time Counter Soundbox Engine
 * Generates high-fidelity audio chimes via Web Audio API and natural voice synthesis alerts
 * (Paytm Soundbox style for loyalty check-ins & counter viral social proof)
 */

interface SoundboxPayload {
  customerName: string;
  businessName?: string;
  cycleStamps?: number;
  milestoneTarget?: number;
  rewardTitle?: string;
  isMilestone?: boolean;
}

interface SoundboxSettings {
  enabled: boolean;
  voiceEnabled: boolean;
  chimeEnabled: boolean;
  volume: number; // 0 to 1
}

const SETTINGS_KEY = 'goldstamp_soundbox_settings';

export const getSoundboxSettings = (): SoundboxSettings => {
  if (typeof window === 'undefined') {
    return { enabled: true, voiceEnabled: true, chimeEnabled: true, volume: 1 };
  }
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { enabled: true, voiceEnabled: true, chimeEnabled: true, volume: 1 };
};

export const saveSoundboxSettings = (settings: SoundboxSettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
};

/**
 * Synthesizes a high-gloss multi-tone chime chord without requiring external audio files
 */
export const playCounterChime = (isMilestone: boolean = false, volume: number = 1): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return resolve();

      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.1, Math.min(volume, 1)), now);
      masterGain.connect(ctx.destination);

      // Chime note frequencies
      // Standard: E5 (659Hz), G#5 (830Hz), B5 (987Hz), E6 (1318Hz)
      // Milestone: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz), E6 (1318Hz), G6 (1567Hz)
      const frequencies = isMilestone
        ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]
        : [659.25, 830.61, 987.77, 1318.51];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        // Blend sine and soft triangle for bright bell warmth
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const startTime = now + idx * 0.08;
        const duration = isMilestone ? 0.9 : 0.6;

        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });

      setTimeout(() => {
        try {
          ctx.close();
        } catch {}
        resolve();
      }, (frequencies.length * 0.08 + 1) * 1000);
    } catch (e) {
      console.warn('Soundbox audio play note:', e);
      resolve();
    }
  });
};

/**
 * Speaks an automated counter announcement using the device's Text-To-Speech engine
 */
export const speakAnnouncement = (text: string, volume: number = 1): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return resolve();
    }

    try {
      window.speechSynthesis.cancel(); // Stop any overlapping previous utterance

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = Math.max(0.1, Math.min(volume, 1));
      utterance.rate = 1.05; // Lively, clear delivery
      utterance.pitch = 1.0;

      // Select high quality English voice if present
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          (v.lang.includes('en-IN') || v.lang.includes('en-US') || v.lang.includes('en-GB')) &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);

      // Safety timeout in case speech engine stalls
      setTimeout(() => resolve(), 6000);
    } catch {
      resolve();
    }
  });
};

/**
 * Master Soundbox Trigger: Plays chime chord followed by clear voice announcement
 */
export const playCounterSoundbox = async (payload: SoundboxPayload) => {
  const settings = getSoundboxSettings();
  if (!settings.enabled) return;

  const { customerName, businessName, cycleStamps, milestoneTarget, rewardTitle, isMilestone } = payload;
  const target = milestoneTarget || 10;
  const current = cycleStamps || 1;

  // 1. Play musical chime first
  if (settings.chimeEnabled) {
    await playCounterChime(!!isMilestone, settings.volume);
  }

  // 2. Synthesize clear voice alert
  if (settings.voiceEnabled) {
    let message = '';
    if (isMilestone) {
      message = `Congratulations! ${customerName} has unlocked their free reward: ${rewardTitle || 'Milestone Reward'}!`;
    } else {
      const remaining = target - current;
      const remainingText = remaining === 1 ? 'Just one more visit to unlock free reward!' : `${current} of ${target} stamps collected.`;
      const bizPart = businessName ? `at ${businessName}` : '';
      message = `Stamp verified! ${customerName} earned one Gold Stamp ${bizPart}. ${remainingText}`;
    }

    await speakAnnouncement(message, settings.volume);
  }
};

/**
 * Preview / Test trigger for the merchant to verify speaker volume
 */
export const testSoundbox = async () => {
  await playCounterSoundbox({
    customerName: 'Aarav',
    businessName: 'SmashZone Arena',
    cycleStamps: 4,
    milestoneTarget: 5,
    rewardTitle: '1 Hour Free Court Session',
    isMilestone: false,
  });
};
