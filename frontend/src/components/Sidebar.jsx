// Sidebar.jsx
import "./sidebar.css";
import { useContext, useEffect, useCallback, useState, useRef } from "react";
import { MyContext } from "../context/MyContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ------------------ Helper: Sanitize chat titles ------------------ */
const sanitizeTitle = (value) => {
  if (typeof value !== "string") return "";
  return value
    .replace(/undefined/gi, "")
    .replace(/\uFEFF/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/* ------------------ TypingTitle Component ------------------ */
function TypingTitle({ text, speed = 50 }) {
  const [displayText, setDisplayText] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const cleanText =
      typeof text === "string" ? text.replace(/undefined/gi, "").trim() : "";

    if (!cleanText) {
      setDisplayText("Untitled Chat");
      return;
    }

    let idx = 0;
    setDisplayText("");

    // Start typing animation
    intervalRef.current = setInterval(() => {
      if (idx >= cleanText.length || cleanText[idx] === undefined) {
        clearInterval(intervalRef.current);
        return;
      }

      const nextChar = cleanText[idx] ?? "";
      setDisplayText((prev) => prev + nextChar);
      idx++;
    }, speed);

    // Cleanup interval on unmount or text change
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [text, speed]);

  return <span className="typing-title">{displayText}</span>;
}

/* ------------------ Sidebar Component ------------------ */
function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setCurrThreadId,
    setMessages,
    setPrompt,
    setReply,
    setNewChat,
  } = useContext(MyContext);

  const { token } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  /* ------------------ Toggle Sidebar ------------------ */
  const toggleSidebar = () => setCollapsed((prev) => !prev);

  /* ------------------ Fetch all saved threads ------------------ */
  const getAllThreads = useCallback(async () => {
    if (!token) {
      setAllThreads([]);
      return;
    }

    try {
      const res = await axios.get("http://localhost:7000/api/thread", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const threadsRaw = Array.isArray(res.data) ? res.data : [];

      // Normalize server threads
      const serverThreads = threadsRaw.map((t) => {
        const titleFromDoc = sanitizeTitle(t.title);
        const titleFromFirstMsg = sanitizeTitle(t?.messages?.[0]?.content);
        const finalTitle = titleFromDoc || titleFromFirstMsg || "Untitled Chat";
        return { ...t, title: String(finalTitle) };
      });

      // Merge server threads with any local optimistic threads kept in state.
      setAllThreads((prev = []) => {
        // Map server threads by id for quick lookup
        const serverMap = new Map(serverThreads.map((t) => [t.threadId, t]));

        // Build a merged map starting with server threads
        const mergedMap = new Map(serverMap);

        // Add any prev threads that server does not have (optimistic locals)
        for (const local of prev) {
          if (!mergedMap.has(local.threadId)) {
            mergedMap.set(local.threadId, local);
            continue;
          }
          // If both exist, prefer server title when it's non-empty; otherwise keep local title
          const server = mergedMap.get(local.threadId);
          const serverHasGoodTitle =
            typeof server.title === "string" && server.title.trim().length > 0;

          mergedMap.set(local.threadId, {
            ...server,
            // Keep important local fields (messages) if server doesn't provide them
            messages:
              Array.isArray(server.messages) && server.messages.length
                ? server.messages
                : local.messages || server.messages || [],
            title: serverHasGoodTitle
              ? server.title
              : local.title || server.title,
          });
        }

        // Return as an array, keep server order but put local-only threads at front (optional)
        const merged = Array.from(mergedMap.values());

        // Optional: sort so local-only (temp) threads remain at top
        merged.sort((a, b) => {
          const aIsLocal = String(a.threadId).startsWith("local-");
          const bIsLocal = String(b.threadId).startsWith("local-");
          if (aIsLocal && !bIsLocal) return -1;
          if (!aIsLocal && bIsLocal) return 1;
          return 0;
        });

        return merged;
      });
    } catch (err) {
      console.error("Failed to load threads:", err);
      setAllThreads([]);
    }
  }, [token, setAllThreads]);

  useEffect(() => {
    getAllThreads();
  }, [getAllThreads, currThreadId]);

  /* ------------------ Create new chat ------------------ */
  const createNewChat = async () => {
    if (!token) {
      const tempId = `local-${Date.now()}`;
      setCurrThreadId(tempId);
      setMessages([]);
      setPrompt("");
      setReply(null);
      setNewChat(true);
      return tempId;
    }

    const result = await Swal.fire({
      title: "Start a New Chat?",
      text: "This will begin a new conversation.",
      icon: "question",
      background: "#0b0b0b",
      color: "#f1f1f1",
      showCancelButton: true,
      confirmButtonText: "Start Chat",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#555",
      iconColor: "#4CAF50",
    });

    if (!result.isConfirmed) return;

    const tempId = `local-${Date.now()}`;
    setCurrThreadId(tempId);
    setMessages([]);
    setPrompt("");
    setReply(null);
    setNewChat(true);
    return tempId;
  };

  /* ------------------ Change active thread ------------------ */
  const changeThread = useCallback(
    async (newThreadId) => {
      if (!newThreadId) return;

      setCurrThreadId(newThreadId);
      setNewChat(false);
      setReply(null);
      setMessages([]);

      if (newThreadId.startsWith("local-") || !token) return;

      try {
        const res = await axios.get(
          `http://localhost:7000/api/thread/${newThreadId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { title, messages } = res.data || {};
        const cleanTitle =
          title?.trim() ||
          messages?.[0]?.content?.slice(0, 50)?.trim() ||
          "Untitled Chat";

        setAllThreads((prev) =>
          prev.map((t) =>
            t.threadId === newThreadId ? { ...t, title: cleanTitle } : t
          )
        );

        setMessages(Array.isArray(messages) ? messages : []);
      } catch (err) {
        console.error("Error loading thread:", err);
        setMessages([]);
      }
    },
    [token, setAllThreads, setMessages, setCurrThreadId, setNewChat, setReply]
  );

  /* ------------------ Delete a chat ------------------ */
  const deleteThread = async (threadId) => {
    if (!threadId) return;

    const result = await Swal.fire({
      title: "Delete this chat?",
      text: "This action cannot be undone.",
      icon: "warning",
      background: "#000",
      color: "#fff",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#555",
    });

    if (!result.isConfirmed) return;

    if (threadId.startsWith("local-")) {
      if (threadId === currThreadId) {
        setCurrThreadId(null);
        setMessages([]);
        setNewChat(true);
      }
      return;
    }

    if (!token) return;

    try {
      await axios.delete(`http://localhost:7000/api/thread/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await getAllThreads();

      if (threadId === currThreadId) {
        setCurrThreadId(null);
        setMessages([]);
        setNewChat(true);
      }
    } catch {
      /* silent */
    }
  };

  /* ------------------ Sidebar UI ------------------ */
  return (
    <>
      {/* Sidebar Section */}
      <section className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="NovaAI Logo" className="logo" />
          {!collapsed && <h2 className="appName">NovaAI</h2>}
        </div>

        <div className="sidebar-header">
          <button className="newChatBtn" onClick={createNewChat}>
            <i className="fa-solid fa-plus"></i>
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

        <ul className="history">
          {allThreads && allThreads.length > 0 ? (
            allThreads.map((thread) => (
              <li
                key={thread.threadId}
                onClick={() => changeThread(thread.threadId)}
                className={
                  thread.threadId === currThreadId ? "highlighted" : ""
                }
              >
                {!collapsed && (
                  <span className="threadTitle">
                    {thread.threadId === currThreadId ? (
                      <TypingTitle text={thread.title} />
                    ) : (
                      thread.title
                    )}
                  </span>
                )}
                <i
                  className="fa-solid fa-trash threadTrash"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(thread.threadId);
                  }}
                ></i>
              </li>
            ))
          ) : (
            <li className="emptyList">No chats yet — create one!</li>
          )}
        </ul>

        {!collapsed && (
          <div className="sign">
            <p>By Nova Team</p>
          </div>
        )}
      </section>

      {/* Independent Toggle Button (Always Visible) */}
      <div
        className={`sidebar-toggle-btn ${collapsed ? "collapsed" : "expanded"}`}
        onClick={toggleSidebar}
      >
        <i
          className={`fa-solid ${
            collapsed ? "fa-chevron-right" : "fa-chevron-left"
          }`}
        ></i>
      </div>
    </>
  );
}

export default Sidebar;
