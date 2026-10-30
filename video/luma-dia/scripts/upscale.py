# EDSR x2 on each scene (the collage panels are small, so every pixel helps)
import cv2, sys
sr=cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel('work/EDSR_x2.pb'); sr.setModel('edsr',2)
for n in sys.argv[1:]:
    out=sr.upsample(cv2.imread(f'work/p_{n}.png')); cv2.imwrite(f'work/{n}2x.png',out); print(n,out.shape,flush=True)
