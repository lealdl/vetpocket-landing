// Substitua o trecho que exibe a mensagem após o cadastro

setTimeout(() => {
    this.showTyping();
    setTimeout(() => {
        this.hideTyping();
        
        // 🔥 VERIFICAR SE GANHOU BENEFÍCIO
        if (result.ganhou_beneficio === true) {
            const vagasRestantes = result.vagas_restantes || 0;
            this.appendMsg(
                `🎉 <b>PARABÉNS! Você é um dos primeiros!</b> 🎉<br><br>` +
                `Você garantiu uma das ${vagasRestantes + 1} últimas vagas com <b>30% OFF</b> no plano vitalício! 🚀<br><br>` +
                `Em breve nossa equipe entrará em contato com as instruções para garantir seu desconto especial.`,
                "bot"
            );
            this.mostrarBotaoFinal();
        } else {
            this.appendMsg(
                `💝 As vagas com 30% OFF se esgotaram, mas você está na <b>Lista VIP</b>! 😊<br><br>` +
                `Você receberá notificações sobre próximas oportunidades, lançamentos e novidades em primeira mão.`,
                "bot"
            );
        }
    }, 2000);
}, 1500);