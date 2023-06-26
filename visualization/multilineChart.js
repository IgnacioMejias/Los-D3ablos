// cargar los datos desde el archivo JSON
d3.json("../players_data.json").then(function (data) {
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
  for (let player in data) {
    let playerData = {
      name: player,
      values: [],
    };
    let totalPoints = 0;
    for (let season of allSeasons) {
      if (data[player][season] !== undefined) {
        totalPoints += data[player][season];
      }
      playerData.values.push({
        season: season,
        points: totalPoints,
      });
    }
    processedData.push(playerData);
  }

  // establecer los márgenes y las dimensiones del gráfico
  let margin = { top: 20, right: 80, bottom: 30, left: 50 };
  let width = 960 - margin.left - margin.right;
  let height = 500 - margin.top - margin.bottom;

  // configurar las escalas x e y
  let x = d3.scaleBand().range([0, width]).padding(0.1);
  let y = d3
    .scaleLinear()
    .range([height, 0])
    .domain([
      0,
      d3.max(processedData.flatMap((d) => d.values.map((p) => p.points))),
    ]);

  // configurar el generador de líneas
  let line = d3
    .line()
    .x(function (d) {
      return x(d.season) + x.bandwidth() / 2;
    })
    .y(function (d) {
      return y(d.points);
    });

  // agregar un SVG al cuerpo del documento
  let svg = d3
    .select("#multilineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // definir el dominio para las escalas x e y
  x.domain(allSeasons);
  y.domain([
    0,
    d3.max(processedData, function (c) {
      return d3.max(c.values, function (d) {
        return d.points;
      });
    }),
  ]);

  // agregar el eje X
  svg
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  // agregar el eje Y
  svg.append("g").attr("class", "yaxis").call(d3.axisLeft(y));

  const circle = svg
    .append("circle")
    .attr("r", 50)
    .attr("fill", "orange")
    .attr("stroke", "black")
    .attr("cx", 200)
    .attr("cy", 100);

  // Función encargada de manejar el zoom.
const manejadorZoom = (evento) => {
    const transformacion = evento.transform;
  
    // Actualizar la escala y en función de la transformación del zoom
    let newY = transformacion.rescaleY(y);
  
    // Actualizar el eje y con la nueva escala
    svg.select(".yaxis").call(d3.axisLeft(newY));
  
    // Actualizar las líneas con la nueva escala
    svg.selectAll(".line")
      .attr("d", function (d) {
        return line(d.values);
      });
  
    // Actualizar las posiciones de los elementos legend
    svg.selectAll("text")
      .attr("transform", function (d) {
        if (d.values && Array.isArray(d.values)) {
        let seasonIndex = Math.round(d3.interpolateNumber(0, d.values.length - 1)(transformacion.k));
        return "translate(" + x(d.values[seasonIndex].season) + "," + newY(d.values[seasonIndex].points) + ")";
        } else {
            console.log(d);
        }
      });
  };
  

  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 2])
    .on("zoom", manejadorZoom);

  svg.call(zoom);

  // dibujar las líneas
  processedData.forEach(function (playerData, i) {
    let path = svg
      .append("path")
      .datum(playerData.values)
      .attr("class", "line") // agregar la clase "line" a las líneas
      .attr("fill", "none")
      .attr("stroke", function () {
        return d3.schemeCategory10[i % 10];
      })
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    let totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    let legend = svg
      .append("text")
      .datum({ name: playerData.name, value: playerData.values[0] })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function (d) {
        return d.name;
      });

    legend
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attrTween("transform", function (d) {
        let interpolate = d3.interpolateNumber(0, playerData.values.length - 1);
        return function (t) {
          let seasonIndex = Math.round(interpolate(t));
          return (
            "translate(" +
            x(playerData.values[seasonIndex].season) +
            "," +
            y(playerData.values[seasonIndex].points) +
            ")"
          );
        };
      });
  });
});
