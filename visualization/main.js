// Cargamos los datos de estados y equipos
d3.json("../US_States_and_Teams.json").then((dataUSAEquipos) => {
  // Cargamos los datos de los equipos
  d3.json("../team_data_per_season.json").then((dataEquipos) => {
    d3.json("../dataset/usa.json").then((datosTopo) => {
      const datos = topojson.feature(datosTopo, datosTopo.objects.states);

      // Define el tamaño del SVG
      const width = 960;
      const height = 600;

      // Crea el SVG
      const svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Define la escala de color con valores iniciales
      let minValor = 0;
      let maxValor = 20000; // Valores predeterminados

      // Función para calcular el valor mínimo y máximo de los valores por temporada
      function calcularDominio(año, opcion) {
        const valorPorTemporada = Object.values(dataEquipos).map(
          (equipo) => equipo[año][opcion]
        );
        minValor = d3.min(valorPorTemporada);
        maxValor = d3.max(valorPorTemporada);
        console.log(minValor, maxValor);
      }

      // Define la escala de color
      const colorScale = d3.scaleSequential().interpolator(d3.interpolateOrRd); // Utiliza el esquema de colores rojo-azul

      // Define la proyección
      const projection = d3
        .geoAlbersUsa()
        .translate([width / 2, height / 2]) // centra el mapa
        .scale(width); // escala el mapa

      // Define el generador de caminos
      const path = d3.geoPath().projection(projection);

      // Función para actualizar el mapa en función del año seleccionado
      function actualizarMapa(año, opcion) {
        // Calcula el dominio de los valores por temporada
        calcularDominio(año, opcion);
        colorScale.domain([minValor, maxValor]);

        svg
          .selectAll("path")
          .data(datos.features)
          .style("fill", function (d) {
            let equipoMaxValor = null;
            let maxValor = 0;

            const nombreEstado = d.properties.name;
            const equipos = dataUSAEquipos[nombreEstado];
            if (equipos && equipos.length > 0) {
              // Busca el equipo con más valor en el año seleccionado
              equipos.forEach((equipo) => {
                const valor = dataEquipos[equipo][año][opcion];
                if (valor && valor > maxValor) {
                  equipoMaxValor = equipo;
                  maxValor = valor;
                }
              });

              if (equipoMaxValor) {
                const valor = dataEquipos[equipoMaxValor][año][opcion];
                return colorScale(valor);
              }
            }
            return "rgb(173,216,230)";
          });
      }

      // Genera las opciones del dropdown para los años desde 1980 hasta 2022
      const añoSelect = document.getElementById("año-select");
      const opcionSelect = document.getElementById("opcion-select");

      for (let año = 2022; año >= 1980; año--) {
        const option = document.createElement("option");
        option.value = año;
        option.text = año;
        añoSelect.appendChild(option);
      }

      añoSelect.addEventListener("change", function () {
        const añoSeleccionado = añoSelect.value;
        const opcionSeleccionada = opcionSelect.value;
        actualizarMapa(añoSeleccionado, opcionSeleccionada);
      });

      opcionSelect.addEventListener("change", function () {
        const añoSeleccionado = añoSelect.value;
        const opcionSeleccionada = opcionSelect.value;
        actualizarMapa(añoSeleccionado, opcionSeleccionada);
      });
      

      // Dibuja cada estado usando los datos
      svg
        .selectAll("path")
        .data(datos.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff") // color de las líneas
        .style("stroke-width", "1") // grosor de las líneas
        .on("mouseover", function (event, d) {
          // evento de mouseover
          // Muestra el nombre del estado en el mapa
          svg
            .append("text")
            .attr("x", 600)
            .attr("y", 100)
            .text(d.properties.name)
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "black");
        })
        .on("mouseout", function (event, d) {
          // evento de mouseout
          // Elimina el texto
          svg.select("text").remove();
        })
        .on("click", function (event, d) {
          // evento de click
          // Verifica el color actual del estado
          const añoActual = añoSelect.value;
          const opcionActual = opcionSelect.value;
          const currentColor = d3.select(this).style("fill");
          if (currentColor === "rgb(65, 105, 225)") {
            // Si el estado ya está seleccionado, cambia su color de vuelta al color original
            d3.select(this).style("fill", function (d) {
              let equipoMaxValor = null;
              let maxValor = 0;

              const nombreEstado = d.properties.name;
              const equipos = dataUSAEquipos[nombreEstado];
              if (equipos && equipos.length > 0) {
                // Busca el equipo con más valor en el año seleccionado
                equipos.forEach((equipo) => {
                  const valor = dataEquipos[equipo][añoActual][opcionActual];
                  if (valor > maxValor) {
                    equipoMaxValor = equipo;
                    maxValor = valor;
                  }
                });

                const valor = dataEquipos[equipoMaxValor][añoActual][opcionActual];
                return colorScale(valor);
              }
              return "rgb(173,216,230)";
            });

            // Elimina el texto
            svg.select("text").remove();
          } else {
            // Si el estado no está seleccionado, cambia su color a rojo
            d3.select(this).style("fill", "rgb(65,105,225)");
          }
        });
      // LLama a la función para actualizar el mapa con los valores por defecto (PUNTOS 2022)
      actualizarMapa("2022", "PTS");
    });
  });
});
