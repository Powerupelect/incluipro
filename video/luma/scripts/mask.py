from rembg import remove, new_session
from PIL import Image
im=Image.open('src.png')
for m in ['isnet-general-use','u2net']:
    try:
        s=new_session(m); out=remove(im, session=s, only_mask=True); out.save(f'mask_{m}.png'); print('ok',m)
    except Exception as e: print(m, e)
