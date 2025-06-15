const { readFileSync } = require('fs');

// Função utilitária
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valor / 100);
}

// Classe que encapsula o acesso aos dados das peças
class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

// Classe de serviço, agora dependendo de um repositório
class ServicoCalculoFatura {
  constructor(repo) {
    this.repo = repo;
  }

  calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    // Acessa as peças através do repositório injetado
    if (this.repo.getPeca(apre).tipo === "comedia")
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }

  calcularTotalApresentacao(apre) {
    let total = 0;
    // Acessa as peças através do repositório injetado
    switch (this.repo.getPeca(apre).tipo) {
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
        throw new Error(`Peça desconhecida: ${this.repo.getPeca(apre).tipo}`);
    }
    return total;
  }

  calcularTotalFatura(apresentacoes) {
    return apresentacoes
      .reduce((total, apre) => total + this.calcularTotalApresentacao(apre), 0);
  }

  calcularTotalCreditos(apresentacoes) {
    return apresentacoes
      .reduce((total, apre) => total + this.calcularCredito(apre), 0);
  }
}

// Função de apresentação, agora não precisa mais do parâmetro 'pecas'
function gerarFaturaStr(fatura, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    // Acessa o nome da peça através do serviço -> repositório
    faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
  return faturaStr;
}

function gerarFaturaHTML(fatura, calc) {
  /* ... corpo comentado ... */
}


// --- Execução do Código Principal ---
const faturas = JSON.parse(readFileSync('./faturas.json'));

// Cria o serviço de cálculo, injetando uma nova instância do repositório
const calc = new ServicoCalculoFatura(new Repositorio());

// Gera a fatura, agora sem passar as peças diretamente
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);