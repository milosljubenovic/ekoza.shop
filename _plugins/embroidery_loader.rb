module Jekyll
  class EmbroideryLoader < Generator
    safe true
    priority :low

    def generate(site)
      embroidery_path = File.join(site.source, 'assets', 'images', 'embroidery')
      
      return unless Dir.exist?(embroidery_path)
      
      designs = []
      
      # Scan through category folders
      Dir.glob(File.join(embroidery_path, '*')).each do |category_path|
        next unless File.directory?(category_path)
        
        category = File.basename(category_path)
        next if category == 'thumbs' # Skip thumbnails folder
        
        # Find all PNG files in this category
        Dir.glob(File.join(category_path, '*.png')).each do |file_path|
          filename = File.basename(file_path, '.png')
          
          # Create design object
          design = {
            'id' => "#{category}-#{filename}",
            'name' => filename.split('-').map(&:capitalize).join(' '),
            'category' => category,
            'image' => "/assets/images/embroidery/#{category}/#{filename}.png",
            'thumbnail' => "/assets/images/embroidery/#{category}/#{filename}.png"
          }
          
          designs << design
        end
      end
      
      # Make designs available in site data
      site.data['embroidery_designs'] = designs
    end
  end
end
