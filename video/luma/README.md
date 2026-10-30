# A pequena descoberta da Luma

Reels 1080×1920, 30 fps, 18 s, feito com HyperFrames. Vídeo final: `renders/mundo-da-luma.mp4`.

## Como funciona

- `assets/luma-original.png`: a ilustração original.
- `scripts/mask.py`: recorta a Luma do fundo (rembg/u2net).
- `scripts/prep.py`: upscale ×2 (EDSR), fundo sem a Luma, desfoque de profundidade, extensão vertical 9:16 e camada de bloom. Gera `assets/plate.jpg`, `assets/fox.png` e `assets/bloom.jpg`.
- `scripts/tts.py`: vozes em pt-BR (Kokoro, voz `pf_dora`). Depois o tom é subido um pouco com ffmpeg.
- `scripts/audio.py`: trilha de caixinha de música, efeitos sonoros e o envelope de sincronia labial (`assets/lipsync.js`).
- `assets/rig.js`: rig 2.5D em WebGL que deforma a imagem para animar cabeça, olhar, piscadas, piscadela, boca sincronizada com a voz, orelhas, topete, cauda, colete ao vento e respiração. Também cuida da luz de recorte, da luz da caixinha, do bloom, das partículas e da câmera.
- `compositions/luma.html`: a cena com o rig. `compositions/titulo.html`: o título "Mundo da Luma" (variável `titulo`).

## Comandos

```bash
npx hyperframes check
npx hyperframes snapshot --at 2.5,7.5,14
npx hyperframes render --quality delivery --workers 4 --output renders/mundo-da-luma.mp4
```
