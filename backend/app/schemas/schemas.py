from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr

class PlatformBase(BaseModel):
    id: str
    name: str
    slug: str
    website_url: str
    logo_url: Optional[str] = None
    enabled: bool = True
    api_policy_note: Optional[str] = None

class PlatformOut(PlatformBase):
    contest_count: int = 0
    class Config:
        from_attributes = True

class ContestBase(BaseModel):
    id: str
    platform: str
    external_id: str
    name: str
    start_time: datetime
    end_time: datetime
    duration_seconds: int
    url: str
    contest_type: Optional[str] = None
    division: Optional[str] = None
    status: str
    platform_logo: Optional[str] = None
    description: Optional[str] = None
    source_type: Optional[str] = "official_api"

class ContestOut(ContestBase):
    class Config:
        from_attributes = True

class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int

class ContestListResponse(BaseModel):
    data: List[ContestOut]
    pagination: PaginationMeta

class ProblemOut(BaseModel):
    id: str
    platform: str
    external_id: str
    name: str
    url: str
    rating: int
    tags: List[str] = []
    position: Optional[int] = 1
    status: Optional[str] = "not_attempted"

    class Config:
        from_attributes = True

class LadderOut(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    difficulty: str
    rating_min: Optional[int] = None
    rating_max: Optional[int] = None
    category: str
    problem_count: int
    solved_count: Optional[int] = 0
    problems: Optional[List[ProblemOut]] = None

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    timezone: Optional[str] = "Asia/Kolkata"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    email: str
    timezone: str
    role: str
    created_at: datetime
    solved_problems_count: int = 0
    attempted_problems_count: int = 0

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class ProgressUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(not_attempted|attempted|solved)$")
