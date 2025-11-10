import "./chat.css";
import { useContext, useEffect, useRef } from "react";
import { MyContext } from "../context/MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChat, reply, messages = [], setMessages } = useContext(MyContext);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Append AI reply to messages
  useEffect(() => {
    if (!reply) return;
    setMessages((prev = []) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant" && last.content === reply)
        return prev;
      return [...prev, { role: "assistant", content: reply }];
    });
  }, [reply, setMessages]);

  return (
    <div className="chat-container">
      {newChat && <h1 className="startTitle">Start a New Chat!</h1>}

      <div className="chats">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message-wrapper ${
              msg.role === "user" ? "user" : "assistant"
            }`}
          >
            <div
              className={`bubble ${
                msg.role === "user" ? "user-bubble" : "assistant-bubble"
              }`}
            >
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

export default Chat;
