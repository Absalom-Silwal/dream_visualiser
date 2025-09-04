import base64
import io

def pil_to_base64(img):
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    byte_data = buf.getvalue()
    base64_img = base64.b64encode(byte_data).decode("utf-8")
    return f"data:image/png;base64,{base64_img}"
