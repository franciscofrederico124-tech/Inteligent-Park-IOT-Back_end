document.addEventListener('DOMContentLoaded', () => {
    const signInForm = document.getElementById('signIn');
    const signUpForm = document.getElementById('signUp');
    const toSignUp = document.getElementById('toSignUp');
    const toSignIn = document.getElementById('toSignIn');
    const alertBox = document.getElementById('customAlert');

    // Função para mostrar alertas
    function showAlert(message, type = 'success') {
        alertBox.textContent = message;
        alertBox.className = `alert show ${type}`;
        setTimeout(() => {
            alertBox.className = 'alert';
        }, 3000);
    }

    // Alternar entre formulários
    toSignUp.addEventListener('click', () => {
        signInForm.style.display = 'none';
        signUpForm.style.display = 'flex';
    });

    toSignIn.addEventListener('click', () => {
        signUpForm.style.display = 'none';
        signInForm.style.display = 'flex';
    });

    // Exemplo de submissão (Integração com backend)
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showAlert('Entrando no sistema...', 'success');
        // Aqui você faria o fetch para o seu servidor
    });
});