# Masking Lab — guided listening edition

Includes all five activities, 5 original sentence recordings and speech SNRs −9, −6, −3, 0, +3 and +6 dB. Each activity now includes numbered “Try this” instructions with starting values, comparisons and discussion prompts. The cross-hearing simulator's audio behavior is unchanged.

## Speech is listening only

There are no typed responses, speech scores, answer keys, comparison blocks or speech-result exports. Select an SNR, press **Play selected SNR**, and compare the same sentence at other SNRs. **Next sentence** advances through a seeded order of all five recordings without repeating; it does not auto-play. After the fifth recording, **Restart listening set** explicitly restarts the set and permits repeats. Changing the seed also restarts. Babble offsets are seeded by sentence ID and stay the same across SNRs for a fairer comparison. Repetition can improve recognition through familiarity; this is an exploratory demonstration, not a test. Tone detection retains its interval-choice feedback and score.

## Upload to GitHub Pages

Unzip the download and upload the **contents** of `masking-lab-five-sentences/` to the repository root. Preserve the `media/` folder. Upload the individual files, not the ZIP. Each media file is below 1.4 MB. In Settings → Pages select Deploy from a branch → main → / (root), then Save. Instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

For local preview, run `python3 -m http.server 8000` inside the extracted folder and visit `http://localhost:8000`. A file:// page may fail to fetch audio. Students using GitHub Pages need only a browser and stereo headphones. No accounts, server processing, analytics, external libraries, or microphone are used.

## Preserved media levels

The five sentence WAVs (`bel_sent01.wav`–`bel_sent05.wav`) remain byte-for-byte copies of the originals. To reduce download size, each of the six babble WAVs contains only the **first 15 seconds of its original recording**. Every retained PCM sample is unchanged: no normalization, gain adjustment, resampling, channel conversion or lossy encoding. The −9 dB masker remains stereo. This excerpt length is sufficient for the five short sentences, their 250 ms noise lead/tail and randomized offsets without looping.

`audio-audit.json` records new file checksums, original source checksums, levels and processing details. Whole-file RMS of a 15-second excerpt can differ from that of the 148.7-second source due to natural babble fluctuations; no calibration gain was altered. Speech and babble still use unit source gain and a single shared master. The supplier's nominal SNR labels are retained, not independently recalibrated. The shared seed generates the same sentence order and the same masker offset across SNR files. Keep device and playback volume unchanged during comparisons.


## Scientific and safety notes

Babble may produce both energetic and informational masking. Changing SNR alone does not isolate informational masking. Cross-hearing is a digital routing/attenuation illustration with a separate hypothetical dB HL calculation; it does not model actual skull transmission or prescribe clinical masking. Hypothetical presentation level affects the calculation, not the playback level. The guided IA values of 0–20 dB deliberately make the routing illustration audible; they are not assumed consumer-headphone IA values.

Temporal masking uses a 20 ms tone and 300 ms noise with 5 ms ramps. Forward tone onset = 300 ms + gap; backward noise onset = 20 ms + gap. Simultaneous tone onset is 140 ms within the noise. All scheduling uses AudioContext time. Gap is offset-to-onset and is disabled for simultaneous mode. Backward masking may be weak or absent. Synthetic tone/noise SNR is based on RMS over each shared interval; its controls are independent of the recorded speech conditions.

Start with system volume low and perform the left/right checks. Playback requires the readiness checkbox. Stop all audio or Escape cancels playback; hiding the page or unchecking readiness stops audio. Do not increase volume to chase faint signals. Software gain is not a calibrated SPL or a guarantee of safe listening. Take breaks and stop if uncomfortable. Semantic labels, keyboard controls, live status text, visible focus indicators and responsive layout are retained.

Media publication rights remain with their rights holders; no media license was supplied.

References: https://www.asha.org/policy/gl2005-00014/ and https://pubmed.ncbi.nlm.nih.gov/16158654/
