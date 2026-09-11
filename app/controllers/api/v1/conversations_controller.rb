class Api::V1::ConversationsController < ApplicationController
  skip_forgery_protection

  def index
    conversations = User.first.conversations
                       .includes(:messages)
                       .order(created_at: :desc)

    render json: conversations.map do |conversation|
      {
        id: conversation.id,
        title: conversation.title,
        created_at: conversation.created_at,
        message_count: conversation.messages.size
      }
    end
  end

  def create
    conversation = User.first.conversations.create!(
      title: "Interview Preparation"
    )

    render json: {
      id: conversation.id,
      title: conversation.title,
      messages: []
    }, status: :created
  end

  def show
    conversation = User.first.conversations.find(params[:id])

    render json: {
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages.order(:created_at).map do |message|
        {
          id: message.id,
          role: message.role,
          content: message.content
        }
      end
    }
  end

  def destroy
    conversation = User.first.conversations.find(params[:id])
    conversation.destroy!

    head :no_content
  end
end
