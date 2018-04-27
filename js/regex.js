function executa(event) {

	event.preventDefault(); //bloqueia o comportamento padrão do browser

	limparResultados();
	var valores 	 = pegaValoresDoForm(); // a função que pega os valores digitados no formulário é armazenada em uma váriavel, pois a mesma retorna um objeto

  var resultados 	 = executaRegex(valores); //variável que armazena a função executaRegex, passando como paramentro os valores recuperados do formulário
																						// a função retorna um array

    imprimeResultadoNoInput(resultados);
    highlightResultados(resultados, valores.target);
}


function executaRegex(valores) {

	var textoPattern = valores.pattern; //montaPatternDeDataMaisLegivel();
	var textoTarget  = valores.target;
	var mostraIndex  = valores.mostraIndex;
	var mostraGrupos = valores.mostraGrupos;

	var resultados	 = [];
  var resultado 	 = null;


	var objetoRegex  = new RegExp(textoPattern, 'g'); //variavel que armazena uma expressão regular, que recupera o texto da variavel pattern (o que deseja encontrar).
																										// 'g' --> GLOBAL
																										// 'i' --> ignorar maiúsc./minúsc.
																										// 'm' --> corresponder o início ou fim de cada linha
																										// 'u' --> unicode; trata o padrão como uma sequência de código unicode
																										// 'y' --> aderente; corresponde apenas pelo index indicado pela propriedade lastIndex dessa expressão regular na string alvo
	while (resultado = objetoRegex.exec(textoTarget)) { //loop que armazena na var resultado a expressão regular, executando uma comparação com o conteudo da input target

		if(resultado[0] === "") { //se o primeiro indice do vetor estiver vazio, retorna a mensagem de erro
			throw Error("Regex retornou valor vazio.");
		}

		console.log("Resultado: " + resultado[0]);


		resultados.push(geraResultado(mostraGrupos ? resultado.join(' ||| ') : resultado[0], resultado.index, objetoRegex.lastIndex, mostraIndex));
	}


	logaTempoDeExecucao(textoPattern, textoTarget);

	return resultados;
}


function geraResultado(resultado, index, lastIndex, mostraIndex) {

	var textoIndex = mostraIndex ? " [" + index + "-" + lastIndex+ "]" : ""

	return {
		'resultado': resultado + textoIndex,
		'index': index,
		'lastIndex': lastIndex
	};
}


function logaTempoDeExecucao(textoPattern, textoTarget) {
	var pObjetoRegex  = new RegExp(textoPattern, 'g');
    var ini = performance.now();
    pObjetoRegex.test(textoTarget)
	var fim =  performance.now();
	console.log("Tempo de execução (ms) " + (fim-ini));
}

function imprimeResultadoNoInput(resultados) {
	var inputResultado 	= document.querySelector('#resultado');
	var labelResultado 	= document.querySelector('#labelResultados');

    labelResultado.innerHTML = (resultados.length) + " Matches (resultados)"; //pega o tamanho do array retornado e apresenta na label de  Matches

	var resultadosComoArray = resultados.map(function(item){
		return item.resultado;
	});

	labelResultado.innerHTML = (resultadosComoArray.length) + " Matches (resultados)";

    if(resultadosComoArray.length > 0) {
    	inputResultado.value = resultadosComoArray.join(' | ');
    	inputResultado.style.borderStyle = 'solid';
    	inputResultado.style.borderColor = 'lime';//verde
    } else {
    	inputResultado.placeholder = 'Sem matches (resultados)';
    	inputResultado.value = '';
    	inputResultado.style.borderStyle = 'solid';
    	inputResultado.style.borderColor = 'red';
    }
}


function highlightResultados(resultados, texto) {
	var item = null;
	var indexBegin = 0;
	var conteudo = "";

	while((item = resultados.shift()) != null) {
		conteudo += semHighlight(escapeHtml(texto.substring(indexBegin, item.index)));
		conteudo += comHighlight(escapeHtml(texto.substring(item.index, item.lastIndex)));
		indexBegin = item.lastIndex;
	}

	//sobrou algum texto?
	if((texto.length - indexBegin) > 0) {
		conteudo += semHighlight(escapeHtml(texto.substring(indexBegin, texto.length)));
	}

	document.querySelector("#highlightText").innerHTML = conteudo;
}

function semHighlight(texto) {
	return texto;
	//return "<s>" + texto + "</s>";
}

function comHighlight(texto) {
	return "<span class='bg-primary'>" + texto + "</span>";
}

function escapeHtml( string ) {
     return string.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}


function pegaValoresDoForm() {

	var inputTarget 	= document.querySelector('#target'); //se referencia ao campo de texto target
	var inputPattern 	= document.querySelector('#pattern') //se referencia ao campo de texto pattern
	inputPattern.focus();

	var checkboxIndex 	= document.querySelector('#mostraIndex'); //se referencia a checkbox Index
	var checkboxGroups 	= document.querySelector('#mostraGrupos'); //se referencia a checkbox Grupos

  	_verifiqueInputs(inputTarget, inputPattern); //função de validação de formulário, passando os parametros (dois campos de texto)

  	console.log('Target:  ' + inputTarget.value);
  	console.log('Pattern: ' + inputPattern.value.trim()); //função trim --> remove espaços em branco do input

  	return {'target': inputTarget.value.trim(),   //a função retornará os valores preenchidos no formulário
  			'pattern': inputPattern.value,
  			'mostraIndex': checkboxIndex.checked,
  			'mostraGrupos' : checkboxGroups.checked};
}

function _verifiqueInputs(inputTarget, inputPattern) {
	if(!inputTarget.value) { //se o valor não estiver digitado, entra no if e substitui o placeholder por uma msg
		inputTarget.placeholder = 'Digite um target';
	}

	if(!inputPattern.value) { //se o valor não estiver digitado, entra no if e substitui o placeholder por uma msg
		inputPattern.placeholder = 'Digite um pattern';
	}

	if(!inputTarget.value || !inputPattern.value) {
		throw Error('Valores invalidos');
	}
}

function limparResultados() {
	console.clear(); //limpa o console com os resultados trazidos de pesquisas anteriores
	document.querySelector('#labelResultados').innerHTML = '0 Matches (resultados)'; //substitui o texto da label
	document.querySelector('#resultado').value = ''; //limpa o resultado
	document.querySelector('#resultado').placeholder = 'sem resultado'; //substitui o placeholder
	document.querySelector("#highlightText").innerHTML = '<em>sem resultado</em>'; //div que está vazia, adiciona essa mensagem

}

function montaPatternDeDataMaisLegivel() {

	var DIA  = "[0123]?\\d";
	var _DE_ = "\\s+(de )?\\s*";
	var MES  = "[A-Za-z][a-zç]{3,8}";
	var ANO  = "[12]\\d{3}";
	return DIA + _DE_ +  MES + _DE_ + ANO;

}

// MetaChar / quantifier

/* /d --> digito número
	 . --> especial, encontra qualquer caractere
	 /. --> escapa o ponto, onde o mesmo só encontra o ponto e não qualquer caractere
	 {} --> (quantifier) utilizado quando existe a repetição de MetaChar
	 ? --> declara que o caractere em questão é opcional
	 [] --> classe de caracteres
	 [0-9] --> classe de caracteres numéricos (do zero até nove)
	 [a-z] --> classe de caracteres alfabéticos (letra A até Z)
	 \s - classe predefinida para espaços em branco
	 	\t é um tab.
		\r é carriage return.
		\n é newline.
		\f é form feed.
	 ? - zero ou uma vez.
	 * - zero ou mais vezes.
	 + - uma ou mais vezes.
	 {n} - exatamente n vezes.
	 {n,} - no mínimo n vezes.
	 {n,m} - no mínimo n vezes, no máximo m vezes.
	 \w - classe wordchar; atalho para [A-Za-z0-9_]

*/

/* Padrões

 CPF (com máscara) --> \d{3}\.\d{3}\.\d{3}\-\d{2}
 CPF (sem máscara) --> \d{3}\.?\d{3}\.?\d{3}\-?\d{2} ou \d{3}\.{0,1}\d{3}\.{0,1}\d{3}\-{0,1}\d{2} ou \d{3}\.?\d{3}\.?\d{3}[-.]?\d{2} (Nessa situação,
 a separação dos últimos digitos do cpf pode ser por ponto, hifen ou não existir separação)
 CNPJ --> \d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}
 IP --> \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}
 CEP --> \d{5}\-\d{3}
 Telefone --> \(\d{2}\)\ \d{4}\-\d{4} (normal)
 Quando o ddd possui 0 na frente /  quando o número tem 9 na frente --> \(\d{1,3}\)\ \d{1,5}\-\d{4}
 pesquisar itens que podem ter caracteres opcionais. Exemplo: No <code>for</code> --> <?code>
definir os números entre 1 e 3 E 6 e 9 --> [1-36-9]
data por extenso --> [1-3]?\d\s+de\s[A-Z][a-zç]{1,}\s+de\s+[12]\d{3}
formato para o padrão 19h32min16s --> \d+h\d+min\d+s
placa de carro --> [A-Z]{3}-\d{4}
Notas entre 7.2 e 7.9 e nomes --> 7\.[2-9]\s+-\s+[A-Z][a-z]\w+
