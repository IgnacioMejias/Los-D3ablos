const botonEmpezar = document.getElementById("boton-empezar-inicio");
const botonSeguir = document.getElementById("boton-seguir-mitad");

botonEmpezar.addEventListener("click", () => {
  const segundaSeccion = document.getElementById("segunda-seccion");
  segundaSeccion.scrollIntoView({ behavior: "smooth" });
});

botonSeguir.addEventListener("click", () => {
  const terceraSeccion = document.getElementById("tercera-seccion");
  terceraSeccion.scrollIntoView({ behavior: "smooth" });
});

// Animación inicial
d3.select(".boton-empezar").style("opacity", 0);
const descripcionTexto =
  "Explora el apasionante mundo de la NBA a través de nuestro mapa ninteractivo. Descubre las estadísticas de puntos, rebotes, bloqueos y robos de cada equipo de Estados Unidos, conéctandolos directamente con la región que representan. Además, conoce a los 10 máximos anotadores en la historia del juego. Sumérgete en los datos y desvela los secretos del baloncesto en nuestra plataforma especializada en el análisis estadístico de la NBA.";

const welcomeText = d3.select(".welcome-text");

// Crear elemento oculto para obtener el tamaño estimado del texto
const hiddenText = welcomeText
  .append("h3")
  .style("font-size", "1.5rem")
  .style("opacity", 0);

hiddenText.text(descripcionTexto);

const textWidth = hiddenText.node().getBoundingClientRect().width;
const textHeight = hiddenText.node().getBoundingClientRect().height;

// Eliminar el elemento oculto
hiddenText.remove();

// Aplicar el tamaño estimado al contenedor
welcomeText.style("width", `${textWidth}px`);
welcomeText.style("height", `${textHeight}px`);

// Animación inicial
const title = welcomeText.append("h3").style("font-size", "1.5rem");

const title_name =
  "Explora el apasionante mundo de la NBA a través de nuestro mapa interactivo. Descubre las estadísticas de puntos, rebotes, bloqueos y robos de cada equipo de Estados Unidos, conéctandolos directamente con la región que representan. Además, conoce a los 10 máximos anotadores en la historia del juego. Sumérgete en los datos y desvela los secretos del baloncesto en nuestra plataforma especializada en el análisis estadístico de la NBA.";
const titleLength = title_name.length;

title
  .transition()
  .end()
  .then(() => {
    for (let i = 0; i <= titleLength; i++) {
      title
        .transition()
        .delay(6 * i)
        .text(title_name.substr(0, i) + (i === titleLength ? "" : "|"));
    }
  })
  .then(() => {
    d3.select(".boton-empezar").transition().delay(1400).duration(2000).style("opacity", 1);
  });
