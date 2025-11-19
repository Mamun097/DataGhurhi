import requests

url = "http://103.94.135.115:2000/api"

try:
    response = requests.get(url)
    response.raise_for_status()  # Raises HTTPError for bad responses
    print("Response JSON:", response.json())
except requests.exceptions.RequestException as e:
    print(f"Error making GET request: {e}")
