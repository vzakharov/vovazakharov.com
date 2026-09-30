# Bite 10 — the instrument's spectra, before and after

Every voice rendered offline in headless Chromium (`OfflineAudioContext`, 48 kHz, mono), through the meadow's master gain (0.8) and compressor as `sound.ts` builds them, then windowed in 50 ms Hann frames every 5 ms and FFT'd. **>300** is the loudest 50 ms counting only what lies above 300 Hz, what a phone's speaker gives back; **full** is the same over the whole band; the shares are of the sound's whole energy. dB are of power, relative to full scale. The noise drums vary by a few tenths from run to run.

| sound       | before >300 | before full | before >300 share | before >8 kHz share | after >300 | after full | after >300 share | after >8 kHz share |
| ----------- | ----------: | ----------: | ----------------: | ------------------: | ---------: | ---------: | ---------------: | -----------------: |
| C4 (60)     |       −26.2 |       −19.1 |               20% |                  0% |      −26.2 |      −19.1 |              20% |                 0% |
| F♯4 (66)    |       −20.3 |       −20.3 |              100% |                  0% |      −20.3 |      −20.3 |             100% |                 0% |
| **C5 (72)** |   **−21.5** |   **−21.5** |              100% |                  0% |  **−21.5** |  **−21.5** |             100% |                 0% |
| F♯5 (78)    |       −22.9 |       −22.9 |              100% |                  0% |      −22.9 |      −22.9 |             100% |                 0% |
| C6 (84)     |       −24.5 |       −24.5 |              100% |                  0% |      −24.5 |      −24.5 |             100% |                 0% |
| F♯6 (90)    |       −26.3 |       −26.3 |              100% |                  0% |      −26.3 |      −26.3 |             100% |                 0% |
| B6 (95)     |       −27.8 |       −27.8 |              100% |                  0% |      −27.8 |      −27.8 |             100% |                 0% |
| kick        |       −70.1 |       −18.1 |                0% |                  0% |      −26.7 |      −18.4 |               5% |                 0% |
| tom-low     |       −69.1 |       −20.9 |                0% |                  0% |      −28.1 |      −20.4 |               8% |                 0% |
| tom-mid     |       −61.7 |       −22.7 |                0% |                  0% |      −28.8 |      −21.9 |              10% |                 0% |
| tom-high    |       −43.3 |       −24.1 |              0.2% |                  0% |      −29.4 |      −23.1 |              12% |                 0% |
| snare       |       −37.3 |       −34.6 |               75% |                  6% |      −27.8 |      −26.8 |              88% |                 7% |
| rim         |       −43.9 |       −43.9 |              100% |                0.1% |      −28.2 |      −28.2 |             100% |               0.1% |
| hat         |       −48.0 |       −48.0 |              100% |                 44% |      −27.8 |      −27.8 |             100% |                21% |
| shaker      |       −38.4 |       −38.4 |              100% |                 18% |      −26.8 |      −26.8 |             100% |                17% |

After, every drum on a phone sits 5–8 dB under a C5, where before the skins sat 22–49 dB under it. The notes did not change.

## The test's stand-in, against the render

`part-loudness.ts` computes the same measure from a voice's parts — harmonics and noise bands through Web Audio's biquad formulas, under the envelopes — and leaves the compressor out. Against a render with the compressor bypassed, it lands within 0.6 dB on every sound above (0.0 on the notes). The compressor then takes 0.9 dB off a C5 and 2.2–4.8 dB off a drum across runs, so a drum can measure up to about 4 dB lower in the real chain than the stand-in says; `instrument-voices.test.ts` asks the drums to clear the "within 12 dB of a C5" bar by 5 dB more for that reason.

The hat's hiss is now centred at 4.6 kHz with Q 1.1, its upper −3 dB edge at 7.1 kHz; a biquad's skirt still lets a fifth of its energy past 8 kHz, as it does the shaker's sixth.
