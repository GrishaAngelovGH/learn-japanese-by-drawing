let audioContext: AudioContext | null = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext)()
  }
  return audioContext
}

/**
 * Plays a short synthesized "swoosh" / "whoosh" sound effect for page transitions.
 *
 * Builds the sound from filtered noise with a gentle swell-and-fade envelope
 * and a low-pass filter sweep that opens and closes — giving it a smooth
 * whoosh character instead of a percussive knock.
 *
 * No external audio file needed. Safe to call from user gesture handlers (click).
 */
export function playSwoosh() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === "suspended") {
      ctx.resume()
    }

    const duration = 0.55 // seconds — long enough to feel like a whoosh, not a hit
    const sampleRate = ctx.sampleRate
    const length = duration * sampleRate
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate white noise, then shape it with a low-pass so it's not harsh/static-y
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    // Low-pass filter that sweeps up and down — this creates the "whoosh" motion
    const lowPass = ctx.createBiquadFilter()
    lowPass.type = "lowpass"
    lowPass.Q.value = 1
    lowPass.frequency.setValueAtTime(300, ctx.currentTime) // start muffled
    lowPass.frequency.linearRampToValueAtTime(4000, ctx.currentTime + 0.12) // open up
    lowPass.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration) // close down

    // Volume envelope: gentle swell in, then fade out — avoids a sharp "knock" attack
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.1) // swell over 100ms
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration) // fade out

    source.connect(lowPass)
    lowPass.connect(gain)
    gain.connect(ctx.destination)

    source.start()
    source.stop(ctx.currentTime + duration)
  } catch {
    // Silently fail if audio is not available or blocked by browser
  }
}

export function playRestart() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === "suspended") ctx.resume()

    // A short rising arpeggio to signal restart — distinct from next/prev beeps
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    const noteDuration = 0.06
    let startTime = ctx.currentTime

    notes.forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration)
      osc.connect(gain).connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + noteDuration)
      startTime += noteDuration
    })
  } catch {}
}

export function playNext() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === "suspended") ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.18)
  } catch {}
}

export function playPrev() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === "suspended") ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(990, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.18)
  } catch {}
}
