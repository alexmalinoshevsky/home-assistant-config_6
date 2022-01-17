const webhook_host = "FQDN"
const webhook_location = "SECRET_WEBHOOK_ID"
const webhook_url= `https://${webhook_host}/api/webhook/${webhook_location}`

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

function generateRandomNumber() {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math
    .random() * (maxm - minm + 1)) + minm;
}

async function handleRequest(request) {
  let requestHeaders = Object.fromEntries(request.headers)
  // Generate OTP
  otp = generateRandomNumber()
  email = requestHeaders["cf-access-authenticated-user-email"] || "unknown"

  const html = `<!DOCTYPE html>
  <head>
  <script>
  var timeleft = 30;
  var downloadTimer = setInterval(function(){
    if(timeleft <= 0){
      clearInterval(downloadTimer);
    document.innerHTML = "<strong>Your code has expired. Refresh to get a new one</strong>";
    document.getElementById("message").innerHTML = "<strong>Your code has expired. Refresh page to get a new one</strong>";

    }
    document.getElementById("time").innerHTML = timeleft;
    timeleft -= 1;
    }, 1000);
  </script>
  </head>
  <body>
    <span id=message>Hi ${requestHeaders["cf-access-authenticated-user-email"]}, your one time unlock code is <span id=code><strong>${otp}</strong></span>. Use this at the garage exterior door behind the gate. <span id=remain>This code will expire in <span id=time>30</span> seconds</span>.</span>
  </body>`

  body = {
    "otp": otp,
    "email": email
  }

  // Add code to lock
  const init = {
    body: JSON.stringify(body),
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  }
  const response = await fetch(webhook_url, init)

  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  })
}