"""
Database Connection Checker
Verifies database connection and shows table status.

Usage:
    python check_db.py
"""
from sqlalchemy import inspect, text
from app.core.database import engine, SessionLocal
from app.models import user, candidate, company, job, proof, test, score

def check_database():
    """Check database connection and table status."""
    print("🔍 Checking database connection...")
    
    try:
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL")
            print(f"📌 Version: {version.split(',')[0]}")
        
        # Check tables
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        print(f"\n📊 Database: {engine.url.database}")
        print(f"🏠 Host: {engine.url.host}:{engine.url.port}")
        
        if existing_tables:
            print(f"\n✅ Found {len(existing_tables)} tables:")
            for table in existing_tables:
                print(f"   ✓ {table}")
        else:
            print("\n⚠️  No tables found!")
            print("   Run 'python init_db.py' to create tables")
        
        # Check if all required tables exist
        required_tables = [
            'users', 'candidate_profiles', 'company_profiles', 
            'jobs', 'proof_documents', 'test_attempts', 'candidate_scores'
        ]
        missing = [t for t in required_tables if t not in existing_tables]
        
        if missing:
            print(f"\n⚠️  Missing tables: {', '.join(missing)}")
            print("   Run 'python init_db.py' to create them")
        else:
            print("\n✅ All required tables exist!")
        
        # Count records
        if existing_tables:
            print("\n📈 Record counts:")
            db = SessionLocal()
            try:
                from app.models.user import User
                from app.models.candidate import CandidateProfile
                from app.models.company import CompanyProfile
                from app.models.job import Job
                
                print(f"   Users: {db.query(User).count()}")
                print(f"   Candidates: {db.query(CandidateProfile).count()}")
                print(f"   Companies: {db.query(CompanyProfile).count()}")
                print(f"   Jobs: {db.query(Job).count()}")
            except Exception as e:
                print(f"   (Could not count records: {e})")
            finally:
                db.close()
        
    except Exception as e:
        print(f"\n❌ Database connection failed!")
        print(f"   Error: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Is PostgreSQL running?")
        print("      Windows: Check Services for 'postgresql'")
        print("      Mac: brew services list")
        print("      Linux: sudo systemctl status postgresql")
        print("   2. Check your .env file DATABASE_URL")
        print("   3. Does the database exist?")
        print("      psql -U postgres -c 'CREATE DATABASE jobify_db;'")
        return False
    
    return True

if __name__ == "__main__":
    check_database()
