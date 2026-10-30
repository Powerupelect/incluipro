# Export each scene texture at 2x (EDSR when available, Lanczos otherwise) with a gentle unsharp mask.
import cv2, os, numpy as np
for n,src in [('quarto','work/quarto2x.png'),('mesa','work/mesa2x.png'),('queixo','work/queixo2x.png'),('porsol','work/porsol2x.png')]:
    if os.path.exists(src): im=cv2.imread(src)
    else:
        p=cv2.imread(f'work/p_{n}.png'); im=cv2.resize(p,(p.shape[1]*2,p.shape[0]*2),interpolation=cv2.INTER_LANCZOS4)
    f=im.astype(np.float32); f=np.clip(f*1.25-cv2.GaussianBlur(f,(0,0),2.5)*0.25,0,255)
    cv2.imwrite(f'assets/{n}.jpg',f.astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,93]); print(n, im.shape, os.path.exists(src))
