import cv2
sr=cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel('work/EDSR_x2.pb'); sr.setModel('edsr',2)
out=sr.upsample(cv2.imread('assets/luma-referencia.png')); cv2.imwrite('work/ref2x.png',out); print(out.shape)
