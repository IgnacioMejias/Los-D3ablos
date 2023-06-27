// Cargamos los datos de estados y equipos
d3.json("../US_States_and_Teams.json").then((dataUSAEquipos) => {
  // Cargamos los datos de los equipos
  d3.json("../team_data_per_season.json").then((dataEquipos) => {
    d3.json("../dataset/usa.json").then((datosTopo) => {
      const datos = topojson.feature(datosTopo, datosTopo.objects.states);

      const tooltip = d3
        .select("#estadisticas-container")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      let estadosSeleccionados = [];

      // Define el tamaño del SVG
      const width = 960;
      const height = 460;

      const mapContainer = d3.select("#map-container");

      // Crea el SVG
      const svg = mapContainer
        .append("svg")
        .attr("id", "map-svg")
        .attr("width", width)
        .attr("height", height);

      // Define la escala de color con valores iniciales
      let minValor = 0;
      let maxValor = 20000; // Valores predeterminados

      // Función para calcular el valor mínimo y máximo de los valores por temporada
      function calcularDominio(año, opcion) {
        console.log(año, opcion);
        const valorPorTemporada = Object.values(dataEquipos).map(
          (equipo) => equipo[año][opcion]
        );
        minValor = d3.min(valorPorTemporada);
        maxValor = d3.max(valorPorTemporada);
      }

      // Función para mostrar mensaje que estado no tieen equipos
      function mostrarMensajeEstado(mensaje) {
        const mensajeEstado = document.getElementById("mensaje-estado");
        mensajeEstado.innerHTML = mensaje;
      }

      // Función auxiliar para obtener el nombre legible de la opción
      function getNombreOpcion(opcion) {
        switch (opcion) {
          case "PTS":
            return "Puntos";
          case "BLK":
            return "Bloqueos";
          case "REB":
            return "Rebotes";
          case "STL":
            return "Robos";
          default:
            return opcion;
        }
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
            const colorActual = d3.select(this).style("fill");
            if (!(colorActual === "rgb(65, 105, 225)")) {
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
            } else {
              return colorActual;
            }
          });
      }

      const WIDTH = 700;
      const HEIGHT = 600;
      const MARGIN = {
        top: 70,
        bottom: 160,
        left: 70,
        right: 30,
      };

      const HEIGHTVIS = HEIGHT - MARGIN.top - MARGIN.bottom;
      const WIDTHVIS = WIDTH - MARGIN.left - MARGIN.right;

      // Creamos el svg
      const grafico = d3
        .select("#estadisticas-container")
        .append("svg")
        .attr("id", "estadisticas-svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

      // Creamos un contenedor específico para cada eje y la visualización
      const contenedorEjeY = grafico
        .append("g")
        .attr("id", "contenedor-eje-y")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      const contenedorEjeX = grafico
        .append("g")
        .attr("id", "contenedor-eje-x")
        .attr(
          "transform",
          `translate(${MARGIN.left}, ${HEIGHTVIS + MARGIN.top})`
        );

      const contenedorVis = grafico
        .append("g")
        .attr("id", "contenedor-vis")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      // Función para actualizar las estadísticas en función de los estados seleccionados
      function actualizarEstadisticas(estadosSeleccionados, año, opcion) {
        let vacio = false;
        if (estadosSeleccionados.length === 0) {
          vacio = true;
        }
        const equiposSeleccionados = [];

        // Obtiene los equipos de los estados seleccionados
        estadosSeleccionados.forEach((estado) => {
          const equipos = dataUSAEquipos[estado];
          if (equipos && equipos.length > 0) {
            equipos.forEach((equipo) => {
              equiposSeleccionados.push(equipo);
            });
          } else {
            mostrarMensajeEstado(
              `El estado ${estado} no tiene equipos en la NBA`
            );
          }
        });

        const datosEquiposSeleccionados = {};

        // Obtiene los datos de los equipos seleccionados
        equiposSeleccionados.forEach((equipo) => {
          datosEquiposSeleccionados[equipo] = dataEquipos[equipo];
        });

        // Obtiene los valores de los equipos seleccionados
        const valorPorTemporada = equiposSeleccionados.map(
          (equipo) => dataEquipos[equipo][año][opcion]
        );

        // Calcula el valor mínimo y máximo
        const minValor = d3.min(valorPorTemporada);
        const maxValor = d3.max(valorPorTemporada);

        // Definimos una escala lineal para determinar la altura
        const escalaAltura = d3
          .scaleLinear()
          .domain([maxValor / 2, maxValor * 1.05]) // Capaz cambiar por minValor
          .range([0, HEIGHTVIS]);

        const escalaY = d3
          .scaleLinear()
          .domain([maxValor / 2, maxValor * 1.05])
          .range([HEIGHTVIS, 0]);

        const ejeY = d3.axisLeft(escalaY);

        contenedorEjeY
          .transition()
          .duration(500)
          .call(ejeY)
          .selectAll("line")
          .attr("x1", WIDTHVIS)
          .attr("stroke-dasharray", "5")
          .attr("opacity", 0.5);

        const escalaX = d3
          .scaleBand()
          .domain(equiposSeleccionados)
          .rangeRound([0, WIDTHVIS])
          .padding(0.5);

        const ejeX = d3.axisBottom(escalaX);

        contenedorEjeX
          .transition()
          .duration(500)
          .call(ejeX)
          .selectAll("text")
          .attr("font-size", "14")
          .attr("y", 6)
          .attr("x", 15)
          .attr("transform", "rotate(70)")
          .attr("text-anchor", "start");

        const barras = contenedorVis
          .selectAll("rect")
          .data(Object.keys(datosEquiposSeleccionados), (d) => d)
          .join(
            (enter) =>
              enter
                .append("rect")
                .style("fill", function (d) {
                  const valor = dataEquipos[d][año][opcion];
                  return colorScale(valor);
                })
                .attr("y", HEIGHTVIS)
                .attr("height", 0)
                .attr("width", escalaX.bandwidth())
                .attr("x", (d) => escalaX(d)),
            (update) =>
              update.style("fill", function (d) {
                const valor = dataEquipos[d][año][opcion];
                return colorScale(valor);
              }),
            (exit) =>
              exit
                .transition("salida")
                .duration(500)
                .attr("y", HEIGHTVIS)
                .attr("height", 0)
                .remove()
          );

        // Personalizamos según la información de los datos
        barras
          .transition("update")
          .duration(500)
          .attr("width", escalaX.bandwidth())
          .attr("height", (d) => escalaAltura(dataEquipos[d][año][opcion]))
          .attr("x", (d) => escalaX(d))
          .attr("y", (d) => escalaY(dataEquipos[d][año][opcion]));

        contenedorVis
          .selectAll("rect")
          .on("mousemove", (event, d) => {
            tooltip.transition().duration(60).style("opacity", 0.9);
            tooltip
              .html(
                `${getNombreOpcion(opcion)}: ${dataEquipos[d][año][opcion]}`
              )
              .style("left", event.pageX + 5 + "px")
              .style("top", event.pageY - 20 + "px");
          })
          .on("mouseout", (event, d) => {
            tooltip.transition().duration(500).style("opacity", 0);
          });

        // Agregamos el texto
        contenedorVis.selectAll("#titulo-grafico").remove();
        contenedorEjeY.selectAll("#titulo-eje").remove();

        if (!vacio) {
          const tituloEjeY = contenedorEjeY
            .append("text")
            .attr("id", "titulo-eje")
            .attr("transform", "rotate(-90)")
            .attr("x", -HEIGHTVIS / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .text(`${getNombreOpcion(opcion)}`)
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "black");

          contenedorVis
            .append("text")
            .attr("id", "titulo-grafico")
            .attr("x", WIDTHVIS / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .attr("font-size", "20")
            .text(`Estadísticas de ${getNombreOpcion(opcion)} en ${año}`);
        } else {
          // Quiero quitar las líneas de los ejes, creo que se llaman domain
          d3.selectAll("path.domain").remove();
        }
      }

      // Genera las opciones del dropdown para los años desde 1980 hasta 2022
      const añoSelect = document.getElementById("año-select");
      const opcionSelect = document.getElementById("opcion-select");
      const botonSeleccionar = document.getElementById(
        "boton-seleccionar-todo"
      );
      const botonDeseleccionar = document.getElementById(
        "boton-borrar-seleccion"
      );

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
        actualizarEstadisticas(
          estadosSeleccionados,
          añoSeleccionado,
          opcionSeleccionada
        );
      });

      opcionSelect.addEventListener("change", function () {
        const añoSeleccionado = añoSelect.value;
        const opcionSeleccionada = opcionSelect.value;
        actualizarMapa(añoSeleccionado, opcionSeleccionada);
        actualizarEstadisticas(
          estadosSeleccionados,
          añoSeleccionado,
          opcionSeleccionada
        );
      });

      botonSeleccionar.addEventListener("click", function () {
        // Selecciona todos los estados
        estadosSeleccionados = [];
        const añoSeleccionado = añoSelect.value;
        const opcionSeleccionada = opcionSelect.value;
        var todosLosEstados = Object.keys(dataUSAEquipos);
        estadosSeleccionados = todosLosEstados;

        d3.selectAll("path")
          .data(datos.features)
          .style("fill", function (d) {
            var nombreEstado = d.properties.name;
            if (estadosSeleccionados.includes(nombreEstado)) {
              return "rgb(65,105,225)";
            } else {
              return "rgb(173,216,230)";
            }
          });
        actualizarEstadisticas(
          estadosSeleccionados,
          añoSeleccionado,
          opcionSeleccionada
        );
      });

      botonDeseleccionar.addEventListener("click", function () {
        if (estadosSeleccionados.length > 0) {
          // Deseleccionar todos los estados
          const añoSeleccionado = añoSelect.value;
          const opcionSeleccionada = opcionSelect.value;
          var todosLosEstados = Object.keys(dataUSAEquipos);
          d3.selectAll("path")
            .data(datos.features)
            .style("fill", function (d) {
              const nombreEstado = d.properties.name;
              if (todosLosEstados.includes(nombreEstado)) {
                let equipoMaxValor = null;
                let maxValor = 0;
                const equipos = dataUSAEquipos[nombreEstado];
                if (equipos && equipos.length > 0) {
                  equipos.forEach((equipo) => {
                    const valor =
                      dataEquipos[equipo][añoSeleccionado][opcionSeleccionada];
                    if (valor > maxValor) {
                      equipoMaxValor = equipo;
                      maxValor = valor;
                    }
                  });
                  const valor =
                    dataEquipos[equipoMaxValor][añoSeleccionado][
                      opcionSeleccionada
                    ];
                  return colorScale(valor);
                }
              }
              return "rgb(173,216,230)";
            });

          estadosSeleccionados = [];
          actualizarEstadisticas(
            estadosSeleccionados,
            añoSeleccionado,
            opcionSeleccionada
          );
        }
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
          // Verificamos si el estado ya está seleccionado
          const nombreEstado = d.properties.name;
          const index = estadosSeleccionados.indexOf(nombreEstado);
          if (index === -1) {
            // Si no está seleccionado, lo agregamos
            estadosSeleccionados.push(nombreEstado);
          } else {
            // Si está seleccionado, lo eliminamos
            estadosSeleccionados.splice(index, 1);
          }
          const añoActual = añoSelect.value;
          const opcionActual = opcionSelect.value;
          const currentColor = d3.select(this).style("fill");
          if (currentColor === "rgb(65, 105, 225)") {
            // Si el estado ya está seleccionado, cambia su color de vuelta al color original
            d3.select(this).style("fill", function (d) {
              let equipoMaxValor = null;
              let maxValor = 0;
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

                // Actualizamos la sección de estadísticas
                actualizarEstadisticas(
                  estadosSeleccionados,
                  añoActual,
                  opcionActual
                );
                const valor =
                  dataEquipos[equipoMaxValor][añoActual][opcionActual];
                return colorScale(valor);
              }
              actualizarEstadisticas(
                estadosSeleccionados,
                añoActual,
                opcionActual
              );
              mostrarMensajeEstado(`¡Presiona un estado para ver sus equipos!`);
              return "rgb(173,216,230)";
            });

            // Elimina el texto
            svg.select("text").remove();
          } else {
            // Si el estado no está seleccionado, cambia su color a rojo
            d3.select(this).style("fill", "rgb(65,105,225)");
            actualizarEstadisticas(
              estadosSeleccionados,
              añoActual,
              opcionActual
            );
          }
        });
      // LLama a la función para actualizar el mapa con los valores por defecto (PUNTOS 2022)
      actualizarMapa("2022", "PTS");
    });
  });
});
