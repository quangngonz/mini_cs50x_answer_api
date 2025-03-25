import requests, os, time, csv
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_KEY")  # Use the service role key
HEADERS = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
}

def bulk_create_users(users):
    """Creates multiple users in Supabase Auth with auto-confirmed emails."""
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    for user in users:
        payload = {
            "email": user["email"],
            "password": user["password"],
            "email_confirm": True  # Auto-confirm email
        }
        response = requests.post(url, json=payload, headers=HEADERS)
        if response.status_code == 200 or response.status_code == 201:
            print(f"User {user['email']} created successfully.")
        else:
            print(f"Failed to create user {user['email']}: {response.text}")

        time.sleep(1.2)  # Prevent rate-limiting

def load_users_from_csv(filename):
    users_data = []
    with open(filename, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            users_data.append({"email": row["email"], "password": row["password"]})
    return users_data

# Example usage
users_data = load_users_from_csv("utils/usernames.csv")

print(users_data)

# print all the email field as js array
print([user["email"] for user in users_data])
# bulk_create_users(users_data)
