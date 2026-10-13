from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    Boolean,
    ForeignKey,
    Text,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def utc_now():
    return datetime.now(timezone.utc)

class Platform(Base):
    __tablename__ = "platforms"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    website_url = Column(String(255), nullable=False)
    logo_url = Column(String(255), nullable=True)
    enabled = Column(Boolean, default=True, nullable=False)
    api_policy_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    contests = relationship("Contest", back_populates="platform_rel", cascade="all, delete-orphan")


class Contest(Base):
    __tablename__ = "contests"

    id = Column(String(100), primary_key=True)
    platform_id = Column(String(50), ForeignKey("platforms.slug"), nullable=False, index=True)
    external_id = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    url = Column(String(500), nullable=False)
    contest_type = Column(String(50), nullable=True)
    division = Column(String(100), nullable=True)
    status = Column(String(20), nullable=False, index=True)  # upcoming, live, finished
    description = Column(Text, nullable=True)
    source_type = Column(String(50), default="official_api")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    platform_rel = relationship("Platform", back_populates="contests")

    # Enforce uniqueness constraint: one platform cannot have duplicate external contest IDs
    __table_args__ = (
        UniqueConstraint("platform_id", "external_id", name="uq_platform_external_id"),
        Index("ix_contests_platform_status_start", "platform_id", "status", "start_time"),
    )


class Ladder(Base):
    __tablename__ = "ladders"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    difficulty = Column(String(50), nullable=False)
    rating_min = Column(Integer, nullable=True)
    rating_max = Column(Integer, nullable=True)
    category = Column(String(50), default="rating")  # rating, topic, curated
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    ladder_problems = relationship("LadderProblem", back_populates="ladder", cascade="all, delete-orphan")


class Problem(Base):
    __tablename__ = "problems"

    id = Column(String(50), primary_key=True)
    platform = Column(String(50), nullable=False, index=True)
    external_id = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    rating = Column(Integer, nullable=False, index=True)
    tags = Column(String(255), nullable=True)  # comma-separated tags
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    ladder_links = relationship("LadderProblem", back_populates="problem")
    user_progress = relationship("UserProblemProgress", back_populates="problem")


class LadderProblem(Base):
    __tablename__ = "ladder_problems"

    ladder_id = Column(String(50), ForeignKey("ladders.id"), primary_key=True)
    problem_id = Column(String(50), ForeignKey("problems.id"), primary_key=True)
    position = Column(Integer, nullable=False, default=1)

    ladder = relationship("Ladder", back_populates="ladder_problems")
    problem = relationship("Problem", back_populates="ladder_links")


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    timezone = Column(String(50), default="Asia/Kolkata", nullable=False)
    role = Column(String(20), default="user", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    progress_records = relationship("UserProblemProgress", back_populates="user", cascade="all, delete-orphan")


class UserProblemProgress(Base):
    __tablename__ = "user_problem_progress"

    user_id = Column(String(50), ForeignKey("users.id"), primary_key=True)
    problem_id = Column(String(50), ForeignKey("problems.id"), primary_key=True)
    status = Column(String(20), default="not_attempted", nullable=False)  # not_attempted, attempted, solved
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="progress_records")
    problem = relationship("Problem", back_populates="user_progress")
