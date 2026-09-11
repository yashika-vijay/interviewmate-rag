class DocumentChunker
  DEFAULT_CHUNK_SIZE = 1000
  DEFAULT_OVERLAP = 200

  def initialize(document, chunk_size: DEFAULT_CHUNK_SIZE, overlap: DEFAULT_OVERLAP)
    @document = document
    @chunk_size = chunk_size
    @overlap = overlap
  end

  def call
    text = DocumentParser.new(@document).call
    raise ArgumentError, "Document has no extractable text" if text.blank?

    chunks = build_chunks(text)

    @document.document_chunks.delete_all

    chunks.each_with_index do |content, index|
      @document.document_chunks.create!(
        content: content,
        chunk_index: index
      )
    end
  end

  private

  def build_chunks(text)
    questions = text.split(/(?=What is |What are |Why do we |How would you )/)
                   .map(&:strip)
                   .reject(&:blank?)

    questions
  end
end
