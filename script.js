function switchTab(turmaId) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(turmaId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function copyEmail(email, button) {
    navigator.clipboard.writeText(email).then(() => {
        const originalText = button.innerText;
        button.innerText = "Copiado!";
        button.style.backgroundColor = "#2ecc71";
        button.style.color = "white";
        setTimeout(() => {
            button.innerText = originalText;
            button.style.backgroundColor = "#f0f0f0";
            button.style.color = "#333";
        }, 2000);
    });
}