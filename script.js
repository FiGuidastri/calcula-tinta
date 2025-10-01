let paredeCount = 0;

// Constantes para áreas e volumes
const AREA_PORTA = 1.68; // 0.80m * 2.10m
const AREA_JANELA = 2.4; // 2.00m * 1.20m
const LITROS_LATA = 18;
const LITROS_GALAO = 3.6;

document.addEventListener("DOMContentLoaded", function () {
  adicionarParede();
});

function adicionarParede() {
  paredeCount++;
  const container = document.getElementById("paredes-container");
  const div = document.createElement("div");
  div.className = "parede-item";
  div.id = "parede-" + paredeCount;
  div.innerHTML = `
        <div class="parede-header">
            <strong>Parede ${paredeCount}</strong>
            <button class="btn btn-remove" onclick="removerParede(${paredeCount})">Remover</button>
        </div>
        <div class="grid-2">
            <div class="input-group">
                <label for="largura-${paredeCount}">Largura (metros)</label>
                <input type="number" id="largura-${paredeCount}" step="0.01" min="0" placeholder="Ex: 4.5" data-parede="${paredeCount}" data-tipo="largura">
            </div>
            <div class="input-group">
                <label for="altura-${paredeCount}">Altura (metros)</label>
                <input type="number" id="altura-${paredeCount}" step="0.01" min="0" placeholder="Ex: 2.7" data-parede="${paredeCount}" data-tipo="altura">
            </div>
        </div>
    `;
  container.appendChild(div);
}

function removerParede(id) {
  const elemento = document.getElementById("parede-" + id);
  if (elemento) {
    elemento.remove();
  }
}

function atualizarRendimento() {
  const select = document.getElementById("tipo-tinta");
  const rendimentoInput = document.getElementById("rendimento");
  if (select.value !== "custom") {
    rendimentoInput.value = select.value;
    rendimentoInput.readOnly = true;
  } else {
    rendimentoInput.value = "";
    rendimentoInput.readOnly = false;
    rendimentoInput.focus();
  }
}

function exibirErro(mensagem) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = mensagem;
  errorDiv.style.display = "block";
  document.getElementById("resultado").style.display = "none";
}

function limparErro() {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = "";
  errorDiv.style.display = "none";
}

/**
 * Calcula a combinação ideal de latas (18L) e galões (3.6L) para um total de litros.
 * @param {number} litros - O total de litros de tinta necessários.
 * @returns {string} Uma string descrevendo a combinação.
 */
function calcularCombinacaoLatas(litros) {
  if (litros <= 0) return "Nenhuma tinta necessária";

  let numLatas = Math.floor(litros / LITROS_LATA);
  const litrosRestantes = litros % LITROS_LATA;
  let numGaloes = Math.ceil(litrosRestantes / LITROS_GALAO);

  // Otimização: se o cálculo resultar em 5 galões, é melhor comprar 1 lata.
  if (numGaloes * LITROS_GALAO >= LITROS_LATA) {
    numGaloes = 0;
    numLatas += 1;
  }

  const resultado = [];
  if (numLatas > 0) {
    resultado.push(`${numLatas} lata(s) de 18L`);
  }
  if (numGaloes > 0) {
    resultado.push(`${numGaloes} galão(ões) de 3.6L`);
  }

  return resultado.length > 0 ? resultado.join(" e ") : "Menos de 1 galão";
}

function calcular() {
  limparErro();
  let areaTotal = 0;
  const paredes = {};
  const inputs = document.querySelectorAll("[data-parede]");

  inputs.forEach((input) => {
    const paredeId = input.dataset.parede;
    const tipo = input.dataset.tipo;
    const valor = parseFloat(input.value) || 0;
    if (!paredes[paredeId]) paredes[paredeId] = {};
    paredes[paredeId][tipo] = valor;
  });

  for (const id in paredes) {
    const { largura = 0, altura = 0 } = paredes[id];
    if (largura > 0 && altura > 0) {
      areaTotal += largura * altura;
    }
  }

  if (areaTotal <= 0) {
    exibirErro("Por favor, preencha as medidas de pelo menos uma parede.");
    return;
  }

  const portas = parseInt(document.getElementById("portas").value) || 0;
  const janelas = parseInt(document.getElementById("janelas").value) || 0;
  const areaDesconto = portas * AREA_PORTA + janelas * AREA_JANELA;
  const areaFinal = areaTotal - areaDesconto;

  if (areaFinal <= 0) {
    exibirErro(
      "A área de portas e janelas é maior que a área total das paredes."
    );
    return;
  }

  const rendimentoPorLata =
    parseFloat(document.getElementById("rendimento").value) || 0;
  if (rendimentoPorLata <= 0) {
    exibirErro("O rendimento da tinta deve ser maior que zero.");
    return;
  }
  const rendimentoPorLitro = rendimentoPorLata / LITROS_LATA;
  const demaos = parseInt(document.getElementById("demaos").value) || 1;

  const litrosNecessarios = (areaFinal * demaos) / rendimentoPorLitro;
  const litrosComMargem = litrosNecessarios * 1.1; // 10% de margem

  // Atualiza os resultados na tela
  document.getElementById("area-total").textContent = `${areaFinal.toFixed(
    2
  )} m²`;
  document.getElementById("total-litros").textContent = `${litrosNecessarios.toFixed(
    2
  )} L`;
  document.getElementById("qtd-tinta").textContent =
    calcularCombinacaoLatas(litrosNecessarios);
  document.getElementById("qtd-margem").textContent =
    calcularCombinacaoLatas(litrosComMargem);

  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.style.display = "block";
  resultadoDiv.scrollIntoView({ behavior: "smooth" });
}

function limpar() {
  document.getElementById("paredes-container").innerHTML = "";
  paredeCount = 0;
  adicionarParede();

  document.getElementById("portas").value = 0;
  document.getElementById("janelas").value = 0;
  document.getElementById("tipo-tinta").selectedIndex = 0;
  document.getElementById("rendimento").value = 300;
  document.getElementById("demaos").selectedIndex = 1;
  document.getElementById("resultado").style.display = "none";
  limparErro();
  window.scrollTo({ top: 0, behavior: "smooth" });
}