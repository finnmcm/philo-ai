from socket import IP_DEFAULT_MULTICAST_LOOP
from flask import Flask, jsonify, request
from flask_cors import CORS
import boto3
from botocore.exceptions import ClientError
import os
import json
import uuid

app = Flask(__name__, static_folder="../", static_url_path="/")

s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
    # aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    # aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

BUCKET= "philo-ai"  # replace with your bucket


CORS(app)  # allow React dev server to call this API

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

    key = f"private/{id}/discussions/{id}"
    
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

if __name__ == "__main__":
    print(app.url_map)
    app.run(port=5001, debug=True)