class DocumentParser
  SUPPORTED_CONTENT_TYPES = {
    "application/pdf" => :pdf,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => :docx
  }.freeze

  def initialize(document)
    @document = document
  end

  def call
    raise ArgumentError, "Document file is not attached" unless @document.file.attached?

    parser = SUPPORTED_CONTENT_TYPES[@document.file.content_type]

    raise ArgumentError, "Unsupported file type: #{@document.file.content_type}" unless parser

    send(:"parse_#{parser}")
  end

  private

  def parse_pdf
    pdf_data = @document.file.download
    reader = PDF::Reader.new(StringIO.new(pdf_data))

    reader.pages.map(&:text).join("\n\n")
  end

  def parse_docx
    tempfile = Tempfile.new(["document", ".docx"])

    begin
      tempfile.binmode
      tempfile.write(@document.file.download)
      tempfile.rewind

      docx = Docx::Document.open(tempfile.path)

      docx.paragraphs.map(&:text).join("\n")
    ensure
      tempfile.close
      tempfile.unlink
    end
  end
end
