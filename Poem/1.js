const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Poem 1</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #111214;
      color: #ffffff;
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 14px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
    }
    .poem-wrap {
      max-width: 680px;
      width: 100%;
    }
    .poem-wrap p {
      line-height: 1.9;
      white-space: pre-wrap;
    }
    .back {
      display: inline-block;
      margin-bottom: 2.5rem;
      color: rgba(255,255,255,0.4);
      font-size: 13px;
      text-decoration: none;
      letter-spacing: 0.06em;
      transition: color 0.2s;
    }
    .back:hover { color: rgba(255,255,255,0.8); }
  </style>
</head>
<body>
  <div class="poem-wrap">
    <a class="back" href="/">&#8592; Back</a>
    <p>Brooklyn, the root of my infectious love,
Brooklyn, straining my heart under heavy love.
I long to hold you in close comforts, like roses in vases, and shoes with laces.
Beautiful Brooklyn, fan out the flames of my love;
Your benevolence drifts naturally with the seas; I love the way your calming laughter flutters upon the breeze.
You were unfairly detested and scorned upon,
but you seem to be defined not by despair, but by your great care.
Your masses of beauty bring out the best in me; ever still, you confuse me till I count my misfortune.
Your rapid choices and wild turns leave me lost in wonder; till when will I witness your first-hand love,
in all my commitments to reforming a stable life together?</p>
  </div>
</body>
</html>`);
});

module.exports = app;
