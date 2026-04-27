"""
Generate a secure SECRET_KEY for production use.

Usage:
    python generate_secret_key.py
"""
import secrets
import os

def generate_secret_key():
    """Generate a cryptographically secure secret key."""
    # Generate 32 bytes (256 bits) of random data
    secret_key = secrets.token_hex(32)
    
    print("🔐 Generated Secure SECRET_KEY:")
    print("=" * 70)
    print(secret_key)
    print("=" * 70)
    
    print("\n📝 Add this to your .env file:")
    print(f"SECRET_KEY={secret_key}")
    
    # Offer to update .env automatically
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        print(f"\n❓ Update .env file automatically? (y/n): ", end="")
        response = input().strip().lower()
        
        if response == 'y':
            try:
                with open(env_path, 'r') as f:
                    content = f.read()
                
                # Replace SECRET_KEY line
                lines = content.split('\n')
                updated = False
                for i, line in enumerate(lines):
                    if line.startswith('SECRET_KEY='):
                        lines[i] = f'SECRET_KEY={secret_key}'
                        updated = True
                        break
                
                if updated:
                    with open(env_path, 'w') as f:
                        f.write('\n'.join(lines))
                    print("✅ .env file updated successfully!")
                else:
                    print("⚠️  SECRET_KEY line not found in .env")
                    print("   Please add it manually")
            except Exception as e:
                print(f"❌ Error updating .env: {e}")
                print("   Please update manually")
    else:
        print(f"\n⚠️  .env file not found at: {env_path}")
        print("   Please create it and add the SECRET_KEY")
    
    print("\n⚠️  IMPORTANT:")
    print("   - Never commit this key to version control")
    print("   - Use different keys for dev/staging/production")
    print("   - Store production keys in secure vault (AWS Secrets Manager, etc.)")

if __name__ == "__main__":
    generate_secret_key()
