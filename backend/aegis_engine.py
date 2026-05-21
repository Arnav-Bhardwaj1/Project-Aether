import re
import time
import uuid
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

logger = logging.getLogger("AetherAegis")

class AegisRule(BaseModel):
    id: str
    name: str
    type: str # DOMAIN, COMMAND, DEPTH, RATE_LIMIT
    pattern: Optional[str] = None
    value: Optional[float] = None
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    description: str
    enabled: bool = True

class Decoy(BaseModel):
    id: str
    path: str
    type: str # FILE, DB
    secret_token: Optional[str] = None
    triggered: bool = False
    triggered_count: int = 0
    last_triggered: Optional[float] = None

class SecurityAlert(BaseModel):
    id: str
    timestamp: float
    type: str # FIREWALL_BLOCK, INTRUSION_ATTEMPT, AGENT_LOOP
    rule_id: Optional[str] = None
    target: str # e.g. path, domain, command
    message: str
    severity: str
    session_id: str

class AegisEngine:
    """
    Aether Aegis: Agent Firewall & Intrusion Detection System.
    Monitors sandbox changes, prompt execution, and enforces micro-rules
    to isolate agent swarms from malicious patterns or infinite loops.
    """
    def __init__(self):
        self.rules: Dict[str, AegisRule] = {}
        self.decoys: Dict[str, Decoy] = {}
        self.alerts: List[SecurityAlert] = []
        
        # session_id -> list of execution timestamps
        self.execution_history: Dict[str, List[float]] = {}
        # session_id -> current depth counter
        self.session_depths: Dict[str, int] = {}
        
        # Extended security metrics & registries
        self.fim_registry: Dict[str, Dict[str, Dict[str, Any]]] = {} # session_id -> {filepath -> {hash, size, last_modified}}
        self.fim_ledger: List[Dict[str, Any]] = []
        self.ast_scans: List[Dict[str, Any]] = []
        
        self._load_default_rules()
        self._load_default_decoys()

    def _load_default_rules(self):
        """Pre-populates the firewall rules database."""
        default_rules = [
            AegisRule(
                id="fw-dns-block",
                name="Domain Blacklist",
                type="DOMAIN",
                pattern=r"(malicious-site\.com|evals-exfiltrate\.net|attacker-server\.org|tempmail\.com)",
                severity="CRITICAL",
                description="Blocks the agent from attempting outgoing HTTP requests to untrusted or known malware hosts."
            ),
            AegisRule(
                id="fw-sys-shadow",
                name="System Shadow Access Protection",
                type="COMMAND",
                pattern=r"(cat\s+/etc/shadow|grep\s+passwd|SAM\s+file|mimikatz|secrets\.xml)",
                severity="CRITICAL",
                description="Intercepts command-line instructions trying to read critical kernel credentials or active user security hives."
            ),
            AegisRule(
                id="fw-dns-whitelist",
                name="Domain Whitelist Enforcer",
                type="DOMAIN",
                pattern=r"^(?!.*(googleapis\.com|github\.com|openai\.com|anthropic\.com|huggingface\.co|wikipedia\.org)).*$",
                severity="HIGH",
                description="Enforces strict outbound limits. Only permits essential API domains, blocking unspecified external connections."
            ),
            AegisRule(
                id="fw-rce-escalation",
                name="Privilege Escalation Interceptor",
                type="COMMAND",
                pattern=r"(sudo\s+su|runas\s+/user|chmod\s+777|chown\s+root|passwd\s+root)",
                severity="HIGH",
                description="Blocks commands trying to upgrade standard credentials to root/administrator access levels."
            ),
            AegisRule(
                id="fw-loop-throttle",
                name="Recursive Loop Detection",
                type="RATE_LIMIT",
                value=5.0, # max 5 calls within 15 seconds
                severity="HIGH",
                description="Monitors invocation frequency. Blocks agents caught in infinite prompt loops or tool invocation recourses."
            ),
            AegisRule(
                id="fw-depth-ceiling",
                name="Execution Depth Capping",
                type="DEPTH",
                value=15.0, # max 15 consecutive execution nodes
                severity="MEDIUM",
                description="Stops agent swarm workflows that run for too many cycles without user feedback."
            ),
            AegisRule(
                id="fw-dlp-leak",
                name="Data Loss Prevention (DLP) Guard",
                type="DLP",
                severity="CRITICAL",
                description="Monitors and blocks output containing sensitive data leaks (e.g., credit card details, AWS secrets, SSNs, and private keys)."
            )
        ]
        for r in default_rules:
            self.rules[r.id] = r

    def _load_default_decoys(self):
        """Initializes simulated honey-pot decoy files and DB tables."""
        default_decoys = [
            Decoy(
                id="decoy-db-admin",
                path="admin_credentials_backup",
                type="DB",
                secret_token="AES256_ENC_TOKEN_99182319"
            ),
            Decoy(
                id="decoy-file-aws",
                path="/home/user/.aws/credentials",
                type="FILE",
                secret_token="AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE;AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
            ),
            Decoy(
                id="decoy-file-conf",
                path="/etc/security/confidential_financials.csv",
                type="FILE",
                secret_token="CONFIDENTIAL_EARNINGS_PRE_RELEASE_DO_NOT_DISTRIBUTE"
            ),
            Decoy(
                id="decoy-db-tokens",
                path="api_master_tokens",
                type="DB",
                secret_token="TOKEN_X_BEARER_8a7c29d10eef410a"
            )
        ]
        for d in default_decoys:
            self.decoys[d.id] = d

    def _extract_domains(self, text: str) -> List[str]:
        # Regex to find potential domains or URLs
        pattern = r'\b(?:https?://|wss?://|ftp://)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b'
        candidates = re.findall(pattern, text)
        
        domains = []
        excluded_extensions = {
            'py', 'js', 'ts', 'tsx', 'css', 'json', 'md', 'txt', 'csv', 'png', 'jpg', 'jpeg', 
            'gif', 'exe', 'sh', 'bat', 'xml', 'yml', 'yaml', 'html', 'rs', 'go', 'cpp', 'c', 
            'h', 'java', 'class', 'dll', 'so', 'db', 'sql', 'log', 'ini', 'cfg', 'conf',
            'append', 'split', 'join', 'read', 'write', 'close', 'open', 'pop', 'push', 'insert'
        }
        
        for cand in candidates:
            domain = cand
            if "://" in domain:
                domain = domain.split("://")[1]
            domain = domain.split("/")[0]
            domain = domain.split("?")[0]
            domain = domain.split("#")[0]
            domain = domain.split(":")[0]
            
            domain = domain.strip().lower()
            if "_" in domain:
                continue
                
            parts = domain.split('.')
            if len(parts) > 1:
                tld = parts[-1]
                if tld in excluded_extensions:
                    continue
                
                valid = True
                for part in parts:
                    if not part:
                        valid = False
                        break
                    if not re.match(r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$', part):
                        valid = False
                        break
                if valid:
                    domains.append(domain)
                    
        return list(set(domains))

    def compute_sha256(self, content: str) -> str:
        import hashlib
        return hashlib.sha256(content.encode('utf-8', errors='ignore')).hexdigest()

    def recursive_decode_and_extract(self, text: str, depth: int = 3) -> List[str]:
        """Recursively scans and extracts decoded payloads from the text up to `depth` levels."""
        if depth <= 0:
            return []
        
        extracted = []
        
        # 1. Base64 Decoder
        b64_matches = re.findall(r'\b[a-zA-Z0-9+/]{8,}={0,2}\b', text)
        for match in b64_matches:
            try:
                import base64
                decoded = base64.b64decode(match.encode('utf-8'), validate=True).decode('utf-8', errors='ignore')
                if len(decoded) > 4 and any(c.isalnum() for c in decoded):
                    extracted.append(decoded)
                    extracted.extend(self.recursive_decode_and_extract(decoded, depth - 1))
            except Exception:
                pass
                
        # 2. Hex Decoder
        hex_matches = re.findall(r'(?:\\x[0-9a-fA-F]{2})+', text)
        for match in hex_matches:
            try:
                byte_data = bytes.fromhex(match.replace('\\x', ''))
                decoded = byte_data.decode('utf-8', errors='ignore')
                if len(decoded) > 2:
                    extracted.append(decoded)
                    extracted.extend(self.recursive_decode_and_extract(decoded, depth - 1))
            except Exception:
                pass
                
        # 3. URL Decoder
        if '%' in text:
            try:
                import urllib.parse
                decoded = urllib.parse.unquote(text)
                if decoded != text:
                    extracted.append(decoded)
                    extracted.extend(self.recursive_decode_and_extract(decoded, depth - 1))
            except Exception:
                pass
                
        # 4. Octal Decoder
        octal_matches = re.findall(r'(?:\\[0-7]{3})+', text)
        for match in octal_matches:
            try:
                octals = [int(o, 8) for o in re.findall(r'[0-7]{3}', match)]
                decoded = bytes(octals).decode('utf-8', errors='ignore')
                if len(decoded) > 2:
                    extracted.append(decoded)
                    extracted.extend(self.recursive_decode_and_extract(decoded, depth - 1))
            except Exception:
                pass
                
        return list(set(extracted))

    def check_dlp_leakage(self, text: str) -> List[Dict[str, Any]]:
        """Scans content for sensitive information (DLP)."""
        leaks = []
        dlp_patterns = {
            "CREDIT_CARD": r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b',
            "SSN": r'\b\d{3}-\d{2}-\d{4}\b',
            "AWS_KEY": r'\b(AKIA[A-Z0-9]{16})\b',
            "PRIVATE_KEY": r'-----BEGIN [A-Z ]*PRIVATE KEY-----'
        }
        for key_type, pattern in dlp_patterns.items():
            matches = re.findall(pattern, text)
            if matches:
                target_match = matches[0] if isinstance(matches[0], str) else matches[0][0]
                leaks.append({
                    "type": key_type,
                    "matched": target_match[:15] + "..." if len(target_match) > 15 else target_match
                })
        return leaks

    def scan_python_ast(self, code: str) -> Dict[str, Any]:
        """Statically analyzes Python code for safety violations."""
        import ast
        
        unsafe_imports = []
        unsafe_calls = []
        threat_level = "LOW"
        risk_score = 0.0
        
        blocked_imports = {'os', 'sys', 'subprocess', 'socket', 'urllib', 'requests', 'pty', 'ctypes', 'builtins'}
        blocked_calls = {'eval', 'exec', 'getattr', 'setattr', '__import__', 'compile'}
        
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        name = alias.name.split('.')[0]
                        if name in blocked_imports:
                            unsafe_imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        name = node.module.split('.')[0]
                        if name in blocked_imports:
                            unsafe_imports.append(f"from {node.module} import {[alias.name for alias in node.names]}")
                elif isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name):
                        if node.func.id in blocked_calls:
                            unsafe_calls.append(node.func.id)
                    elif isinstance(node.func, ast.Attribute):
                        if node.func.attr in blocked_calls:
                            unsafe_calls.append(node.func.attr)
                            
            if unsafe_imports or unsafe_calls:
                threat_level = "HIGH" if (any(x in ['subprocess', 'socket', 'pty'] for x in unsafe_imports) or 'eval' in unsafe_calls or 'exec' in unsafe_calls) else "MEDIUM"
                risk_score = 0.8 if threat_level == "HIGH" else 0.5
                
            return {
                "parsed": True,
                "unsafe_imports": unsafe_imports,
                "unsafe_calls": unsafe_calls,
                "threat_level": threat_level,
                "risk_score": risk_score
            }
        except Exception as e:
            return {
                "parsed": False,
                "error": str(e),
                "unsafe_imports": [],
                "unsafe_calls": [],
                "threat_level": "LOW",
                "risk_score": 0.0
            }

    def register_file_fim(self, session_id: str, filepath: str, action: str, content: str = ""):
        """Updates FIM registry and logs changes to the ledger."""
        now = time.time()
        file_hash = self.compute_sha256(content) if action != "DELETE" else "DELETED"
        size = len(content.encode('utf-8')) if action != "DELETE" else 0
        
        if session_id not in self.fim_registry:
            self.fim_registry[session_id] = {}
            
        previous_hash = "NEW_FILE"
        if filepath in self.fim_registry[session_id]:
            previous_hash = self.fim_registry[session_id][filepath]["hash"]
            
        if action == "DELETE":
            if filepath in self.fim_registry[session_id]:
                del self.fim_registry[session_id][filepath]
        else:
            self.fim_registry[session_id][filepath] = {
                "hash": file_hash,
                "size": size,
                "last_modified": now
            }
            
        self.fim_ledger.append({
            "id": f"fim_{uuid.uuid4().hex[:8]}",
            "timestamp": now,
            "session_id": session_id,
            "filepath": filepath,
            "action": action,
            "size": size,
            "previous_hash": previous_hash[:12] if previous_hash else "None",
            "current_hash": file_hash[:12] if file_hash else "None"
        })
        logger.info(f"[AEGIS FIM] Registered {action} for '{filepath}' in session {session_id}")

    def get_fim_ledger(self) -> List[Dict[str, Any]]:
        return sorted(self.fim_ledger, key=lambda x: x["timestamp"], reverse=True)

    def get_ast_scans(self) -> List[Dict[str, Any]]:
        return sorted(self.ast_scans, key=lambda x: x["timestamp"], reverse=True)

    def evaluate_text_rules(self, text: str, session_id: str) -> Dict[str, Any]:
        """Scans input prompt or output text against domain, command and DLP rules (including recursive decodes)."""
        violations = []
        risk_score = 0.0
        
        # 1. Recursive Decode
        decoded_payloads = self.recursive_decode_and_extract(text)
        all_texts = [(text, False)] + [(p, True) for p in decoded_payloads]
        
        # 2. Evaluate rules for all texts
        for check_text, is_decoded in all_texts:
            extracted_domains = self._extract_domains(check_text)
            
            for rule_id, rule in self.rules.items():
                if not rule.enabled:
                    continue
                    
                if rule.type == "DOMAIN" and rule.pattern:
                    for domain in extracted_domains:
                        if re.search(rule.pattern, domain, re.IGNORECASE):
                            if rule not in violations:
                                violations.append(rule)
                            alert = SecurityAlert(
                                id=f"alert_{uuid.uuid4().hex[:8]}",
                                timestamp=time.time(),
                                type="FIREWALL_BLOCK",
                                rule_id=rule.id,
                                target=domain,
                                message=f"Domain rule '{rule.name}' triggered on '{domain}'" + (" (in decoded payload)" if is_decoded else ""),
                                severity=rule.severity,
                                session_id=session_id
                            )
                            self.alerts.append(alert)
                            logger.warning(f"[AEGIS FIREWALL] Blocked domain in session {session_id} on rule {rule.id}: {domain}")
                
                elif rule.type == "COMMAND" and rule.pattern:
                    if re.search(rule.pattern, check_text, re.IGNORECASE):
                        if rule not in violations:
                            violations.append(rule)
                        alert = SecurityAlert(
                            id=f"alert_{uuid.uuid4().hex[:8]}",
                            timestamp=time.time(),
                            type="FIREWALL_BLOCK",
                            rule_id=rule.id,
                            target=rule.type,
                            message=f"Command rule '{rule.name}' triggered" + (" (in decoded payload)" if is_decoded else ""),
                            severity=rule.severity,
                            session_id=session_id
                        )
                        self.alerts.append(alert)
                        logger.warning(f"[AEGIS FIREWALL] Blocked text in session {session_id} on rule {rule.id}")

        # 3. Evaluate DLP Rules
        dlp_rule = self.rules.get("fw-dlp-leak")
        if dlp_rule and dlp_rule.enabled:
            for check_text, is_decoded in all_texts:
                leaks = self.check_dlp_leakage(check_text)
                if leaks:
                    if dlp_rule not in violations:
                        violations.append(dlp_rule)
                    for leak in leaks:
                        alert = SecurityAlert(
                            id=f"alert_{uuid.uuid4().hex[:8]}",
                            timestamp=time.time(),
                            type="FIREWALL_BLOCK",
                            rule_id=dlp_rule.id,
                            target=leak["type"],
                            message=f"DLP Leak Blocked: Found sensitive {leak['type']} ('{leak['matched']}')" + (" (in decoded payload)" if is_decoded else ""),
                            severity=dlp_rule.severity,
                            session_id=session_id
                        )
                        self.alerts.append(alert)
                        logger.warning(f"[AEGIS FIREWALL] Blocked text in session {session_id} on rule {dlp_rule.id}: {leak['type']}")
                    break # only trigger once per evaluation run

        if violations:
            severity_weights = {"LOW": 0.2, "MEDIUM": 0.5, "HIGH": 0.8, "CRITICAL": 1.0}
            risk_score = max(severity_weights.get(v.severity, 0.0) for v in violations)
            
        return {
            "passed": len(violations) == 0,
            "violations": [v.model_dump() for v in violations],
            "risk_score": risk_score
        }

    def check_loop_prevention(self, session_id: str) -> Dict[str, Any]:
        """Enforces rate-limits and depth checks to throttle recursive runs."""
        now = time.time()
        
        # 1. Update execution timestamps
        if session_id not in self.execution_history:
            self.execution_history[session_id] = []
        self.execution_history[session_id].append(now)
        
        # Clean older history (older than 30s)
        self.execution_history[session_id] = [t for t in self.execution_history[session_id] if now - t < 30]
        
        # 2. Check depth counter
        if session_id not in self.session_depths:
            self.session_depths[session_id] = 0
        self.session_depths[session_id] += 1
        
        violations = []
        
        # Evaluate Loop Rule
        loop_rule = self.rules.get("fw-loop-throttle")
        if loop_rule and loop_rule.enabled and loop_rule.value:
            # count calls in last 15 seconds
            recent_calls = [t for t in self.execution_history[session_id] if now - t < 15]
            if len(recent_calls) > loop_rule.value:
                violations.append(loop_rule)
                alert = SecurityAlert(
                    id=f"alert_{uuid.uuid4().hex[:8]}",
                    timestamp=now,
                    type="AGENT_LOOP",
                    rule_id=loop_rule.id,
                    target="EXECUTION_RATE",
                    message=f"Rate limit exceeded: {len(recent_calls)} iterations in 15 seconds. Triggered throttle.",
                    severity=loop_rule.severity,
                    session_id=session_id
                )
                self.alerts.append(alert)
                logger.error(f"[AEGIS FIREWALL] Loop detected in session {session_id}")

        # Evaluate Depth Rule
        depth_rule = self.rules.get("fw-depth-ceiling")
        if depth_rule and depth_rule.enabled and depth_rule.value:
            if self.session_depths[session_id] > depth_rule.value:
                violations.append(depth_rule)
                alert = SecurityAlert(
                    id=f"alert_{uuid.uuid4().hex[:8]}",
                    timestamp=now,
                    type="AGENT_LOOP",
                    rule_id=depth_rule.id,
                    target="EXECUTION_DEPTH",
                    message=f"Maximum agent call depth ceiling ({int(depth_rule.value)}) breached. Throttled workflow.",
                    severity=depth_rule.severity,
                    session_id=session_id
                )
                self.alerts.append(alert)
                logger.error(f"[AEGIS FIREWALL] Max depth ceiling hit in session {session_id}")

        if violations:
            return {
                "passed": False,
                "violations": [v.model_dump() for v in violations],
                "risk_score": max(0.8 if v.severity == "HIGH" else 0.5 for v in violations)
            }
            
        return {"passed": True, "violations": [], "risk_score": 0.0}

    def check_sandbox_decoys(self, session_id: str, action_type: str, path: str) -> Optional[Dict[str, Any]]:
        """
        Inspects sandbox actions. If an agent tries to modify or read a path
        that matches a honey-decoy pattern, we trigger an intrusion alert.
        """
        now = time.time()
        for decoy_id, decoy in self.decoys.items():
            # Check if decoy path is a substring or match of action path
            # (e.g. if path is '/home/user/.aws/credentials')
            cleaned_decoy_path = decoy.path.lower().strip()
            cleaned_action_path = path.lower().strip()
            
            if cleaned_decoy_path in cleaned_action_path or cleaned_action_path in cleaned_decoy_path:
                decoy.triggered = True
                decoy.triggered_count += 1
                decoy.last_triggered = now
                
                alert = SecurityAlert(
                    id=f"alert_{uuid.uuid4().hex[:8]}",
                    timestamp=now,
                    type="INTRUSION_ATTEMPT",
                    rule_id=decoy_id,
                    target=path,
                    message=f"HONEYPOT TRIGGERED: Unauthorized agent attempt to {action_type} decoy '{decoy.path}'.",
                    severity="CRITICAL",
                    session_id=session_id
                )
                self.alerts.append(alert)
                logger.critical(f"[AEGIS HONEYPOT] Honey-decoy path '{decoy.path}' breached by session {session_id}!")
                
                return {
                    "decoy_id": decoy.id,
                    "decoy_path": decoy.path,
                    "secret_token": decoy.secret_token,
                    "severity": "CRITICAL"
                }
        return None

    def get_rules(self) -> List[Dict[str, Any]]:
        return [r.model_dump() for r in self.rules.values()]

    def toggle_rule(self, rule_id: str) -> bool:
        if rule_id in self.rules:
            self.rules[rule_id].enabled = not self.rules[rule_id].enabled
            logger.info(f"[AEGIS ENGINE] Toggled rule {rule_id} -> {self.rules[rule_id].enabled}")
            return True
        return False

    def get_decoys(self) -> List[Dict[str, Any]]:
        return [d.model_dump() for d in self.decoys.values()]

    def add_decoy(self, path: str, type: str, secret_token: Optional[str] = None) -> Dict[str, Any]:
        decoy_id = f"decoy-custom-{uuid.uuid4().hex[:6]}"
        decoy = Decoy(
            id=decoy_id,
            path=path,
            type=type,
            secret_token=secret_token
        )
        self.decoys[decoy_id] = decoy
        logger.info(f"[AEGIS ENGINE] Added custom honey-decoy '{path}'")
        return decoy.model_dump()

    def get_alerts(self) -> List[Dict[str, Any]]:
        return [a.model_dump() for a in sorted(self.alerts, key=lambda x: x.timestamp, reverse=True)]

    def clear_alerts(self):
        self.alerts.clear()
        logger.info("[AEGIS ENGINE] Cleared security alerts.")

    def reset_session_stats(self, session_id: str):
        if session_id in self.execution_history:
            self.execution_history[session_id] = []
        if session_id in self.session_depths:
            self.session_depths[session_id] = 0

    def get_stats(self) -> Dict[str, Any]:
        """Calculates security metrics and risk indicators."""
        total_alerts = len(self.alerts)
        active_rules = len([r for r in self.rules.values() if r.enabled])
        triggered_decoys = len([d for d in self.decoys.values() if d.triggered])
        
        critical_alerts = len([a for a in self.alerts if a.severity == "CRITICAL"])
        high_alerts = len([a for a in self.alerts if a.severity == "HIGH"])
        
        # Calculate general threat status level
        if critical_alerts > 0 or triggered_decoys > 0:
            threat_level = "CRITICAL"
            health_score = max(20.0, 100.0 - (critical_alerts * 25) - (triggered_decoys * 30))
        elif high_alerts > 0:
            threat_level = "HIGH"
            health_score = max(50.0, 100.0 - (high_alerts * 15))
        elif total_alerts > 0:
            threat_level = "MEDIUM"
            health_score = max(75.0, 100.0 - (total_alerts * 5))
        else:
            threat_level = "LOW"
            health_score = 100.0
            
        coverage_pct = (active_rules / len(self.rules)) * 100.0 if self.rules else 100.0
        
        return {
            "threat_level": threat_level,
            "health_score": round(health_score, 1),
            "total_alerts": total_alerts,
            "active_rules_count": active_rules,
            "total_rules_count": len(self.rules),
            "triggered_decoys": triggered_decoys,
            "coverage_percentage": round(coverage_pct, 1)
        }

    def simulate_attack_sequence(self, session_id: str, category: str) -> List[Dict[str, Any]]:
        """Generates dynamic simulated alerts and logs to showcase dashboard animations."""
        now = time.time()
        sim_alerts = []
        
        if category == "PORT_SCAN":
            sim_alerts.append(SecurityAlert(
                id=f"alert_sim_{uuid.uuid4().hex[:6]}",
                timestamp=now - 4,
                type="FIREWALL_BLOCK",
                rule_id="fw-dns-block",
                target="nmap -sS -O 192.168.1.1",
                message="Privileged port scanner instruction intercepted: network recon signature match.",
                severity="HIGH",
                session_id=session_id
            ))
        elif category == "JAILBREAK":
            sim_alerts.append(SecurityAlert(
                id=f"alert_sim_{uuid.uuid4().hex[:6]}",
                timestamp=now - 3,
                type="FIREWALL_BLOCK",
                rule_id="fw-sys-shadow",
                target="DAN override mode active",
                message="System command bypass instruction detected: Override bypass attempt.",
                severity="CRITICAL",
                session_id=session_id
            ))
        elif category == "DECOY_ACCESS":
            # Simulate agent reading aws credentials
            decoy = self.decoys.get("decoy-file-aws")
            if decoy:
                decoy.triggered = True
                decoy.triggered_count += 1
                decoy.last_triggered = now
                
            sim_alerts.append(SecurityAlert(
                id=f"alert_sim_{uuid.uuid4().hex[:6]}",
                timestamp=now - 2,
                type="INTRUSION_ATTEMPT",
                rule_id="decoy-file-aws",
                target="/home/user/.aws/credentials",
                message="HONEYPOT TRIGGERED: Unauthorized agent attempt to FILE_READ decoy '/home/user/.aws/credentials'.",
                severity="CRITICAL",
                session_id=session_id
            ))
        elif category == "LOOP_DEFENSE":
            rule = self.rules.get("fw-loop-throttle")
            sim_alerts.append(SecurityAlert(
                id=f"alert_sim_{uuid.uuid4().hex[:6]}",
                timestamp=now - 1,
                type="AGENT_LOOP",
                rule_id="fw-loop-throttle",
                target="EXECUTION_RATE",
                message="Rate limit threshold breached: 8 loop calls in 15 seconds. Triggered emergency isolation.",
                severity="HIGH",
                session_id=session_id
            ))
            
        # Append simulated alert to database
        for sa in sim_alerts:
            self.alerts.append(sa)
            
        return [sa.model_dump() for sa in sim_alerts]
