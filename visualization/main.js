d3.json("../dataset/usa.json").then((datosTopo) => {
    const datos = topojson.feature(datosTopo, datosTopo.objects.states);

    // Define el tamaño del SVG
    const width = 960;
    const height = 600;

    // Crea el SVG
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define la proyección
    const projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2]) // centra el mapa
        .scale(width); // escala el mapa

    // Define el generador de caminos
    const path = d3.geoPath().projection(projection);

    // Dibuja cada estado usando los datos
    svg.selectAll("path")
        .data(datos.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff") // color de las líneas
        .style("stroke-width", "1") // grosor de las líneas
        .style("fill", "rgb(173,216,230)") // color de relleno
        .on("mouseover", function(event, d) { // evento de mouseover
                // Muestra el nombre del estado en el mapa
                svg.append("text")
                    .attr("x", 600)
                    .attr("y", 100)
                    .text(d.properties.name)
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "20px")
                    .attr("fill", "black");
        })
        .on("mouseout", function(event, d) { // evento de mouseout
            // Elimina el texto
            svg.select("text").remove();
        })
        .on("click", function(event, d) { // evento de click
            // Verifica el color actual del estado
            const currentColor = d3.select(this).style("fill");
            if (currentColor === "rgb(255, 0, 0)") {
                // Si el estado ya está seleccionado, cambia su color de vuelta al color original
                d3.select(this).style("fill", "rgb(173,216,230)");

                // Elimina el texto
                svg.select("text").remove();
            } else {
                // Si el estado no está seleccionado, cambia su color a rojo
                d3.select(this).style("fill", "rgb(255,0,0)");

            }
        });
});
