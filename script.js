async function buscarCliente(event) {
    event.preventDefault();  // Impede o envio do formulário

    const CPF = document.getElementById('identification').value;
    const mensagemErro = document.getElementById('mensagem-erro');
    const listaClientes = document.getElementById('lista-clientes');
    const quantidadeProcessos = document.getElementById('quantidade-processos');


    // Limpar mensagens de erro e a lista de clientes
    mensagemErro.textContent = '';
    listaClientes.innerHTML = '';
    quantidadeProcessos.textContent = "";  // Limpar a lista de clientes antes de exibir novos resultados

    if (!CPF) {
        mensagemErro.textContent = 'Por favor, preencha o campo CPF.';
        return;
    }

try {
    // Fazer a requisição para o servidor intermediário
    let response = await fetch(`https://search-lawsuits.onrender.com/buscar-cliente?identification=${CPF}`);


    const data = await response.json();

    // Verificar se a resposta é um array e se tem processos
    if (data && data.length > 0) {
        // Filtrar processos com stage diferente de 'ARQUIVO' e 'ARQUIVADO'
        const processosFiltrados = data.filter(processo => processo.stage !== 'ARQUIVO' && processo.stage !== 'ARQUIVADO');
        console.log('Processos encontrados para o cliente:', processosFiltrados);

        // Exibir os processos filtrados no front-end
        exibirProcessos(processosFiltrados, CPF);

        // Atualizar a quantidade de processos encontrados
        quantidadeProcessos.textContent = `Quantidade de Processos Encontrados: ${processosFiltrados.length}`;
    } else {
        mensagemErro.textContent = 'Cliente não encontrado.';
    }

} catch (error) {
    console.error('Erro ao buscar cliente:', error);
    mensagemErro.textContent = 'Ocorreu um erro ao buscar o cliente. Tente novamente mais tarde.';
}

}

// Função para exibir os processos encontrados para o cliente
function exibirProcessos(processos, CPF) {
    const listaClientes = document.getElementById('lista-clientes');
    
    let clienteEncontrado = false;

    // Percorrer todos os processos e verificar se o cliente com o CPF está associado
    processos.forEach(processo => {
        // Filtro para processos que não estão "arquivados" ou "em arquivo"
        if (processo.stage !== 'ARQUIVO' && processo.stage !== 'ARQUIVADO') {
            // Verificar se o CPF do cliente está associado diretamente ao processo
            if (processo.identification === CPF) {
                clienteEncontrado = true;
                const li = document.createElement('li');
                li.classList.add('process-item');  // Adiciona uma classe para identificar o processo

                li.innerHTML = `
                    <strong>Processo:</strong> ${processo.type || 'Informação não disponível'}
                `;
                
                // Adiciona informações detalhadas do processo
                const detalhes = document.createElement('div');
                detalhes.classList.add('process-details');
                detalhes.innerHTML = `
                    <ul>
                        <li><strong>Responsável:</strong> ${processo.responsible || 'Não Informado'}</li>
                        <li><strong>Etapa:</strong> ${processo.stage || 'Não Informado'} - Passo: ${processo.step || 'Não Informado'}</li>
                        <li><strong>Cliente:</strong> ${processo.name} - CPF: ${processo.identification}</li>
                    </ul>
                `;
                li.appendChild(detalhes);

                // Adiciona a funcionalidade de dropdown
                li.addEventListener('click', () => {
                    li.classList.toggle('active');  // Toggling a classe active para abrir/fechar o dropdown
                });

                listaClientes.appendChild(li);
            }
        }
    });

    // Se nenhum cliente foi encontrado, exibe uma mensagem
    if (!clienteEncontrado) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum processo encontrado para este CPF.';
        listaClientes.appendChild(li);
    }
}

function formatCPF(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é número

    if (value.length <= 11) {
        // Adiciona a pontuação do CPF (xxx.xxx.xxx-xx)
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    input.value = value;
}
