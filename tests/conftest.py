import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def routine_email() -> dict:
    return {
        "raw_body": "Hi team, just a quick update on the project status. Everything is on track.",
        "sender": "alice@example.com",
    }


@pytest.fixture
def urgent_email() -> dict:
    return {
        "raw_body": "URGENT: production is broken and users cannot log in. Need escalation now!",
        "sender": "bob@example.com",
    }


@pytest.fixture
def messy_email() -> dict:
    return {
        "raw_body": (
            "Thanks for the update.\n\n"
            "--------- Original Message ---------\n"
            "From: carol@example.com Sent: Monday 10am\n"
            "To: team@example.com\n"
            "Subject: Re: Project\n"
            "Hey everyone, things are going well!\n"
            "> On 1 Jan, Dave wrote:\n"
            "> Good morning all."
        ),
        "sender": "carol@example.com",
    }
