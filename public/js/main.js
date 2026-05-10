document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema Smart Park carregado.");

    // Exemplo: Lógica para o botão de perfil
    const perfilBtn = document.getElementById('perfilBtn');
    if (perfilBtn) {
        perfilBtn.addEventListener('click', () => {
            window.location.href = "/configuracoes";
        });
    }

    // Você pode adicionar chamadas fetch aqui para atualizar os cards de vagas
});