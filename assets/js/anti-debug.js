// Anti-debugging and DevTools detection
(function() {
  'use strict';
  
  // Disable right-click
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, false);
  
  // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
      return false;
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      return false;
    }
    // Ctrl+S (Save Page)
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault();
      return false;
    }
  }, false);
  
  // Disable console methods (but don't break the page)
  if (typeof window.console !== 'undefined') {
    var methods = ["log", "debug", "warn", "info"];
    for (var i = 0; i < methods.length; i++) {
      console[methods[i]] = function() {};
    }
  }
  
  // Prevent text selection on sensitive elements
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.msUserSelect = 'none';
  
  // Allow selection on input fields
  var inputs = document.querySelectorAll('input, textarea');
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].style.userSelect = 'text';
    inputs[j].style.webkitUserSelect = 'text';
  }
  
})();
