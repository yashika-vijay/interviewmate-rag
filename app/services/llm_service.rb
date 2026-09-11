require "net/http"
require "json"
require "uri"

class LlmService
  MODEL = "llama3.2:3b"
  OLLAMA_URL = "http://localhost:11434/api/generate"

  def initialize(prompt)
    @prompt = prompt
  end

  def call
    raise ArgumentError, "Prompt cannot be blank" if @prompt.blank?

    response = Net::HTTP.post(
      URI(OLLAMA_URL),
      {
        model: MODEL,
        prompt: @prompt,
        stream: false
      }.to_json,
      "Content-Type" => "application/json"
    )

    unless response.is_a?(Net::HTTPSuccess)
      raise "Ollama LLM failed: #{response.body}"
    end

    body = JSON.parse(response.body)

    body.fetch("response")
  end
end
