import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import Swal from "sweetalert2";
import { useContext, useState } from "react";
import { MyContext } from "../context/MyContext.jsx";
import { ScaleLoader } from "react-spinners";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    setMessages,
    messages,
    setNewChat,
    setAllThreads,
  } = useContext(MyContext);

  const { logout, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const typeEffect = (text) => {
    return new Promise((resolve) => {
      const words = text.split(" ");
      let currText = "";
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < words.length) {
          currText += (idx > 0 ? " " : "") + words[idx];
          setMessages((prev = []) => {
            const updated = [...prev];
            if (
              updated.length > 0 &&
              updated[updated.length - 1].role === "assistant"
            ) {
              updated[updated.length - 1].content = currText;
            } else {
              updated.push({ role: "assistant", content: currText });
            }
            return updated;
          });
          idx++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  };

  const getReply = async () => {
    if (!prompt || !prompt.trim()) {
      await Swal.fire({
        icon: "info",
        title: "Empty Chat!",
        text: "Please type something to start a chat.",
        confirmButtonText: "OK",
        confirmButtonColor: "#10a37f",
      });
      setNewChat(true);
      setMessages([]);
      setPrompt("");
      return;
    }

    if (loading) return;
    if (!token) {
      logout();
      navigate("/login");
      return;
    }

    setNewChat(false);
    setLoading(true);

    try {
      let threadId = currThreadId;
      const isLocalTemp = !threadId || String(threadId).startsWith("local-");

      if (isLocalTemp) {
        // 1️ Create a temporary thread immediately for instant sidebar update
        const tempThreadId = `local-${Date.now()}`;
        const tempTitle = prompt?.slice(0, 50) || "New Chat";

        setCurrThreadId(tempThreadId);
        setAllThreads((prev = []) => [
          { threadId: tempThreadId, title: tempTitle, messages: [] },
          ...prev,
        ]);

        //  2️ Then create the real thread in background
        try {
          const threadRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/thread`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ title: tempTitle }),
            }
          );

          const threadData = await threadRes.json();

          if (threadData?.threadId) {
            threadId = threadData.threadId;
            setCurrThreadId(threadData.threadId);

            // 3️ Replace the temporary thread with the real one
            setAllThreads((prev = []) =>
              prev.map((t) =>
                t.threadId === tempThreadId
                  ? {
                      ...t,
                      threadId: threadData.threadId,
                      title: threadData.title?.trim()
                        ? threadData.title
                        : tempTitle,
                    }
                  : t
              )
            );
          }
        } catch (err) {
          console.error("Thread creation failed:", err);
        }
      }

      setMessages((prev = []) => [...prev, { role: "user", content: prompt }]);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: prompt, threadId }),
      });

      const res = await response.json();
      if (!response.ok) throw new Error(res.error || "Failed to get reply");

      const assistantReply = res.reply ?? "No reply from server";
      setMessages((prev = []) => [...prev, { role: "assistant", content: "" }]);
      await typeEffect(assistantReply);
    } catch (error) {
      console.error(error);
      setReply("Error: Unable to get reply. Please check console.");
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  const handleProfileClick = () => setIsOpen((prev) => !prev);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span className="brand">NovaAI</span>
        <div className="userIcon" onClick={handleProfileClick}>
          <i className="fa-solid fa-user"></i>
        </div>
      </div>

      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">
            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade Plan
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i> Settings
          </div>
          <div className="dropDownItem" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
          </div>
        </div>
      )}

      <div className={`chatBody ${messages.length === 0 ? "centered" : ""}`}>
        {messages.length === 0 ? (
          <div className="welcomeMessage">
            <h1>How can I help, {user?.name || "there"}?</h1>
          </div>
        ) : (
          <div className="chatArea">
            <Chat key={currThreadId} messages={messages} />
            {loading && <ScaleLoader loading={true} color="#10a37f" />}
          </div>
        )}

        <div className="chatInput">
          <div className="inputBox">
            <input
              placeholder="Ask anything to NovaAI…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && getReply()}
            />
            <div className="submit" onClick={getReply}>
              <i className="fa-solid fa-paper-plane"></i>
            </div>
          </div>
          <p className="info">
            NovaAI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
