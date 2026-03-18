import os
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

URL = "https://data.calgary.ca/api/v3/views/c2es-76ed/query.geojson"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/permits")
def permits():
    start = request.args.get("start")
    end = request.args.get("end")

    if not start or not end:
        return jsonify({"error": "start and end dates are required"}), 400
    if start > end:
        return jsonify({"error": "start must be before end"}), 400

    key_id = os.getenv("SODA_KEY_ID")
    key_secret = os.getenv("SODA_KEY_SECRET")
    if not key_id or not key_secret:
        return jsonify({"error": "Missing SODA_KEY_ID / SODA_KEY_SECRET env vars"}), 500

    q = (
        "SELECT * "
        f"WHERE `issueddate` >= '{start}T00:00:00.000' "
        f"AND `issueddate` <= '{end}T23:59:59.999' "
        "ORDER BY `issueddate` DESC"
    )

    payload = {
        "query": q,
        "page": {"pageNumber": 1, "pageSize": 2000}
    }

    r = requests.post(URL, json=payload, auth=(key_id, key_secret), timeout=30)

    if r.status_code != 200:
        return jsonify({
            "error": "Open Calgary API failed",
            "status": r.status_code,
            "details": r.text[:300]
        }), 502

    return jsonify(r.json())

if __name__ == "__main__":
    app.run(debug=True)