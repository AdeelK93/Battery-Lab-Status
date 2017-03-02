// Basic math and statistics functions

const sum = arr => arr.reduce((a,b) => a+b);

const mean = arr => sum(arr)/arr.length;

const variance = arr => {
  const avg = mean(arr)
  return mean(arr.map(num => Math.pow(num - avg, 2)))
};


export { sum, mean, variance };
