class ChangeDocumentChunkEmbeddingDimension < ActiveRecord::Migration[8.1]
  def change
    remove_column :document_chunks, :embedding
    add_column :document_chunks, :embedding, :vector, limit: 768
  end
end