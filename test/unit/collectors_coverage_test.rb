# frozen_string_literal: true

require File.expand_path('../test_helper', File.dirname(__FILE__))
require File.expand_path('./dog', File.dirname(__FILE__))

if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('2.3.0')
  class CollectorsCoverageTest < Test::Unit::TestCase
    attr_accessor :coverband

    def setup
      Coverband.configure do |config|
        config.store = Coverband::Adapters::RedisStore.new(Redis.new)
      end
      @coverband = Coverband::Collectors::Coverage.instance.reset_instance
    end

    def teardown
      Thread.current[:coverband_instance] = nil
      Coverband.configure do |config|
      end
      @coverband = Coverband::Collectors::Coverage.instance.reset_instance
    end

    test 'gets coverage instance' do
      assert_equal Coverband::Collectors::Coverage, coverband.class
    end

    test 'defaults to a redis store' do
      assert_equal Coverband::Adapters::RedisStore, coverband.instance_variable_get('@store').class
    end

  end
end
