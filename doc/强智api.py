import requests
import sys
import os
import time
from PIL import Image
from io import BytesIO


def get_encryption_data(session, base_url):
    """Get encryption data from server and return it"""
    url = f"{base_url}/Logon.do?method=logon&flag=sess"
    print("\n--- REQUEST HEADERS FOR ENCRYPTION DATA ---")

    response = session.post(url)

    print("Request URL:", response.request.url)
    for header, value in response.request.headers.items():
        print(f"Request Header - {header}: {value}")

    print("\n--- RESPONSE HEADERS FOR ENCRYPTION DATA ---")
    for header, value in response.headers.items():
        print(f"Response Header - {header}: {value}")

    data_str = response.text
    print("\nEncryption data:", data_str)

    return data_str


def encrypt_credentials(username, password, data_str):
    """Encrypt credentials using the server's algorithm"""
    if data_str == "no" or "#" not in data_str:
        print("Error: Invalid encryption data received")
        return None

    scode = data_str.split("#")[0]
    sxh = data_str.split("#")[1]

    code = username + "%%%" + password
    print(code)
    encoded = ""

    for i in range(len(code)):
        if i < 20:
            sxh_value = int(sxh[i : i + 1])
            encoded = encoded + code[i : i + 1] + scode[:sxh_value]
            scode = scode[sxh_value:]
        else:
            encoded = encoded + code[i:]
            break
    return encoded


def download_verification_code(session, base_url):
    """Download verification code image and save it locally"""
    verify_code_url = f"{base_url}/verifycode.servlet?t={time.time()}"
    response = session.get(verify_code_url, stream=True)

    if response.status_code == 200:
        # Save the image to a file
        image_path = "verification_code.jpg"
        with open(image_path, "wb") as f:
            f.write(response.content)

        # Try to open the image with PIL
        try:
            img = Image.open(BytesIO(response.content))
            img.show()
            print(f"Verification code image saved to {image_path} and displayed")
        except Exception as e:
            print(f"Error displaying image: {e}")
            print(
                f"Please open the verification code image at {os.path.abspath(image_path)}"
            )

        return image_path
    else:
        print(f"Error downloading verification code: {response.status_code}")
        return None


def login_to_system():
    """Perform the actual login to the system"""
    base_url = "https://jwgl.sdust.edu.cn"
    session = requests.Session()

    # Download verification code image
    image_path = download_verification_code(session, base_url)
    if not image_path:
        print("Failed to download verification code image")
        return

    # Get encryption data
    try:
        data_str = get_encryption_data(session, base_url)
    except Exception as e:
        print(f"Error fetching encryption data: {e}")
        return

    # Get user credentials
    username = input("Enter username: ")
    password = input("Enter password: ")
    verify_code = input("Enter verification code shown in the image: ")

    # Encrypt credentials
    encoded = encrypt_credentials(username, password, data_str)
    if not encoded:
        return

    print("\n--- ENCRYPTED CREDENTIALS ---")
    print(f"Encoded value: {encoded}")

    # Prepare login data
    login_data = {
        "userAccount": username,
        "userPassword": password,
        "RANDOMCODE": verify_code,
        "encoded": encoded,
        "useDogCode": "",
        "view": "0",
    }

    print("\n--- SENDING LOGIN REQUEST ---")
    print(f"URL: {base_url}/Logon.do?method=logon")

    # Send login request
    try:
        login_url = f"{base_url}/Logon.do?method=logon"
        login_response = session.post(login_url, data=login_data, allow_redirects=True)

        print(f"Response status code: {login_response.status_code}")

        # Check if login was successful
        if "错误" in login_response.text or "failed" in login_response.text.lower():
            print("Login failed. Check credentials or verification code.")
            print(f"Response content contains: {login_response.text[:200]}...")
        else:
            print("Login successful!")
            # Save cookies for future requests
            cookies_dict = requests.utils.dict_from_cookiejar(session.cookies)
            print("Session cookies:", cookies_dict)
            print("Session headers:", session.headers)
            print(login_response.text)
            # Return the session for further use
            return session

    except Exception as e:
        print(f"Error during login: {e}")
        return None


if __name__ == "__main__":
    print("山东科技大学综合教务管理系统 Login System")
    session = login_to_system()
    if session:
        print("You can now use this session for further requests")
