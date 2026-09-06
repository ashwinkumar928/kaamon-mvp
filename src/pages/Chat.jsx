import { useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";

import API_URL from "../api";
import "./Chat.css";

function Chat() {
  const { applicationId } = useParams();

  const token =
    localStorage.getItem("kaamonToken");

  const savedUser =
    localStorage.getItem("kaamonCurrentUser");

  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const [error, setError] =
    useState("");

  const [sending, setSending] =
    useState(false);


  // ==============================
  // LOAD CHAT MESSAGES
  // ==============================

    useEffect(() => {
  let active = true;

  async function loadMessages() {
    try {
      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (active) {
          setError(
            data.message ||
              "Could not load chat."
          );
        }

        return;
      }

      if (active) {
        setMessages(data);
        setError("");
      }

    } catch (error) {
      console.error(
        "Load chat error:",
        error
      );

      if (active) {
        setError(
          "Could not connect to KaamON server."
        );
      }

    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  if (token) {
    loadMessages();

    const intervalId = setInterval(
      loadMessages,
      3000
    );

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }

  setLoading(false);

}, [applicationId, token]);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);
  


  // ==============================
  // SEND MESSAGE
  // ==============================

  async function handleSendMessage(event) {
    event.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}/messages`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: newMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not send message."
        );
        return;
      }

      setMessages((current) => [
        ...current,
        {
          ...data.chatMessage,
          sender_name:
            currentUser?.name || "You",
        },
      ]);

      setNewMessage("");

    } catch (error) {
      console.error(
        "Send chat error:",
        error
      );

      setError(
        "Could not connect to KaamON server."
      );

    } finally {
      setSending(false);
    }
  }


  if (!token || !currentUser) {
    return <Navigate to="/login" />;
  }


  if (loading) {
    return (
      <main className="chat-page">
        <div className="chat-container">
          <p>Loading chat...</p>
        </div>
      </main>
    );
  }


  return (
    <main className="chat-page">

      <div className="chat-container">

        <Link
          to="/dashboard"
          className="chat-back"
        >
          ← Back to Dashboard
        </Link>


        <div className="chat-card">

          <div className="chat-header">

            <div>
              <span>KAAMON CHAT</span>

              <h1>Work Conversation</h1>

              <p>
                Chat is available after the
                application is accepted.
              </p>
            </div>

          </div>


          {error && (
            <p className="chat-error">
              {error}
            </p>
          )}


          <div className="chat-messages">

            {messages.length === 0 ? (

              <div className="chat-empty">
                <p>
                  No messages yet.
                </p>

                <span>
                  Start the conversation.
                </span>
              </div>

            ) : (

              messages.map((chatMessage) => {

                const isOwnMessage =
                  String(
                    chatMessage.sender_id
                  ) ===
                  String(currentUser.id);

                return (
                  <div
                    key={chatMessage.id}
                    className={
                      isOwnMessage
                        ? "chat-message-row own"
                        : "chat-message-row"
                    }
                  >

                    <div className="chat-message">

                      {!isOwnMessage && (
                        <strong>
                          {chatMessage.sender_name}
                        </strong>
                      )}

                      <p>
                        {chatMessage.message}
                      </p>

                      <small>
                        {new Date(
                          chatMessage.created_at
                        ).toLocaleString()}
                      </small>

                    </div>

                  </div>
                );
              })

            )}

            <div ref={messagesEndRef} />

          </div>


          <form
            className="chat-form"
            onSubmit={handleSendMessage}
          >

            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(event) =>
                setNewMessage(
                  event.target.value
                )
              }
            />

            <button
              type="submit"
              disabled={
                sending ||
                !newMessage.trim()
              }
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}

export default Chat;