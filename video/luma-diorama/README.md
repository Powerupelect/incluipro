# Luma em miniatura

Animação de 8 s em 1080×1920 (9:16), a 30 fps e com câmera fixa, feita a partir de `assets/luma-referencia.png`. O vídeo final é `renders/luma-diorama.mp4`.

- `scripts/upscale.py`: upscale ×2 com EDSR.
- `scripts/mask.py`: recorte da Luma com rembg/u2net.
- `scripts/prep.py`: gera as texturas da Luma e do quarto, a camada de bloom e o fundo reconstruído atrás dela.
- `scripts/audio.py`: ambiente ASMR (ar do quarto, brisa da janela, passarinhos ao longe, roçar da pelagem e estalinhos das lanternas). Não tem música nem voz.
- `assets/rig.js`: um passe de WebGL em tela cheia. Anima a Luma (respiração, balanço do peso, cabeça, olhar, piscadas, orelhas, topete, cauda, colete e sorriso) e o quarto (cortina, plantas, lanterna pendurada, flores). Também cuida da luz das lanternas, da luz da janela e da poeira no ar.

```bash
npx hyperframes check
npx hyperframes render --quality delivery --workers 4 --output renders/luma-diorama.mp4
```
