require 'htmlcompressor'

module Jekyll
  module Compressor
    def self.compress_html(content)
      compressor = HtmlCompressor::Compressor.new(
        :remove_comments => true,
        :remove_multi_spaces => true,
        :remove_intertag_spaces => true,
        :remove_quotes => true,
        :compress_css => false,
        :compress_javascript => false,
        :simple_doctype => false,
        :remove_script_attributes => true,
        :remove_style_attributes => true,
        :remove_link_attributes => true,
        :remove_form_attributes => true,
        :remove_input_attributes => true,
        :remove_javascript_protocol => true,
        :remove_http_protocol => false,
        :remove_https_protocol => false,
        :preserve_line_breaks => false,
        :simple_boolean_attributes => true
      )
      compressor.compress(content)
    end
  end
end

Jekyll::Hooks.register :documents, :post_render do |doc|
  if doc.output_ext == '.html' && ENV['JEKYLL_ENV'] == 'production'
    doc.output = Jekyll::Compressor.compress_html(doc.output)
  end
end

Jekyll::Hooks.register :pages, :post_render do |page|
  if page.output_ext == '.html' && ENV['JEKYLL_ENV'] == 'production'
    page.output = Jekyll::Compressor.compress_html(page.output)
  end
end
