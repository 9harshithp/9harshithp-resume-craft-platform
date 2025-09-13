import os
import redis
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import firebase_admin
from firebase_admin import credentials, auth
import uuid

# --- Firebase Admin SDK Setup ---
cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if not cred_path:
    raise ValueError("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

# --- FastAPI App Initialization ---
app = FastAPI()

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Redis Database Connection ---
try:
    redis_client = redis.Redis(host=os.getenv('REDIS_HOST', 'localhost'), port=6379, db=0, decode_responses=True)
    redis_client.ping()
    print("Connected to Redis successfully!")
except redis.exceptions.ConnectionError as e:
    print(f"Could not connect to Redis: {e}")
    redis_client = None

# --- Pydantic Models ---
class PersonalDetails(BaseModel):
    fullName: str
    email: str
    phone: str
    address: str
    linkedin: Optional[str] = None
    github: Optional[str] = None
    profilePictureUrl: Optional[str] = None

class Experience(BaseModel):
    id: str
    jobTitle: str
    company: str
    startDate: str
    endDate: str
    description: str

class Education(BaseModel):
    id: str
    degree: str
    school: str
    startDate: str
    endDate: str

class Skill(BaseModel):
    id: str
    name: str

class Resume(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    template: str = "classic"
    personalDetails: PersonalDetails
    experience: List[Experience]
    education: List[Education]
    skills: List[Skill]


# --- Authentication ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- API Endpoints ---
@app.post("/resume", response_model=Resume)
async def create_resume(resume: Resume, user: dict = Depends(get_current_user)):
    user_id = user["uid"]
    resume_id = resume.id
    
    redis_client.set(f"resume:{resume_id}", resume.json())
    redis_client.sadd(f"user:{user_id}:resumes", resume_id)
    
    return resume

@app.get("/resume", response_model=List[Resume])
async def get_all_resumes(user: dict = Depends(get_current_user)):
    user_id = user["uid"]
    resume_ids = redis_client.smembers(f"user:{user_id}:resumes")
    resumes = []
    for resume_id in resume_ids:
        resume_data = redis_client.get(f"resume:{resume_id}")
        if resume_data:
            resumes.append(Resume.parse_raw(resume_data))
    return resumes

@app.get("/resume/public/{resume_id}", response_model=Resume)
async def get_public_resume(resume_id: str):
    resume_data = redis_client.get(f"resume:{resume_id}")
    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found")
    return Resume.parse_raw(resume_data)

@app.put("/resume/{resume_id}", response_model=Resume)
async def update_resume(resume_id: str, updated_resume: Resume, user: dict = Depends(get_current_user)):
    user_id = user["uid"]
    
    if not redis_client.sismember(f"user:{user_id}:resumes", resume_id):
        raise HTTPException(status_code=403, detail="Not authorized to update this resume")
    
    redis_client.set(f"resume:{resume_id}", updated_resume.json())
    return updated_resume

@app.delete("/resume/{resume_id}", status_code=204)
async def delete_resume(resume_id: str, user: dict = Depends(get_current_user)):
    user_id = user["uid"]

    if not redis_client.sismember(f"user:{user_id}:resumes", resume_id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this resume")

    redis_client.delete(f"resume:{resume_id}")
    redis_client.srem(f"user:{user_id}:resumes", resume_id)
    return

# --- Demo User Seeding ---
@app.on_event("startup")
def seed_demo_data():
    if redis_client is None:
        print("Redis is not connected. Skipping demo data seeding.")
        return

    print("Seeding demo data if it doesn't exist...")
    DEMO_USER_UID = "YOUR_FIREBASE_UID_FOR_DEMO_USER" # IMPORTANT: Replace with the actual UID from Firebase

    demo_resume_id = "demo-resume-123"
    
    if not redis_client.exists(f"resume:{demo_resume_id}"):
        print("Creating demo resume...")
        demo_resume = Resume(
            id=demo_resume_id,
            title="Senior Software Engineer",
            template="modern",
            personalDetails=PersonalDetails(
                fullName="Anshumat Org",
                email="hire-me@anshumat.org",
                phone="123-456-7890",
                address="San Francisco, CA",
                linkedin="linkedin.com/in/anshumat",
                github="github.com/anshumat",
                profilePictureUrl="https://placehold.co/200x200/1f2937/4ade80?text=AO"
            ),
            experience=[Experience(id="exp1", jobTitle="Senior Developer", company="Tech Corp", startDate="Jan 2020", endDate="Present", description="- **Led** a team of 5 engineers.\n- *Developed* and maintained a high-traffic web application.")],
            education=[Education(id="edu1", degree="B.S. in Computer Science", school="University of Technology", startDate="2014", endDate="2018")],
            skills=[Skill(id="s1", name="React"), Skill(id="s2", name="Python"), Skill(id="s3", name="FastAPI")]
        )
        redis_client.set(f"resume:{demo_resume_id}", demo_resume.json())
        redis_client.sadd(f"user:{DEMO_USER_UID}:resumes", demo_resume_id)
        print("Demo resume created.")
    else:
        print("Demo resume already exists.")

