/*
* jQuery Stopwatch Thing
*/

/*jslint plusplus: true, devel: true, browser: true, white: true, maxerr: 50, indent: 2, unparam: true */
/*global jQuery : false, $ : false */

(function($){
  "use strict";
  var initialRender,
      renderTime,
      msToArray,
      zeroPad,
      // States
      stateNew = { state : "new", startStop : "Start", lapReset : "Reset"},
      stateRunning = { state : "running", startStop : "Stop", lapReset : "Reset"},
      stateStopped = { state : "stopped", startStop : "Start", lapReset : "Reset"};
      
  //Turn a time in milliseconds to an array of [hour, minute, second, ms]
  msToArray = function( totalMs ){
    var ms = totalMs % 1000,
        totalSeconds = 0,
        seconds = 0, 
        minutes = 0, 
        hours = 0;
        
    totalSeconds = (totalMs - ms) / 1000;
    seconds = totalSeconds % 60;
    minutes = Math.floor((totalSeconds % 3600) / 60);
    hours = Math.floor(totalSeconds / 3600);
    
    return [hours, minutes, seconds, ms];
  };
  
  //Given a number, pad the beginning with 0's to fill out the 
  //needed number of spaces
  //Ex: zeroPad(1, 2) => "01"
  //zeroPad(10, 2) => "10"
  //zeroPad(10, 3) => "010"
  zeroPad = function( toPad, digits ){
    var i = 0, 
        neededZeros = digits - (toPad.toString()).length, 
        padding = "";
    for( i = neededZeros; i > 0; i-- ){
      padding += "0";
    }
    return padding + (toPad.toString());
  };
  
  initialRender = function( renderInto ){
    var structure = "<div class='stoptastic-outer'><div class='stoptastic-inner'>" +  
        "<span class='stoptastic-hours'></span>:<span class='stoptastic-minutes'></span>:<span class='stoptastic-seconds'></span>.<span class='stoptastic-fractional'></span></div>" + 
        "<div class='stoptastic-controls'><input type='button' class='stoptastic-startStop' value='Start'/><input type='button' class='stoptastic-lapReset' value='Reset'/></div></div>";
    renderInto.html(structure);
    renderTime( renderInto, 0 );
  };
  
  renderTime = function( stopwatch, timeInMs ) {
    var timeArray = msToArray( timeInMs );
    stopwatch.find(".stoptastic-hours").text(zeroPad(timeArray[0], 2));
    stopwatch.find(".stoptastic-minutes").text(zeroPad(timeArray[1], 2));
    stopwatch.find(".stoptastic-seconds").text(zeroPad(timeArray[2], 2));
    stopwatch.find(".stoptastic-fractional").text(zeroPad(timeArray[3], 3)[0]);
  };
  
  
  
  $.fn.stoptastic = function(){
    //closure scope variables
    var $this = $(this), 
        startTime, stopTime,
        startStopClickHandler,
        lapResetClickHandler,
        tick,
        ticker = null,
        currentState = stateNew;
        
    //keep updating the UI
    tick = function(){
      var elapsed = new Date().getTime() - startTime;      
      renderTime($this, elapsed);
      ticker = setTimeout(tick, 50);
    };
      
    startStopClickHandler = function(){
      var elapsed, 
          now = new Date().getTime(),
          gap,
          originalElapsed;
          
      //handle states
      if( currentState === stateNew ){
        startTime = new Date().getTime();
        stopTime = null;
        setTimeout(tick, 50);
        currentState = stateRunning;
      }
      else if( currentState === stateRunning ){        
        stopTime = new Date().getTime();        
        elapsed = stopTime - startTime;
        currentState = stateStopped;
        clearTimeout(ticker);
        renderTime( $this, elapsed );
      }
      else if( currentState === stateStopped ){
        originalElapsed = stopTime - startTime;
        gap = now - stopTime;
        startTime = now - originalElapsed;
        stopTime = null;
        ticker = setTimeout(tick, 50);
        currentState = stateRunning;
      }
      
      //update UI
      $this.find(".stoptastic-startStop").val(currentState.startStop);
      $this.find(".stoptastic-lapReset").val(currentState.lapReset);
    };
    
    lapResetClickHandler = function(){
      if( currentState === stateRunning ){
        clearTimeout(ticker);
        renderTime( $this, 0 );
        startTime = null;
        stopTime = null;
        currentState = stateNew;
      }
      else if( currentState === stateStopped ){
        renderTime( $this, 0 );
        startTime = null;
        stopTime = null;
        currentState = stateNew;
      }
      //Unused: else if( currentState === stateNew ){}
      
      $this.find(".stoptastic-startStop").val(currentState.startStop);
      $this.find(".stoptastic-lapReset").val(currentState.lapReset);
    };
    
    //create a closure and do the actual setup
    return (function(){
      currentState = stateNew;
      initialRender($this);
      $this.find(".stoptastic-startStop").click(startStopClickHandler);
      $this.find(".stoptastic-lapReset").click(lapResetClickHandler);
      return $this;
    }());
  };
}(jQuery));