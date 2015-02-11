module ApplicationHelper
  def page_title(page)
    site = 'WEST 2015 PlugFest'
    if page.nil? || page.length == 0
      site
    else
      "#{page} | #{site}"
    end
  end
end
