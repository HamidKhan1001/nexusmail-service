def test_process_routine_acevane(client, routine_email):
    r = client.post("/email/process-stream", json=routine_email)
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert data["pipeline_mode"] == "AceVane_Mock_Protected"
    assert data["metrics"]["priority_rating"] == "ROUTINE_READ"
    assert data["purged_context"] != ""


def test_process_urgent_acevane(client, urgent_email):
    r = client.post("/email/process-stream", json=urgent_email)
    assert r.status_code == 200
    data = r.json()
    assert data["metrics"]["priority_rating"] == "CRITICAL_ACTION"


def test_process_live_mode(client, routine_email):
    payload = {**routine_email, "use_acevane": False}
    r = client.post("/email/process-stream", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["pipeline_mode"] == "Live_Inference_Pass"
    assert data["metrics"]["priority_rating"] == "UNASSIGNED"


def test_messy_email_cleaned(client, messy_email):
    r = client.post("/email/process-stream", json=messy_email)
    assert r.status_code == 200
    assert "Original Message" not in r.json()["purged_context"]


def test_invalid_sender_rejected(client):
    r = client.post("/email/process-stream", json={"raw_body": "test", "sender": "not-an-email"})
    assert r.status_code == 422


def test_empty_body_rejected(client):
    r = client.post("/email/process-stream", json={"raw_body": "", "sender": "x@x.com"})
    assert r.status_code == 422
