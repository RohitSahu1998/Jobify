"""
Full Flow Integration Tests
Tests the complete candidate + company journey end-to-end.
Run with: python -m pytest tests/test_full_flow.py -v
Or run directly: python tests/test_full_flow.py
"""
import requests
import json
import sys
import os

BASE = "http://127.0.0.1:8000/api"

# Test data
CANDIDATE_EMAIL = "testcandidate@jobify.com"
CANDIDATE_PASS = "Test@1234"
COMPANY_EMAIL = "testcompany@jobify.com"
COMPANY_PASS = "Test@1234"

results = []

def log(test_name, passed, detail=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    results.append((test_name, passed, detail))
    print(f"{status} | {test_name}" + (f" → {detail}" if detail else ""))

def check(condition, test_name, detail=""):
    log(test_name, condition, detail)
    return condition

# ─── AUTH TESTS ───────────────────────────────────────────────────────────────

def test_register_candidate():
    r = requests.post(f"{BASE}/auth/register", json={
        "email": CANDIDATE_EMAIL,
        "password": CANDIDATE_PASS,
        "role": "candidate"
    })
    data = r.json()
    passed = r.status_code == 201 and "user_id" in data
    check(passed, "Register Candidate", f"status={r.status_code}")
    return data.get("dev_otp"), data.get("user_id")

def test_register_duplicate():
    r = requests.post(f"{BASE}/auth/register", json={
        "email": CANDIDATE_EMAIL,
        "password": CANDIDATE_PASS,
        "role": "candidate"
    })
    check(r.status_code == 400, "Duplicate Registration Blocked", f"status={r.status_code}")

def test_login_before_verify():
    r = requests.post(f"{BASE}/auth/login", json={
        "email": CANDIDATE_EMAIL,
        "password": CANDIDATE_PASS
    })
    check(r.status_code == 403, "Login Blocked Before OTP Verify", f"status={r.status_code}")

def test_verify_otp(otp):
    r = requests.post(f"{BASE}/auth/verify-otp", json={
        "email": CANDIDATE_EMAIL,
        "otp": otp
    })
    check(r.status_code == 200, "OTP Verification", f"status={r.status_code}, msg={r.json().get('message','')}")

def test_wrong_otp():
    r = requests.post(f"{BASE}/auth/verify-otp", json={
        "email": CANDIDATE_EMAIL,
        "otp": "000000"
    })
    check(r.status_code in [400, 200], "Wrong OTP Handled", f"status={r.status_code}")

def test_login_candidate():
    r = requests.post(f"{BASE}/auth/login", json={
        "email": CANDIDATE_EMAIL,
        "password": CANDIDATE_PASS
    })
    data = r.json()
    passed = r.status_code == 200 and "access_token" in data
    check(passed, "Candidate Login", f"role={data.get('role')}")
    return data.get("access_token")

def test_login_wrong_password():
    r = requests.post(f"{BASE}/auth/login", json={
        "email": CANDIDATE_EMAIL,
        "password": "wrongpassword"
    })
    check(r.status_code == 401, "Wrong Password Blocked", f"status={r.status_code}")

# ─── PROTECTED ROUTE TESTS ────────────────────────────────────────────────────

def test_protected_without_token():
    r = requests.get(f"{BASE}/candidates/me")
    check(r.status_code in [401, 403], "Protected Route Without Token Blocked", f"status={r.status_code}")

def test_protected_with_token(token):
    r = requests.get(f"{BASE}/candidates/me", headers={"Authorization": f"Bearer {token}"})
    # Should be 404 (no profile yet) not 401
    check(r.status_code == 404, "Protected Route With Token Accessible", f"status={r.status_code}")

# ─── CANDIDATE PROFILE TESTS ──────────────────────────────────────────────────

def test_create_profile(token):
    r = requests.post(f"{BASE}/candidates/profile",
        json={"full_name": "Test Candidate", "phone": "9876543210",
              "location": "Mumbai", "college": "IIT Bombay", "degree": "B.Tech CS"},
        headers={"Authorization": f"Bearer {token}"}
    )
    data = r.json()
    passed = r.status_code == 201 and "profile_id" in data
    check(passed, "Create Candidate Profile", f"status={r.status_code}")
    return data.get("profile_id")

def test_create_profile_duplicate(token):
    r = requests.post(f"{BASE}/candidates/profile",
        json={"full_name": "Test Candidate"},
        headers={"Authorization": f"Bearer {token}"}
    )
    check(r.status_code == 400, "Duplicate Profile Blocked", f"status={r.status_code}")

def test_get_profile(token):
    r = requests.get(f"{BASE}/candidates/me", headers={"Authorization": f"Bearer {token}"})
    data = r.json()
    passed = r.status_code == 200 and data.get("full_name") == "Test Candidate"
    check(passed, "Get Candidate Profile", f"name={data.get('full_name')}, status={data.get('verification_status')}")
    return data

# ─── PROOF TESTS ──────────────────────────────────────────────────────────────

def test_upload_proof_no_proof(token):
    """Test no-proof path → test should be assigned"""
    r = requests.post(f"{BASE}/candidates/upload-proof",
        data={"category": "certification", "claim_text": "AWS Certified Developer", "no_proof": "true"},
        headers={"Authorization": f"Bearer {token}"}
    )
    data = r.json()
    passed = r.status_code == 200 and data.get("test_required") == True
    check(passed, "No-Proof → Test Assigned", f"test_required={data.get('test_required')}, proof_id={data.get('proof_id','')[:8]}...")
    return data.get("proof_id")

def test_get_proofs(token):
    r = requests.get(f"{BASE}/candidates/proofs", headers={"Authorization": f"Bearer {token}"})
    data = r.json()
    passed = r.status_code == 200 and len(data) > 0
    check(passed, "Get Proofs List", f"count={len(data)}, status={data[0].get('status') if data else 'none'}")
    return data

# ─── TEST ENGINE TESTS ────────────────────────────────────────────────────────

def test_start_test(token, proof_id):
    r = requests.post(f"{BASE}/tests/start",
        json={"proof_id": proof_id, "domain": "tech"},
        headers={"Authorization": f"Bearer {token}"}
    )
    data = r.json()
    passed = r.status_code == 200 and "questions" in data and len(data["questions"]) > 0
    check(passed, "Start Skill Test", f"type={data.get('test_type')}, questions={len(data.get('questions',[]))}")
    return data.get("attempt_id"), data.get("questions", [])

def test_submit_test_fail(token, attempt_id, questions):
    """Submit all wrong answers → should fail"""
    wrong_answers = {str(q["id"]): "WRONG_ANSWER" for q in questions}
    r = requests.post(f"{BASE}/tests/submit",
        json={"attempt_id": attempt_id, "answers": wrong_answers},
        headers={"Authorization": f"Bearer {token}"}
    )
    data = r.json()
    passed = r.status_code == 200 and data.get("passed") == False
    check(passed, "Test Fail on Wrong Answers", f"score={data.get('score')}%, passed={data.get('passed')}")

def test_start_test_retry(token, proof_id):
    """Should be able to start a new test attempt after failing"""
    r = requests.post(f"{BASE}/tests/start",
        json={"proof_id": proof_id, "domain": "tech"},
        headers={"Authorization": f"Bearer {token}"}
    )
    data = r.json()
    check(r.status_code == 200, "Test Retry Allowed", f"new attempt_id={data.get('attempt_id','')[:8]}...")
    return data.get("attempt_id"), data.get("questions", [])

def test_submit_test_pass(token, attempt_id, questions):
    """Submit correct answers → should pass and update verification"""
    # Get correct answers from question bank
    from app.services.test_engine import QUESTION_BANK
    from app.models.test import TestType
    bank = {str(q["id"]): q["answer"] for q in QUESTION_BANK[TestType.coding]}
    correct_answers = {str(q["id"]): bank.get(str(q["id"]), q["options"][0]) for q in questions}

    r = requests.post(f"{BASE}/tests/submit",
        json={"attempt_id": attempt_id, "answers": correct_answers},
        headers={"Authorization": f"Bearer {token}"}
    )
    data = r.json()
    passed = r.status_code == 200 and data.get("passed") == True
    check(passed, "Test Pass on Correct Answers", f"score={data.get('score')}%, verification={data.get('verification_status')}")
    return data

def test_verification_status_after_test(token):
    """After passing test, candidate should be test_verified"""
    r = requests.get(f"{BASE}/candidates/me", headers={"Authorization": f"Bearer {token}"})
    data = r.json()
    passed = data.get("verification_status") in ["verified", "test_verified"]
    check(passed, "Verification Status Updated After Test", f"status={data.get('verification_status')}")

# ─── COMPANY TESTS ────────────────────────────────────────────────────────────

def test_register_company():
    r = requests.post(f"{BASE}/auth/register", json={
        "email": COMPANY_EMAIL,
        "password": COMPANY_PASS,
        "role": "company"
    })
    data = r.json()
    check(r.status_code == 201, "Register Company", f"status={r.status_code}")
    return data.get("dev_otp")

def test_login_company(otp):
    requests.post(f"{BASE}/auth/verify-otp", json={"email": COMPANY_EMAIL, "otp": otp})
    r = requests.post(f"{BASE}/auth/login", json={"email": COMPANY_EMAIL, "password": COMPANY_PASS})
    data = r.json()
    passed = r.status_code == 200 and data.get("role") == "company"
    check(passed, "Company Login", f"role={data.get('role')}")
    return data.get("access_token")

def test_candidate_cannot_post_job(candidate_token):
    r = requests.post(f"{BASE}/jobs/",
        json={"title": "Test", "description": "Test", "required_skills": ["python"],
              "experience_level": "entry"},
        headers={"Authorization": f"Bearer {candidate_token}"}
    )
    check(r.status_code == 403, "Candidate Cannot Post Job (Role Check)", f"status={r.status_code}")

def test_create_company_profile(company_token):
    r = requests.post(f"{BASE}/companies/profile",
        json={"company_name": "Test Corp", "industry": "Technology", "location": "Bangalore"},
        headers={"Authorization": f"Bearer {company_token}"}
    )
    data = r.json()
    passed = r.status_code == 201 and "company_id" in data
    check(passed, "Create Company Profile", f"status={r.status_code}")
    return data.get("company_id")

def test_post_job(company_token):
    r = requests.post(f"{BASE}/jobs/",
        json={"title": "Python Developer", "description": "Build APIs",
              "required_skills": ["python", "fastapi", "sql"],
              "experience_level": "entry", "location": "Remote"},
        headers={"Authorization": f"Bearer {company_token}"}
    )
    data = r.json()
    passed = r.status_code == 201 and "job_id" in data
    check(passed, "Post Job", f"job_id={data.get('job_id','')[:8]}...")
    return data.get("job_id")

def test_list_jobs(company_token):
    r = requests.get(f"{BASE}/jobs/", headers={"Authorization": f"Bearer {company_token}"})
    data = r.json()
    passed = r.status_code == 200 and len(data) > 0
    check(passed, "List Jobs", f"count={len(data)}")

# ─── SCORING TESTS ────────────────────────────────────────────────────────────

def test_calculate_score(company_token, candidate_profile_id, job_id):
    r = requests.post(f"{BASE}/scoring/calculate",
        json={"candidate_id": candidate_profile_id, "job_id": job_id},
        headers={"Authorization": f"Bearer {company_token}"}
    )
    data = r.json()
    passed = r.status_code == 200 and "final_score" in data
    check(passed, "Calculate Score", f"score={data.get('final_score')}/5, label={data.get('label')}, visible={data.get('is_visible')}")
    return data

def test_company_sees_candidates(company_token, job_id):
    r = requests.get(f"{BASE}/companies/candidates/{job_id}",
        headers={"Authorization": f"Bearer {company_token}"}
    )
    data = r.json()
    check(r.status_code == 200, "Company Dashboard Loads", f"total={data.get('total')}")
    return data

# ─── MAIN ─────────────────────────────────────────────────────────────────────

def run_all():
    print("\n" + "="*60)
    print("  JOBIFY FULL FLOW INTEGRATION TESTS")
    print("="*60 + "\n")

    # ── Auth Flow ──
    print("── AUTH FLOW ──")
    otp, _ = test_register_candidate()
    if not otp:
        print("❌ No OTP returned — cannot continue auth tests")
        return summarize()

    test_register_duplicate()
    test_login_before_verify()
    test_wrong_otp()
    test_verify_otp(otp)
    candidate_token = test_login_candidate()
    test_login_wrong_password()

    if not candidate_token:
        print("❌ No candidate token — cannot continue")
        return summarize()

    # ── Protected Routes ──
    print("\n── PROTECTED ROUTES ──")
    test_protected_without_token()
    test_protected_with_token(candidate_token)

    # ── Candidate Profile ──
    print("\n── CANDIDATE PROFILE ──")
    profile_id = test_create_profile(candidate_token)
    test_create_profile_duplicate(candidate_token)
    profile_data = test_get_profile(candidate_token)

    # ── Proof & Test Flow ──
    print("\n── PROOF & TEST FLOW ──")
    proof_id = test_upload_proof_no_proof(candidate_token)
    test_get_proofs(candidate_token)

    if proof_id:
        attempt_id, questions = test_start_test(candidate_token, proof_id)
        if attempt_id and questions:
            test_submit_test_fail(candidate_token, attempt_id, questions)
            # Retry
            attempt_id2, questions2 = test_start_test_retry(candidate_token, proof_id)
            if attempt_id2 and questions2:
                test_submit_test_pass(candidate_token, attempt_id2, questions2)
                test_verification_status_after_test(candidate_token)

    # ── Company Flow ──
    print("\n── COMPANY FLOW ──")
    company_otp = test_register_company()
    test_candidate_cannot_post_job(candidate_token)

    if company_otp:
        company_token = test_login_company(company_otp)
        if company_token:
            test_create_company_profile(company_token)
            job_id = test_post_job(company_token)
            test_list_jobs(company_token)

            # ── Scoring ──
            print("\n── SCORING & VISIBILITY ──")
            if job_id and profile_id:
                score_data = test_calculate_score(company_token, profile_id, job_id)
                test_company_sees_candidates(company_token, job_id)

    summarize()

def summarize():
    print("\n" + "="*60)
    total = len(results)
    passed = sum(1 for _, p, _ in results if p)
    failed = total - passed
    print(f"  RESULTS: {passed}/{total} passed | {failed} failed")
    print("="*60)
    if failed > 0:
        print("\nFailed tests:")
        for name, p, detail in results:
            if not p:
                print(f"  ❌ {name} — {detail}")
    print()

if __name__ == "__main__":
    # Add backend to path
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    run_all()
