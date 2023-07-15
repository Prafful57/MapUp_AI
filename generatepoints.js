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
  console.log(points);