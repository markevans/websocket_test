require 'rubygems'
require 'cramp/controller'
require 'connection'

Cramp::Controller::Websocket.backend = :thin

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
