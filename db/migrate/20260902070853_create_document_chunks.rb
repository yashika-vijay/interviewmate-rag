class CreateDocumentChunks < ActiveRecord::Migration[8.1]
  def change
    create_table :document_chunks do |t|
      t.references :document, null: false, foreign_key: true
      t.text :content
      t.integer :chunk_index
      t.vector :embedding, limit: 1536

      t.timestamps
    end
  end
end
