from typing import Any, Dict, Optional
from pydantic import BaseModel, Field, field_validator

class SessionVaultRequest(BaseModel):
    session_id: str = Field(..., description="Unique session token (UUID v4)")
    user_id: Optional[str] = Field(None, description="Optional user identifier if authenticated")
    client_version: str = Field(..., description="Semantic version of the client")
    current_step: int = Field(..., ge=1, le=4, description="Current step index (1-4)")
    form_data: Dict[str, Any] = Field(..., description="Form input values mapped dynamically")
    edge_ai_score: Optional[Dict[str, Any]] = Field(None, description="On-device Edge AI underwriting score matrix")
    encryption_method: Optional[str] = Field(None, description="Encryption cipher or WebAuthn passkey method")

    @field_validator('client_version')
    @classmethod
    def validate_version(cls, v: str) -> str:
        import re
        if not re.match(r"^\d+\.\d+\.\d+$", v):
            raise ValueError("client_version must match semantic versioning format (e.g. 1.0.0)")
        return v

class SessionVaultResponse(BaseModel):
    success: bool
    session_id: str
    message: str

class TelemetryLogRequest(BaseModel):
    session_id: str = Field(..., description="Active session ID at crash time")
    client_version: str = Field(..., description="Running version when error was caught")
    target_asset_url: str = Field(..., description="The dynamic JS chunk URL that failed to load")
    user_agent: str = Field(..., description="User's browser user agent")
    error_message: str = Field(..., description="The captured exception details")
    stack_trace: Optional[str] = Field(None, description="Optional stack trace dump")
    dom_mutation_frames: Optional[list] = Field(None, description="Recorded DOM mutation frames for 60 FPS Visual Session Replay")
    edge_ai_score: Optional[Dict[str, Any]] = Field(None, description="Captured Edge AI risk metrics")
    encryption_method: Optional[str] = Field(None, description="Security cipher descriptor")

    @field_validator('client_version')
    @classmethod
    def validate_version(cls, v: str) -> str:
        import re
        if not re.match(r"^\d+\.\d+\.\d+$", v):
            raise ValueError("client_version must match semantic versioning format (e.g. 1.0.0)")
        return v

class LoginRequest(BaseModel):
    username: str = Field(..., description="Admin operator username")
    password: str = Field(..., description="Admin operator password")

class GoogleLoginRequest(BaseModel):
    id_token: Optional[str] = Field(None, description="Google OAuth ID Token")
    email: str = Field(..., description="Verified Google Email")
    name: str = Field(..., description="Google User Full Name")
    picture: Optional[str] = Field(None, description="Google Profile Picture URL")

class UserProfileResponse(BaseModel):
    user_id: str
    name: str
    email: str
    picture: str
    is_verified: bool
    reward_credits: int
    role: str

class SessionTokenRequest(BaseModel):
    session_id: str = Field(..., description="Unique session token ID")


