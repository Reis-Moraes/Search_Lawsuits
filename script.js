async function buscarCliente(event) {
    event.preventDefault();  // Impede o envio do formulário

    const CPF = document.getElementById('identification').value;
    const mensagemErro = document.getElementById('mensagem-erro');
    const listaClientes = document.getElementById('lista-clientes');
    const quantidadeProcessos = document.getElementById('quantidade-processos');
    const botaoBuscar = event.target.querySelector('button') || document.querySelector("button[type='submit']");


    // Limpar mensagens de erro e a lista de clientes
    mensagemErro.textContent = '';
    listaClientes.innerHTML = '';
    quantidadeProcessos.textContent = "";  // Limpar a lista de clientes antes de exibir novos resultados

    if (!validarCPF(CPF)) {
        mensagemErro.textContent = '⚠️ CPF inválido. Digite um CPF válido.';
        return;
    }

try {

    botaoBuscar.disabled = true;
    botaoBuscar.innerHTML = `<span class="spinner"></span> Buscando`;

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
} finally {
    botaoBuscar.disabled = false;
    botaoBuscar.innerHTML = "Buscar"
}

}

// Função para exibir os processos encontrados para o cliente
function exibirProcessos(processos, CPF) {
    const listaClientes = document.getElementById('lista-clientes');
    listaClientes.innerHTML = ""; // limpa lista antes

    let clienteEncontrado = false;

    processos.forEach(processo => {
        if (processo.stage !== 'ARQUIVO' && processo.stage !== 'ARQUIVADO') {
            if (processo.identification === CPF) {
                clienteEncontrado = true;

                const li = document.createElement('li');
                li.classList.add('process-item');

                li.innerHTML = `
                    <div class="process-header">
                        <span><strong>Processo:</strong> ${processo.type || 'Informação não disponível'}</span>
                        <svg class="toggle-arrow" xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 24 24" fill="none" stroke="#b99671" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="process-details">
                        <ul>
                            <li><strong>Responsável:</strong> REIS & MORAES</li>
                            <li><strong>Etapa:</strong> ${processo.stage || 'Não Informado'} - Passo: ${processo.step || 'Não Informado'}</li>
                            <li><strong>Cliente:</strong> ${processo.name} - CPF: ${processo.identification}</li>
                        </ul>
                    </div>
                `;

                const header = li.querySelector('.process-header');
                const toggleArrow = li.querySelector('.toggle-arrow');
                const detalhes = li.querySelector('.process-details');

                header.addEventListener('click', () => {
                    li.classList.toggle('active');
                    toggleArrow.classList.toggle('rotated');
                });

                listaClientes.appendChild(li);
            }
        }
    });

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

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove pontos e traços

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; // inválido se tiver menos de 11 dígitos ou todos iguais

    let soma = 0, resto;

    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}
