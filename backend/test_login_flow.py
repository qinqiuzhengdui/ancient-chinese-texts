import asyncio
import httpx
import redis.asyncio as redis

async def main():
    base_url = "http://127.0.0.1:8000"
    redis_url = "redis://localhost:6379/0" # read from configuration if different, standard default is 6379
    
    # 1. Connect to Redis to fetch the code
    r = redis.from_url(redis_url, decode_responses=True)
    
    test_phone = "18888888888"
    test_email = "test_code_login@example.com"
    test_username = "codeloginuser"
    test_password = "SecurePassword123"
    
    print("--- Testing Code Verification Flow ---")
    
    # 2. Request verification code for phone
    print(f"Requesting phone code for {test_phone}...")
    async with httpx.AsyncClient(trust_env=False) as client:
        res = await client.post(f"{base_url}/api/users/verify-code", json={"target": test_phone})
        print(f"Verify code request response: {res.status_code} - {res.json()}")
        
        # 3. Retrieve code from Redis
        code = await r.get(f"verify_code_{test_phone}")
        print(f"Retrieved code from Redis: {code}")
        
        if not code:
            print("Failed to retrieve code from Redis!")
            return
            
        # 4. Request verification code for email
        print(f"Requesting email code for {test_email}...")
        res_email = await client.post(f"{base_url}/api/users/verify-code", json={"target": test_email})
        email_code = await r.get(f"verify_code_{test_email}")
        print(f"Retrieved email code from Redis: {email_code}")
        
        # 5. Check if user already exists
        # Let's try registering. If user already exists, it will return 400.
        print("Registering test user...")
        reg_res = await client.post(f"{base_url}/api/auth/register", json={
            "username": test_username,
            "email": test_email,
            "email_code": email_code,
            "phone": test_phone,
            "phone_code": code,
            "password": test_password
        })
        print(f"Register response: {reg_res.status_code} - {reg_res.json()}")
        
        # 6. Request a NEW code for login
        print("Requesting new verification code for login...")
        await client.post(f"{base_url}/api/users/verify-code", json={"target": test_phone})
        login_code_val = await r.get(f"verify_code_{test_phone}")
        print(f"New login verification code: {login_code_val}")
        
        # 7. Test login using code
        print("Testing login with phone verification code...")
        login_res = await client.post(f"{base_url}/api/auth/login-code", json={
            "login_type": "phone",
            "target": test_phone,
            "code": login_code_val
        })
        print(f"Login code response: {login_res.status_code} - {login_res.json()}")
        assert login_res.status_code == 200, "Phone code login failed!"
        
        # 8. Test login using wrong code
        print("Testing login with incorrect code...")
        wrong_login_res = await client.post(f"{base_url}/api/auth/login-code", json={
            "login_type": "phone",
            "target": test_phone,
            "code": "000000"
        })
        print(f"Incorrect code login response: {wrong_login_res.status_code} - {wrong_login_res.json()}")
        assert wrong_login_res.status_code == 400, "Incorrect code should have been rejected!"
        
        print("\nAll tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
