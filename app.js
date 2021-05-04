// Note that to get income from the poverty index, we divide by 100 then multiply by about $13000 (the current poverty level for an individual)
//filter data
data = data.filter(d => d.systolic_bp > 0 && d.poverty_index > 0);

// Plot parameters 
const incomeFilterWidth = 50;
const ageFilterWidth = 5;

const width = 400;
const height = 400;
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

// axis scaling
const x = d3.scaleLinear()
  //.domain([0, d3.max(data, d => d['systolic_bp'])])
  .domain([60, 280])
  .range([margin.left, width-margin.right])
  .nice();

const y = d3.scaleLinear()
  //.domain([0, d3.max(data, d => d['serum_cholesterol'])])
  .domain([0, 500])
  .range([height - margin.bottom, margin.top])
  .nice();

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

let participants = svg
  .selectAll('circle')
  .data(data, d => d.index)
  .join('circle')
    .attr('opacity', backgroundDotOpacity)
    .attr('fill', d => backgroundDotColor)
    .attr('cx', d => x(d['systolic_bp']))
    .attr('cy', d => y(d['serum_cholesterol']))
    .attr('r', d => 2);

document.getElementById('mainChart').appendChild(svg.node());

let selectedAge = 35;
let selectedSex = 1;
let selectedPovertyIndex = 5;
let otherPovertyIndex = 10;

function onInputChange (e) {
  try {
    selectedAge = Number(ageInput.value);
  } catch(err) {
    // change styling of ageInput box here in future
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
  console.log('----')
  console.log(average(filteredData, 'systolic_bp'))

  participants = participants
    .data(filteredData, d => d.index)
    .join(
      enter => enter.remove().append('circle')
        .attr('fill', myDotColor)
        .attr('opacity', foregroundDotOpacity)
        .attr('cx', d => x(d.systolic_bp))
        .attr('cy', d => y(d.serum_cholesterol))
        .attr('r', d => 2),
      update => update.attr('fill', myDotColor).attr('opacity', foregroundDotOpacity),
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
  console.log(average(filteredData, 'systolic_bp'))

  participants = participants
    .data(filteredData, d => d.index)
    .join(
      enter => enter.remove().append('circle')
        .attr('fill', otherDotColor)
        .attr('opacity', foregroundDotOpacity)
        .attr('cx', d => x(d.systolic_bp))
        .attr('cy', d => y(d.serum_cholesterol))
        .attr('r', d => 2),
      update => update.attr('fill', intersectDotColor).attr('opacity', foregroundDotOpacity),
      exit => exit, // dont need to do anything here
    );
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

