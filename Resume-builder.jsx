import React, { useState, useEffect, useRef } from 'react';

// --- FIREBASE SETUP ---
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyCpYQkkLLMrtyAq6j6-_QbyocY5rWUPI",
  authDomain: "resumebuilder-b7445.firebaseapp.com",
  projectId: "resumebuilder-b7445",
  storageBucket: "resumebuilder-b7445.firebasestorage.app",
  messagingSenderId: "509499874116",
  appId: "1:509499874116:web:05e832255d20f70a749511",
  measurementId: "G-ZMB5N7CMH2"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

// --- API CONFIG ---
const API_URL = 'http://127.0.0.1:8000';
const GEMINI_API_KEY = ""; // The Canvas environment will handle this key.

// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
    .action-button-green {
        @apply bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300;
    }
    .nav-link {
        @apply text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition;
    }
    .dashboard-card {
        @apply bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-green-500 transition flex flex-col;
    }
    .icon-button {
        @apply p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition;
    }
    .builder-input {
        @apply w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500;
    }
    .builder-add-btn {
        @apply w-full mt-2 py-2 px-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-green-500 hover:text-green-500 transition;
    }
    .auth-input {
        @apply w-full bg-white text-black rounded-lg px-4 py-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-lg text-center;
    }
    .auth-title {
        color: #111827;
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
        @apply text-4xl font-bold text-center;
    }
    .social-icon-btn {
        @apply h-12 w-12 flex items-center justify-center bg-black/20 border border-white/20 rounded-full text-gray-300 hover:bg-green-500/20 hover:text-green-400 transition;
    }
    @keyframes fade-in-out {
        0% { opacity: 0; transform: translateY(-10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
    .animate-fade-in-out {
        animation: fade-in-out 3s ease-in-out forwards;
    }
    .bg-grid-gray-700 {
      background-image: linear-gradient(to right, rgba(55, 65, 81, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(55, 65, 81, 0.4) 1px, transparent 1px);
      background-size: 2rem 2rem;
    }
  `}</style>
);


// --- SVG ICONS ---
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);
const ShareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.348l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.348a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const CheckCircleIcon = ({isValid}) => (<svg className={`h-5 w-5 ${isValid ? 'text-green-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// --- MAIN APP COMPONENT ---
export default function App() {
    const [page, setPage] = useState('home'); 
    const [currentUser, setCurrentUser] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [editingResume, setEditingResume] = useState(null);
    const [viewingResume, setViewingResume] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState('');
    const [aiCoachFeedback, setAiCoachFeedback] = useState('');
    const [isAiCoachLoading, setIsAiCoachLoading] = useState(false);


    useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#/view/')) {
            const resumeId = hash.split('/')[2];
            fetchPublicResume(resumeId);
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchResumes(user);
                const currentPageIsAuthPage = ['login', 'signup'].includes(page);
                if (currentPageIsAuthPage || page === 'home') {
                    setPage('dashboard');
                }
            } else {
                setCurrentUser(null);
                setResumes([]);
                const protectedPages = ['dashboard', 'builder'];
                if (protectedPages.includes(page) || page === '') {
                     setPage('home');
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    const navigate = (newPage) => {
        setError('');
        setPage(newPage);
        if (['home', 'about', 'templates'].includes(newPage)) {
             window.location.hash = `#/${newPage}`;
        }
    };

    const handleLogin = async (email, password) => { setLoading(true); setError(''); try { await signInWithEmailAndPassword(auth, email, password); } catch (err) { setError(err.message); } finally { setLoading(false); } };
    
    const handleSignup = async (fullName, email, password) => { 
        setLoading(true); 
        setError(''); 
        try { 
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: fullName });
            setCurrentUser(userCredential.user);
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setLoading(false); 
        } 
    };

    const handleLogout = () => { signOut(auth).then(() => navigate('home')); };

    const fetchResumes = async (user) => {
        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`${API_URL}/resume`, { headers: { 'Authorization': `Bearer ${idToken}` } });
            if (response.ok) setResumes(await response.json());
        } catch (err) {
            setError('Could not fetch resumes.');
        }
    };

    const getAuthHeader = async () => {
        if (!currentUser) throw new Error("User not authenticated");
        const token = await currentUser.getIdToken();
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    };

    const handleSaveResume = async (updatedResume) => {
        const isNew = updatedResume.id.startsWith('temp-');
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${API_URL}/resume` : `${API_URL}/resume/${updatedResume.id}`;
        try {
            const headers = await getAuthHeader();
            const response = await fetch(url, { method, headers, body: JSON.stringify(updatedResume) });
            if (response.ok) {
                await fetchResumes(currentUser);
                navigate('dashboard');
                showNotification('Resume saved successfully!');
            } else {
                setError('Failed to save resume.');
            }
        } catch (err) {
            setError('Could not connect to server.');
        }
    };

    const handleDeleteResume = async (resumeId) => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_URL}/resume/${resumeId}`, { method: 'DELETE', headers: {'Authorization': headers.Authorization } });
            if (response.ok) {
                setResumes(prev => prev.filter(r => r.id !== resumeId));
                showNotification('Resume deleted.');
            } else {
                setError('Failed to delete resume.');
            }
        } catch (err) {
            setError('Could not connect to server.');
        }
    };
    
    const fetchPublicResume = async (resumeId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/resume/public/${resumeId}`);
            if (response.ok) {
                setViewingResume(await response.json());
                setPage('view');
            } else {
                setError("Resume not found or not public.");
                setPage('home');
            }
        } catch (err) {
            setError("Could not fetch resume.");
            setPage('home');
        } finally {
            setLoading(false);
        }
    };

    const startNewResume = () => { setEditingResume({ id: `temp-${Date.now()}`, title: "Untitled Resume", template: "classic", personalDetails: { fullName: currentUser?.displayName || '', email: currentUser?.email || '', phone: '', address: '', linkedin: '', github: '', profilePictureUrl: '' }, experience: [], education: [], skills: [] }); navigate('builder'); };
    const startEditResume = (resumeId) => { const resume = resumes.find(r => r.id === resumeId); if (resume) { setEditingResume(JSON.parse(JSON.stringify(resume))); navigate('builder'); } };
    const handleShare = (resumeId) => { const link = `${window.location.origin}/#/view/${resumeId}`; navigator.clipboard.writeText(link); showNotification('Public link copied to clipboard!'); };
    const handleDownloadPdf = async (resume) => {
        const element = document.getElementById(`pdf-render-${resume.id}`);
        if (!element || !window.html2canvas || !window.jspdf) {
            showNotification("Error: PDF library not found.");
            return;
        }
        try {
            const canvas = await window.html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${resume.title.replace(/\s/g, '_')}.pdf`);
        } catch(e) {
            showNotification("Failed to generate PDF.");
        }
    };

    const renderPage = () => {
        if (page === 'login' || page === 'signup') {
            return <AuthPage isSignup={page === 'signup'} setPage={navigate} handleLogin={handleLogin} handleSignup={handleSignup} error={error} setError={setError} />;
        }
        
        if (loading) return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <p className="text-xl text-white">Loading...</p>
            </div>
        );

        return (
            <>
                <NavBar user={currentUser} onNavigate={navigate} onLogout={handleLogout} />
                <main>
                    {
                        {
                            'home': <HomePage onNavigate={navigate} />,
                            'about': <AboutPage />,
                            'templates': <TemplatesPage onStart={startNewResume} />,
                            'dashboard': <DashboardPage user={currentUser} resumes={resumes} onNew={startNewResume} onEdit={startEditResume} onDelete={handleDeleteResume} onDownload={handleDownloadPdf} onShare={handleShare} />,
                            'builder': <BuilderPage resumeData={editingResume} onSave={handleSaveResume} onCancel={() => navigate('dashboard')} currentUser={currentUser} aiCoach={{aiCoachFeedback, setAiCoachFeedback, isAiCoachLoading, setIsAiCoachLoading}}/>,
                            'view': <ResumeViewPage resume={viewingResume} />,
                        }[page] || <HomePage onNavigate={navigate} />
                    }
                </main>
            </>
        );
    };

    return (
        <div className="bg-gray-900 min-h-screen font-sans text-gray-300">
            <GlobalStyles />
            {notification && <div className="fixed top-20 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">{notification}</div>}
            {renderPage()}
        </div>
    );
}

// --- LAYOUT COMPONENTS ---
function NavBar({ user, onNavigate, onLogout }) {
    return (
        <nav className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-2xl font-bold text-white">
                            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>ResumeCraft</span>
                        </button>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <button onClick={() => onNavigate('home')} className="nav-link">Home</button>
                            <button onClick={() => onNavigate('templates')} className="nav-link">Templates</button>
                            <button onClick={() => onNavigate('about')} className="nav-link">About</button>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <>
                                <button onClick={() => onNavigate('dashboard')} className="action-button-green">Dashboard</button>
                                <button onClick={onLogout} className="ml-4 text-gray-400 hover:text-white p-2 rounded-full" title="Logout"><LogoutIcon /></button>
                            </>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2">
                                <button onClick={() => onNavigate('login')} className="nav-link">Log In</button>
                                <button onClick={() => onNavigate('signup')} className="action-button-green">Sign Up</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

// --- PAGE COMPONENTS ---
function HomePage({ onNavigate }) {
    return (
        <div className="relative text-center py-32 px-4 bg-gray-900 overflow-hidden">
            <div className="absolute inset-0 bg-grid-gray-700 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
                    Your Resume Is More <br/> Than Just <span className="text-green-400">Knowledge</span>
                </h1>
                <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
                    Together we the people achieve more than any single person could ever do alone. Let's craft the resume that gets you hired.
                </p>
                <button onClick={() => onNavigate('signup')} className="mt-10 action-button-green text-lg px-8 py-3">
                    Get Started
                </button>
            </div>
        </div>
    );
}

function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6 sm:px-8">
            <h1 className="text-4xl font-bold text-center mb-4 text-white">About ResumeCraft</h1>
            <p className="text-lg text-gray-400 text-center">ResumeCraft is a project designed to simplify the process of creating professional resumes. We believe that everyone deserves a well-crafted resume without the hassle. This tool was built with React for the frontend, FastAPI (Python) for the backend, and Firebase for authentication, styled with a modern, dark theme.</p>
        </div>
    );
}

function TemplatesPage({ onStart }) {
    const templates = [{name: 'Classic', img: 'https://placehold.co/400x560/1a202c/4ade80?text=Classic'}, {name: 'Modern', img: 'https://placehold.co/400x560/1a202c/4ade80?text=Modern'}, {name: 'Creative', img: 'https://placehold.co/400x560/1a202c/4ade80?text=Creative'}];
    return (
        <div className="max-w-7xl mx-auto py-16 px-6 sm:px-8">
            <h1 className="text-4xl font-bold text-center mb-2 text-white">Resume Templates</h1>
            <p className="text-center text-gray-400 mb-10">Each template is designed to follow the exact rules you need to get hired faster.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {templates.map(t => (
                    <div key={t.name} className="group cursor-pointer" onClick={onStart}>
                        <div className="overflow-hidden rounded-lg border border-gray-700 group-hover:border-green-400 transition">
                            <img src={t.img} alt={t.name} className="w-full h-auto transform group-hover:scale-105 transition-transform duration-300"/>
                        </div>
                        <h3 className="mt-4 text-center text-lg font-semibold text-white">{t.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DashboardPage({ user, resumes, onNew, onEdit, onDelete, onDownload, onShare }) {
    
    const RenderResumeForPdf = ({ resume }) => {
        switch (resume.template) {
            case 'modern':
                return <ResumePDFTemplateModern resume={resume} />;
            default:
                return <ResumePDFTemplateClassic resume={resume} />;
        }
    };
    
    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
             <div className="hidden">{resumes.map(r => <div key={r.id} id={`pdf-render-${r.id}`}><RenderResumeForPdf resume={r} /></div>)}</div>
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Welcome back, {user?.displayName || user?.email}</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <button onClick={onNew} className="dashboard-card items-center justify-center border-2 border-dashed border-gray-600 hover:border-green-400 hover:text-green-400 text-gray-400">
                    <PlusIcon />
                    <span className="mt-2 font-semibold">Create New</span>
                </button>
                <button onClick={() => alert('Feature coming soon!')} className="dashboard-card items-center justify-center border-2 border-dashed border-gray-600 hover:border-green-400 hover:text-green-400 text-gray-400">
                    <UploadIcon />
                    <span className="mt-2 font-semibold">Upload Resume</span>
                </button>
                {resumes.map(resume => (
                    <div key={resume.id} className="dashboard-card justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-white truncate">{resume.title}</h3>
                            <p className="text-sm text-gray-500">Template: {resume.template || 'Classic'}</p>
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-4">
                            <button onClick={() => onEdit(resume.id)} className="icon-button" title="Edit"><EditIcon /></button>
                            <button onClick={() => onDownload(resume)} className="icon-button" title="Download PDF"><DownloadIcon /></button>
                            <button onClick={() => onShare(resume.id)} className="icon-button" title="Share Link"><ShareIcon /></button>
                            <button onClick={() => onDelete(resume.id)} className="icon-button text-red-500 hover:bg-red-500/10" title="Delete"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PasswordStrength({password}) {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        specialChar: /[^A-Za-z0-9]/.test(password),
    };

    const PasswordRule = ({ isValid, text }) => (
        <li className="flex items-center space-x-2">
            <CheckCircleIcon isValid={isValid} />
            <span className={isValid ? 'text-gray-300' : 'text-gray-500'}>{text}</span>
        </li>
    );

    return (
        <ul className="space-y-1 text-sm mt-4">
            <PasswordRule isValid={checks.length} text="At least 8 characters long" />
            <PasswordRule isValid={checks.uppercase} text="Contains an uppercase letter" />
            <PasswordRule isValid={checks.lowercase} text="Contains a lowercase letter" />
            <PasswordRule isValid={checks.number} text="Contains a number" />
            <PasswordRule isValid={checks.specialChar} text="Contains a special character" />
        </ul>
    );
}

function AuthPage({ isSignup, setPage, handleLogin, handleSignup, error, setError }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        if (isSignup) {
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            handleSignup(fullName, email, password);
        } else {
            handleLogin(email, password);
        }
    };
    
    const handleDemoLogin = () => {
        handleLogin('hire-me@anshumat.org', 'HireMe@2025!');
    };

    const toggleAuthMode = () => { setError(''); setPage(isSignup ? 'login' : 'signup'); };

    return (
        <div 
            className="flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center"
            style={{backgroundImage: "url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop')"}}
        >
            <div className="w-full max-w-md p-8 space-y-6 bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
                <h2 className="auth-title">{isSignup ? 'Register' : 'Login'}</h2>
                {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignup && (
                        <div>
                            <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="auth-input" required placeholder="Full Name" />
                        </div>
                    )}
                    <div>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" required placeholder="E-mail Id" />
                    </div>
                    <div>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" required placeholder="Password" />
                    </div>
                    {isSignup && (
                        <div>
                            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="auth-input" required placeholder="Confirm Password" />
                        </div>
                    )}
                    
                    {!isSignup && (
                       <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-300"><input type="checkbox" className="mr-2 bg-gray-700 border-gray-600 text-green-500 focus:ring-green-500" /> Remember me</label>
                            <a href="#" onClick={(e) => { e.preventDefault(); alert("Forgot password functionality not implemented."); }} className="font-medium text-green-400 hover:underline">Forgot password?</a>
                        </div>
                    )}

                    {isSignup && <PasswordStrength password={password} />}

                    <div className="pt-2">
                         <button type="submit" className="w-full bg-white text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition"> {isSignup ? 'Register' : 'Login'} </button>
                    </div>
                </form>
                
                <div className="text-center">
                    <p className="text-gray-400 text-xs font-bold mb-2">FOR EVALUATION</p>
                     <button 
                        onClick={handleDemoLogin} 
                        className="w-full bg-green-500/20 text-green-300 font-bold py-3 px-4 rounded-lg border border-green-500 hover:bg-green-500/30 transition"
                    >
                        Login as Demo User
                    </button>
                </div>

                <p className="text-center text-gray-300 text-sm">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={toggleAuthMode} className="text-green-400 font-semibold hover:underline ml-2">
                        {isSignup ? 'Login' : 'Register'}
                    </button>
                </p>
            </div>
        </div>
    );
}

function SimpleRichTextEditor({ value, onChange, placeholder, onGenerate, isLoading }) {
    const parseSimpleMarkdown = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*?)(\n|$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-600">
            <div className="p-2 border-b border-gray-600 flex justify-between items-center">
                <small className="text-xs text-gray-400">Use **bold**, *italics*, and - for bullet points.</small>
                <button onClick={onGenerate} disabled={isLoading} className="text-xs bg-green-500/50 text-white font-semibold py-1 px-2 rounded-md hover:bg-green-500/80 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Generating...' : '✨ Auto-Generate'}
                </button>
            </div>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-32 p-2 bg-transparent focus:outline-none"
            />
            <div className="p-4 border-t border-gray-600 text-gray-300 min-h-[100px]" dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(value) || '<p class="text-gray-500">Preview</p>' }} />
        </div>
    );
}

function AICoach({ resume, feedback, setFeedback, isLoading, setIsLoading }) {
    
    const getResumeFeedback = async () => {
        setIsLoading(true);
        setFeedback('');

        const systemPrompt = `You are an expert career coach and resume reviewer for technical roles. Your goal is to provide clear, concise, and actionable feedback to help the user improve their resume. Be encouraging and professional. Format your feedback using simple markdown (**bold**, *italics*, and bullet points using '-').`;
        
        // Sanitize and format the resume data into a string
        const resumeString = `
            Title: ${resume.title}
            Full Name: ${resume.personalDetails.fullName}
            Contact: ${resume.personalDetails.email}, ${resume.personalDetails.phone}
            
            Experience:
            ${resume.experience.map(exp => `
                - Role: ${exp.jobTitle} at ${exp.company}
                - Dates: ${exp.startDate} to ${exp.endDate}
                - Description: ${exp.description}
            `).join('')}

            Education:
            ${resume.education.map(edu => `
                - Degree: ${edu.degree} from ${edu.school}
                - Dates: ${edu.startDate} to ${edu.endDate}
            `).join('')}
            
            Skills: ${resume.skills.map(s => s.name).join(', ')}
        `;

        const userQuery = `Please review the following resume and provide feedback on its strengths and areas for improvement:\n\n${resumeString}`;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) {
                setFeedback(text);
            } else {
                setFeedback("Sorry, I couldn't get any feedback. The response was empty.");
            }
        } catch (error) {
            console.error("Gemini API error:", error);
            setFeedback("Sorry, there was an error getting feedback from the AI coach.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BuilderSection title="AI Coach">
            {isLoading ? (
                <div className="text-center p-4">
                    <p>Analyzing your resume...</p>
                </div>
            ) : feedback ? (
                <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{__html: parseSimpleMarkdown(feedback)}}></div>
            ) : (
                <p className="text-sm text-gray-400 mb-4">Get instant feedback on your resume's content, formatting, and impact.</p>
            )}
            <button onClick={getResumeFeedback} disabled={isLoading} className="w-full action-button-green mt-2">
                {isLoading ? 'Getting Feedback...' : 'Get Feedback'}
            </button>
        </BuilderSection>
    );
}


function BuilderPage({ resumeData, onSave, onCancel, currentUser, aiCoach }) {
    const [resume, setResume] = useState(resumeData);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [generatingIndex, setGeneratingIndex] = useState(null); // Track which experience item is generating text

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;
        setIsUploading(true);
        const storageRef = ref(storage, `profile_pictures/${currentUser.uid}/${file.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            handleChange('personalDetails', 'profilePictureUrl', downloadURL);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const generateExperienceDescription = async (index) => {
        const experienceItem = resume.experience[index];
        if (!experienceItem.jobTitle || !experienceItem.company) {
            alert("Please enter a Job Title and Company first.");
            return;
        }

        setGeneratingIndex(index);
        
        const systemPrompt = "You are a professional resume writer. Your task is to generate 3-4 concise, impactful bullet points for a work experience section based on a job title and company. Use action verbs and quantify achievements where possible. Format the output as a bulleted list using '-'.";
        const userQuery = `Job Title: ${experienceItem.jobTitle}\nCompany: ${experienceItem.company}`;
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("API call failed");
            
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) {
                handleListChange('experience', index, 'description', text);
            }
        } catch (error) {
            console.error("Gemini description generation error:", error);
            alert("Failed to generate description.");
        } finally {
            setGeneratingIndex(null);
        }
    };


    const handleChange = (section, field, value) => setResume(p => ({ ...p, [section]: { ...p[section], [field]: value } }));
    const handleTitleChange = (e) => setResume(p => ({ ...p, title: e.target.value }));
    const handleTemplateChange = (e) => setResume(p => ({ ...p, template: e.target.value }));
    const handleListChange = (section, index, field, value) => setResume(p => ({ ...p, [section]: p[section].map((item, i) => i === index ? { ...item, [field]: value } : item) }));
    const addListItem = (section, newItem) => setResume(p => ({ ...p, [section]: [...p[section], newItem] }));
    const removeListItem = (section, index) => setResume(p => ({ ...p, [section]: p[section].filter((_, i) => i !== index) }));

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
            {/* Form Section */}
            <div className="w-full lg:w-2/3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <input type="text" value={resume.title} onChange={handleTitleChange} className="text-3xl font-bold text-white bg-transparent focus:outline-none focus:border-b-2 border-green-400 w-full sm:w-1/2 mb-4 sm:mb-0" placeholder="Resume Title" />
                    <div className="flex items-center gap-4">
                        <select value={resume.template} onChange={handleTemplateChange} className="builder-input bg-gray-800">
                            <option value="classic">Classic Template</option>
                            <option value="modern">Modern Template</option>
                        </select>
                        <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition">Cancel</button>
                        <button onClick={() => onSave(resume)} className="action-button-green px-6 py-2">Save Resume</button>
                    </div>
                </div>
                <div className="space-y-8">
                    <BuilderSection title="Personal Details">
                        <div className="flex items-center gap-6 mb-4">
                            <img 
                                src={resume.personalDetails.profilePictureUrl || 'https://placehold.co/100x100/1f2937/4ade80?text=Upload'} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
                            />
                            <div>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef}/>
                                <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="action-button-green">
                                    {isUploading ? 'Uploading...' : 'Upload Picture'}
                                </button>
                                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={resume.personalDetails.fullName} onChange={e => handleChange('personalDetails', 'fullName', e.target.value)} placeholder="Full Name" className="builder-input" />
                            <input value={resume.personalDetails.email} onChange={e => handleChange('personalDetails', 'email', e.target.value)} placeholder="Email" className="builder-input" />
                            <input value={resume.personalDetails.phone} onChange={e => handleChange('personalDetails', 'phone', e.target.value)} placeholder="Phone" className="builder-input" />
                            <input value={resume.personalDetails.address} onChange={e => handleChange('personalDetails', 'address', e.target.value)} placeholder="Address" className="builder-input" />
                            <input value={resume.personalDetails.linkedin} onChange={e => handleChange('personalDetails', 'linkedin', e.target.value)} placeholder="LinkedIn URL" className="builder-input" />
                            <input value={resume.personalDetails.github} onChange={e => handleChange('personalDetails', 'github', e.target.value)} placeholder="GitHub URL" className="builder-input" />
                        </div>
                    </BuilderSection>
                    <BuilderSection title="Work Experience">
                        {resume.experience.map((item, index) => (
                            <div key={item.id} className="p-4 border border-gray-700 rounded-lg mb-4 relative bg-gray-800/50">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                   <input value={item.jobTitle} onChange={e => handleListChange('experience', index, 'jobTitle', e.target.value)} placeholder="Job Title" className="builder-input" />
                                   <input value={item.company} onChange={e => handleListChange('experience', index, 'company', e.target.value)} placeholder="Company" className="builder-input" />
                                   <input value={item.startDate} onChange={e => handleListChange('experience', index, 'startDate', e.target.value)} placeholder="Start Date" className="builder-input" />
                                   <input value={item.endDate} onChange={e => handleListChange('experience', index, 'endDate', e.target.value)} placeholder="End Date" className="builder-input" />
                               </div>
                               <SimpleRichTextEditor
                                    value={item.description}
                                    onChange={value => handleListChange('experience', index, 'description', value)}
                                    placeholder="Description..."
                                    onGenerate={() => generateExperienceDescription(index)}
                                    isLoading={generatingIndex === index}
                                />
                               <button onClick={() => removeListItem('experience', index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon /></button>
                            </div>
                        ))}
                        <button onClick={() => addListItem('experience', { id: Date.now(), jobTitle: '', company: '', startDate: '', endDate: '', description: '' })} className="builder-add-btn">Add Experience</button>
                    </BuilderSection>
                     <BuilderSection title="Education">
                        {resume.education.map((item, index) => (
                            <div key={item.id} className="p-4 border border-gray-700 rounded-lg mb-4 relative bg-gray-800/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input value={item.degree} onChange={e => handleListChange('education', index, 'degree', e.target.value)} placeholder="Degree" className="builder-input" />
                                    <input value={item.school} onChange={e => handleListChange('education', index, 'school', e.target.value)} placeholder="School" className="builder-input" />
                                    <input value={item.startDate} onChange={e => handleListChange('education', index, 'startDate', e.target.value)} placeholder="Start Date" className="builder-input" />
                                    <input value={item.endDate} onChange={e => handleListChange('education', index, 'endDate', e.target.value)} placeholder="End Date" className="builder-input" />
                                </div>
                                <button onClick={() => removeListItem('education', index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon /></button>
                            </div>
                        ))}
                        <button onClick={() => addListItem('education', { id: Date.now(), degree: '', school: '', startDate: '', endDate: '' })} className="builder-add-btn">Add Education</button>
                    </BuilderSection>
                    <BuilderSection title="Skills">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {resume.skills.map((item, index) => (
                            <div key={item.id} className="relative">
                                <input value={item.name} onChange={e => handleListChange('skills', index, 'name', e.target.value)} placeholder="Skill" className="builder-input w-full" />
                                <button onClick={() => removeListItem('skills', index)} className="absolute top-1/2 -translate-y-1/2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon /></button>
                            </div>
                        ))}
                        </div>
                        <button onClick={() => addListItem('skills', { id: Date.now(), name: '' })} className="builder-add-btn mt-4">Add Skill</button>
                    </BuilderSection>
                </div>
            </div>
            {/* AI Coach Section */}
            <div className="w-full lg:w-1/3">
                <div className="sticky top-24">
                   <AICoach 
                        resume={resume} 
                        feedback={aiCoach.aiCoachFeedback} 
                        setFeedback={aiCoach.setAiCoachFeedback}
                        isLoading={aiCoach.isAiCoachLoading}
                        setIsLoading={aiCoach.setIsAiCoachLoading}
                    />
                </div>
            </div>
        </div>
    );
}

function ResumeViewPage({ resume }) {
    if (!resume) return <div className="text-center py-20 text-white">Resume not found.</div>;
    
    const RenderResume = () => {
        switch (resume.template) {
            case 'modern':
                return <ResumePDFTemplateModern resume={resume} />;
            default:
                return <ResumePDFTemplateClassic resume={resume} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <RenderResume />
            </div>
        </div>
    );
}

// --- UTILITY & PDF COMPONENTS ---
function BuilderSection({ title, children }) {
    return (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-600 pb-2">{title}</h2>
            {children}
        </div>
    );
}

function parseSimpleMarkdown(text = "") {
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*?)(\n|$)/gm, '<li>$1</li>')
        .replace(/(<\/li>\s*<li>)/g, '</li><li>') // Clean up whitespace between list items
        .replace(/^(<li>.*<\/li>)$/gm, '<ul>$1</ul>');
    return html;
}


function ResumePDFTemplateClassic({ resume }) {
  if (!resume) return null;
  const { personalDetails, experience, education, skills } = resume;
  return (
    <div className="bg-white p-10 font-serif text-gray-800" style={{ width: '800px', margin: 'auto' }}>
      <div className="text-center mb-8 border-b-2 pb-4 border-gray-800">
        <h1 className="text-4xl font-bold tracking-wider">{personalDetails.fullName}</h1>
        <div className="flex justify-center gap-x-6 gap-y-1 mt-3 text-sm flex-wrap">
          <span>{personalDetails.email}</span><span>&bull;</span>
          <span>{personalDetails.phone}</span><span>&bull;</span>
          <span>{personalDetails.address}</span>
        </div>
         <div className="flex justify-center gap-x-4 mt-2 text-sm">
            {personalDetails.linkedin && <span>{personalDetails.linkedin}</span>}
            {personalDetails.github && <span>{personalDetails.github}</span>}
        </div>
      </div>
      <div className="mb-6"><h2 className="text-xl font-bold border-b border-gray-400 pb-1 mb-2">WORK EXPERIENCE</h2>{experience.map(exp => (<div key={exp.id} className="mb-3"><div className="flex justify-between items-baseline"><h3 className="font-semibold text-lg">{exp.jobTitle}</h3><p className="text-sm">{exp.startDate} - {exp.endDate}</p></div><p className="italic text-md">{exp.company}</p><div className="mt-1 text-sm prose" dangerouslySetInnerHTML={{__html: parseSimpleMarkdown(exp.description)}}></div></div>))}</div>
      <div className="mb-6"><h2 className="text-xl font-bold border-b border-gray-400 pb-1 mb-2">EDUCATION</h2>{education.map(edu => (<div key={edu.id} className="mb-2"><div className="flex justify-between items-baseline"><h3 className="font-semibold text-lg">{edu.degree}</h3><p className="text-sm">{edu.startDate} - {edu.endDate}</p></div><p className="italic text-md">{edu.school}</p></div>))}</div>
      <div><h2 className="text-xl font-bold border-b border-gray-400 pb-1 mb-2">SKILLS</h2><div className="flex flex-wrap gap-2">{skills.map(skill => (<span key={skill.id} className="bg-gray-200 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">{skill.name}</span>))}</div></div>
    </div>
  );
}

function ResumePDFTemplateModern({ resume }) {
  if (!resume) return null;
  const { personalDetails, experience, education, skills } = resume;
  return (
    <div className="bg-white text-gray-800 flex" style={{ width: '800px', minHeight: '1120px', margin: 'auto' }}>
      {/* Left Column */}
      <div className="w-1/3 bg-gray-800 text-white p-8">
        {personalDetails.profilePictureUrl && (
          <img src={personalDetails.profilePictureUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-green-400" />
        )}
        <h2 className="text-2xl font-bold text-green-400 border-b-2 border-green-400 pb-2 mb-4">CONTACT</h2>
        <div className="space-y-2 text-sm">
            <p>{personalDetails.phone}</p>
            <p>{personalDetails.email}</p>
            <p>{personalDetails.address}</p>
            {personalDetails.linkedin && <p>{personalDetails.linkedin}</p>}
            {personalDetails.github && <p>{personalDetails.github}</p>}
        </div>
        <h2 className="text-2xl font-bold text-green-400 border-b-2 border-green-400 pb-2 my-6">SKILLS</h2>
        <div className="space-y-2 text-sm">
            {skills.map(skill => <p key={skill.id}>{skill.name}</p>)}
        </div>
      </div>
      {/* Right Column */}
      <div className="w-2/3 p-8">
        <div className="text-left mb-8">
            <h1 className="text-5xl font-extrabold text-gray-800 tracking-wider">{personalDetails.fullName}</h1>
        </div>
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-300 pb-1 mb-4">WORK EXPERIENCE</h2>
            {experience.map(exp => (
                <div key={exp.id} className="mb-4">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-lg">{exp.jobTitle}</h3>
                        <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</p>
                    </div>
                    <p className="italic text-md text-gray-600">{exp.company}</p>
                    <div className="mt-1 text-sm prose" dangerouslySetInnerHTML={{__html: parseSimpleMarkdown(exp.description)}}></div>
                </div>
            ))}
        </div>
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-300 pb-1 mb-4">EDUCATION</h2>
            {education.map(edu => (
                <div key={edu.id} className="mb-2">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-lg">{edu.degree}</h3>
                        <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
                    </div>
                    <p className="italic text-md text-gray-600">{edu.school}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

