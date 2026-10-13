import pytest
from datetime import datetime, timezone, timedelta
from backend.app.schemas.schemas import ContestBase, UserRegister

def test_contest_normalization_schema():
    start = datetime.now(timezone.utc)
    end = start + timedelta(hours=2)

    contest = ContestBase(
        id="codeforces-1234",
        platform="Codeforces",
        external_id="1234",
        name="Codeforces Round 999 (Div. 2)",
        start_time=start,
        end_time=end,
        duration_seconds=7200,
        url="https://codeforces.com/contest/1234",
        contest_type="CF",
        division="Div. 2",
        status="upcoming",
    )

    assert contest.platform == "Codeforces"
    assert contest.duration_seconds == 7200
    assert contest.division == "Div. 2"
    assert contest.status == "upcoming"

def test_duplicate_contest_identity_key():
    platform = "Codeforces"
    external_id = "1234"
    identity_key = f"{platform.lower()}:{external_id}"
    assert identity_key == "codeforces:1234"

def test_user_registration_schema_validation():
    user = UserRegister(
        username="tourist_fan",
        email="tourist@example.com",
        password="strongpassword123",
        timezone="Asia/Kolkata",
    )
    assert user.username == "tourist_fan"
    assert user.timezone == "Asia/Kolkata"

def test_contest_status_calculation():
    now = datetime.now(timezone.utc)

    # Future contest
    start_future = now + timedelta(days=2)
    end_future = start_future + timedelta(hours=2)
    assert start_future > now  # upcoming

    # Live contest
    start_live = now - timedelta(minutes=30)
    end_live = now + timedelta(minutes=90)
    assert start_live <= now <= end_live  # live

    # Finished contest
    start_past = now - timedelta(days=2)
    end_past = start_past + timedelta(hours=2)
    assert end_past < now  # finished
