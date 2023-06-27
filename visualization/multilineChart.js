// cargar los datos desde el archivo JSON
d3.json("../dataset/players_data.json").then(function(data) {

    // obtener todas las temporadas 
    let allSeasons = [];
    for (let player in data) {
        for (let season in data[player]) {
            if (!allSeasons.includes(season)) {
                allSeasons.push(season);
            }
        }
    }
    allSeasons.sort();

    // procesar los datos 
    let processedData = [];
    let totalPointsArray = [];
    for (let player in data) {
        let playerData = {
            name: player,
            values: []
        };
        let totalPoints = 0; // contador acumulativo de puntos
        for (let season of allSeasons) {
            if (data[player][season] !== undefined) {
                totalPoints += data[player][season];
            }
            playerData.values.push({
                season: season,
                points: totalPoints
            });
            if (totalPoints > 0) {
                totalPointsArray.push(totalPoints);
            }
        }
        processedData.push(playerData);
    }

    let margin = {top: 20, right: 80, bottom: 30, left: 50};
    let width = 960 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);

    let line = d3.line()
        .x(function(d) { return x(new Date(d.season)); })
        .y(function(d) { return y(d.points); });

    x.domain(d3.extent(allSeasons, function(d) { return new Date(d); }));

    y.domain([
        0,
        d3.max(processedData, function(c) { return d3.max(c.values, function(d) { return d.points; }); })
    ]);

    // agregar un SVG al cuerpo del documento
    let svg = d3.select("#multilineChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // definir el clipPath
    svg.append("defs").append("clipPath") 
        .attr("id", "areaClip") 
        .append("rect") 
        .attr("width", width) 
        .attr("height", height); 


    let myG = svg.append("g")
    .attr("clip-path", "url(#areaClip)"); 


    let lineGroup = myG.append("g")
        .attr("class", "line-group")

    let legendGroup = svg.append("g")
        .attr("class", "legend-group");


    svg.append("g")
        .attr("class", "eje-x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("class", "eje-y")
        .call(d3.axisLeft(y));

    svg.append("text")             
    .attr("transform",
            "translate(" + (width/2) + " ," + 
                            (height + margin.top - 20) + ")") 
    .style("text-anchor", "middle")
    .text("Año");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Puntos Acumulados"); 
    
const manejadorZoom = (evento) => {
    const transformacion = evento.transform;

    // Actualizamos posición y tamaño usando transform
    lineGroup.attr("transform", transformacion);
    legendGroup.attr("transform", transformacion);
    const escalaY2 = transformacion.rescaleY(y);
    const escalaX2 = transformacion.rescaleX(x);

    console.log(escalaX2.domain());
    console.log(escalaY2.domain());

    // Actualizamos las escalas en la visualización
    svg.select(".eje-x").call(d3.axisBottom(escalaX2));
    svg.select(".eje-y").call(d3.axisLeft(escalaY2));

};


// Crear objeto zoom
const zoom = d3.zoom()
    .scaleExtent([0.5, 2]) // rango de escalas (máximo alejarse 0.5 y acercarse el doble)
    .extent([[0, 0], [width, height]])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", manejadorZoom); // conectar el evento de zoom con nuestro manejador de zoom

// Conectar el objeto zoom con el SVG
svg.call(zoom);

document.getElementById("playButton").addEventListener("click", function() {

    let lines = lineGroup.selectAll(".line")
        .data(processedData, function(d) { return d.name; });

    let paths = {};
    let newLines = lines.enter().append("path")
        .attr("fill", "none")
        .attr("stroke", function(d, i) { return d3.schemeCategory10[i % 10]; })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .each(function(playerData) {
            let path = d3.select(this);
            let totalLength = path.node().getTotalLength();

            paths[playerData.name] = {path: path, totalLength: totalLength};

            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(8000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
        });

    lines.exit().remove();

    let legends = legendGroup.selectAll(".leyenda")
        .data(processedData, function(d) { return d.name; });

    legends.enter().append("text")
        .attr("class", "leyenda")
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d) { return d.name; })
        .transition()
        .duration(8000)
        .ease(d3.easeLinear)
        .attrTween("transform", function(d) {
            let path = paths[d.name].path;
            let totalLength = paths[d.name].totalLength;

            let interpolate = d3.interpolateNumber(0, totalLength);
            return function(t) {
                let p = path.node().getPointAtLength(interpolate(t));
                return "translate(" + p.x + "," + p.y + ")";
            };
        })
        .end()
        .then(() => {
            let xZoom = -600;
            let yZoom = 16; 
            let escalaZoom = 3; 

            let transformacionZoom = d3.zoomIdentity.scale(escalaZoom).translate(xZoom, yZoom);

            svg.transition().duration(2000).call(zoom.transform, transformacionZoom);
            legendGroup.selectAll(".leyenda").style("font", "5px sans-serif");
        });

    legends.exit().remove();

});


const reinicio = d3.select("#replayButton");
reinicio.on("click", () => {
    // Obtenemos una transformación identidad (x=0, y=0, k=1)
    const transformacion = d3.zoomIdentity;
    // De forma elegante (con transition) aplicamos esta transformación
    svg.transition().duration(1000).call(zoom.transform, transformacion);

    d3.selectAll(".line").remove();

    d3.selectAll(".leyenda").remove();
  });
});