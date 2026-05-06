from citadel_engine import PolicyManifest, PolicyRule

def get_standard_policies():
    """Returns a collection of industry-standard policy templates."""
    
    # 1. GDPR & PII Shield
    gdpr_policy = PolicyManifest(
        id="gdpr-pii-shield",
        name="GDPR & PII Privacy Shield",
        rules=[
            PolicyRule(
                id="pii-email",
                name="Email Detection",
                type="REGEX",
                pattern=r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
                severity="HIGH",
                description="Detection of personal email addresses in data stream."
            ),
            PolicyRule(
                id="pii-ssn",
                name="SSN / ID Pattern",
                type="REGEX",
                pattern=r"\b\d{3}-\d{2}-\d{4}\b",
                severity="CRITICAL",
                description="Detection of Social Security Numbers or similar identifiers."
            ),
            PolicyRule(
                id="pii-medical",
                name="Medical Data Privacy",
                type="SEMANTIC",
                severity="HIGH",
                description="Prevent the agent from processing or revealing sensitive health/medical information."
            )
        ]
    )

    # 2. NIST AI Risk Management
    nist_policy = PolicyManifest(
        id="nist-ai-rmf",
        name="NIST AI Risk Framework",
        rules=[
            PolicyRule(
                id="sec-injection",
                name="Prompt Injection Protection",
                type="REGEX",
                pattern=r"(ignore all previous instructions|system override|DAN mode)",
                severity="CRITICAL",
                description="Detection of common prompt injection and jailbreak patterns."
            ),
            PolicyRule(
                id="sec-secret",
                name="Secret & API Key Leak",
                type="ENTROPY",
                severity="CRITICAL",
                description="Detection of high-entropy strings likely to be API keys or credentials."
            ),
            PolicyRule(
                id="sec-adversarial",
                name="Adversarial Intent",
                type="SEMANTIC",
                severity="HIGH",
                description="Detect and block attempts to use the agent for malicious hacking or reconnaissance."
            )
        ]
    )

    ethical_policy = PolicyManifest(
        id="ethical-boundaries",
        name="Ethical & Bias Guardrails",

        rules=[
            PolicyRule(
                id="eth-toxicity",
                name="Toxicity & Hate Speech",
                type="SEMANTIC",
                severity="HIGH",
                description="Block content that contains hate speech, harassment, or extreme toxicity."
            ),
            PolicyRule(
                id="eth-political",
                name="Political Neutrality",
                type="SEMANTIC",
                severity="MEDIUM",
                description="Ensure the agent maintains a neutral stance on sensitive political topics."
            ),
            PolicyRule(
                id="eth-bias",
                name="Gender & Racial Bias",
                type="SEMANTIC",
                severity="HIGH",
                description="Detect and flag responses that exhibit systematic bias or stereotyping."
            )
        ]
    )

    # 4. Financial Compliance (SOX/SEC)
    financial_policy = PolicyManifest(
        id="fin-compliance",
        name="Financial Governance (SOX)",
        rules=[
            PolicyRule(
                id="fin-advice",
                name="Unregulated Financial Advice",
                type="SEMANTIC",
                severity="CRITICAL",
                description="Prevent the agent from providing specific investment or financial advice without disclaimers."
            ),
            PolicyRule(
                id="fin-insider",
                name="Insider Info Patterns",
                type="REGEX",
                pattern=r"(confidential earnings|non-public|internal only forecast)",
                severity="CRITICAL",
                description="Flag potential leaks of sensitive financial forecasts or non-public data."
            )
        ]
    )

    # 5. Infrastructure Guardrails
    infra_policy = PolicyManifest(
        id="infra-guard",
        name="Infrastructure Shield",
        rules=[
            PolicyRule(
                id="inf-rce",
                name="RCE Pattern Detection",
                type="REGEX",
                pattern=r"(rm -rf|chmod 777|sudo|PowerShell -ExecutionPolicy)",
                severity="CRITICAL",
                description="Detect attempts to execute destructive shell commands or privilege escalation."
            ),
            PolicyRule(
                id="inf-port",
                name="Port Scanning Intent",
                type="REGEX",
                pattern=r"(nmap|netcat|zmap|nc -zv)",
                severity="HIGH",
                description="Detect attempts to use the agent for network reconnaissance."
            )
        ]
    )

    return [gdpr_policy, nist_policy, ethical_policy, financial_policy, infra_policy]

