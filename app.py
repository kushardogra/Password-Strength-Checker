from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # allow your frontend to call this

HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range/'

@app.route('/api/breach-check', methods=['POST'])
def breach_check():
    data = request.get_json()
    prefix = data.get('prefix')  # first 5 chars of SHA-1
    suffix = data.get('suffix')  # remaining chars

    if not prefix or not suffix or len(prefix) != 5:
        return jsonify({'error': 'Invalid hash parts'}), 400

    resp = requests.get(HIBP_RANGE_URL + prefix)
    if resp.status_code != 200:
        return jsonify({'error': 'HIBP service error'}), 502

    # parse lines like "0018A45C4D1DEF81644B54AB7F969B88D65:2"
    for line in resp.text.splitlines():
        h, count = line.split(':')
        if h.upper() == suffix.upper():
            return jsonify({'count': int(count)})

    return jsonify({'count': 0})

if __name__ == '__main__':
    app.run(debug=True)