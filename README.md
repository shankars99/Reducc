# Reducc
A mobile app built on flutter that works on encoded data and summarizes your bod of text


<h1>Install the required files </h1> </br> 

install ngrok from [here](https://ngrok.com/) or any other port forwarding software

/server:</br>
`npm install` </br>

/client-react:</br>
`pip install libnum` </br>
`pip install Crypto` </br>
`pip install flask` </br>

<h1>Get the backend going </h1> </br>

i) Start flask server
```
cd server/
export FLASK_APP=reducc_server
flask run
```
ii) Get the ngrok going
```
cd PATH_TO_NGROK
ngrock https 5000
```

now you would see a url that ends with ngrok.io, paste that into client-react/app.js into the variable `url`

<h1>Get the android stuff going </h1> </br>

i) Install expo on your phone

ii) Run the app
```
cd client-react/
expo start
```
you would now see a QR code, scan that on the expo app

