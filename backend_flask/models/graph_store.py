import json
from neo4j import GraphDatabase
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASS
from helpers.prompt_builder import build_prompt
from models.dream_generator import generate_vision_path

class GraphStore:
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))


    def get_nodes(self):
        records,summary,keys  = self.driver.execute_query("""
                MATCH (a:Vision)-[r:CATEGORY]->(b:Vision) return elementId(a) as aId,a,r,elementId(b) as bId,b,elementId(r) AS rId
            """)
        return self.node_data(records)
    
    def update_node(self,elementId):
        records, summary, keys = self.driver.execute_query("""
        MATCH (a:Vision)
        WHERE elementId(a)={elementId}
        SET p.age = $age
        """, elementId=elementId
        #database_="<database-name>",
        )
        return self.get_nodes(self) 
    
    def get_shortest_path(self):
        pass
    
    def node_data(self,records): 
        """
        //** should be in this format **//
        {
            nodes: [
                { id: 'node1', label: 'Alice', title: 'Mentor', group: 'Person' },
                { id: 'node2', label: 'Bob', title: 'Mentee', group: 'Person' },
                { id: 'node3', label: 'Dream', title: 'Visual Goal', group: 'Concept' }
            ],
            edges: [
                { id: 'edge1', from: 'node1', to: 'node2', label: 'Guides', arrows: 'to' },
                { id: 'edge2', from: 'node2', to: 'node3', label: 'Pursues', arrows: 'to' }
            ]
            }
        """  
        nodes = {}
        edges = []
        #records = [record.data() for record in records]
        for record in records:
            aId = record["aId"]
            bId = record["bId"]
            rId = record["rId"]
            aProps = record["a"]._properties
            bProps = record["b"]._properties
            rProps = record["r"]._properties

            # Add node A
            if aId not in nodes:
                nodes[aId] = {
                    "id": aId,
                    "label": aProps.get("milestone", "Milestone A"),
                    "title": str(aProps),
                    "group": "Vision",
                    #"shape":"image",
                    #"image": aProps.get('image',False)
                }
                if aProps.get('image'):
                    nodes[bId]["shape"] = "image"
                    nodes[aId]['image'] = aProps.get('image')
                    nodes[aId]['size'] = 30
            # Add node B
            if bId not in nodes:
                nodes[bId] = {
                    "id": bId,
                    "label": bProps.get("milestone", "Milestone B"),
                    "title": str(bProps),
                    "group": "Vision",
                    #"shape":"image",
                    #"image": bProps.get('image',False)
                }
                if bProps.get('image'):
                    nodes[bId]["shape"] = "image"
                    nodes[bId]['image'] = bProps.get('image')
                    nodes[bId]['size'] = 30

            # Add edge
            edges.append({
                "id": rId,
                "from": aId,
                "to": bId,
                "label": rProps.get("name", "category"),
                "title": str(rProps),
                "arrows": "to"
            })
        return {
            "nodes": list(nodes.values()),
            "edges": edges
        }
    
    def node_exists(self):
        #finding the initial node
        query ="""
            MATCH (start:Vision)
            WHERE NOT (:Vision)-[:CATEGORY]->(start)
            RETURN start {.*, element_id: elementId(start)} AS start;
            """
        records,summary,keys = self.driver.execute_query(query)
        if len(records) > 0:
            return records[0].data().get('start') 
        return False
    
    def find_last_node(self,first_element_id):
        query="""
                MATCH (start:Vision) WHERE elementId(start)=$element_id
                OPTIONAL MATCH (start)-[:CATEGORY*]->(last)
                WHERE NOT (last)-[:CATEGORY]->(:Vision)
                RETURN coalesce(last {.*,element_id:elementId(last)}, start {.*,element_id:elementId(start)}) AS finalNode
                """
        records, summary, keys = self.driver.execute_query(query, element_id=first_element_id)
        return records[0].data().get('finalNode') if records else None
    
    def find_node_by_element_id(self,element_id):
        query = """
                    MATCH (a:Vision)
                    WHERE elementId(a) = $element_id
                    OPTIONAL MATCH (a)-[:CATEGORY]->(b:Vision)
                    WITH a, collect(elementId(b)) AS next_ele
                    SET a.next_ele = next_ele[0]
                    RETURN a {.*, element_id: elementId(a), next_ele: a.next_ele} AS a;
                    """
        params = {'element_id':element_id}
        records,summary,keys = self.driver.execute_query(query,**params)
        return records[0].data().get('a') if records else None

    def create_new_node(self,milestone,vision,history):
        query ="""
                MERGE (a:Vision {current_milestone:$milestone})
                SET a += $node_properties
                RETURN  a {.*,element_id:elementId(a),next_ele:null} AS a
                """
        
        properties = {
            'milestone_history':json.dumps(history),
            'current_vision':vision,
        } 
        params = {'milestone':milestone,'node_properties':properties}
        records,summary,keys = self.driver.execute_query(query,**params)
        return records[0].data().get('a') if records else None

        
    
    def update_current_vision_node(self,current_node,updated_data,generate_new_node):
        history = json.loads(json.loads(current_node.get('history')))
        history[current_node['element_id']] = updated_data['goal']['vision']
        properties = {
            'milestone':updated_data['goal']['milestone'],
            'history':json.dumps(history),
            'current_vision':updated_data['goal'].get('vision',''),
            'category':updated_data['category'],
            'prompt':build_prompt()
        }
        query = """
                    MATCH (a:Vision) 
                    WHERE elementId(a) = $element_id
                    SET a += $properties
                    WITH a
                    OPTIONAL MATCH (a)-[:CATEGORY]->(b:Vision)
                    WITH a, collect(elementId(b)) AS next_ele
                    SET a.next_ele = head(next_ele)
                    RETURN a {.*, element_id: elementId(a), next_ele: a.next_ele} AS a;
                """
        params = {'element_id':current_node['element_id'],'properties':properties}
        records,summary,keys = self.driver.execute_query(query,**params)
        return records[0].data().get('a') if records else None

    
    def find_next_node(self,element_id):
        """
        return list of next next node connected to the currenet element
        """
        query = """
                MATCH (n:Vision) WHERE elementId(n)=$element_id 
                SET n.next_ele = COLLECT {MATCH (n)-[:CATEGORY]->(b:Vision) RETURN elementId(b) as next_ele} 
                RETURN n.next_ele as next_ele;
                """
        params = {'element_id':element_id}
        records,summary,keys = self.driver.execute_query(query,**params)
        return records
    

    def connect_nodes(self,current_node,next_node,category):
        query = """
                MATCH (curr:Vision), (next:Vision)
                WHERE elementId(curr) = $curr_id AND elementId(next) = $next_id
                MERGE (curr)-[r:CATEGORY {name:$category_name}]->(next)
                RETURN r
                """
        params = {
            'curr_id': current_node['element_id'],
            'next_id': next_node['element_id'],
            'category_name':category
        }
        self.driver.execute_query(query, **params)
        #need to update future node as well
        return next_node  
    

#graph = GraphStore()
