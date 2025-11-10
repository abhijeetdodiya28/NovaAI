import { useState, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/Chatwindow.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import { MyContext } from "./context/MyContext.jsx";
import { AuthProvider, AuthContext } from "./context/AuthContext.jsx";
import ForgotPassword from "./pages/Forgotpassword.jsx";
import "./App.css";
import { v1 as uuidv1 } from "uuid";
import ResetPassword from "./pages/ResetPassword.jsx";
import "./index.css";

// Handles token after Google redirects back
function GoogleAuthHandler() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    console.log("GoogleAuthHandler found token:", token);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const user = {
          id: payload.id,
          email: payload.email,
          username: payload.username,
        };

        login({ token, user });

        // clean up URL and redirect
        window.history.replaceState({}, document.title, "/chat");
        navigate("/chat");
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [location.search, login, navigate]); // added stable dependency array

  return <div>Signing you in with Google...</div>;
}

//Controls routes (public vs private)

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/chat"
        element={
          user ? (
            <div className="main-layout">
              <Sidebar />
              <ChatWindow />
            </div>
          ) : (
            <Navigate to="/signup" />
          )
        }
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/chat" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/chat" /> : <Signup />}
      />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/auth/google/callback" element={<GoogleAuthHandler />} />

      <Route path="*" element={<Navigate to={user ? "/chat" : "/signup"} />} />
    </Routes>
  );
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [messages, setMessages] = useState([]);

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    newChat,
    setNewChat,
    prevChats,
    setPrevChats,
    allThreads,
    setAllThreads,
    messages,
    setMessages,
  };
  // Clear prompt when starting a new chat
  useEffect(() => {
    if (newChat) setPrompt("");
  }, [newChat]);

  return (
    <MyContext.Provider value={providerValues}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </MyContext.Provider>
  );
}

export default App;
