require "net/http"
require "json"
require "uri"

class EmbeddingService
  MODEL = "nomic-embed-text"
  OLLAMA_URL = "http://localhost:11434/api/embeddings"
  DIMENSIONS = 768

  def initialize(text)
    @text = text
  end

  def call
    raise ArgumentError, "Text cannot be blank" if @text.blank?

    response = Net::HTTP.post(
      URI(OLLAMA_URL),
      {
        model: MODEL,
        prompt: @text
      }.to_json,
      "Content-Type" => "application/json"
    )

    unless response.is_a?(Net::HTTPSuccess)
      raise "Ollama embedding failed: #{response.body}"
    end

    body = JSON.parse(response.body)
    embedding = body.fetch("embedding")

    raise "Expected #{DIMENSIONS} dimensions, got #{embedding.length}" unless embedding.length == DIMENSIONS

    embedding
  end
end
