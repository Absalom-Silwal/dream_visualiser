import os,json
from openai import OpenAI
from huggingface_hub import InferenceClient
from helpers.prompt_builder import build_prompt




def generate_vision_path(current_vision,vision_history,category):
    
    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=os.environ["HF_TOKEN"],
    )
    completion = client.chat.completions.create(
        model="openai/gpt-oss-20b:fireworks-ai",
        messages=[
            {
                "role": "user",
                "content": build_prompt(current_vision,vision_history,category)
            }
        ],
    )

    response = completion.choices[0].message.content
    #print(response)
    return json.loads(response)

def generate_vision_image(image_prompt):
    client = InferenceClient(
        provider="nebius",
        api_key=os.environ["HF_TOKEN"],
    )
    image = client.text_to_image(
        image_prompt,
        model="stabilityai/stable-diffusion-xl-base-1.0",
    )
    return image

def get_updated_vision_data(prev_data,updated_vision,category,generate_new_node):
    history = prev_data.get('history',{})
    if isinstance(history, str):   # if it's JSON string
        updated_history = json.loads(json.loads(history))
    elif isinstance(history, dict):   # if already dict
        updated_history = history
    else:
        updated_history = {}
    updated_history[prev_data['element_id']] = updated_vision['vision']
    updated_history = json.dumps(updated_history)
    data = {
        'goal':{
            'milestone':updated_vision['milestone'],
            'vision':updated_vision['vision']
        },
        'category':category,
        'history':updated_history,
    }
    if generate_new_node == False:
        data['element_id'] = prev_data['element_id']
    print('generate_new_node',generate_new_node)
    return data