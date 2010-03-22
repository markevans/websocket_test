(function($){

// Comet stuff for long-polling
$.comet = function(url, success_callback, error_callback){
  error_callback = error_callback || function(a,b,c){alert('Error '+b)};
  $.ajax({
    type: "GET",
    dataType: 'json',
    url: url,
    success: function(data){
      success_callback(data);
      $.comet(url, success_callback, error_callback);
    },
    error: function(a,b,c){
      error_callback(a,b,c);
      $.comet(url, success_callback, error_callback);
    },
    ifModified: true
  });
}

// Drawing Canvas
$.objectify('drawingCanvas',{
  
  relativeCoords: function(event){
    return {
      x: event.pageX - this.offset().x,
      y: event.pageY - this.offset().y
    };
  },
  
  offset: function(){
    var offset = this.jelem.offset();
    return {x: offset.left, y: offset.top};
  },
  
  draw: function(x, y, send_message){
    this.context.beginPath();
    // this.context.arc(x, y, 1, 0, 2*Math.PI, true);
    // this.context.fill();
    this.context.moveTo(this.current.x, this.current.y);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.current.x = x;
    this.current.y = y;
    this.send('draw', [x, y]);
  },
  
  onMouseDown: function(x, y, send_message){
    this.mouse_down = true;
    this.current = {x: x, y: y};
    this.send('mousedown', [x, y]);
  },
  
  onMouseUp: function(send_message){
    this.mouse_down = false;
    this.send('mouseup');
  },
  
  send: function(name, content){
    if(!this.suppress_messages){
      websocket.send(JSON.stringify({name: name, content: content}));
    }
  },
  
  withoutTransmitting: function(func){
    this.suppress_messages = true;
    func();
    this.suppress_messages = false;
  },
  
  init: function(){
    var obj = this;
    this.mouse_down = false;
    this.context = this.elem.getContext('2d');
    this.current = {x: 0, y: 0};

    this.jelem.mousedown(function(event){
      var coords = obj.relativeCoords(event);
      obj.onMouseDown(coords.x, coords.y);
    }).
    mouseup(function(){
      obj.onMouseUp();
    }).
    mousemove(function(event){
      if(obj.mouse_down){
        var relative_coords = obj.relativeCoords(event);
        obj.draw(relative_coords.x, relative_coords.y);
      }
    });
    
    // Respond to external events
    $().bind('dc.draw', function(evt, coords){
      obj.withoutTransmitting(function(){
        obj.draw(coords[0], coords[1]);
      });
    }).bind('dc.mousedown', function(evt, coords){
      obj.withoutTransmitting(function(){
        obj.onMouseDown(coords[0], coords[1]);
      });
    }).bind('dc.mouseup', function(evt){
      obj.withoutTransmitting(function(){
        obj.onMouseUp();
      });
    });
    
  }
});
  
  
})(jQuery);
