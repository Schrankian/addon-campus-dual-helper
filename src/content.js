const originalOpen = XMLHttpRequest.prototype.open;
let disabledColor = document.currentScript.getAttribute('data-disabledColor');
let hideDisabled = (/true/).test(document.currentScript.getAttribute('data-hideDisabled')); // Got as string, then made to bool

XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
  console.info("Request started");
  this.addEventListener('readystatechange', function () {
    if (this.readyState === 4 && this.status === 200) {
      // Modify the response here
      const modifiedResponse = modifyResponse(JSON.parse(this.responseText));

      // Override the response text
      Object.defineProperty(this, 'responseText', {
        writable: true,
        value: JSON.stringify(modifiedResponse),
      });
    }
  });

  originalOpen.apply(this, arguments);
};

function modifyResponse(response) {
  // Your modification logic here
  for(const [key, value] of response.entries()){
    if (value.title.trim() == "DB" || true) {
      response[key].color = disabledColor
      console.log(hideDisabled, typeof hideDisabled)
      if (hideDisabled) response[key].allDay = true; // This hides the lesson for some reason
    };
  }
  console.info(response)
  return response;
}

window.onmessage = function (message) {
  console.info("content script: ");
  console.info(message.data)
  if (message.data) { 
    disabledColor = message.data.disabledColor; 
    hideDisabled = message.data.hideDisabled;
    $('#calendar').fullCalendar('refetchEvents');
  }
}

$('#calendar').fullCalendar('refetchEvents');