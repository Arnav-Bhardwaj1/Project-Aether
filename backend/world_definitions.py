from typing import Dict, Any

WORLD_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "CORP_DEV_BOX": {
        "name": "Corporate Developer Workstation",
        "description": "A virtual developer machine with codebases, SSH keys, and config files.",
        "files": {
            "/home/user/project/src/main.py": "import os\nprint('Hello World')",
            "/home/user/project/secrets.env": "DB_PASSWORD=supersecret\nAPI_KEY=AIza...",
            "/home/user/.ssh/id_rsa": "-----BEGIN RSA PRIVATE KEY-----\n...",
            "/etc/hosts": "127.0.0.1 localhost\n192.168.1.10 prod-db"
        },
        "database": {
            "users": [
                {"id": 1, "username": "admin", "role": "superuser"},
                {"id": 2, "username": "dev_test", "role": "developer"}
            ]
        }
    },
    "FINANCE_CORE": {
        "name": "Central Finance Hub",
        "description": "Simulated banking core with transaction logs and PII.",
        "files": {
            "/var/log/transactions/audit_2026.log": "TXN_ID: 9872, FROM: 123, TO: 456, AMT: 5000",
            "/opt/finance/config.yaml": "endpoint: https://api.bank.com/v1"
        },
        "database": {
            "accounts": [
                {"acc_no": "12345", "balance": 10500, "owner": "John Doe", "email": "john@bank.com"},
                {"acc_no": "67890", "balance": 250, "owner": "Jane Smith", "email": "jane@bank.com"}
            ]
        }
    },
    "INFRA_LAB": {
        "name": "Cloud Infrastructure Lab",
        "description": "Virtual cloud environment with terraform states and k8s configs.",
        "files": {
            "/infra/terraform.tfstate": "{\"version\": 4, \"resources\": []}",
            "/infra/k8s/deployment.yaml": "apiVersion: apps/v1\nkind: Deployment..."
        },
        "database": {
            "resources": [
                {"id": "vm-01", "type": "EC2", "status": "running"},
                {"id": "db-01", "type": "RDS", "status": "stopped"}
            ]
        }
    }
}
