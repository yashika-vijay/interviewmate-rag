class Document < ApplicationRecord
  DOCUMENT_TYPES = %w[
    resume
    job_description
    interview_notes
    company_info
    other
  ].freeze

  STATUSES = %w[
    uploaded
    processing
    ready
    failed
  ].freeze

  belongs_to :user
  belongs_to :conversation, optional: true

  has_one_attached :file
  has_many :document_chunks, dependent: :destroy

  validates :name, presence: true
  validates :document_type, inclusion: { in: DOCUMENT_TYPES }
  validates :status, inclusion: { in: STATUSES }
  validates :file, presence: true

  after_initialize :set_default_status, if: :new_record?

  private

  def set_default_status
    self.status ||= "uploaded"
  end
end
