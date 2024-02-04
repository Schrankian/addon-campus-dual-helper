const originalOpen = XMLHttpRequest.prototype.open;
console.log(document.currentScript.getAttribute('data-modifications'))
let modifications = JSON.parse(document.currentScript.getAttribute('data-modifications')); // [{name: ..., color: ..., hide: ... },{...}]

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
    for(const mod of modifications){
      if (value.title.trim().includes(mod.name.trim())) {
        response[key].color = mod.color;
        if (mod.hide) response[key].allDay = true; // This hides the lesson for some reason
      };
    }
  }
  console.info(response)
  return response;
}

window.onmessage = function (message) {
  console.info("content script: ");
  console.info(message.data)
  if (message.data) { 
    modifications = message.data;
    $('#calendar').fullCalendar('refetchEvents');
  }
}

$('#calendar').fullCalendar('refetchEvents');