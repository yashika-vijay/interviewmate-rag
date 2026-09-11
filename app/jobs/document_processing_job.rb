class DocumentProcessingJob < ApplicationJob
  queue_as :default

  def perform(document_id)
    document = Document.find(document_id)

    document.update!(status: "processing")

    DocumentChunker.new(document).call
    DocumentEmbeddingService.new(document).call

    document.update!(status: "ready")
  rescue StandardError => e
    document&.update!(status: "failed")
    Rails.logger.error(
      "Document processing failed for #{document_id}: #{e.message}"
    )
    raise
  end
end
