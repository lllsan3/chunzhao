"""Insert parsed jobs JSON into Supabase via REST API."""
import json
import os
import sys
import urllib.request
import urllib.error
os.chdir(r"C:\Users\Lenovo\Desktop\chunzhao")
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://zuorqnyxteftxtjrriox.supabase.co"
# We need service_role key for insert (bypasses RLS)
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
if not SERVICE_KEY:
    print("ERROR: Set SUPABASE_SERVICE_KEY env var")
    sys.exit(1)

JSON_PATH = r"C:\Users\Lenovo\Desktop\chunzhao\scripts\jobs-data.json"
BATCH_SIZE = 50

def post_batch(records):
    url = f"{SUPABASE_URL}/rest/v1/jobs"
    data = json.dumps(records).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Prefer', 'return=minimal')
    try:
        resp = urllib.request.urlopen(req)
        return resp.status, None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, body

def main():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        jobs = json.load(f)

    print(f"Inserting {len(jobs)} jobs in batches of {BATCH_SIZE}...")
    inserted = 0
    errors = 0

    for i in range(0, len(jobs), BATCH_SIZE):
        batch = jobs[i:i+BATCH_SIZE]
        status, err = post_batch(batch)
        if status in (200, 201):
            inserted += len(batch)
            print(f"  OK: {inserted}/{len(jobs)}")
        else:
            errors += len(batch)
            print(f"  FAIL batch {i}-{i+len(batch)}: {status} {err[:200] if err else ''}")

    print(f"\nDone! Inserted: {inserted}, Failed: {errors}")

if __name__ == '__main__':
    main()
