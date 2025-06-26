
    // consumindo API

      document.addEventListener('DOMContentLoaded', () => {
           

            
            const regrasFrete = {
                'SP': { valorFixo: 15.00, tempo: '2-3 dias úteis' },
                'MG': { valorFixo: 20.00, tempo: '3-5 dias úteis' },
                'RJ': { valorFixo: 18.00, tempo: '2-4 dias úteis' },
                'PR': { valorFixo: 22.00, tempo: '4-6 dias úteis' },
                'SC': { valorFixo: 22.00, tempo: '4-6 dias úteis' },
                'RS': { valorFixo: 25.00, tempo: '5-7 dias úteis' }
            };


            const cepInput = document.getElementById('cepInput'); 
            const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');
            const ulResult = document.getElementById('ulResult');
            const mensagemStatus = document.getElementById('mensagemStatus');

           
            function getProcurar(cep) {
                const url = `https://viacep.com.br/ws/${cep}/json/`;
                return fetch(url)
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
                    })
                    .catch(error => {
                        console.error("Erro na requisição ViaCEP:", error);
                        return { error: true, message: 'Erro ao verificar o CEP. Tente novamente mais tarde.' };
                    });
            }

            const createViewResult = (endereco, freteValor, prazoEntrega) => {
                ulResult.innerHTML = '';

                let outputText = 'Endereço de Entrega: <br>';
                outputText += `Logradouro: ${endereco.logradouro || 'Não informado'} <br>`;
                outputText += `Bairro: ${endereco.bairro || 'Não informado'} <br>`;
                outputText += `Cidade: ${endereco.localidade || 'Não informado'} <br>`;
                outputText += `Estado: ${endereco.uf || 'Não informado'} <br><br>`;

                outputText += 'Custo do Frete: <br>';
                if (freteValor !== null) {
                    outputText += `R$ ${freteValor.toFixed(2)} <br>`;
                    outputText += `Prazo de Entrega: ${prazoEntrega} <br>`;
                } else {
                    outputText += `Serviço de entrega indisponível para esta região. <br>`;
                    outputText += `Entre em contato para opções de entrega personalizadas. <br>`;
                }
                ulResult.innerHTML = outputText; 
            };

            const displayMessage = (message, type = 'info') => {
                mensagemStatus.textContent = message;
                mensagemStatus.style.display = 'block';
            };

            const clearResultsAndMessages = () => {
                ulResult.innerHTML = '';
                mensagemStatus.style.display = 'none';
                mensagemStatus.textContent = '';
            };

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
                    freteInfo.valor = regra.valorFixo; // Apenas o valor fixo
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