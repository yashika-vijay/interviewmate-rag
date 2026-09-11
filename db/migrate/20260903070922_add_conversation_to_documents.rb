class AddConversationToDocuments < ActiveRecord::Migration[8.1]
  def change
    add_reference :documents, :conversation, null: true, foreign_key: true
  end
end
