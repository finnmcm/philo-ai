from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app)  # allow React dev server to call this API

@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({ "message": "pong" })

# Example POST
@app.route("/api/echo", methods=["POST"])
def echo():
    data = request.json or {}
    return jsonify({ "you_sent": data })

# In production, serve frontend:
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(port=5000, debug=True)