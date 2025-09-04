from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16).to("cpu")

def generate_image(prompt):
    image = pipe(prompt).images[0]
    path = f"static/{prompt[:20].replace(' ', '_')}.png"
    image.save(path)
    return path
