(function(){
  
  // Taken from http://github.com/markevans/jquery-objectify
  // See the README for usage instructions
 
  $.objectifications = [];
 
  $.objectify = function(name, opts){
    
    // 'prototype_vars' correspond to both methods and attributes
    var prototype_vars = opts || {};
 
    // Add extra methods to the prototype
    $.extend(prototype_vars, {
      transmit: function(event_name){
        $().trigger(name+'.'+event_name, this);
      }
    });
 
    // Define class with prototype methods and attributes
    var klass = function(){};
    $.extend(klass.prototype, prototype_vars);
 
    // Define the plugin
    $.fn[name] = function(){
    
      var selector = $(this).selector;
      var n = $(this).length; // Number of elements matching selector
      var args = arguments;
      
      // Store which selector was used to apply which objectify object
      $.objectifications.push([selector, name]);
    
      $(this).each(function(i){
        // Instantiate the object and add instance methods/attributes to it
        var obj = new klass();
        
        obj.elem = this; // Make the dom element available for use in object methods via 'this.elem'
        obj.jelem = $(this); // Make the jquerified dom element available for use in object methods via 'this.jelem'
        
        this.obj = obj; // Make the obj available for use in jquery methods via 'this.obj'
 
        // Add some useful meta-data to the object
        obj.meta = {
          obj_index: i,
          total_objs: n,
          selector: selector
        };
 
        // Call the init function if it exists
        if(obj.init) obj.init.apply(obj, args);
      });
    
      return $(this);
    };
  
  };
 
  // Connect is a wrapper around bind for global events, that connects objectified objects directly
  $.connect = function(global_event, obj2_name, func){
    var selector, name;
    for(i in $.objectifications){
      selector = $.objectifications[i][0];
      name = $.objectifications[i][1];
      if(name == obj2_name){
        $().bind(global_event, function(evt, obj1){
          $(selector).each(function(){
            func.call(this, obj1, this.obj);
          });
        });
      }
    }
  };
 
})(jQuery);
