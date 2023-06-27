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
            // asegurarse de que cada jugador tenga un registro para cada temporada
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

    // establecer los márgenes y las dimensiones del gráfico
    let margin = {top: 20, right: 80, bottom: 30, left: 50};
    let width = 960 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    // configurar las escalas x e y
    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);

    // configurar el generador de líneas
    let line = d3.line()
        //.x(function(d) { return x(d.season) + x.bandwidth() / 2; }) // coloca cada punto en el centro de su banda
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
    svg.append("defs").append("clipPath") // define un clipPath dentro de 'defs'
        .attr("id", "areaClip") // asignar un ID
        .append("rect") // agregar un rectángulo dentro del clipPath
        .attr("width", width) // el rectángulo tiene el mismo tamaño que el área del gráfico
        .attr("height", height); 



    let lineGroup = svg.append("g")
        .attr("class", "line-group")
        .attr("clip-path", "url(#areaClip)"); 

    let legendGroup = svg.append("g")
        .attr("class", "legend-group");


    // agregar el eje X
    svg.append("g")
        .attr("class", "eje-x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    // agregar el eje Y
    svg.append("g")
        .attr("class", "eje-y")
        .call(d3.axisLeft(y));




// definir el manejador del zoom
const manejadorZoom = (evento) => {
    const transformacion = evento.transform;

    
    // Actualizamos posición y tamaño usando transform
    lineGroup.attr("transform", transformacion);
    legendGroup.attr("transform", transformacion);
    //svg.selectAll(".line").attr("transform", transformacion);
    
    //y.domain([27000,39000]);
    // Ajustamos escalas. Esta función solo sirve con escalas continuas.
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

// dibujar las líneas
document.getElementById("playButton").addEventListener("click", function() {

    if (lineGroup.selectAll(".line").empty()) {
    processedData.forEach(function(playerData, i) {
        //let path = svg.append("path")
        let path = lineGroup.append("path")
            .datum(playerData.values)
            .attr("fill", "none")
            .attr("stroke", function() { return d3.schemeCategory10[i % 10]; }) // alternar colores
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("class", "line")
            .attr("d", line);

        // agregar animación
        let totalLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // agregar leyenda
        let legend = legendGroup.append("text")
            .datum({name: playerData.name, value: playerData.values[0]})
            .attr("class", "leyenda")
            .attr("x", 3)
            .attr("dy", "0.35em ")  // separar cada leyenda por 15px
            .style("font", "10px sans-serif")
            .text(function(d) { return d.name; });




        // agregar animación a la leyenda
        legend.transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attrTween("transform", function(d) {
                //let interpolate = d3.interpolateNumber(0, playerData.values.length - 1);
                let interpolate = d3.interpolateNumber(0, totalLength);
                return function(t) {
                    let p = path.node().getPointAtLength(interpolate(t));
                    return "translate(" + p.x + "," + p.y + ")";
                };
            })
            
            .end() // cuando la transición termine
            .then(() => {
                // define a dónde quieres hacer zoom, y cuánto (esto dependerá de tus datos y de cómo quieras que se vea el zoom)
                let xZoom = -500;
                let yZoom = 20; 
                let escalaZoom = 2; 
    
                // obtén una transformación de identidad y define la posición y la escala a la que hacer zoom
                let transformacionZoom = d3.zoomIdentity.scale(escalaZoom).translate(xZoom, yZoom);
    
                // aplica esta transformación
                svg.transition().duration(1000).call(zoom.transform, transformacionZoom);
            });
    });
    }
});
const reinicio = d3.select("#replayButton");
reinicio.on("click", () => {
    // Obtenemos una transformación identidad (x=0, y=0, k=1)
    const transformacion = d3.zoomIdentity;
    // De forma elegante (con transition) aplicamos esta transformación
    svg.transition().duration(1000).call(zoom.transform, transformacion);

    // Selecciona todas las líneas y elimínalas
    d3.selectAll(".line").remove();

    // Selecciona todos los textos de la leyenda y elimínalos
    d3.selectAll(".leyenda").remove();
  });
});