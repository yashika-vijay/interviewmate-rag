import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("resume");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [conversations, setConversations] = useState([]);

  const fetchDocuments = async (conversationId) => {
    if (!conversationId) {
      setDocuments([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/documents?conversation_id=${conversationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchLatestConversation = async () => {
    try {
      const response = await fetch("/api/v1/conversations");

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const conversations = await response.json();

      if (conversations.length === 0) {
        return;
      }

      const latestConversation = conversations[0];

      const conversationResponse = await fetch(
        `/api/v1/conversations/${latestConversation.id}`
      );

      if (!conversationResponse.ok) {
        throw new Error("Failed to load conversation");
      }

      const conversation = await conversationResponse.json();

      setConversationId(conversation.id);
      setMessages(conversation.messages);
      await fetchDocuments(conversation.id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/v1/conversations");

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchLatestConversation();
  }, []);

  const uploadDocument = async () => {
  if (!file) {
    setUploadMessage("Please select a file.");
    return;
  }

  if (!conversationId) {
    setUploadMessage("Please create or select a conversation first.");
    return;
  }

  setUploading(true);
  setUploadMessage("");

  try {
    const formData = new FormData();
    formData.append("name", file.name);
    formData.append("document_type", documentType);
    formData.append("file", file);

    const response = await fetch(
      `/api/v1/documents?conversation_id=${conversationId}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload document");
    }

    const document = await response.json();

    setDocuments((currentDocuments) => [
        document,
        ...currentDocuments,
      ]);

      setFile(null);
      setUploadMessage("Document uploaded successfully.");
    } catch (error) {
      console.error(error);
      setUploadMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;

    setQuestion("");
    setLoading(true);

    setSources([]);
    setAnswer("");

    // Show the user's message immediately.
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: currentQuestion,
      },
    ]);

    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          conversation_id: conversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setConversationId(data.conversation_id);

      setAnswer(data.answer);
      setSources(data.sources || []);

      // Add the assistant's response to the conversation.
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
      await fetchConversations();
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (id) => {
    try {
      const response = await fetch(`/api/v1/conversations/${id}`);

      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const conversation = await response.json();

      setConversationId(conversation.id);
      setMessages(conversation.messages);
      setAnswer("");
      setSources([]);
      await fetchDocuments(conversation.id);
    } catch (error) {
      console.error(error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch("/api/v1/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation = await response.json();

      setConversationId(conversation.id);
      setMessages([]);
      setAnswer("");
      setSources([]);
      setQuestion("");
      setDocuments([]);

      await fetchConversations();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteConversation = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chat?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/v1/conversations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      setConversations((currentConversations) =>
        currentConversations.filter(
          (conversation) => conversation.id !== id
        )
      );

      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
        setAnswer("");
        setSources([]);
        setDocuments([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteDocument = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/v1/documents/${documentId}?conversation_id=${conversationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments((currentDocuments) =>
        currentDocuments.filter((document) => document.id !== documentId)
      );
    } catch (error) {
      console.error(error);
      setUploadMessage(error.message);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="logo">InterviewMate</div>
          <p>AI-powered interview preparation assistant</p>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Previous Chats</h2>

            <button
              className="new-chat-button"
              type="button"
              onClick={createNewConversation}
            >
              + New Chat
            </button>
          </div>

          {conversations.length === 0 ? (
            <p className="no-conversations">No previous chats yet.</p>
          ) : (
            <div className="conversations-list">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-card ${
                    conversationId === conversation.id ? "active" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="conversation-select"
                    onClick={() => openConversation(conversation.id)}
                  >
                    <div className="conversation-title">
                      {conversation.title}
                    </div>

                    <div className="conversation-meta">
                      {conversation.message_count} messages
                    </div>
                  </button>

                  <button
                    type="button"
                    className="delete-conversation-button"
                    onClick={() => deleteConversation(conversation.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>

        <main className="chat-container">

          <div className="upload-section">
            <h2>Your interview documents</h2>

            <div className="upload-row">
              <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
              >
                <option value="resume">Resume</option>
                <option value="job_description">Job Description</option>
                <option value="interview_notes">Interview Notes</option>
                <option value="company_info">Company Info</option>
                <option value="other">Other</option>
              </select>

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(event) => setFile(event.target.files[0])}
              />

              <button
                type="button"
                onClick={uploadDocument}
                disabled={!file || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>

            {uploadMessage && (
              <p className="upload-message">{uploadMessage}</p>
            )}
          </div>

          <div className="documents-section">
            <h2>Your Documents</h2>

            {loadingDocuments ? (
              <p>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p>No documents uploaded yet.</p>
            ) : (
              <div className="documents-list">
                {documents.map((document) => (
                  <div key={document.id} className="document-card">
                    <div className="document-info">
                      <div className="document-name">
                        {document.name}
                      </div>

                      <div className="document-type">
                        {document.document_type}
                      </div>
                    </div>

                    <div className="document-actions">
                      <div className={`document-status ${document.status}`}>
                        {document.status}
                      </div>

                      <button
                        type="button"
                        className="delete-document-button"
                        onClick={() => deleteDocument(document.id)}
                        title="Delete document"
                        aria-label={`Delete ${document.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="welcome">
              <h1>Prepare smarter for your interview.</h1>
              <p>
                Ask questions about your resume, experience, skills, or interview
                preparation.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              className={`message ${
                message.role === "user"
                  ? "user-message"
                  : "assistant-message"
              }`}
              key={index}
            >
              <div className="message-label">
                {message.role === "user" ? "You" : "InterviewMate"}
              </div>

              <div className="answer-text">
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message assistant-message">
              <div className="message-label">InterviewMate</div>
              <div className="loading">Thinking...</div>
            </div>
          )}

          {sources.length > 0 && !loading && (
            <div className="sources">
              <h2>Sources used</h2>

              {sources.map((source) => (
                <div className="source-card" key={source.id}>
                  <div className="source-title">
                    Document chunk {source.chunk_index}
                  </div>

                  <p>{source.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="input-container">
            <input
              className="question-input"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  askQuestion();
                }
              }}
              placeholder="Ask a question about your interview..."
            />

            <button
              className="ask-button"
              type="button"
              onClick={askQuestion}
              disabled={loading}
            >
              {loading ? "..." : "Ask"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
