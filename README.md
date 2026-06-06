# NexusMail AI Context Processor 🚀

An independent, highly scalable Python microservice designed to act as an asynchronous, privacy-centric context optimizer for the [Odysseus AI Workspace](https://github.com/HamidKhan1001/odysseus).

NexusMail acts as an architectural boundary between raw email webhooks and local LLMs. It cleans massive email chains, extracts critical priority tags, and utilizes the internal **AceVane Mock Layer** to validate agent flows without burning expensive cloud API tokens during local development phases.

## 🏗️ Modularity Blueprint
- **Client Workspace Interface:** [HamidKhan1001/odysseus](https://github.com/HamidKhan1001/odysseus)
- **Workload Core Service:** [HamidKhan1001/nexusmail-service](https://github.com/HamidKhan1001/nexusmail-service)

## 🛠️ Local Environment Activation

1. **Clone your service repository:**
```bash
git clone https://github.com/HamidKhan1001/nexusmail-service.git
cd nexusmail-service
```

2. **Initialize isolated environment:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pydantic
```

3. **Boot the decoupled server platform:**
```bash
uvicorn app.main:app --port 8050 --reload
```

## 🔗 Cross-Repository Interconnection

To connect this service to your running Odysseus instance, add the following object into your Odysseus application's configuration array or local settings file:

```json
{
  "mcpServers": {
    "nexusmail-processor": {
      "command": "python",
      "args": ["-m", "app.main"],
      "env": {
        "NEXUS_ENDPOINT": "http://localhost:8050"
      }
    }
  }
}
```
