// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;  // Porta do servidor intermediário

// Ativar CORS para permitir que o frontend acesse este servidor
app.use(cors());

// Configuração da URL da API do AdvBox e do seu token de autenticação

const apiURL = "https://app.advbox.com.br/api/v1/lawsuits";
const AdvBox_key = process.env.ADVBOX_API_KEY;

// Rota para buscar o cliente via CPF
app.get('/buscar-cliente', async (req, res) => {
    const { identification } = req.query;  // Obter o CPF (identification) dos parâmetros de consulta

    if (!identification) {
        return res.status(400).json({ error: 'CPF não fornecido' });
    }

    try {
        // Fazer a requisição à API do AdvBox
        const response = await axios.get(`${apiURL}?identification=${identification}`, {
            headers: {
                'Authorization': `Bearer ${AdvBox_key}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

            // Extrair os campos necessários dos processos e clientes
        const processosFiltrados = response.data.data.map(processo => {
            // Encontrar o cliente associado ao processo
        const cliente = processo.customers.find(cliente => cliente.identification === identification);

            // Retornar apenas os campos necessários
            return {
                step: processo.step,
                stage: processo.stage,
                type: processo.type,
                responsible: processo.responsible,
                name: cliente ? cliente.name : 'Cliente não encontrado',
                identification: cliente ? cliente.identification : 'Identificação não encontrada',
            };
        });

        // Retornar os dados filtrados para o frontend
        res.json(processosFiltrados);


    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar o cliente' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor intermediário rodando em http://localhost:${port}`);
});
