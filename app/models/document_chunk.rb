class DocumentChunk < ApplicationRecord
  belongs_to :document

  validates :content, presence: true
  validates :chunk_index, presence: true
end