// Função simples para atualizar os números no dashboard
function atualizarDashboard(dados) {
    if(document.getElementById('vagas-livres')) {
        document.getElementById('vagas-livres').innerText = dados.livres;
        document.getElementById('vagas-ocupadas').innerText = dados.ocupadas;
        document.getElementById('vagas-reservadas').innerText = dados.reservadas;
        document.getElementById('vagas-total').innerText = dados.total;
    }
}

// Exemplo de uso (Você pode apagar isso quando conectar ao banco)
document.addEventListener('DOMContentLoaded', () => {
    const dadosIniciais = {
        livres: 12,
        ocupadas: 5,
        reservadas: 3,
        total: 20
    };
    
    atualizarDashboard(dadosIniciais);
});