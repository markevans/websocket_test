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
