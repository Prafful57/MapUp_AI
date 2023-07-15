const express = require("express");
const turf = require("@turf/turf");
const jwt = require("jsonwebtoken");
const lines = require("./spreadLines");
const app = express();
//this will allow to large payload
app.use(express.json({ limit: "10mb" }));
require("dotenv").config();

//we are verifying token here
const verifyToken = (req, res, next) => {
  //here we are assigning the key value we are passing the token from query or from body
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(400).send("A token is required for authentication");
  }
  try {
    //we are decoding the token here we are passing the token and key
    const decoded = jwt.verify(token, process.env.TOKEN);
    req.user = decoded;
  } catch (err) {
    return res.status(400).send("Invalid Token");
  }
  return next();
};

//this is the api to generate 5k points
app.post("/points", (req, res) => {
  function generatePoints(count) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const longitude = getRandomNumber(-122.5, -122.3);
      const latitude = getRandomNumber(37.7, 37.9);
      points.push([longitude, latitude]);
    }
    return points;
  }
  function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  const points = generatePoints(5000);
  return res.json(points);
});

//this api will generate token
app.post("/token", (req, res) => {
  try {
    // Generate the JWT token
    const token = jwt.sign({}, process.env.TOKEN, { expiresIn: "1h" });

    // Send the token as the API response
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

// POST /intersections route handler
app.post("/intersections", verifyToken, (req, res) => {
  const { linestring } = req.body;
  if(linestring.coordinates.length==0){
    return res.status(500).json({ error: "Empty Coordinates" });
}
  // Check if the linestring is provided and is a valid GeoJSON LineString
  if (
    !linestring ||
    linestring.type !== "LineString" ||
    !Array.isArray(linestring.coordinates)
  ) {
    return res.status(500).json({ error: "Invalid linestring" });
  }
  // Array to store intersecting line IDs and intersection points
  const intersections = [];
  // it iterates over the lines and check for intersections
  for (let i = 0; i < lines.length; i++) {
    const line = turf.lineString(lines[i]);

    // Check for intersection
    const intersect = turf.lineIntersect(linestring, line);

    // If an intersection is found, store the line ID and intersection point
    if (intersect.features.length > 0) {
      intersections.push({
        lineId: `L${i + 1}`,
        intersectionPoint: intersect.features[0].geometry.coordinates,
      });
    }
  }

  // Return the result
  res.json(intersections);
});

// Start the server
app.listen(3003, () => {
  console.log("Server started on port 3003");
});
