require 'csv'
require 'faraday'

begin
  require 'dotenv'
  Dotenv.load('.env')
rescue StandardError => e
  puts "loading Dotenv failed. because: #{e.message}"
end

TICKERS_LIST = 'data/ticker_list.csv'.freeze
FILTERED_LIST = 'data/free_ticker_list.csv'.freeze
BASE_URL = 'https://www.quandl.com/api/v3/datasets/EOD'.freeze

data = CSV.read(TICKERS_LIST, headers: true)

CSV.open(FILTERED_LIST, "w+") do |csv|
  data.each do |r|
    url = "#{BASE_URL}/#{r['Ticker']}.json?start_date=2017-12-21&end_date=2017-12-23&api_key=#{ENV['QUANDL_API_KEY']}"
    puts url
    resp = Faraday.get(url)
    puts "#{r['Ticker']} #{resp.status}"
    next if resp.status != 200
    csv << r
  end
end
