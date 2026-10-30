# Cut Luma out, rebuild the room behind her, and export 2x textures for the rig.
import cv2, numpy as np, os
from scipy import ndimage as ndi
src=cv2.imread('assets/luma-referencia.png'); H,W=src.shape[:2]
up=cv2.imread('work/ref2x.png') if os.path.exists('work/ref2x.png') else cv2.resize(src,(W*2,H*2),interpolation=cv2.INTER_LANCZOS4)
m=cv2.imread('work/mask_u2net.png',0).astype(np.float32)/255
# keep only the fox: largest component of the confident mask, holes filled
core=m>0.5
lab,n=ndi.label(core); sizes=ndi.sum(np.ones_like(m),lab,range(1,n+1)); core=lab==(1+int(np.argmax(sizes)))
core=ndi.binary_fill_holes(core)
near=ndi.binary_dilation(core,iterations=10)
m=np.where(near,m,0)
m=np.maximum(m, ndi.gaussian_filter(ndi.binary_erosion(core,iterations=3).astype(np.float32),1.2))
# ---- background plate: inpaint where she stands
hard=ndi.binary_dilation(m>0.04,iterations=12).astype(np.uint8)*255
small=cv2.resize(src,(W//2,H//2),interpolation=cv2.INTER_AREA); sm=cv2.resize(hard,(W//2,H//2))
inp=cv2.inpaint(small,(sm>0).astype(np.uint8)*255,15,cv2.INPAINT_TELEA)
inp=cv2.GaussianBlur(inp,(0,0),5)
inp_up=cv2.resize(inp,(W*2,H*2),interpolation=cv2.INTER_CUBIC).astype(np.float32)
hm=cv2.resize(cv2.GaussianBlur(hard,(0,0),5),(W*2,H*2)).astype(np.float32)[...,None]/255
plate=up.astype(np.float32)*(1-hm)+inp_up*hm
cv2.imwrite('assets/plate.jpg',np.clip(plate,0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,93])
# ---- fox texture (full frame, 2x) with alpha
m2=cv2.resize(m,(W*2,H*2),interpolation=cv2.INTER_LINEAR)
fox=np.dstack([up, np.clip(m2*255,0,255).astype(np.uint8)])
cv2.imwrite('assets/fox.png',fox)
# ---- bloom source: brightest parts of the whole picture
lum=up.astype(np.float32).mean(2); br=np.clip((lum-185)/60,0,1)[...,None]*up
br=cv2.resize(br,(W//2,H//2)); br=cv2.GaussianBlur(br,(0,0),12)
cv2.imwrite('assets/bloom.jpg',np.clip(br*1.3,0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,90])
# previews
a=m[...,None]; prev=(src*a+np.array([255,0,255])*(1-a)).astype(np.uint8)
cv2.imwrite('work/cut_prev.jpg',cv2.resize(prev,(W//2,H//2))); cv2.imwrite('work/plate_prev.jpg',cv2.resize(plate.astype(np.uint8),(W//2,H//2)))
print('done',fox.shape)
