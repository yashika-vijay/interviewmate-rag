class Api::V1::ChatController < ApplicationController
  skip_forgery_protection

  def create
    question = params[:question]

    if question.blank?
      return render json: {
        error: "Question cannot be blank"
      }, status: :unprocessable_entity
    end

    conversation = find_or_create_conversation

    conversation.messages.create!(
      role: "user",
      content: question
    )
    
    conversation.update!(title: question.truncate(50))

    result = RagService.new(question,conversation: conversation).call

    conversation.messages.create!(
      role: "assistant",
      content: result[:answer]
    )

    render json: {
      conversation_id: conversation.id,
      answer: result[:answer],
      sources: result[:sources].map do |chunk|
        {
          id: chunk.id,
          content: chunk.content,
          chunk_index: chunk.chunk_index
        }
      end
    }
  end

  private

  def find_or_create_conversation
    if params[:conversation_id].present?
      User.first.conversations.find(params[:conversation_id])
    else
      User.first.conversations.create!(
        title: "Interview Preparation"
      )
    end
  end
end
