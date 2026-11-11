# Masking Lab — small GitHub edition

This edition includes **10 sentences** (`bel_sent01.wav`–`bel_sent10.wav`) and exactly five speech-in-noise settings: **−3, 0, +3, +6, +9 dB SNR**. All five teaching activities remain available. Quiet and the other recorded SNRs are omitted from this edition.

The speech comparison is now **two blocks of five unique sentences**, ten trials total. Default easy = +9 dB; hard = −3 dB. Each correct sentence is 20 percentage points in its block. Start the comparison before exploration: both modes share the ten-sentence pool, without repeats. Exploration, interruptions, or ending a comparison consume sentences; reload to explicitly start a fresh session. There are no spare sentences for replacing interrupted trials in a full comparison. Export partial results, end the comparison and reload if interrupted.

## Publish

Unzip the download. Upload the **contents** of `masking-lab-small/` to your repository, preserving `media/` and its files. Do not upload the ZIP itself to the repository. Each individual file is below 7 MB. In Settings → Pages, select Deploy from a branch → main → / (root) → Save. See [GitHub Pages instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

For a local preview, run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`. On GitHub Pages students only need a browser and stereo headphones.

## Calibration and scoring

All 15 included WAV files are **byte-for-byte copies of the originals**. No normalization, cropping, recompression, or level adjustment was applied. The selected full-length babble recordings retain their original approximately 3 dB level steps. Both sentence and masker use unit source gain and one common master volume; SNR labels retain the supplier's nominal calibration. Their original active-speech calibration procedure was not included and is not independently reconstructed. `audio-audit.json` records checksums and levels.

The ten sentences remain mono 16-bit PCM at 22,050 Hz; all five babble files are also mono 16-bit PCM at 22,050 Hz. Babble segments begin 250 ms before the sentence and end 250 ms afterward. Seeded sentence order and noise offsets are reproducible. The shared volume control changes both components together.

No transcripts were supplied. Default sentence scoring is explicitly unverified self-report after a typed response. An optional instructor JSON key with verified sentence strings for keys "1" through "10" enables exact-sentence scoring (case and punctuation ignored). The app checks key completeness, not transcript accuracy. Results export locally as JSON, including responses, condition, seed, offsets, interruptions and scoring method. Reload clears memory; export first.

Babble may produce both energetic and informational masking. Changing SNR alone does not isolate informational masking. Five-trial blocks are especially coarse: differences can reflect sentence difficulty, order, attention, or self-rating bias. This is an educational demonstration, not a validated hearing test.

## Safety and activities

Keep system volume low; use the channel checks before listening. Playback requires the readiness checkbox. Stop all audio or Escape cancels sounds; hiding the page also stops playback. No consumer-headphone volume percentage guarantees a safe SPL. Do not raise volume to chase faint tones.

Cross-hearing illustrates digital ear routing, IA and a hypothetical dB HL calculation; it does not simulate actual skull transmission or prescribe clinical masking. Energetic masking provides adjustable tone/noise SNR. Temporal masking schedules forward, backward and simultaneous presentations on the audio clock. Tone detection uses a seeded two-interval forced-choice task. Speech supports the five supplied SNRs, exploration, two five-trial blocks, scoring and export. Synthetic-tone exercise SNR controls are independent of the five recorded speech SNR choices.

Semantic labels, keyboard controls, focus outlines, responsive layout and live status text are retained. No accounts, backend, analytics, microphone or external libraries are required. Confirm publication rights for uploaded media; no media license was supplied.

References: [ASHA audiometry guidance](https://www.asha.org/policy/gl2005-00014/); [Kidd et al., energetic and informational masking](https://pubmed.ncbi.nlm.nih.gov/16158654/).
