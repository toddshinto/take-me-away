# take-me-away
* An application created during a 48-hour hackathon to calculate the farthest possible destination from any major city.
* Returns a link to purchase a one-way plane ticket.

[![livesite][1]][2]

[1]:  /logo.png
[2]:  https://take-me-away.toddshinto.com "Redirect to homepage"

### [Live Site](https://take-me-away.toddshinto.com)

## Technologies
* JavaScript (ES6)
* CSS3
* HTML5
* NodeJS
* Express

## Current Features
* User can input any major city
* Antipode is calculated based on major city
* User is given the cheapest flight as returned by Skyscanner
  * The Skyscanner API returns only cached results as of May 2020
* User can view distance to destination relative to maximum distance (12,450 miles)

## Planned Features
* Increase specificity of search area
  * Requires more specific geographic data regarding coastlines
* Alternative to using the Skyscanner API
* User can view distance on a map

## Instructions
#### You will need:
* NodeJS
#### 1. Clone the repo
`git clone https://github.com/toddshinto/take-me-away.git`
#### 2. Install dependencies
`npm install`
#### 3. Rename `.env.example` to `.env` and insert your server key:
`GOOGLE_API_KEY=AAAUUUGGGHHH1111`
#### 4. Rename `server/public/browser-key-example.js` to `browser-key.js` and insert your browser keys:
`const browserKey=KKKKOOOOBBBBEEEE2222`

`const rapidAPIKey=RRRRROOOOOCCCCKKKK3333`
#### 5. Run the server
`node index.js`
#### 6. Visit localhost:3001 in browser
![start-screen](/start-screen-takeaway.gif)


### Support
Reach out to me at one of these places!
* Website at [toddshinto.com](https://toddshinto.com)
* Email at <toddshinto@gmail.com>
