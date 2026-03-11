/**
 * pcm-processor.js  — AudioWorklet (runs on the audio rendering thread)
 *
 * WHY THIS FILE EXISTS:
 *   The browser mic delivers Float32 audio at 44.1kHz or 48kHz.
 *   Gemini Live API requires raw 16-bit PCM at 16kHz (mono, little-endian).
 *   We cannot do this conversion on the main JS thread without blocking UI.
 *   AudioWorklet runs on a dedicated audio rendering thread — zero UI jank.
 *
 * WHAT IT DOES:
 *   1. Receives Float32 samples at the browser's native rate (typically 48kHz)
 *   2. Mixes all channels to mono
 *   3. Downsamples to 16kHz using averaging decimation (good enough for voice)
 *   4. Converts Float32 → Int16 (Gemini's expected format)
 *   5. Accumulates 320 samples (~20ms at 16kHz) then posts to main thread
 *   6. Responds to { type: 'suppress', value: bool } to silence output
 *      — used for echo prevention when ARIA is speaking
 *
 * CHUNK SIZE — WHY 320 samples (640 bytes):
 *   320 int16 samples × 2 bytes = 640 bytes per chunk.
 *   Your backend logs confirm: "send_audio: 640 bytes → Gemini" ✅
 *   Google recommends ~20ms chunks for Gemini Live (320 samples at 16kHz = 20ms).
 *
 * DOWNSAMPLING STRATEGY:
 *   We average input samples over each decimation window. For a 3:1 ratio
 *   (48kHz → 16kHz), every 3 input samples produce 1 output sample.
 *   Averaging (not just skipping) prevents aliasing on voice frequencies.
 *   For non-integer ratios we track a fractional position.
 */

const TARGET_SAMPLE_RATE = 16000;
const CHUNK_SIZE = 320; // 320 int16 samples × 2 bytes = 640 bytes — matches backend

class PCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);

    // sampleRate is a global in AudioWorkletGlobalScope
    this._ratio = sampleRate / TARGET_SAMPLE_RATE; // e.g. 48000/16000 = 3.0

    this._outBuf = new Float32Array(CHUNK_SIZE);
    this._outIdx = 0;

    // Accumulator for decimation averaging
    this._acc = 0;
    this._accN = 0;
    this._fracPos = 0; // fractional input position tracker

    // When true, output silence (echo suppression — set while ARIA is speaking)
    this._suppress = false;

    this.port.onmessage = (e) => {
      if (e.data?.type === 'suppress') {
        this._suppress = !!e.data.value;
      }
    };
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    // Mix all channels to mono
    const numChannels = input.length;
    const len = input[0].length;

    for (let i = 0; i < len; i++) {
      // Mono mix across all input channels
      let sample = 0;
      for (let c = 0; c < numChannels; c++) sample += input[c][i];
      sample /= numChannels;

      // Accumulate for decimation averaging
      this._acc += sample;
      this._accN++;
      this._fracPos++;

      // When we've consumed _ratio input samples, emit one 16kHz output sample
      if (this._fracPos >= this._ratio) {
        this._fracPos -= this._ratio;

        // If ARIA is speaking, suppress mic input to prevent echo feedback
        const out = this._suppress ? 0 : (this._acc / this._accN);
        this._acc = 0;
        this._accN = 0;

        this._outBuf[this._outIdx++] = out;

        // Once we have a full 320-sample chunk (640 bytes), send to main thread
        if (this._outIdx >= CHUNK_SIZE) {
          // Convert Float32 → Int16 little-endian
          const int16 = new Int16Array(CHUNK_SIZE);
          for (let j = 0; j < CHUNK_SIZE; j++) {
            const clamped = Math.max(-1, Math.min(1, this._outBuf[j]));
            int16[j] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
          }
          // Zero-copy transfer to main thread — int16.buffer is detached after this
          this.port.postMessage({ type: 'pcm', buffer: int16.buffer }, [int16.buffer]);
          this._outIdx = 0;
        }
      }
    }

    return true; // Keep processor alive indefinitely
  }
}

registerProcessor('pcm-processor', PCMProcessor);