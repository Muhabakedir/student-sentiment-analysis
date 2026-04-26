"""
PostgreSQL Database Setup Script for SentiFeed
Programmatically creates all tables and seeds initial data
"""

import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv
from auth import hash_password

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:muhe23@localhost:5432/sentiment")

def setup_database():
    """Create all tables and seed initial data"""

    print("🔧 Connecting to PostgreSQL database...")
    engine = create_engine(DATABASE_URL)

    try:
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✅ Database connection successful")

        # Drop all existing tables first (clean slate)
        print("\n🗑️ Dropping all existing tables...")
        with engine.connect() as conn:
            tables_to_drop = [
                "student_sessions",
                "student_password_reset",
                "feedback",
                "anonymous_students",
                "students",
                "admin_users",
                "password_reset_tokens",
            ]
            for t in tables_to_drop:
                conn.execute(text(f'DROP TABLE IF EXISTS "{t}" CASCADE'))
            conn.commit()
            print("✅ All old tables dropped")

        # Create tables
        print("\n📊 Creating database tables...")

        with engine.connect() as conn:
            # 1. Feedback table
            conn.execute(text("""
                CREATE TABLE feedback (
                    id SERIAL PRIMARY KEY,
                    service VARCHAR(255) NOT NULL,
                    theme VARCHAR(255) NOT NULL,
                    text TEXT NOT NULL,
                    sentiment VARCHAR(50) DEFAULT 'pending',
                    confidence FLOAT DEFAULT 0.0,
                    email VARCHAR(255),
                    session_hash VARCHAR(64),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Feedback table created")

            # 2. Admin users table
            conn.execute(text("""
                CREATE TABLE admin_users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    hashed_password VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'active',
                    is_active BOOLEAN DEFAULT TRUE,
                    is_superadmin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Admin users table created")

            # 3. Students table
            conn.execute(text("""
                CREATE TABLE students (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    student_id VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Students table created")

            # 4. Password reset tokens table
            conn.execute(text("""
                CREATE TABLE password_reset_tokens (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    token VARCHAR(255) UNIQUE NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    role VARCHAR(50) DEFAULT 'admin',
                    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Password reset tokens table created")

            # 5. Activity logs table
            conn.execute(text("""
                CREATE TABLE activity_logs (
                    id SERIAL PRIMARY KEY,
                    actor VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    target VARCHAR(255),
                    detail TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Activity logs table created")

            # Create indexes
            print("\n🔍 Creating indexes...")

            indexes = [
                "CREATE INDEX idx_feedback_service ON feedback(service)",
                "CREATE INDEX idx_feedback_sentiment ON feedback(sentiment)",
                "CREATE INDEX idx_feedback_theme ON feedback(theme)",
                "CREATE INDEX idx_feedback_session ON feedback(session_hash)",
                "CREATE INDEX idx_feedback_created ON feedback(created_at)",
                "CREATE INDEX idx_admin_email ON admin_users(email)",
                "CREATE INDEX idx_student_email ON students(email)",
                "CREATE INDEX idx_student_id ON students(student_id)",
                "CREATE INDEX idx_reset_token ON password_reset_tokens(token)",
                "CREATE INDEX idx_activity_logs_actor ON activity_logs(actor)",
                "CREATE INDEX idx_activity_logs_created ON activity_logs(created_at)",
            ]

            for idx_sql in indexes:
                conn.execute(text(idx_sql))

            print("✅ All indexes created")

            # Seed default admin
            print("\n👤 Seeding default admin user...")
            admin_hash = hash_password("admin123")

            result = conn.execute(text("""
                INSERT INTO admin_users (email, hashed_password, is_superadmin, is_active)
                VALUES (:email, :password, TRUE, TRUE)
                RETURNING id
            """), {"email": "admin@university.edu", "password": admin_hash})

            conn.commit()

            if result.rowcount > 0:
                print("✅ Default admin created: admin@university.edu / admin123")

        # Verify tables
        print("\n🔍 Verifying database structure...")
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        expected_tables = ['feedback', 'admin_users', 'students', 'password_reset_tokens', 'activity_logs']
        for table in expected_tables:
            if table in tables:
                columns = [col['name'] for col in inspector.get_columns(table)]
                print(f"✅ {table}: {len(columns)} columns")
            else:
                print(f"❌ {table}: NOT FOUND")

        print("\n✅ Database setup complete!")
        print("\n📊 Database Summary:")
        print(f"   Database: sentiment")
        print(f"   Tables: {len(tables)}")
        print(f"   Admin: admin@university.edu / admin123")
        print(f"   Connection: {DATABASE_URL.split('@')[1]}")

    except Exception as e:
        print(f"\n❌ Error setting up database: {e}")
        raise
    finally:
        engine.dispose()

if __name__ == "__main__":
    setup_database()
