# Masking Lab — guided listening edition

Includes all five activities, 10 original sentence recordings and speech SNRs −3, 0, +3, +6 and +9 dB. Each activity now includes numbered “Try this” instructions with starting values, comparisons and discussion prompts. The cross-hearing simulator's audio behavior is unchanged.

## Speech is listening only

There are no typed responses, speech scores, answer keys, comparison blocks or speech-result exports. Select an SNR, press **Play selected SNR**, and compare the same sentence at other SNRs. **Next sentence** advances through a seeded order of all ten recordings without repeating; it does not auto-play. After the tenth recording, **Restart listening set** explicitly restarts the set and permits repeats. Changing the seed also restarts. Babble offsets are seeded by sentence ID and stay the same across SNRs for a fairer comparison. Repetition can improve recognition through familiarity; this is an exploratory demonstration, not a test. Tone detection retains its interval-choice feedback and score.

## Upload to GitHub Pages

Unzip the download and upload the **contents** of `masking-lab-guided/` to the repository root. Preserve the `media/` folder. Upload the individual files, not the ZIP. Each media file is below 7 MB. In Settings → Pages select Deploy from a branch → main → / (root), then Save. Instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

For local preview, run `python3 -m http.server 8000` inside the extracted folder and visit `http://localhost:8000`. A file:// page may fail to fetch audio. Students using GitHub Pages need only a browser and stereo headphones. No accounts, server processing, analytics, external libraries, or microphone are used.

## Preserved media levels

All 15 WAVs remain byte-for-byte copies of the uploaded recordings. `audio-audit.json` records SHA-256 checksums, formats, levels and durations. Sentences 01–10 and the five selected babble recordings are mono 16-bit PCM at 22,050 Hz. No normalization, cropping, recompression, limiter, or condition-specific gain is applied. Speech and babble use unit source gain and a single shared master volume. Noise starts 250 ms before speech and ends 250 ms afterward. The original supplied nominal SNR relationships are preserved; the supplier's active-speech calibration procedure was not included and cannot be independently reconstructed. Keep device and shared volume fixed across comparisons.

## Scientific and safety notes

Babble may produce both energetic and informational masking. Changing SNR alone does not isolate informational masking. Cross-hearing is a digital routing/attenuation illustration with a separate hypothetical dB HL calculation; it does not model actual skull transmission or prescribe clinical masking. Hypothetical presentation level affects the calculation, not the playback level. The guided IA values of 0–20 dB deliberately make the routing illustration audible; they are not assumed consumer-headphone IA values.

Temporal masking uses a 20 ms tone and 300 ms noise with 5 ms ramps. Forward tone onset = 300 ms + gap; backward noise onset = 20 ms + gap. Simultaneous tone onset is 140 ms within the noise. All scheduling uses AudioContext time. Gap is offset-to-onset and is disabled for simultaneous mode. Backward masking may be weak or absent. Synthetic tone/noise SNR is based on RMS over each shared interval; its controls are independent of the recorded speech conditions.

Start with system volume low and perform the left/right checks. Playback requires the readiness checkbox. Stop all audio or Escape cancels playback; hiding the page or unchecking readiness stops audio. Do not increase volume to chase faint signals. Software gain is not a calibrated SPL or a guarantee of safe listening. Take breaks and stop if uncomfortable. Semantic labels, keyboard controls, live status text, visible focus indicators and responsive layout are retained.

Media publication rights remain with their rights holders; no media license was supplied.

References: https://www.asha.org/policy/gl2005-00014/ and https://pubmed.ncbi.nlm.nih.gov/16158654/
