const { readFileSync } = require('fs');

// Funções utilitárias que permanecem fora da classe
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valor / 100);
}

function getPeca(pecas, apre) {
  return pecas[apre.id];
}

// Classe que encapsula a lógica de negócio (cálculos)
class ServicoCalculoFatura {

  calcularCredito(pecas, apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(pecas, apre).tipo === "comedia")
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }

  calcularTotalApresentacao(pecas, apre) {
    let total = 0;
    switch (getPeca(pecas, apre).tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
          total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
        throw new Error(`Peça desconhecida: ${getPeca(pecas, apre).tipo}`);
    }
    return total;
  }

  calcularTotalFatura(pecas, apresentacoes) {
    return apresentacoes
      // A chamada interna agora usa 'this'
      .reduce((total, apre) => total + this.calcularTotalApresentacao(pecas, apre), 0);
  }

  calcularTotalCreditos(pecas, apresentacoes) {
    return apresentacoes
      // A chamada interna agora usa 'this'
      .reduce((total, apre) => total + this.calcularCredito(pecas, apre), 0);
  }
}

// Funções de apresentação (agora recebem o serviço de cálculo)
function gerarFaturaStr(fatura, pecas, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    // As chamadas de cálculo agora são feitas através do objeto 'calc'
    faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
  }
  // As chamadas de cálculo agora são feitas através do objeto 'calc'
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
  return faturaStr;
}

function gerarFaturaHTML(fatura, pecas, calc) {
  /*
  let faturaHTML = `<html><p> Fatura ${fatura.cliente} </p>`;
  faturaHTML += "<ul>";
  for (let apre of fatura.apresentacoes) {
    faturaHTML += `<li>  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>`;
  }
  faturaHTML += "</ul>";
  faturaHTML += `<p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))} </p>`;
  faturaHTML += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>`;
  faturaHTML += "</html>";
  return faturaHTML;
  */
}


// --- Execução do Código ---
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

// 1. Cria uma instância do serviço de cálculo
const calc = new ServicoCalculoFatura();

// 2. Passa a instância para a função de geração de fatura
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
console.log(faturaStr);

// const faturaHTML = gerarFaturaHTML(faturas, pecas, calc);
// console.log(faturaHTML);