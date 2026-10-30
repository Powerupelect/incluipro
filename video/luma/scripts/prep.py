import cv2, numpy as np, os
from scipy import ndimage as ndi
src=cv2.imread('src.png'); H,W=src.shape[:2]
up=cv2.imread('src2x.png') if os.path.exists('src2x.png') else cv2.resize(src,(W*2,H*2),interpolation=cv2.INTER_LANCZOS4)
m=cv2.imread('mask_u2net.png',0).astype(np.float32)/255
# solid interior: fill holes on a binary mask, erode, union with soft mask
b=m>0.25; b=ndi.binary_fill_holes(b); b=ndi.binary_erosion(b,iterations=4)
m=np.maximum(m, ndi.gaussian_filter(b.astype(np.float32),1.5))
# drop stray blobs far from the fox (keep largest component)
lab,n=ndi.label(m>0.1); sizes=ndi.sum(np.ones_like(m),lab,range(1,n+1)); keep=1+int(np.argmax(sizes))
m=m*(lab==keep)
# ---- background plate: inpaint fox
hard=ndi.binary_dilation(m>0.05,iterations=14).astype(np.uint8)*255
small=cv2.resize(src,(W//2,H//2),interpolation=cv2.INTER_AREA); sm=cv2.resize(hard,(W//2,H//2))
inp=cv2.inpaint(small,(sm>0).astype(np.uint8)*255,21,cv2.INPAINT_NS)
inp=cv2.GaussianBlur(inp,(0,0),4)
inp_up=cv2.resize(inp,(W*2,H*2),interpolation=cv2.INTER_CUBIC)
hm=cv2.resize(cv2.GaussianBlur(hard,(0,0),6),(W*2,H*2)).astype(np.float32)[...,None]/255
plate=(up*(1-hm)+inp_up*hm)
# depth-of-field blur: background wall softer than table
bl1=cv2.GaussianBlur(plate,(0,0),2.2); bl2=cv2.GaussianBlur(plate,(0,0),5.0)
yy=np.arange(H*2)[:,None,None]/2.0
wfar=np.clip((760-yy)/200,0,1)   # 1 = wall (far)
plate=bl1*(1-wfar)+bl2*wfar
# ---- extend top/bottom (src px): top 260, bottom 380
T,B=260*2,520*2
top=plate[:T][::-1]; top=cv2.GaussianBlur(top,(0,0),9)
g=np.linspace(0.35,1,T)[:,None,None]; top=top*g
bot=plate[-B:][::-1]; bot=cv2.GaussianBlur(bot,(0,0),7)
g=(np.linspace(0.8,0.04,B)**1.7)[:,None,None]; bot=bot*g
ext=np.concatenate([top,plate,bot],0)
# soften seams
for y0 in (T,T+H*2):
    s=slice(y0-40,y0+40); ext[s]=cv2.GaussianBlur(ext[s],(0,0),6)
cv2.imwrite('../assets/plate.jpg',np.clip(ext,0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,92])
# bloom source: bright parts of plate (window light)
lum=ext.mean(2); br=np.clip((lum-170)/70,0,1)[...,None]*ext
br=cv2.resize(br,(ext.shape[1]//4,ext.shape[0]//4)); br=cv2.GaussianBlur(br,(0,0),14)
cv2.imwrite('../assets/bloom.jpg',np.clip(br*1.2,0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,90])
# ---- fox texture with alpha: src x 160..890, y -60..830 (2x)
X0,X1,Y0,Y1=160,890,-60,830
m2=cv2.resize(m,(W*2,H*2),interpolation=cv2.INTER_LINEAR)
fox=np.zeros(((Y1-Y0)*2,(X1-X0)*2,4),np.uint8)
ys=slice(0,Y1*2); fox[(0-Y0)*2:, :, :3]=up[0:Y1*2, X0*2:X1*2]
fox[(0-Y0)*2:, :, 3]=np.clip(m2[0:Y1*2, X0*2:X1*2]*255,0,255).astype(np.uint8)
# light unsharp for crispness
rgb=fox[...,:3].astype(np.float32); rgb=np.clip(rgb*1.35-cv2.GaussianBlur(rgb,(0,0),2)*0.35,0,255)
fox[...,:3]=rgb.astype(np.uint8)
cv2.imwrite('../assets/fox.png',fox)
print('plate',ext.shape,'fox',fox.shape)
