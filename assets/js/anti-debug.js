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
  
  // Detect if DevTools is open
  var devtools = {
    isOpen: false,
    orientation: undefined
  };
  
  var threshold = 160;
  var emitEvent = function(state, orientation) {
    window.dispatchEvent(new CustomEvent('devtoolschange', {
      detail: {
        isOpen: state,
        orientation: orientation
      }
    }));
  };
  
  setInterval(function() {
    var widthThreshold = window.outerWidth - window.innerWidth > threshold;
    var heightThreshold = window.outerHeight - window.innerHeight > threshold;
    var orientation = widthThreshold ? 'vertical' : 'horizontal';
    
    if (!(heightThreshold && widthThreshold) &&
      ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
      if (!devtools.isOpen || devtools.orientation !== orientation) {
        emitEvent(true, orientation);
        // Redirect or take action when DevTools detected
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:24px;color:#666;">Developer tools nisu dozvoljeni na ovoj stranici.</div>';
      }
      devtools.isOpen = true;
      devtools.orientation = orientation;
    } else {
      if (devtools.isOpen) {
        emitEvent(false, undefined);
      }
      devtools.isOpen = false;
      devtools.orientation = undefined;
    }
  }, 500);
  
  // Debugger trap - constantly triggers debugger if DevTools is open
  setInterval(function() {
    (function() {
      return false;
    })
    ['constructor']('debugger')
    ['call']();
  }, 50);
  
  // Disable console methods
  if (!window.console) window.console = {};
  var methods = ["log", "debug", "warn", "info", "error", "dir", "trace", "assert"];
  for (var i = 0; i < methods.length; i++) {
    console[methods[i]] = function() {};
  }
  
  // Detect if console is opened by measuring time
  var startTime = performance.now();
  console.profile("profile");
  console.profileEnd("profile");
  var timeTaken = performance.now() - startTime;
  
  if (timeTaken > 10) {
    // Console is likely open
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:24px;color:#666;">Developer tools nisu dozvoljeni na ovoj stranici.</div>';
  }
  
  // Prevent text selection
  document.onselectstart = function() {
    return false;
  };
  
  // Detect when user switches to another tab
  var hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }
  
  // Clear sensitive data when tab becomes hidden
  document.addEventListener(visibilityChange, function() {
    if (document[hidden]) {
      // Clear clipboard, local storage, etc.
    }
  }, false);
  
})();
