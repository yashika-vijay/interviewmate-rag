class VectorSearchService
  DEFAULT_LIMIT = 1

  def initialize(query, conversation:, limit: DEFAULT_LIMIT)
    @query = query
    @conversation = conversation
    @limit = limit
  end

  def call
    query_embedding = EmbeddingService.new(@query).call
    vector = "[#{query_embedding.join(",")}]"

    DocumentChunk
      .joins(:document)
      .where(documents: { conversation_id: @conversation.id })
      .where.not(embedding: nil)
      .order(Arel.sql("embedding <=> '#{vector}'::vector"))
      .limit(@limit)
  end
end
