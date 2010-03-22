require 'rubygems'
require 'cramp/controller'

Cramp::Controller::Websocket.backend = :thin

class Connection
  
  class << self
    def add(websocket_connection)
      connections << websocket_connection
    end
  
    def all
      connections
    end
    
    def remove(websocket_connection)
      connections.delete(websocket_connection)
    end
    
    private
    def connections
      @connections ||= []
    end
  end
  
end

class WebsocketController < Cramp::Controller::Websocket
  
  on_start :add_connection
  on_finish :remove_connection
  
  on_data :received_data

  def add_connection
    Connection.add(self)
  end
  
  def remove_connection
    Connection.remove(self)
  end

  def received_data(data)
    Connection.all.each do |ws|
      ws.render(data) unless ws == self
    end
  end
  
end

Rack::Handler::Thin.run WebsocketController, :Port => 3001
