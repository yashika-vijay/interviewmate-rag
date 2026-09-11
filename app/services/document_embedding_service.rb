class DocumentEmbeddingService
  def initialize(document)
    @document = document
  end

  def call
    @document.document_chunks.find_each do |chunk|
      embedding = EmbeddingService.new(chunk.content).call

      chunk.update!(
        embedding: embedding
      )
    end
  end
end
