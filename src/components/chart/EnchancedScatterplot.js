import React, { Component } from 'react';
import * as d3 from 'd3';
class ScatterPlot extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          selectedXAxis: "open",
          selectedYAxis: "sma(25)"         
        };
    
        this.xAxisOptions = [
        {"name":"sma(25)","startangle":5.4,"endangle":5,"color":"#9F6F2E","axis":'y'},
        {"name":"sma(125)","startangle":5,"endangle":4.6,"color":"#1E5B56","axis":'y'},
        {"name":"ema","startangle":4.6,"endangle":4.2,"color":"#5A1E5B","axis":'y'},        
        {"name":"open","startangle":3.8,"endangle":3.4,"color":" #9F2E2E","axis":'x'},
        {"name":"close","startangle":3.4,"endangle":3,"color":"#2E8540","axis":'x'},
        {"name":"high","startangle":3,"endangle":2.6,"color":" #1E5B9F","axis":'x'},    
    
    ];
       this.data=props["data"]["data"]
      
     
        
     
      }
  componentDidMount() {
    // Call the function to draw the scatter plot
    this.drawScatterPlot();
  }
  handleAxisChange = (option,axis) => {
 
    if(axis=='x')
    this.setState({ selectedXAxis: option });
    else
    this.setState({ selectedYAxis: option });
    
    // Call the function to update the circular glyph with the selected X axis
    this.drawScatterPlot();
  };



  generateArc(circleRadius, startAngle, endAngle, button_name) {        
        return d3.arc()({
            innerRadius: circleRadius,
            outerRadius: circleRadius + ([this.state.selectedXAxis,this.state.selectedYAxis].includes(button_name)?35:30),
            startAngle: startAngle,
            endAngle: endAngle,
        });
    }
    generateRSIArc(circleRadius,rsi,date){
 
        return d3.arc()({
            innerRadius: circleRadius,
            outerRadius: circleRadius + 30,
            startAngle: 6,
            endAngle: 6+(rsi/100)*2,
        });
    }
    dragHandler = (event) => {
        const rotation = event.x * 360 / this.svg.attr('width'); // Calculate rotation
        this.svg.attr('transform', `rotate(${rotation})`);
      }

     
  drawScatterPlot() {

    // Data
     // Chart dimensions and margins
     const width = 500;
     const height = 500;
     const marginTop = 120;
     const marginRight = 120;
     const marginBottom = 120;
     const marginLeft = 120;
     const circleRadius = 220;
     const circleX = width / 2;
     const circleY = height / 2;
     const scatter_x=135;
     const scatter_y=120;
     const scatter_width=250;
     const scatter_height=250;
     d3.select(this.chartRef).selectAll('*').remove();
     
   
   
     const calculateTotalLength  = (path) => d3.create("svg:path").attr("d", path).node().getTotalLength()
    // Positional encodings
    var x = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d[this.state.selectedXAxis])).nice()
      .range([marginLeft, width - marginRight]);

    var y = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d[this.state.selectedYAxis])).nice()
      .range([height - marginBottom, marginTop]);

    var line = d3.line()
      .curve(d3.curveCatmullRom)
      .x(d => x(d[this.state.selectedXAxis]))
      .y(d => y(d[this.state.selectedYAxis]));

  
    this.svg = d3.select(this.chartRef)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-50,0,600,500])
      .attr("style", "max-width: 100%; height: auto;padding: 30px;")//.call(d3.drag().on('drag', this.dragHandler)); 
     
    
  
      

    const l = calculateTotalLength(line(this.data));
   
    var xAxis=this.svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80))
      .call(g => g.select(".domain").attr("display", "none"))
      .call(g => g.append("text")
        .attr("x", width -85)
        .attr("y", 4)
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("fill", "currentColor")
        .text(this.state.selectedXAxis));
    
    var yAxis=this.svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(width / 80))
      .call(g => g.select(".domain").attr("display", "none"))
      .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 4)
        .attr("y", -10)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(this.state.selectedYAxis));



     // Add a clipPath: everything out of this area won't be drawn.
  var clip = this.svg.append("defs").append("SVG:clipPath")
  .attr("id", "clip")
  .append("SVG:rect")
  .attr("width", scatter_width )
  .attr("height", scatter_height )
  .attr("x", scatter_x)
  .attr("y", scatter_y);
  const zoom=d3.zoom()
  .scaleExtent([1, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
  //.translateExtent([[0, 0], [width, height]])
  //.extent([[marginLeft, marginRight], [width-marginLeft, height-marginRight]])
  .on("zoom",zoomed);  
  this.svg.append("rect")
  .attr("width", scatter_width)
  .attr("height", scatter_height)
  .style("fill", "none")
  .style("pointer-events", "all")
  .attr('transform', 'translate(' + scatter_x + ',' + scatter_y + ')')
  .call(zoom);
// Create the scatter variable: where both the circles and the brush take place
  var scatter = this.svg.append('g')
  .attr("clip-path", "url(#clip)")

    var gLine=scatter.append("path")
      .datum(this.data)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("r", 2.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-dasharray", `0,${l}`)
      .attr("d", line)
      .attr("stroke-dasharray", `${l},${l}`);
     
     
    this.svg.append("path")
      .attr("id", "arc_rsi" )       
      .attr('d', this.generateArc(circleRadius,8,6))
      .attr("transform", "translate(250,250)")
      .attr('fill', "black")    

    var rsi_path=this.svg.append("path")
      .attr("id", "arc_rsi" )       
      .attr('d', this.generateRSIArc(circleRadius,this.data[0]['rsi'],this.data[0]['date']))
      .attr("transform", "translate(250,250)")
      .attr('fill',this.data[0]['rsi']>=70?"green":"red")
      
    var gDot=scatter.append("g")
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .selectAll("circle")
      .data(this.data)
      .join("circle")
      .attr("cx", d => x(d[this.state.selectedXAxis]))
      .attr("cy", d => y(d[this.state.selectedYAxis]))
      .attr("r", 1)
      .on('mouseover', (event,d) => { 
        rsi_path.transition()
        .duration(200) // Animation duration in milliseconds
        .attr('d', this.generateRSIArc(circleRadius,d.rsi,d.date))
        .attr('fill',d.rsi>=70?"green":"red")
      
        });
       
  
    this.svg.append('circle')
        .attr('cx', circleX)
        .attr('cy', circleY)
        .attr('r', circleRadius)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
  
    // Add buttons as arcs on the right and bottom side of the circle
   
    this.svg.selectAll('buttons').data(this.xAxisOptions).enter().append("path")
        .attr("id", d=>  "button_"+d.name )       
        .attr('d',(d) => this.generateArc(circleRadius, d.startangle, d.endangle,d.name))
        .attr("transform", "translate(250,250)")
        .attr('fill', d=> d.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style("cursor", "pointer")
        .attr('class', 'arc-button')
        .on('click', (event,d) => this.handleAxisChange(d.name,d.axis));
    
 
        
    

    //button labels
   this.svg.selectAll('button_lables').data(this.xAxisOptions).enter().append("text").attr('dy', '-.5em').append("textPath")
    .join("textPath")
    .attr("xlink:href",  d=>  "#button_"+d.name ) //place the ID of the path here
    .style("text-anchor","middle") //place the text halfway on the arc
    .attr("startOffset", "20%")    
    .attr('fill', 'white')
    .attr('font-size', '20px')    
    .text( d=>  d.name)
    .style("cursor", "pointer")    
    .on('click',(event,d) => this.handleAxisChange(d.name,d.axis));
 

    var elem=this
    function zoomed({transform}){
      
      var zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
      var zy = transform.rescaleY(y).interpolate(d3.interpolateRound);    
      gLine.attr("transform", transform).attr("stroke-width", 1 / transform.k);     
      xAxis.call(d3.axisBottom(zx));      
      yAxis.call(d3.axisLeft(zy));
      gDot
      .attr('cx', function(d) {return zx(d[elem.state.selectedXAxis])})
      .attr('cy', function(d) {return zy(d[elem.state.selectedYAxis])});
    
    }
   
   
   // scatter.call(zoom).call(zoom.transform, d3.zoomIdentity);

    }
    
  

    
   

  render() {
    return (
      <svg ref={ref => this.chartRef = ref}></svg>
    );
  }
}

export default ScatterPlot;
