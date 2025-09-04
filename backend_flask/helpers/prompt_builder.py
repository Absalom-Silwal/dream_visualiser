import json
def build_prompt(current_vision,vision_history,category):
    history = json.loads(vision_history)
    history = ','.join(history.values()) if len(history) else '' 
    return f"""
        You are a milestone node in a user's dream graph.

        The user’s current prompt:  
        {current_vision}

        Chosen category:  
        {category}

        Previous milestone visions:
        {vision_history}

        Based on this growth and the user's current prompt, generate the next milestone vision in first-person voice.  
        Make it emotionally resonant, specific, and forward-looking.  
        Return a valid JSON object ONLY, nothing else. 
        The JSON must have these fields:
        - "milestone": (string) A short milestone title
        - "vision": (string) A first-person description of what success looks like
        - "image_prompt": (string) A vivid visual scene that represents this milestone

        Strict rules:
        - Do not include markdown, explanations, or extra text.
        - Do not wrap the JSON in code blocks.
        - Ensure all strings are properly quoted and escaped.Return only the updated vision as a single paragraph.

        """
