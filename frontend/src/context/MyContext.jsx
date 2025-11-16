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
  const [currThreadId, setCurrThreadIdState] = useState(null);

  const [newChat, setNewChat] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [messages, setMessages] = useState([]);

  const { user } = useContext(AuthContext);

  // Set current thread
  const setCurrThreadId = (id) => {
    setCurrThreadIdState(id);
    if (id) localStorage.setItem("currThreadId", id);
    else localStorage.removeItem("currThreadId");
  };

  // FULL RESET
  const resetContext = useCallback(() => {
    setAllThreads([]);
    setCurrThreadIdState(null);
    localStorage.removeItem("currThreadId");

    setNewChat(false);
    setPrompt("");
    setReply(null);
    setMessages([]);
  }, []);

  // When user logs out -> clear everything
  useEffect(() => {
    if (!user) {
      resetContext();
    }
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
