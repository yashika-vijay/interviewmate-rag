# InterviewMate RAG

InterviewMate is an AI-powered interview preparation chatbot built with **Ruby on Rails, React, PostgreSQL, pgvector, and Ollama**.

Users can create conversations, upload interview-related documents, and ask questions based on those documents. The application uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant content and generate grounded answers with sources.

## Tech Stack

* **Backend:** Ruby on Rails
* **Frontend:** React + Vite
* **Database:** PostgreSQL + pgvector
* **Embeddings:** Ollama + `nomic-embed-text`
* **LLM:** Ollama + `llama3.2:3b`
* **Document Processing:** PDF Reader, DOCX
* **Background Jobs:** Active Job

## Architecture

```text
React Frontend
      │
      │ JSON API
      ▼
Rails Application
      │
      ├── PostgreSQL + pgvector
      │
      ├── Background Jobs
      │
      └── Ollama
            ├── Embeddings
            └── LLM
```

### RAG Flow

```text
Document Upload
      ↓
Parse PDF/DOCX
      ↓
Clean & Chunk Text
      ↓
Generate Embeddings
      ↓
Store in pgvector
      ↓
User Question
      ↓
Generate Question Embedding
      ↓
Conversation-scoped Vector Search
      ↓
Retrieve Relevant Chunks
      ↓
Build Prompt with Context
      ↓
Ollama LLM
      ↓
Answer + Sources
```

## Project Structure

```text
app/
├── controllers/api/v1/
│   ├── chat_controller.rb
│   ├── conversations_controller.rb
│   └── documents_controller.rb
│
├── models/
│   ├── user.rb
│   ├── document.rb
│   ├── document_chunk.rb
│   ├── conversation.rb
│   └── message.rb
│
├── services/
│   ├── document_parser.rb
│   ├── document_text_cleaner.rb
│   ├── document_chunker.rb
│   ├── embedding_service.rb
│   ├── document_embedding_service.rb
│   ├── vector_search_service.rb
│   ├── rag_service.rb
│   └── llm_service.rb
│
└── jobs/
    └── document_processing_job.rb

app/javascript/
├── App.jsx
└── entrypoints/
    └── application.jsx
```

## Requirements

* Ruby 3.4.2
* Rails 8.1.x
* Node.js 22+
* PostgreSQL 14+
* pgvector
* Redis
* Ollama

## Setup

### 1. Install dependencies

```bash
bundle install
npm install
```

### 2. Setup database

```bash
bin/rails db:create
bin/rails db:migrate
```

Make sure the PostgreSQL `vector` extension is available.

### 3. Setup Ollama

Pull the required models:

```bash
ollama pull nomic-embed-text
ollama pull llama3.2:3b
```

Start Ollama:

```bash
ollama serve
```

### 4. Start the application

```bash
bin/dev
```

Open:

```text
http://localhost:3000
```

## Document Processing

Uploaded documents are processed asynchronously:

```text
Upload
  ↓
DocumentProcessingJob
  ↓
Parse → Clean → Chunk → Embed
  ↓
Ready
```

Supported document types:

* PDF
* DOCX

## Conversation-Scoped RAG

Documents belong to conversations. During retrieval, only document chunks from the **current conversation** are searched.

This prevents documents from other conversations from being used as context.

## API

| Endpoint                           | Purpose                   |
| ---------------------------------- | ------------------------- |
| `POST /api/v1/chat`                | Ask an interview question |
| `GET /api/v1/conversations`        | List conversations        |
| `POST /api/v1/conversations`       | Create conversation       |
| `DELETE /api/v1/conversations/:id` | Delete conversation       |
| `GET /api/v1/documents`            | List documents            |
| `POST /api/v1/documents`           | Upload document           |
| `DELETE /api/v1/documents/:id`     | Delete document           |

## Future Improvements

* User authentication
* Streaming LLM responses
* Better conversation memory
* Hybrid search and reranking
* Mock interview mode
* Resume and job-description matching
* RAG evaluation and automated testing
