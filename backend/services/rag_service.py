import chromadb
import json
import os
import random  # <--- NEW IMPORT
import google.generativeai as genai
from chromadb import Documents, EmbeddingFunction, Embeddings
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini API
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        if not GOOGLE_API_KEY:
            print(" Error: GEMINI_API_KEY not found.")
            return []

        genai.configure(api_key=GOOGLE_API_KEY)
        model = "models/text-embedding-004"
        
        try:
            # Batch embedding
            response = genai.embed_content(
                model=model,
                content=input, 
                task_type="retrieval_document"
            )
            if 'embedding' in response:
                return response['embedding']
            else:
                return [e for e in response['embedding']]
        except Exception as e:
            print(f" Batch Embedding Error: {e}")
            return [[0.0] * 768 for _ in range(len(input))]

chroma_client = chromadb.Client() 
collection = None

def initialize_rag():
    global collection
    print(" Initializing RAG System...")
    
    try:
        chroma_client.delete_collection("tech_concepts")
    except:
        pass
    
    gemini_ef = GeminiEmbeddingFunction()
    collection = chroma_client.create_collection(
        name="tech_concepts",
        embedding_function=gemini_ef
    )

    try:
        base_path = os.path.dirname(os.path.dirname(__file__))
        file_path = os.path.join(base_path, "data", "tech_facts.json")
        
        with open(file_path, "r") as f:
            facts = json.load(f)
        
        ids = [f["id"] for f in facts]
        documents = [f["content"] for f in facts]
        metadatas = [{"topic": f["topic"]} for f in facts]

        if ids:
            print(f"⏳ Sending ONE batch request for {len(ids)} facts to Gemini...")
            collection.add(ids=ids, documents=documents, metadatas=metadatas)
            
        print(f" RAG Ready: Loaded {len(ids)} concepts into memory.")
        
    except Exception as e:
        print(f" RAG Initialization Failed: {e}")

def retrieve_context(topic: str):
    """
    1. Fetches TOP 10 results (instead of 1).
    2. Filters them to ensure the Topic matches (Guardrail).
    3. RANDOMLY selects one from the valid list.
    """
    global collection
    if not collection:
        return None
        
    try:
        # 1. Fetch a pool of candidates (Top 10)
        # We ask for more results so we have variety to choose from
        results = collection.query(
            query_texts=[f"Concepts related to {topic}"],
            n_results=10 
        )
        
        if not results["documents"]:
            return None

        # The results are lists of lists, let's flatten them for easier processing
        found_docs = results["documents"][0]
        found_metas = results["metadatas"][0]
        
        # 2. Filter Candidates (Topic Guardrail)
        valid_candidates = []
        user_topic_lower = topic.lower()

        for doc, meta in zip(found_docs, found_metas):
            db_topic = meta.get("topic", "").lower()
            
            # Check if topics match loosely (e.g. "Python" in "Advanced Python")
            if db_topic in user_topic_lower or user_topic_lower in db_topic:
                valid_candidates.append(doc)

        if not valid_candidates:
            print(f" Guardrail: Found {len(found_docs)} docs but none matched topic '{topic}'. Bypassing.")
            return None

        # 3. Random Selection (The Fix for Repetition)
        # Instead of always taking [0], we pick a random one from the valid list.
        selected_fact = random.choice(valid_candidates)
        
        # Optional: Print which one was picked for debugging
        print(f" Randomly selected fact from {len(valid_candidates)} candidates.")
        return selected_fact

    except Exception as e:
        print(f"RAG Query Error: {e}")
        
    return None