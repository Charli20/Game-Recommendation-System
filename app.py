from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import logging
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup Flask app
app = Flask(__name__)
CORS(app)

# Logging config
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise EnvironmentError("Missing GOOGLE_API_KEY in environment variables.")
genai.configure(api_key=GOOGLE_API_KEY)

# Load game data
game_df = pd.read_csv('datasets/final_game.csv')
game_df['Large_Header_Image'] = game_df['Header image'].fillna("cover-not_found.jpg") + "&fife=w800"
game_df['Screenshots'] = game_df['Screenshots'].fillna("").apply(lambda x: x.split('|') if x else [])

logger.info("Loading documents...")
raw_documents = TextLoader("tagged_description.txt").load()

logger.info("Splitting documents...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
documents = text_splitter.split_documents(raw_documents)

try:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
except Exception as e:
    logger.exception("Failed to initialize Google Generative AI embeddings")
    raise e


CHROMA_PATH = "./chroma_store"

if os.path.exists(CHROMA_PATH):
    logger.info("Loading Chroma DB from disk...")
    db_games = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
else:
    logger.info("Creating Chroma DB from documents...")
    db_games = Chroma.from_documents(documents, embedding=embeddings, persist_directory=CHROMA_PATH)
    db_games.persist()
    logger.info("Chroma DB created and persisted.")


# Semantic + emotional recommendation
def retrieve_semantic_recommendations(query: str, tone: str = None, initial_top_k: int = 50, final_top_k: int = 12):
    recs = db_games.similarity_search(query, k=initial_top_k)
    game_ids = []
    for rec in recs:
        try:
            first_word = rec.page_content.strip('"').split()[0]
            game_id = int(first_word)
            game_ids.append(game_id)
        except (IndexError, ValueError):
            logger.warning(f"Skipping invalid record: {rec.page_content}")

    game_recs = game_df[game_df["AppID"].isin(game_ids)].copy()

    if tone:
        emotion_map = {
            "happy": "joy",
            "surprising": "surprise",
            "angry": "anger",
            "suspenseful": "fear",
            "sad": "sadness"
        }
        emotion_col = emotion_map.get(tone.lower())
        if emotion_col in game_df.columns:
            game_recs = game_recs.sort_values(by=emotion_col, ascending=False)

    return game_recs.head(final_top_k)


# Format results
def recommend_games(query: str, tone: str):
    recommendations = retrieve_semantic_recommendations(query, tone)
    results = []

    for _, row in recommendations.iterrows():
        description = row["About the game"]
        truncated_description = " ".join(description.split()[:30]) + "..."

        dev_split = row["Developers"].split(";")
        if len(dev_split) == 2:
            dev_str = f"{dev_split[0]} and {dev_split[1]}"
        elif len(dev_split) > 2:
            dev_str = f"{', '.join(dev_split[:-1])}, and {dev_split[-1]}"
        else:
            dev_str = row["Developers"]

        results.append({
            "title": row["Name"],
            "header_image": row["Large_Header_Image"],
            "description": truncated_description,
            "release_date": row["Released_date"],
            "genres": row["Genres"],
            "developer": dev_str,
            "price": row["Price"],
            "screenshots": row.get("Screenshots", []),
            "videos": row.get("Movies", "")
        })

    return results

# Flask endpoint
@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    query = data.get("query", "").strip()
    tone = data.get("tone", "all").strip().lower()

    if not query:
        return jsonify({"error": "Missing query"}), 400

    try:
        recommendations = recommend_games(query, tone)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        logger.exception("Error generating recommendations")
        return jsonify({"error": str(e)}), 500

# Run app
if __name__ == "__main__":
    app.run(debug=True)

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import pandas as pd
# import os
# import logging
# from dotenv import load_dotenv

# from langchain.embeddings import HuggingFaceEmbeddings
# from langchain_community.vectorstores import Chroma
# from langchain_community.document_loaders import TextLoader
# from langchain.text_splitter import RecursiveCharacterTextSplitter

# # Load environment variables
# load_dotenv()

# # Setup Flask app
# app = Flask(__name__)
# CORS(app)

# # Logging config
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Load game data
# game_df = pd.read_csv('datasets/final_game.csv')
# game_df['Large_Header_Image'] = game_df['Header image'].fillna("cover-not_found.jpg") + "&fife=w800"
# game_df['Screenshots'] = game_df['Screenshots'].fillna("").apply(lambda x: x.split('|') if x else [])

# # Load and split documents
# logger.info("Loading documents...")
# raw_documents = TextLoader("tagged_description.txt").load()

# logger.info("Splitting documents...")
# text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
# documents = text_splitter.split_documents(raw_documents)

# # Initialize HuggingFace embeddings
# logger.info("Initializing Hugging Face embeddings...")
# embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# # Initialize or load Chroma DB
# CHROMA_PATH = "./chroma_store"
# if os.path.exists(CHROMA_PATH) and os.listdir(CHROMA_PATH):
#     logger.info("Loading Chroma DB from disk...")
#     db_games = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
# else:
#     logger.info("Creating Chroma DB from documents...")
#     db_games = Chroma.from_documents(documents, embedding=embeddings, persist_directory=CHROMA_PATH)
#     db_games.persist()
#     logger.info("Chroma DB created and persisted.")

# # Semantic + emotional recommendation
# def retrieve_semantic_recommendations(query: str, tone: str = None, initial_top_k: int = 50, final_top_k: int = 10):
#     recs = db_games.similarity_search(query, k=initial_top_k)
#     game_ids = [int(rec.page_content.strip('"').split()[0]) for rec in recs]
#     game_recs = game_df[game_df["AppID"].isin(game_ids)].copy()

#     if tone:
#         emotion_map = {
#             "happy": "joy",
#             "surprising": "surprise",
#             "angry": "anger",
#             "suspenseful": "fear",
#             "sad": "sadness"
#         }
#         emotion_col = emotion_map.get(tone.lower())
#         if emotion_col in game_df.columns:
#             game_recs = game_recs.sort_values(by=emotion_col, ascending=False)

#     return game_recs.head(final_top_k)

# # Format results
# def recommend_games(query: str, tone: str):
#     recommendations = retrieve_semantic_recommendations(query, tone)
#     results = []

#     for _, row in recommendations.iterrows():
#         description = row["About the game"]
#         truncated_description = " ".join(description.split()[:30]) + "..."

#         dev_split = row["Developers"].split(";")
#         if len(dev_split) == 2:
#             dev_str = f"{dev_split[0]} and {dev_split[1]}"
#         elif len(dev_split) > 2:
#             dev_str = f"{', '.join(dev_split[:-1])}, and {dev_split[-1]}"
#         else:
#             dev_str = row["Developers"]

#         results.append({
#             "title": row["Name"],
#             "header_image": row["Large_Header_Image"],
#             "description": truncated_description,
#             "release_date": row["Released_date"],
#             "genres": row["Genres"],
#             "developer": dev_str,
#             "price": row["Price"],
#             "screenshots": row.get("Screenshots", []),
#             "videos": row.get("Movies", "")
#         })

#     return results

# # Flask endpoint
# @app.route("/recommend", methods=["POST"])
# def recommend():
#     data = request.json
#     query = data.get("query", "").strip()
#     tone = data.get("tone", "all").strip().lower()

#     if not query:
#         return jsonify({"error": "Missing query"}), 400

#     try:
#         recommendations = recommend_games(query, tone)
#         return jsonify({"recommendations": recommendations})
#     except Exception as e:
#         logger.exception("Error generating recommendations")
#         return jsonify({"error": str(e)}), 500

# # Run app
# if __name__ == "__main__":
#     app.run(debug=True)



# tagged_file = "datasets/tagged_description.txt"
# with open(tagged_file, "w", encoding="utf-8") as f:
#     for _, row in game_df.iterrows():
#         app_id = row["AppID"]
#         desc = str(row["About the game"]).strip().replace("\n", " ")
#         f.write(f"{app_id} {desc}\n")

# # Load description text for Gemini prompt
# with open(tagged_file, "r", encoding="utf-8") as f:
#     tagged_text = f.read()


# def generate_recommendations_with_gemini(query, tone=""):
#     try:
#         prompt = f"""
# You are a game recommendation assistant. Based on the user's query and emotional tone, select the best matching AppIDs from the following game descriptions:

# --- Game Descriptions ---
# {tagged_text}
# -------------------------

# User Query: "{query}"
# Preferred Tone: "{tone}"

# Respond with a JSON array of exactly 10 AppIDs that best match the user request. ONLY return the AppIDs, e.g.:
# ["123456", "987654", "765432", "111111", "222222", "333333", "444444", "555555", "666666", "777777"]
#         """.strip()

#         response = model.generate_content(prompt)
#         logger.info("Gemini Response: %s", response.text)

#         # Extract AppIDs from Gemini response
#         recommended_ids = eval(response.text.strip())
#         return recommended_ids[:10]

#     except Exception as e:
#         logger.error(f"Gemini generation error: {e}")
#         return []


# @app.route('/recommend', methods=['POST'])
# def recommend():
#     try:
#         data = request.json
#         query = data.get("query", "")
#         tone = data.get("tone", "")

#         if not query:
#             return jsonify({"error": "Missing query parameter"}), 400

#         app_ids = generate_recommendations_with_gemini(query, tone)

#         # Fetch matching games from game_df
#         result = []
#         for app_id in app_ids:
#             game = game_df[game_df["AppID"] == str(app_id)].squeeze()
#             if not game.empty:
#                 developer_list = str(game["Developers"]).split(",")
#                 developer = " and ".join([dev.strip() for dev in developer_list[:2]]) if developer_list else "Unknown"
#                 truncated_desc = " ".join(str(game["About the game"]).split()[:30]) + "..."

#                 result.append({
#                     "app_id": game["AppID"],
#                     "title": game["Title"],
#                     "header_image": game["Large_Header_Image"],
#                     "description": truncated_desc,
#                     "developer": developer,
#                     "price": game["Price"],
#                     "release_date": game["Release Date"],
#                     "screenshots": game["Screenshots"],
#                     "video_url": game["Movies"]
#                 })

#         return jsonify({"recommendations": result})

#     except Exception as e:
#         logger.error(f"Error in recommend endpoint: {e}")
#         return jsonify({"error": str(e)}), 500


# @app.route('/test', methods=['GET'])
# def test():
#     return "Server is running. POST to /recommend with JSON data."

