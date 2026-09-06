# Measured performance and verification limits

## Test environment

Windows 10 Home build 19045; Intel i9-12900K; NVIDIA RTX 3080 Ti, driver 32.0.16.1074; 34,088,239,104 bytes physical RAM. Chromium 153.0.8010.12 used ANGLE Direct3D11 on the physical NVIDIA GPU at 1920 × 1080. The environment is recorded in [environment.json](../reports/environment.json). This is a high-end desktop, not representative mainstream laptop hardware. Safari was unavailable.

## Sustained real-time measurements

Each physical-GPU run used 30 seconds warm-up, at least 1,200 measured wall-clock seconds and ten subsequent restarts. The isolated preview refreshed jetpack through the UI every four seconds and used keyboard lane changes. No accelerated simulation clock was used. This exercises world streaming, district transitions, animated assets, effects and restarts; it is not twenty minutes of human obstacle play. Other browser verification and development work occurred during portions of the high run.

| Measurement | Medium baseline | Final high renderer |
| --- | ---: | ---: |
| Measured seconds | 1,200.030 | 1,200.222 |
| Frame intervals sampled | 287,526 | 286,302 |
| p50 / p95 / p99, ms | 4.2 / 4.3 / 4.3 | 4.2 / 4.3 / 4.3 |
| Maximum interval, ms | 37.4 | 24.9 |
| Intervals over 33 ms | 1 | 0 |
| Restarts | 10 | 10 |
| Uncaught runtime errors | 0 | 0 |
| Normal save unchanged | Yes | Yes |

Sources: [medium report](../reports/performance-medium.json), [high report](../reports/performance.json). Intervals measure requestAnimationFrame cadence, not GPU execution time or guaranteed performance on other displays. The high run began at 2026-09-06T17:21:54.055Z and includes 35 GLBs, selective bloom, multisample antialiasing and the final drone position. Its JavaScript asset is `index-Bq687XPE.js`. The delivered build subsequently added only the menu start guard during incomplete/failed asset loading; that guard passed a separate [asset-failure test](../reports/asset-failure.json). The medium baseline predates the tunnel/harbor additions and high-only bloom.

After district warm-up, high quality stayed at 49 Three.js geometries and 17 textures, including through all ten restarts. The pooled object count reached 47 and remained there. Sampled JS heap after five minutes varied between 48,973,411 and 76,444,472 bytes; the last sample was 63,754,150 used / 109,463,098 allocated bytes. This shows garbage-collection fluctuations and stable renderer counters in the measured window, without evidence of accumulating render resources. It does not measure total browser process memory, GPU memory or arbitrarily long sessions. The working diagnostic budget is 150 MB used JavaScript heap and bounded renderer/world pools; these sampled runs stayed below it.

The preserved [SwiftShader baseline](../reports/performance-baseline.json) was software rendering: 1,198.394 measured seconds, p50/p95/p99 133.3/266.6/283.3 ms. It failed the 60 FPS target and was shorter than the required twenty minutes. It is diagnostic evidence, not a physical-GPU result.

## Loading, download and offline

Fresh isolated production browser suites reached the loaded title in 1,309 ms (Chromium) and 1,932 ms (Firefox) on the local server. These include asset readiness and are more useful than the page load event alone; they are not internet bandwidth benchmarks. Both suites passed actual offline reload and keyboard play after the complete-cache indicator, with no external HTTP requests or uncaught errors. Firefox masks its renderer string; its reported GTX 980-like string is not the physical host's GPU identity.

The complete production directory is 23,135,572 bytes (approximately 23.14 MB / 22.06 MiB), below both the 25 MB first-playable and 80 MB full-demo targets even when counting every file uncompressed. The exact delivered file sizes and SHA-256 hashes are in [build-manifest.json](../reports/build-manifest.json). The final packaging pass removed trailing blank lines in source files; this changed only HTML whitespace and the cache version, with the JavaScript payload unchanged. Source PNGs and editable Blender files are excluded from the download. The 35 runtime GLBs total 20,516,712 bytes; no mesh compression decoder is required. Browser caches include local fonts, audio, models and licenses.

## Interpretation

The physical desktop meets the 60 FPS target in these measured conditions. Mainstream hardware, Safari, total process/VRAM usage, perceptual audio listening, professional animation quality and a full accessibility audit remain unverified. Screenshots and short manual keyboard runs support presentation/interaction review, not performance conclusions. See [feature checklist](FEATURE-CHECKLIST.md) for the remaining production-art requirements.
