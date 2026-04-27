"""
Database Initialization Script
Creates all tables in the database.

Usage:
    python init_db.py
"""
import sys
from app.core.database import Base, engine
from app.models import user, candidate, company, job, proof, test, score

def init_database():
    """Create all database tables."""
    print("🔧 Initializing database...")
    print(f"📍 Database URL: {engine.url}")
    
    try:
        # Import all models to ensure they're registered with Base
        print("\n📦 Loading models...")
        print("   ✓ User")
        print("   ✓ CandidateProfile")
        print("   ✓ CompanyProfile")
        print("   ✓ Job")
        print("   ✓ ProofDocument")
        print("   ✓ TestAttempt")
        print("   ✓ CandidateScore")
        
        # Create all tables
        print("\n🏗️  Creating tables...")
        Base.metadata.create_all(bind=engine)
        
        print("\n✅ Database initialized successfully!")
        print("\n📋 Tables created:")
        for table in Base.metadata.sorted_tables:
            print(f"   ✓ {table.name}")
        
        print("\n🚀 You can now start the backend server:")
        print("   cd backend")
        print("   uvicorn app.main:app --reload --port 8000")
        
    except Exception as e:
        print(f"\n❌ Error initializing database: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure PostgreSQL is running")
        print("   2. Check your DATABASE_URL in .env file")
        print("   3. Ensure the database 'jobify_db' exists:")
        print("      psql -U postgres -c 'CREATE DATABASE jobify_db;'")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
