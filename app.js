// Note that to get income from the poverty index, we divide by 100 then multiply by about $13000 (the current poverty level for an individual)
//filter data
data = data.filter(d => d.systolic_bp > 0 && d.poverty_index > 0);

// Plot parameters 
const incomeFilterWidth = 50;
const ageFilterWidth = 5;

const width = 600;
const height = 600;
const margin = {
  left: 40,
  right: 10,
  top: 10,
  bottom: 40
};
const backgroundDotColor = "#303030";
const backgroundDotOpacity = 0.01;
const myDotColor = "#e03030";
const otherDotColor = "#3030e0";
const intersectDotColor = "#a730b7";
const foregroundDotOpacity = 0.5;
const annotationLineColor = "#606060";

// axis scaling
const minBP = 60;
const maxBP = 200
const x = d3.scaleLinear()
  .domain([minBP, maxBP])
  .range([margin.left, width-margin.right])
  .nice();

const minCholesterol = 50;
const maxCholesterol = 400;
const y = d3.scaleLinear()
  .domain([minCholesterol, maxCholesterol])
  .range([height - margin.bottom, margin.top])
  .nice();

//filter data to remove points beyond axes
data = data.filter(d => (minBP < d.systolic_bp) 
                        && (maxBP > d.systolic_bp) 
                        && (minCholesterol < d.serum_cholesterol)
                        && (maxCholesterol > d.serum_cholesterol)
);

// create an svg
const svg = d3.create('svg')
  .attr('width', width)
  .attr('height', height);

// bottom axis and label
svg.append('g')
  .attr('transform', `translate(0, ${height - margin.bottom})`)
  .call(d3.axisBottom(x))
  .append('text')
    .attr('text-anchor', 'end')
    .attr('fill', 'black')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('x', width - margin.right)
    .attr('y', -10)
    .text('Systolic BP (mmHg)');

// left axis and label
svg.append('g')
  .attr('transform', `translate(${margin.left}, 0)`)
  .call(d3.axisLeft(y))
  .append('text')
    .attr('transform', `translate(20, ${margin.top}) rotate(-90)`)
    .attr('text-anchor', 'end')
    .attr('fill', 'black')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .text('Cholesterol (mg/dL)');

// Cholesterol annotation line
highCholesterolThreshold = 240;
svg.append('line')
  .attr('x1', x(minBP))
  .attr('y1', y(highCholesterolThreshold))
  .attr('x2', x(maxBP))
  .attr('y2', y(highCholesterolThreshold))
  .attr('stroke', annotationLineColor);
svg.append('text')
  .attr('x', x(maxBP))
  .attr('y', y(highCholesterolThreshold))
  .attr('text-anchor', 'end')
  .attr('font-size', '12px')
  .attr('dy', '-5px')
  .text("High cholesterol");

// Blood pressure annotation line 
highBPThreshold = 140;
lowBPThreshold = 90;
svg.append('line')
  .attr('x1', x(highBPThreshold))
  .attr('y1', y(minCholesterol))
  .attr('x2', x(highBPThreshold))
  .attr('y2', y(maxCholesterol))
  .attr('stroke', annotationLineColor);
svg.append('text')
  .attr('transform', `translate(${x(highBPThreshold)}, ${y(maxCholesterol)}) rotate(-90)`)
  .attr('text-anchor', 'end')
  .attr('font-size', '12px')
  .attr('dy', '-5px')
  .text("High BP");
svg.append('line')
  .attr('x1', x(lowBPThreshold))
  .attr('y1', y(minCholesterol))
  .attr('x2', x(lowBPThreshold))
  .attr('y2', y(maxCholesterol))
  .attr('stroke', annotationLineColor);
svg.append('text')
  .attr('transform', `translate(${x(lowBPThreshold)}, ${y(maxCholesterol)}) rotate(-90)`)
  .attr('text-anchor', 'end')
  .attr('font-size', '12px')
  .attr('dy', '-5px')
  .text("Low BP");

// Main plot; setup background gray marks for now
let participants = svg
  .selectAll('circle')
  .data(data, d => d.index)
  .join('circle')
    .attr('opacity', backgroundDotOpacity)
    .attr('fill', d => backgroundDotColor)
    .attr('cx', d => x(d['systolic_bp']))
    .attr('cy', d => y(d['serum_cholesterol']))
    .attr('r', d => 2)
    .attr('class', 'dataElement');

document.getElementById('mainChart').appendChild(svg.node());

// Selection parameters
let selectedAge = 35;
let selectedSex = 1;
let selectedPovertyIndex = 5;
let otherPovertyIndex = 10;

//Initialize average parameters
let averages = {
  my: {x: -1, y: -1, color: myDotColor},
  other: {x: -1, y: -1, color: otherDotColor}
};
let myAverageMark = null;
let otherAverageMark = null;


function onInputChange (e) {
  selectedAge = Number(ageInput.value);
  if (isNaN(selectedAge)) {
    ageInput.style.border = "1px solid red";
  } else {
    ageInput.style.border = "1px solid black";
  }
  selectedSex = Number(sexInput.value);
  selectedPovertyIndex = Number(myIncomeSlider.value);
  otherPovertyIndex = Number(otherIncomeSlider.value);

  // filter the data for people similar to the user 
  filteredData = data.filter(
    d => (
      (d.poverty_index > selectedPovertyIndex - incomeFilterWidth) 
      && (d.poverty_index < selectedPovertyIndex + incomeFilterWidth)
      && (d.age > selectedAge - ageFilterWidth)
      && (d.age < selectedAge + ageFilterWidth)
      && (d.sex == selectedSex)
    )
  );
  averages.my.x = average(filteredData, 'systolic_bp');
  averages.my.y = average(filteredData, 'serum_cholesterol');

  participants = svg.selectAll('.dataElement') // select elements of class dataElement
    .data(filteredData, d => d.index)
    .join(
      enter => enter
        .attr('fill', myDotColor)
        .attr('opacity', foregroundDotOpacity)
        .attr('cx', d => x(d.systolic_bp))
        .attr('cy', d => y(d.serum_cholesterol))
        .attr('r', d => 2),
      update => update
        .attr('fill', myDotColor)
        .attr('opacity', foregroundDotOpacity),
      exit => exit
        .attr('fill', backgroundDotColor)
        .attr('opacity', backgroundDotOpacity)
        .attr('cx', d => x(d.systolic_bp))
        .attr('cy', d => y(d.serum_cholesterol))
        .attr('r', d => 2),
    );

  // filter the data for people with the selected other income
  filteredData = data.filter(
    d => (
      (d.poverty_index > otherPovertyIndex - incomeFilterWidth) 
      && (d.poverty_index < otherPovertyIndex + incomeFilterWidth)
      && (d.age > selectedAge - ageFilterWidth)
      && (d.age < selectedAge + ageFilterWidth)
      && (d.sex == selectedSex)
    )
  );
  averages.other.x = average(filteredData, 'systolic_bp');
  averages.other.y = average(filteredData, 'serum_cholesterol');

  participants = svg.selectAll('.dataElement') // select elements of class dataElement
    .data(filteredData, d => d.index)
    .join(
      enter => enter
        .attr('fill', otherDotColor)
        .attr('opacity', foregroundDotOpacity)
        .attr('cx', d => x(d.systolic_bp))
        .attr('cy', d => y(d.serum_cholesterol))
        .attr('r', d => 2),
      update => update
        .attr('fill', otherDotColor)
        .attr('opacity', foregroundDotOpacity),
      exit => exit, // dont need to do anything here
    );

  // filter the data for people in the intersection 
  filteredData = data.filter(
    d => (
      (d.poverty_index > otherPovertyIndex - incomeFilterWidth) 
      && (d.poverty_index < otherPovertyIndex + incomeFilterWidth)
      && (d.poverty_index > selectedPovertyIndex - incomeFilterWidth)
      && (d.poverty_index < selectedPovertyIndex + incomeFilterWidth)
      && (d.age > selectedAge - ageFilterWidth)
      && (d.age < selectedAge + ageFilterWidth)
      && (d.sex == selectedSex)
    )
  );

  participants = svg.selectAll('.dataElement') // select elements of class dataElement
    .data(filteredData, d => d.index)
    .join(
      enter => enter
        .attr('fill', intersectDotColor)
        .attr('opacity', foregroundDotOpacity)
        .attr('cx', d => x(d.systolic_bp))
        .attr('cy', d => y(d.serum_cholesterol))
        .attr('r', d => 2),
      update => update
        .attr('fill', intersectDotColor)
        .attr('opacity', foregroundDotOpacity),
      exit => exit, // dont need to do anything here
    );

  // place average marks
  try {
    myAverageMark.remove();
  } catch(err) {
    //pass
  }
  try {
    otherAverageMark.remove();
  } catch(err) {
    //pass
  }
  //myAverageMark = svg.append('g');
  //myAverageMark.append('line')
  //  .attr('x1', x(averages.my.x))
  //  .attr('y1', y(minCholesterol))
  //  .attr('x2', x(averages.my.x))
  //  .attr('y2', y(maxCholesterol))
  //  .attr('stroke', myDotColor);
  //myAverageMark.append('line')
  //  .attr('x1', x(minBP))
  //  .attr('y1', y(averages.my.y))
  //  .attr('x2', x(maxBP))
  //  .attr('y2', y(averages.my.y))
  //  .attr('stroke', myDotColor);

  //otherAverageMark = svg.append('g');
  //otherAverageMark.append('line')
  //  .attr('x1', x(averages.other.x))
  //  .attr('y1', y(minCholesterol))
  //  .attr('x2', x(averages.other.x))
  //  .attr('y2', y(maxCholesterol))
  //  .attr('stroke', otherDotColor);
  //otherAverageMark.append('line')
  //  .attr('x1', x(minBP))
  //  .attr('y1', y(averages.other.y))
  //  .attr('x2', x(maxBP))
  //  .attr('y2', y(averages.other.y))
  //  .attr('stroke', otherDotColor);

  myAverageMark = svg.append('circle')
    .attr('fill', myDotColor)
    .attr('stroke', 'black')
    .attr('opacity', 1)
    .attr('cx', x(averages.my.x))
    .attr('cy', y(averages.my.y))
    .attr('r', 5);
  otherAverageMark = svg.append('circle')
    .attr('fill', otherDotColor)
    .attr('stroke', 'black')
    .attr('opacity', 1)
    .attr('cx', x(averages.other.x))
    .attr('cy', y(averages.other.y))
    .attr('r', 5);
  return Object.assign(svg.node(), {onInputChange});
}

function average(array, attribute) {
  let total = 0;
  for(var i = 0; i < array.length; i++) {
    total += array[i][attribute];
  }
  return total/array.length
}

const myIncomeSlider = document.getElementById('myIncomeSlider');
myIncomeSlider.addEventListener('input', onInputChange);
myIncomeSlider.addEventListener('change', onInputChange);
const otherIncomeSlider = document.getElementById('otherIncomeSlider');
otherIncomeSlider.addEventListener('input', onInputChange);
otherIncomeSlider.addEventListener('change', onInputChange);
const ageInput = document.getElementById('ageInput');
ageInput.addEventListener('change', onInputChange);
const sexInput = document.getElementById('sexInput');
sexInput.addEventListener('change', onInputChange);
onInputChange();

