def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data["docs"] == "/docs"
    assert "version" in data


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["service"] == "NexusMail Context Processor"
