class Api::V1::DocumentsController < ApplicationController
  skip_forgery_protection

  def index
    conversation = current_conversation

    documents = conversation.documents
                            .order(created_at: :desc)

    render json: documents
  end

  def create
    conversation = current_conversation

    document = conversation.documents.new(document_params)
    document.user = User.first

    if document.save
      DocumentProcessingJob.perform_later(document.id)

      render json: document, status: :created
    else
      render json: {
        errors: document.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def show
    document = current_conversation.documents.find(params[:id])

    render json: document
  end

  def destroy
    document = current_conversation.documents.find(params[:id])

    document.file.purge_later if document.file.attached?
    document.destroy!

    head :no_content
  end

  private

  def current_conversation
    if params[:conversation_id].present?
      User.first.conversations.find(params[:conversation_id])
    else
      User.first.conversations.create!(
        title: "Interview Preparation"
      )
    end
  end

  def document_params
    params.permit(:name, :document_type, :file)
  end
end
