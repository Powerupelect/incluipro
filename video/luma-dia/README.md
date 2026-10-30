# Um dia na casa da Luma

Reels de 10 s em 1080×1920 e 30 fps. O vídeo final é `renders/um-dia-na-casa-da-luma.mp4`.

| Tempo | Cena | O que acontece |
| --- | --- | --- |
| 0–2,5 s | Quarto (`assets/quarto.jpg`) | Pisca, mexe a orelha, olha para a direita e a câmera "segue" a Luma num movimento rápido. |
| 2,5–5 s | Mesa (`assets/mesa.jpg`) | Sentadinha com as mãos nas bochechas, balança animada. |
| 5–7,5 s | Escrivaninha (`assets/queixo.jpg`) | Queixo nas mãos, piscada lenta e olhar sonhador. |
| 7,5–10 s | Pôr do sol (`assets/porsol.jpg`) | Um clarão quente marca a passagem para o fim do dia. A câmera vai até o sol e aparece "Mundo da Luma". |

- `scripts/upscale.py` e `scripts/prep.py`: recortam as cenas das colagens, fazem upscale ×2 (EDSR) e exportam as texturas.
- `scripts/audio.py`: caixinha de música, ar do quarto, patinhas e "whoosh" nas passagens, passarinhos, brisa e grilos no fim de tarde, e o sininho do título.
- `assets/rig.js`: um rig WebGL por cena (câmera, piscadas, olhar, cabeça, orelhas, cauda, topete, vegetação ao vento, luzes), mais as passagens com blur de movimento, a poeira e o clarão.

```bash
npx hyperframes check
npx hyperframes render --quality delivery --workers 4 --output renders/um-dia-na-casa-da-luma.mp4
```
