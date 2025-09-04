import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from models.dream_generator import generate_vision_path,generate_vision_image,get_updated_vision_data
from models.graph_store import GraphStore
from helpers.image_helper import pil_to_base64

app = Flask(__name__)
app.config["DEBUG"] = True
CORS(app)

@app.route("/generate-dream", methods=["POST"])
def generate_dream():
    #try:
    data = request.json
    graph  = GraphStore()

    user_milestone = data.get('milestone','')
    user_vision = data.get('vision','')
    user_category = data.get('category','career') 

    #check if node exists or not
    first_node = graph.node_exists()
    if not first_node:
        current_node = graph.create_new_node(user_milestone,user_vision,{})
    else:
        current_node = graph.find_last_node(first_node['element_id'])
    print('current',current_node)
    next_vision_data = generate_vision_path(user_vision,current_node['milestone_history'],user_category)
    vision_history = json.loads(current_node['milestone_history'])
    vision_history[current_node['element_id']] = current_node['current_vision']
    next_node = graph.create_new_node(next_vision_data['milestone'],next_vision_data['vision'],vision_history)

    #connect current_node and next_node
    current_node = graph.connect_nodes(current_node,next_node,user_category)


@app.route("/graph/get-nodes", methods=["GET"])
def get_node():
    nodes = (GraphStore()).get_nodes()
    return jsonify(nodes)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
