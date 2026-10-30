from rembg import remove, new_session
from PIL import Image
im=Image.open('assets/luma-referencia.png').convert('RGB')
remove(im, session=new_session('u2net'), only_mask=True).save('work/mask_u2net.png')
