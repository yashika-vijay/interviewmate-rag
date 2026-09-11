class RagService
  DEFAULT_LIMIT = 1

  def initialize(question, conversation: nil, limit: DEFAULT_LIMIT)
    @question = question
    @conversation = conversation
    @limit = limit
  end

  def call
    search_query = [
      conversation_history,
      @question
    ].reject(&:blank?).join("\n")

    chunks = VectorSearchService.new(
      search_query,
      conversation: @conversation,
      limit: @limit
    ).call

    context = chunks.map(&:content).join("\n\n")
    history = conversation_history

    prompt = build_prompt(
      context: context,
      history: history
    )

    answer = LlmService.new(prompt).call

    {
      answer: answer,
      sources: chunks
    }
  end

  private

  def conversation_history
    return "" unless @conversation

    @conversation.messages
                .order(:created_at)
                .last(10)
                .map do |message|
      "#{message.role.capitalize}: #{message.content}"
    end
                .join("\n")
  end

  def build_prompt(context:, history:)
    <<~PROMPT
      You are InterviewMate, an interview preparation assistant.

      Answer the user's question using the provided document context and
      conversation history when relevant.

      Use the conversation history to understand follow-up questions and
      references such as "it", "that project", "the database", or "what about it".

      Use ONLY information supported by the provided documents and conversation.

      If the answer cannot be found in the available information, say:
      "I couldn't find that information in the provided documents."

      Do not invent or assume information.

      Conversation history:
      #{history.presence || "No previous conversation."}

      Document context:
      #{context}

      Current user question:
      #{@question}

      Answer:
    PROMPT
  end
end
