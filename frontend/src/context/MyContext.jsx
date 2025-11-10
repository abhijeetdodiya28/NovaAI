import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";

export const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [allThreads, setAllThreads] = useState([]);
  const [currThreadId, setCurrThreadIdState] = useState(() => {
    const saved = localStorage.getItem("currThreadId");
    return saved && !saved.startsWith("local-") ? saved : null;
  });

  const [newChat, setNewChat] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [messages, setMessages] = useState([]);

  const { user } = useContext(AuthContext);

  //  Save currThreadId whenever it changes
  useEffect(() => {
    if (currThreadId) {
      localStorage.setItem("currThreadId", currThreadId);
    } else {
      localStorage.removeItem("currThreadId");
    }
  }, [currThreadId]);

  // Wrap setter to keep storage in sync
  const setCurrThreadId = (id) => {
    setCurrThreadIdState(id);
    if (id) {
      localStorage.setItem("currThreadId", id);
    } else {
      localStorage.removeItem("currThreadId");
    }
  };

  // Helper to clear all chat-related state
  const resetContext = useCallback(() => {
    setAllThreads([]);
    setCurrThreadId(null);
    setNewChat(false);
    setPrompt("");
    setReply(null);
    setMessages([]);
  }, []);

  // Clear everything if user logs out
  useEffect(() => {
    if (!user) resetContext();
  }, [user, resetContext]);

  return (
    <MyContext.Provider
      value={{
        allThreads,
        setAllThreads,
        currThreadId,
        setCurrThreadId,
        newChat,
        setNewChat,
        prompt,
        setPrompt,
        reply,
        setReply,
        messages,
        setMessages,
        resetContext,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};
