       document.addEventListener('DOMContentLoaded', () => {
            const produtos = [
    {
        nome:"Jaqueta de couro preta",
        imagem:"Imagens/download.jpg",
        preço:"R$284,99",
        tamanho: "G"
    },

     {
        nome:"Vestido de amarração azul e branco",
        imagem:"Imagens/vestido.png",
        preço:"R$110,42",
        tamanho: "M"
    },
    
     {
        nome:"Calça cargo jeans",
        imagem:"Imagens/download (2).jpg",
        preço:"R$199,99",
        tamanho: "G"
    },
    
     {
        nome:"Calça alfaiataria preta",
        imagem:"Imagens/download (1).jpg",
        preço:"R$115,00",
        tamanho: "P"
    },
];

            const regrasFrete = {
                'SP': { valorFixo: 15.00, tempo: '2-3 dias úteis' },
                'MG': { valorFixo: 20.00, tempo: '3-5 dias úteis' },
                'RJ': { valorFixo: 18.00, tempo: '2-4 dias úteis' },
                'PR': { valorFixo: 22.00, tempo: '4-6 dias úteis' },
                'SC': { valorFixo: 22.00, tempo: '4-6 dias úteis' },
                'RS': { valorFixo: 25.00, tempo: '5-7 dias úteis' }
            };

            const produtosContainer = document.getElementById("produtos-container");
            const freteSection = document.getElementById('frete-section');
            const cepInput = document.getElementById('cepInput');
            const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');
            const ulResult = document.getElementById('ulResult');
            const mensagemStatus = document.getElementById('mensagemStatus');
            const produtoSelecionadoDetalhes = document.getElementById('produto-selecionado-detalhes');

            const displayProductDetails = (produto) => {
                produtoSelecionadoDetalhes.innerHTML = `
                    <img src="${produto.imagem}" alt="${produto.nome}" style="max-width: 120px; height: auto; border-radius: 8px; margin-bottom: 10px;">
                    <h3>${produto.nome}</h3>
                    <p>Preço: ${produto.preço}</p>
                    <p>Tamanho: ${produto.tamanho}</p>
                `;
            };

            const clearResultsAndMessages = () => {
                ulResult.innerHTML = '';
                mensagemStatus.style.display = 'none';
                mensagemStatus.textContent = '';
            };

            const clearProductDetails = () => {
                produtoSelecionadoDetalhes.innerHTML = '';
            };
            
            function getProcurar(cep) {
                const ceps = fetch (`https://viacep.com.br/ws/${cep}/json/`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error('Falha na busca do CEP. Verifique sua conexão.');
                        }
                        return res.json();
                    })
                    .then(data => {
                        if (data.erro) {
                            return { error: true, message: 'CEP não encontrado. Por favor, verifique o número digitado.' };
                        }
                        return data;
                        }
                    )
                    .catch(error => {
                        console.error("Erro na requisição ViaCEP:", error);
                        return { error: true, message: 'Erro ao verificar o CEP. Tente novamente mais tarde.' };
                    });
            }

            const createViewResult = (endereco, freteValor, prazoEntrega) => {
                ulResult.innerHTML = '';

                let outputText = 'Endereço de Entrega: \n';
                outputText += `Logradouro: ${endereco.logradouro || 'Não informado'} \n`;
                outputText += `Bairro: ${endereco.bairro || 'Não informado'} \n`;
                outputText += `Cidade: ${endereco.localidade || 'Não informado'} \n`;
                outputText += `Estado: ${endereco.uf || 'Não informado'} \n\n`;

                outputText += 'Custo do Frete: \n';
                if (freteValor !== null) {
                    outputText += `R$ ${freteValor.toFixed(2)} \n`;
                    outputText += `Prazo de Entrega: ${prazoEntrega} \n`;
                } else {
                    outputText += `Serviço de entrega indisponível para esta região. \n`;
                    outputText += `Entre em contato para opções de entrega personalizadas. \n`;
                }
                ulResult.innerHTML = outputText;
            };

            const displayMessage = (message, type = 'info') => {
                mensagemStatus.textContent = message;
                mensagemStatus.style.display = 'block';
            };


            produtos.forEach(produto => {
                const card = document.createElement("div");
                card.classList.add("produto-card");

                const img = document.createElement("img");
                img.src = produto.imagem;
                img.alt = produto.nome;

                const nome = document.createElement("h2");
                nome.textContent = produto.nome;

                const preco = document.createElement("p");
                preco.textContent = "Preço: " + produto.preço;

                const tamanho = document.createElement("p");
                tamanho.textContent = "Tamanho: " + produto.tamanho;

                const botao = document.createElement("button");
                botao.textContent = "Comprar";

                botao.addEventListener('click', () => {
                    clearResultsAndMessages();
                    clearProductDetails();
                    displayProductDetails(produto);
                    freteSection.style.display = 'block';
                    freteSection.scrollIntoView({ behavior: 'smooth' });
                    cepInput.value = '';
                });

                card.appendChild(img);
                card.appendChild(nome);
                card.appendChild(preco);
                card.appendChild(tamanho);
                card.appendChild(botao);

                produtosContainer.appendChild(card);
            });

            btnFinalizarCompra.addEventListener('click', async () => {
                clearResultsAndMessages();
                const cep = cepInput.value.replace(/\D/g, '');

                if (cep.length !== 8) {
                    displayMessage('Por favor, digite um CEP válido com 8 dígitos.', 'error');
                    return;
                }

                displayMessage('Buscando endereço...', 'info');

                const enderecoResult = await getProcurar(cep);

                if (enderecoResult.error) {
                    displayMessage(enderecoResult.message, 'error');
                    return;
                }

                let freteInfo = { valor: 0, prazo: '', disponivel: true };
                const uf = enderecoResult.uf;

                if (regrasFrete[uf]) {
                    const regra = regrasFrete[uf];
                    freteInfo.valor = regra.valorFixo;
                    freteInfo.prazo = regra.tempo;
                } else {
                    freteInfo.disponivel = false;
                    freteInfo.valor = null;
                    freteInfo.prazo = 'N/A';
                }

                createViewResult(enderecoResult, freteInfo.valor, freteInfo.prazo);
                if (freteInfo.disponivel) {
                    displayMessage('Detalhes da entrega e frete calculados!', 'success');
                } else {
                    displayMessage('Região fora da área de cobertura.', 'error');
                }
            });

            cepInput.addEventListener('input', () => {
                const value = cepInput.value.replace(/\D/g, '');
                let formattedValue = value;
                if (value.length > 5) {
                    formattedValue = `${value.substring(0, 5)}-${value.substring(5, 8)}`;
                }
                cepInput.value = formattedValue;
                clearResultsAndMessages();
            });

            cepInput.addEventListener('focus', () => {
                clearResultsAndMessages();
            });
        });