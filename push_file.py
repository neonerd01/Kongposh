"""
push_file.py — universal GitHub file pusher for neonerd01/Kongposh

USAGE (from PowerShell, in the same folder as this script):
    python push_file.py index.html
    python push_file.py style.css
    python push_file.py assets/images/embroidery/emb-hoops1.jpeg

- Works for text files (html/css/js) AND images/binary files — no mode switching needed.
- First argument = local file to push (must be in this folder, or give a relative path).
- Optional second argument = destination path in the repo (defaults to same name/path as local file).
  Example: python push_file.py hero.jpg assets/images/hero-banner.jpg

Requires:
    $env:GITHUB_TOKEN="your_token_here"   (set once per terminal session)
"""

import base64
import json
import os
import sys
import urllib.request
import urllib.error

TOKEN = os.environ.get("GITHUB_TOKEN")
OWNER = "neonerd01"
REPO = "Kongposh"
BRANCH = "main"

def main():
    if not TOKEN:
        print("ERROR: GITHUB_TOKEN is not set.")
        print('Run this first:  $env:GITHUB_TOKEN="your_token_here"')
        sys.exit(1)

    if len(sys.argv) < 2:
        print("Usage: python push_file.py <local_file> [remote_path]")
        sys.exit(1)

    local_path = sys.argv[1]
    remote_path = sys.argv[2] if len(sys.argv) > 2 else os.path.basename(local_path)
    remote_path = remote_path.replace("\\", "/")

    if not os.path.isfile(local_path):
        print(f"ERROR: local file not found: {local_path}")
        sys.exit(1)

    api_url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{remote_path}"
    headers = {
        "Authorization": f"token {TOKEN}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "kongposh-push-script",
    }

    # Check if the file already exists (need its sha to update it)
    sha = None
    req = urllib.request.Request(api_url + f"?ref={BRANCH}", headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            existing = json.loads(resp.read().decode())
            sha = existing.get("sha")
    except urllib.error.HTTPError as e:
        if e.code != 404:
            print("Warning while checking existing file:", e.read().decode())

    with open(local_path, "rb") as f:
        content_b64 = base64.b64encode(f.read()).decode("utf-8")

    payload = {
        "message": f"Update {remote_path}",
        "content": content_b64,
        "branch": BRANCH,
    }
    if sha:
        payload["sha"] = sha

    data = json.dumps(payload).encode("utf-8")
    put_req = urllib.request.Request(api_url, data=data, headers=headers, method="PUT")

    try:
        with urllib.request.urlopen(put_req) as resp:
            result = json.loads(resp.read().decode())
            print("Success! Commit:", result["commit"]["sha"])
            print("File URL:", result["content"]["html_url"])
    except urllib.error.HTTPError as e:
        print("FAILED:", e.code)
        print(e.read().decode())
        sys.exit(1)

if __name__ == "__main__":
    main()
