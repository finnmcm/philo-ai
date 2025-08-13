
from flask import Flask, jsonify, request
from flask_cors import CORS
import boto3
from botocore.exceptions import ClientError
import os
import json
import uuid
from dotenv import load_dotenv
from datetime import datetime

# Load .env file from parent directory (project root)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Check required environment variables
required_env_vars = ['OPENAI_API_KEY']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]

if missing_vars:
    print(f"ERROR: Missing required environment variables: {missing_vars}")
    print("Please set these environment variables or create a .env file in the backend directory")
    print("Example .env file:")
    print("OPENAI_API_KEY=your_openai_api_key_here")
    print("AWS_DEFAULT_REGION=us-east-1")
    exit(1)

from openai import OpenAI
app = Flask(__name__, static_folder="../", static_url_path="/")

s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
    # aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    # aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

BUCKET= "philo-ai"  # replace with your bucket
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

PHILOSOPHERS = {
    "socrates": {
        "name": "Socrates",
        "era": "Ancient Greek",
        "specialties": ["ethics", "epistemology", "virtue", "wisdom"],
        "style": "Socratic method, questioning, dialectical approach",
        "key_concepts": ["know thyself", "examined life", "virtue as knowledge"]
    },
    "kant": {
        "name": "Immanuel Kant",
        "era": "Enlightenment",
        "specialties": ["ethics", "duty", "categorical imperative", "reason"],
        "style": "systematic, rigorous, principle-based",
        "key_concepts": ["categorical imperative", "duty", "autonomy"]
    },
    "nietzsche": {
        "name": "Friedrich Nietzsche",
        "era": "19th Century",
        "specialties": ["nihilism", "will to power", "master-slave morality", "authenticity"],
        "style": "provocative, aphoristic, challenging conventional morality",
        "key_concepts": ["will to power", "eternal recurrence", "übermensch"]
    },
    "aristotle": {
        "name": "Aristotle",
        "era": "Ancient Greek",
        "specialties": ["virtue ethics", "eudaimonia", "practical wisdom", "golden mean"],
        "style": "analytical, systematic, focused on human flourishing",
        "key_concepts": ["virtue ethics", "golden mean", "eudaimonia"]
    },
    "mill": {
        "name": "John Stuart Mill",
        "era": "19th Century",
        "specialties": ["utilitarianism", "liberty", "happiness", "consequences"],
        "style": "consequentialist, focused on greatest good for greatest number",
        "key_concepts": ["utility", "harm principle", "liberty"]
    },
    "confucius": {
        "name": "Confucius",
        "era": "Ancient Chinese",
        "specialties": ["virtue", "social harmony", "filial piety", "ritual"],
        "style": "practical wisdom, emphasis on relationships and social order",
        "key_concepts": ["ren", "li", "junzi", "filial piety"]
    },
    "hume": {
    "name": "David Hume",
    "era": "Scottish Enlightenment",
    "specialties": [
      "empiricism",
      "skepticism",
      "emotions and reason",
      "causation",
      "moral sentiments",
      "is-ought problem"
    ],
    "style": "empirical, skeptical of abstract reasoning, emphasizes observation and feeling over pure reason",
    "key_concepts": [
      "impressions vs ideas",
      "bundle theory of self",
      "moral sentiments",
      "is-ought gap",
      "problem of induction",
      "passion as master of reason"
    ]
  },
  
  "plato": {
    "name": "Plato",
    "era": "Ancient Greek",
    "specialties": [
      "theory of forms",
      "ideal justice",
      "knowledge vs opinion",
      "soul and virtue",
      "philosopher kings",
      "metaphysics"
    ],
    "style": "dialectical through Socratic dialogue, idealistic, uses allegories and myths to convey truth",
    "key_concepts": [
      "theory of forms",
      "allegory of the cave",
      "tripartite soul",
      "philosopher king",
      "anamnesis (recollection)",
      "the Good"
    ]
  },
  
  "hegel": {
    "name": "Georg Wilhelm Friedrich Hegel",
    "era": "German Idealism",
    "specialties": [
      "dialectics",
      "historical progress",
      "absolute idealism",
      "freedom and recognition",
      "master-slave dialectic",
      "synthesis of opposites"
    ],
    "style": "systematic, dialectical, sees history as rational progress, complex and totalizing",
    "key_concepts": [
      "thesis-antithesis-synthesis",
      "Geist (Spirit)",
      "master-slave dialectic",
      "recognition (Anerkennung)",
      "absolute knowledge",
      "cunning of reason"
    ]
  },
  
}

CORS(app)  # allow React dev server to call this API

@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint"""
    try:
        # Check if OpenAI client is working
        openai_status = "OK" if client.api_key else "Missing API Key"
        
        # Check if S3 client is working
        s3_status = "OK"
        try:
            s3.list_buckets()
        except Exception as e:
            s3_status = f"Error: {str(e)}"
        
        return jsonify({
            "status": "healthy",
            "openai": openai_status,
            "s3": s3_status,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/upload/", methods=["POST"])
def upload_file():
    data = request.get_json(force=True, silent=True)
    if not data:
       return jsonify({"error": "invalid JSON"}), 400
   # Deterministic or random key; here we use timestamp + uuid
    name = data.get("id")
    key = f"philosopher_data/{name}.json"
    try:
        s3.put_object(
            Bucket=BUCKET,
            Key=key,
            Body=json.dumps(data).encode(),
            ContentType="application/json"
        )

        url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": BUCKET, "Key": key},
            ExpiresIn=3600
        )
        return jsonify({"key": key, "url": url}), 201
    except ClientError as e:
        if e.response["Error"]["Code"] == "AccessDenied":
            # still CORS-friendly, so the browser gets status 403 and a JSON body
            return jsonify(error="s3 access denied"), 403
        raise        # unknown error → 500 (but still with CORS header)

@app.route("/api/users/profile/", methods=["POST", "PUT"])
def save_user_profile():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "invalid JSON"}), 400
    
    user_id = data.get("id")
    if not user_id:
        return jsonify({"error": "user ID required"}), 400
    
    # Create the S3 key for the user profile
    key = f"private/{user_id}/users/{user_id}/profile.json"
    
    try:
        # Save the profile to S3
        s3.put_object(
            Bucket=BUCKET,
            Key=key,
            Body=json.dumps(data).encode(),
            ContentType="application/json"
        )
        
        return jsonify({"message": "Profile saved successfully", "key": key}), 201
    except ClientError as e:
        if e.response["Error"]["Code"] == "AccessDenied":
            return jsonify({"error": "s3 access denied"}), 403
        app.logger.error(f"S3 error: {e}")
        return jsonify({"error": "Failed to save profile"}), 500

@app.route("/api/discussions/", methods=["POST", "PUT"])
def save_discussion():
    try:
        data = request.get_json(force=True, silent=True)
        print(f"Received data: {data}")
        
        if not data:
            return jsonify({"error": "No data received"}), 400
        
        # Extract user input from the messages array
        messages = data.get("messages", [])
        if not messages or not isinstance(messages, list) or len(messages) == 0:
            return jsonify({"error": "No messages provided"}), 400
        
        # Get the first message text
        first_message = messages[0]
        if not isinstance(first_message, dict) or "text" not in first_message:
            return jsonify({"error": "Invalid message format"}), 400
        
        user_input = first_message.get("text", "")
        if not user_input:
            return jsonify({"error": "Empty message content"}), 400
        
        print(f"Processing user input: {user_input}")
        
        is_philosophical, reason = is_philosophy_related(user_input)
        if not is_philosophical:
            return jsonify({
                'error': 'Input not related to philosophy',
                'reason': reason
            }), 400
        
        # Create philosopher selection prompt
        philosopher_list = "\n".join([
            f"- {p['name']}: {', '.join(p['specialties'])}"
            for p in PHILOSOPHERS.values()
        ])
        
        selection_prompt = f"""
    A user has presented the following moral dilemma or philosophical question:
    
    "{user_input}"
    
    Available philosophers:
    {philosopher_list}
    
    Select the MOST appropriate philosopher to address this dilemma.
    Consider their specialties, approach, and relevance to the issue.
    
    You MUST respond with ONLY a valid JSON object in this exact format:
    {{"philosopher_id": "choose_one_id", "reasoning": "brief explanation", "initial_response": "2-3 sentences in philosopher's voice"}}
    
    The philosopher_id MUST be one of: {', '.join(PHILOSOPHERS.keys())}
    
    Respond with ONLY the JSON object, no other text.
    """
        
        
        try:
            
            response = client.responses.create(
    model="gpt-5",
    input="Write a one-sentence bedtime story about a unicorn."
)
        
            
        except Exception as openai_error:
            print(f"OpenAI API error: {openai_error}")
            print(f"Error type: {type(openai_error)}")
            import traceback
            traceback.print_exc()
            
            if "authentication" in str(openai_error).lower() or "401" in str(openai_error):
                return jsonify({"error": "OpenAI API authentication failed. Please check your API key."}), 500
            elif "quota" in str(openai_error).lower() or "429" in str(openai_error):
                return jsonify({"error": "OpenAI API quota exceeded. Please try again later."}), 500
            elif "rate_limit" in str(openai_error).lower():
                return jsonify({"error": "OpenAI API rate limit exceeded. Please try again later."}), 500
            else:
                return jsonify({"error": f"OpenAI API error: {str(openai_error)}"}), 500
        
        content = response.choices[0].message.content.strip()
        # Remove any markdown code blocks if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.split("```")[0]
        content = content.strip()
        
        result = json.loads(content)
        philosopher_id = result['philosopher_id']
        
        # Use the provided discussion ID if available, otherwise generate a new one
        conversation_id = data.get('discussionId') or str(uuid.uuid4())
        
        # Create conversation data structure
        conversation_data = {
            'id': conversation_id,
            'philosopherId': philosopher_id,
            'philosopherName': PHILOSOPHERS[philosopher_id]['name'],
            'messages': [
                {
                    'id': 1,
                    'text': user_input,
                    'sender': 'user',
                    'timestamp': datetime.now()
                },
                {
                    'id': 2,
                    'text': result['initial_response'],
                    'sender': 'philosopher',
                    'timestamp': datetime.now()
                }
            ],
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'title': user_input[:50] + "..." if len(user_input) > 50 else user_input
        }
        
        # Save to S3 using the correct key structure
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"error": "No user_id provided"}), 400
            
        key = f"private/{user_id}/discussions/{conversation_id}.json"
        s3.put_object(
            Bucket=BUCKET,
            Key=key,
            Body=json.dumps(conversation_data, default=str),
            ContentType='application/json'
        )
        
        return jsonify({
            'conversation_id': conversation_id,
            'philosopher': PHILOSOPHERS[philosopher_id],
            'philosopher_id': philosopher_id,
            'reasoning': result['reasoning'],
            'response': result['initial_response'],
            'discussion': conversation_data,  # Return the full discussion object
            'key': key  # Return the S3 key for reference
        })
        
    except Exception as e:
        print(f"Error in save_discussion: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        
        # Provide more specific error messages based on the error type
        if "OPENAI_API_KEY" in str(e) or "authentication" in str(e).lower():
            return jsonify({"error": "OpenAI API authentication failed. Please check your API key."}), 500
        elif "boto3" in str(e) or "aws" in str(e).lower():
            return jsonify({"error": "AWS S3 error. Please check your AWS credentials and bucket configuration."}), 500
        elif "json" in str(e).lower():
            return jsonify({"error": f"JSON parsing error: {str(e)}"}), 500
        elif "openai" in str(e).lower():
            return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500
        else:
            return jsonify({"error": f"Failed to process discussion: {str(e)}"}), 500

    
@app.route("/api/get/users/", methods=["GET"])
def get_user_profile():
    id = request.args.get('id')
    if not id:
        return jsonify({"error": "required id param"}), 400

    key = f"private/{id}/users/{id}/profile.json"
    print(f"Looking for key: {key}")
    try:
        # List objects under prefix
        resp = s3.get_object(Bucket=BUCKET, Key=key)
        body = resp["Body"].read().decode("utf-8")
        data = json.loads(body)
        print(jsonify({"results": data}))
        return jsonify({"results": data})
    except ClientError as e:
        print(f"S3 error: {e}")
        # Let's see what's actually in the bucket
        try:
            list_resp = s3.list_objects_v2(Bucket=BUCKET, Prefix="private/")
            if 'Contents' in list_resp:
                print("Found objects in bucket:")
                for obj in list_resp['Contents']:
                    print(f"  {obj['Key']}")
            else:
                print("No objects found with 'private/' prefix")
        except Exception as list_error:
            print(f"Error listing bucket: {list_error}")
        return jsonify({"error": "fetching json error"}), 500

@app.route("/api/get/discussions/", methods=["GET"])
def get_user_discussions():
    id = request.args.get('id')
    if not id:
        return jsonify({"error": "required id param"}), 400

    # Look for discussions under the user's discussions folder
    key = f"private/{id}/discussions/"
    
    try:
        # List objects under prefix
        resp = s3.list_objects_v2(Bucket=BUCKET, Prefix=key)
    except ClientError as e:
        app.logger.error(f"ListObjects error: {e}")
        return jsonify({"error": "listing objects error"}), 500

    contents = resp.get('Contents')
    if not contents:
        return jsonify({"error":"No objects found under key '{key}'"}), 404

    results = {}
    for obj in contents:
        key = obj['Key']
        # Only JSON files
        if not key.lower().endswith('.json'):
            continue
        try:
            s3_resp = s3.get_object(Bucket=BUCKET, Key=key)
            body = s3_resp['Body'].read().decode('utf-8')
            data = json.loads(body)
        except ClientError as e:
            app.logger.warning(f"Could not generate URL for {key}: {e}")
        except json.JSONDecodeError as e:
            app.logger.warning(f"Invalid JSON in {key}: {e}")
            continue
        filename = os.path.basename(key)
        filename = filename.replace(".json", "")
        results[filename] = data

    if not results:
        return jsonify({"error":"No JSON files found under that prefix"}), 404
    
    print(jsonify({"urls":results}))
    return jsonify({"results": results})


@app.route("/api/get/folder/", methods=["GET"])
def get_folder():
    prefix = request.args.get('prefix')
    if not prefix:
        return jsonify({"error": "required prefix param"}), 400

    try:
        # List objects under prefix
        resp = s3.list_objects_v2(Bucket=BUCKET, Prefix=prefix)
    except ClientError as e:
        app.logger.error(f"ListObjects error: {e}")
        return jsonify({"error": "listing objects error"}), 500

    contents = resp.get('Contents')
    if not contents:
        return jsonify({"error":"No objects found under prefix '{prefix}'"}), 404

    results = {}
    for obj in contents:
        key = obj['Key']
        # Only JSON files
        if not key.lower().endswith('.json'):
            continue
        try:
            s3_resp = s3.get_object(Bucket=BUCKET, Key=key)
            body = s3_resp['Body'].read().decode('utf-8')
            data = json.loads(body)
        except ClientError as e:
            app.logger.warning(f"Could not generate URL for {key}: {e}")
        except json.JSONDecodeError as e:
            app.logger.warning(f"Invalid JSON in {key}: {e}")
            continue
        filename = os.path.basename(key)
        filename = filename.replace(".json", "")
        results[filename] = data

    if not results:
        return jsonify({"error":"No JSON files found under that prefix"}), 404
    
    print(jsonify({"urls":results}))
    return jsonify({"results": results})


# In production, serve frontend:
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    return app.send_static_file("index.html")

def is_philosophy_related(text: str) -> tuple[bool, str]:
    prompt = f"""
    Determine if the following text is related to philosophy, ethics, morality, or seeking philosophical guidance.
    
    Text: "{text}"
    
    You MUST respond with ONLY a valid JSON object in this exact format:
    {{"is_philosophical": true, "reason": "brief explanation here"}}
    
    Be lenient with personal dilemmas, ethical questions, life decisions, meaning, purpose, or moral conflicts.
    Reject only if clearly unrelated (e.g., technical support, recipes, weather, etc.)
    
    Respond with ONLY the JSON object, no other text.
    """
    
    try:
        response = client.responses.create(
            model="gpt-5-mini",
            input=prompt
)
        
        # Clean the response and parse JSON
        content = response.choices[0].message.content.strip()
        # Remove any markdown code blocks if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()
        print(f"Content: {content}")
        result = json.loads(content)
        return result["is_philosophical"], result.get("reason", "")
    except Exception as e:
        # If validation fails, be conservative and allow it
        print(f"Philosophy validation error: {e}")
        return True, "Validation check failed, allowing by default"
    
if __name__ == "__main__":
    print(app.url_map)
    app.run(port=5001, debug=True)
    