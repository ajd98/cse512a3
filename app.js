// Note that to get income from the poverty index, we divide by 100 then multiply by about $13000 (the current poverty level for an individual)
//filter data
data = data.filter(d => d.systolic_bp > 0);

// Plot parameters 
const filterWidth = 5;
const width = 400;
const height = 400;
const margin = {
  left: 40,
  right: 10,
  top: 10,
  bottom: 40
};
const backgroundDotColor = "#333";
const backgroundDotOpacity = 0.01;
const myDotColor = "#e33";
const comparisonDotColor = "#33e";
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

document.body.appendChild(svg.node());

const slider = document.getElementById('income_slider');

function onIncomeChange (e) {
  console.log(slider.value);
  filteredData = data.filter(d => ((d.poverty_index > slider.value - filterWidth) && (d.poverty_index < slider.value + filterWidth)));
  console.log('filtered');

  participants = participants
    .data(filteredData, d => d.index)
    .join(
      enter => enter.remove().append('circle')
        .attr('fill', myDotColor)
        .attr('opacity', foregroundDotOpacity)
        .attr('cx', d => x(d.systolic_bp))
        .attr('cy', d => y(d.serum_cholesterol))
        .attr('r', d => 2),
      //enter => {
      //  try { 
      //    enter
      //      .attr('fill', myDotColor)
      //      .attr('opacity', foregroundDotOpacity)
      //      .attr('cx', d => x(d.systolic_bp))
      //      .attr('cy', d => y(d.serum_cholesterol))
      //      .attr('r', d => 2)
      //  } catch(err) {
      //    //pass 
      //  }
      //},
      update => update.attr('fill', myDotColor).attr('opacity', foregroundDotOpacity),
      exit => exit.attr('fill', '#000').attr('opacity', backgroundDotOpacity)
    );
}
slider.addEventListener('change', onIncomeChange);
