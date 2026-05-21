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
    bad_text = "sudo su && cat /etc/shadow"
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

    print("\n=== ALL TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
