class User < ApplicationRecord
  has_many :documents, dependent: :destroy
  has_many :conversations, dependent: :destroy

  validates :email, presence: true, uniqueness: true
end