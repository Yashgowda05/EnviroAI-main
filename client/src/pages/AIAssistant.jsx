import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaTrash,
  FaArrowLeft,
  FaMapMarkedAlt,
  FaCloudSun,
  FaLeaf,
  FaShieldAlt,
} from "react-icons/fa";

import "../styles/ai-assistant.css";

const API_URL = "http://localhost:5000/api/assistant";

const SUGGESTED_QUESTIONS = [
  {
    icon: <FaMapMarkedAlt />,
    title: "Plan a trip",
    question:
      "Plan a three-day trip to Mysuru with destinations and an eco-friendly itinerary.",
  },
  {
    icon: <FaCloudSun />,
    title: "Weather precautions",
    question:
      "What weather conditions should I check before starting a long journey?",
  },
  {
    icon: <FaShieldAlt />,
    title: "Safer journey",
    question:
      "Give me a checklist for planning a safe road trip.",
  },
  {
    icon: <FaLeaf />,
    title: "Eco-friendly travel",
    question:
      "Suggest ways to reduce my carbon footprint while travelling.",
  },
];

function AIAssistant() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! 👋 Welcome to EnviroAI Travel Assistant.\n\nI can help you plan trips, understand travel precautions, explore eco-friendly transportation, and prepare for safer journeys.\n\nWhat would you like help with today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Redirect unauthenticated users to the login page.
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // Automatically scroll to the newest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // Send a message to the backend AI endpoint.
  const sendMessage = async (question = input) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
    };

    // Keep recent conversation history for context.
    const history = messages
      .filter(
        (message) =>
          message.role === "user" ||
          message.role === "assistant"
      )
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/chat`,
        {
          message: trimmedQuestion,
          history,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      const answer = response.data.reply;

      if (
        typeof answer !== "string" ||
        !answer.trim()
      ) {
        throw new Error(
          "The AI returned an empty response."
        );
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      const status = err.response?.status;

      let errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Unable to contact the AI assistant.";

      if (status === 401 || status === 403) {
        errorMessage =
          "Your login session is invalid or expired. Please log in again.";

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else if (
        err.code === "ECONNABORTED"
      ) {
        errorMessage =
          "The AI response took too long. Please try again.";
      } else if (!err.response) {
        errorMessage =
          "Cannot connect to the EnviroAI server. Check that your backend is running on port 5000.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle Enter to send and Shift+Enter for a new line.
  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Clear conversation history in the current interface.
  const clearChat = () => {
    if (loading) {
      return;
    }

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content:
          "Your conversation has been cleared. 👋\n\nI'm ready to help you plan your next journey. What would you like to know?",
      },
    ]);

    setInput("");
    setError("");
  };

  return (
    <div className="ai-assistant-page">

      {/* Header */}
      <header className="ai-header">

        <div className="ai-brand">
          <div className="ai-brand-icon">
            <FaRobot />
          </div>

          <div>
            <h2>EnviroAI Assistant</h2>
            <p>Your intelligent travel companion</p>
          </div>
        </div>

        <div className="ai-header-actions">

          <button
            type="button"
            className="ai-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft />
            Dashboard
          </button>

          <button
            type="button"
            className="ai-clear-btn"
            onClick={clearChat}
            disabled={loading}
          >
            <FaTrash />
            Clear Chat
          </button>

        </div>
      </header>

      {/* Main content */}
      <main className="ai-main">

        <section className="ai-chat-container">

          {/* Chat heading */}
          <div className="ai-chat-heading">
            <div className="ai-heading-icon">
              <FaRobot />
            </div>

            <div>
              <h1>AI Travel Assistant</h1>

              <p>
                Ask about destinations, travel planning,
                weather precautions, and sustainable travel.
              </p>
            </div>
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="ai-suggestions">

              <h3>What can I help you with?</h3>

              <div className="ai-suggestion-grid">

                {SUGGESTED_QUESTIONS.map(
                  (suggestion) => (
                    <button
                      type="button"
                      key={suggestion.title}
                      className="ai-suggestion-card"
                      onClick={() =>
                        sendMessage(
                          suggestion.question
                        )
                      }
                      disabled={loading}
                    >
                      <span className="suggestion-icon">
                        {suggestion.icon}
                      </span>

                      <span className="suggestion-title">
                        {suggestion.title}
                      </span>

                      <span className="suggestion-description">
                        {suggestion.question}
                      </span>
                    </button>
                  )
                )}

              </div>
            </div>
          )}

          {/* Messages */}
          <div
            className="ai-messages"
            aria-live="polite"
            aria-label="Conversation"
          >

            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-message ${
                  message.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >

                <div className="ai-message-avatar">
                  {message.role === "user" ? (
                    <FaUser />
                  ) : (
                    <FaRobot />
                  )}
                </div>

                <div className="ai-message-content">

                  <span className="ai-message-author">
                    {message.role === "user"
                      ? "You"
                      : "EnviroAI Assistant"}
                  </span>

                  <div className="ai-message-bubble">
                    {message.content}
                  </div>

                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="ai-message assistant-message">

                <div className="ai-message-avatar">
                  <FaRobot />
                </div>

                <div className="ai-message-content">
                  <span className="ai-message-author">
                    EnviroAI Assistant
                  </span>

                  <div
                    className="ai-typing"
                    aria-label="AI is generating a response"
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                    <span className="ai-thinking-text">
                      Thinking...
                    </span>
                  </div>
                </div>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Error message */}
          {error && (
            <div
              className="ai-error"
              role="alert"
            >
              <strong>Something went wrong:</strong>
              <p>{error}</p>

              <button
                type="button"
                onClick={() => setError("")}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Input area */}
          <form
            className="ai-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >

            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your next trip..."
              aria-label="Enter your travel question"
              rows={2}
              maxLength={4000}
              disabled={loading}
            />

            <button
              type="submit"
              className="ai-send-btn"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <FaPaperPlane />
              <span>Send</span>
            </button>

          </form>

          <p className="ai-disclaimer">
            AI-generated travel advice may be inaccurate.
            Verify important travel, weather, and safety
            information with authoritative sources.
          </p>

        </section>
      </main>
    </div>
  );
}

export default AIAssistant;