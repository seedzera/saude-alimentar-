// main.js - comportamento: smooth scroll e animação de entrada para tópicos

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll para âncoras internas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e){
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target){ target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    // Animação de entrada para cartões de tópico usando IntersectionObserver
    const items = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    items.forEach(i => {
        i.classList.add('fade-in');
        observer.observe(i);
    });
});

// Chatbot simples (registro local, respostas baseadas em palavras-chave)
document.addEventListener('DOMContentLoaded', () => {
    (function(){
        const toggle = document.getElementById('chat-toggle');
        const panel = document.getElementById('chat-panel');
        const closeBtn = document.getElementById('chat-close');
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');
        const messagesEl = document.getElementById('chat-messages');
        const suggestions = document.querySelectorAll('.chat-suggestions .suggestion');

        if(!toggle || !panel || !form || !messagesEl) return; // segurança

        const STORAGE_KEY = 'saudavel_chat_history_v1';

        const faq = [
            {k:['importância','importancia','qualidade'],'a':'Uma alimentação saudável é fundamental para prevenção de doenças, energia e bem-estar. Priorize alimentos in natura, variedade e moderação.'},
            {k:['fruta','frutas','vegetal','verdura','vegetais'],'a':'Frutas e vegetais fornecem fibras, vitaminas e antioxidantes; varie as cores e prefira preparo simples como saladas, assados e refogados.'},
            {k:['prato','montar','porção','porcao'],'a':'Regra prática: metade do prato vegetais, 1/4 proteína magra e 1/4 carboidratos integrais. Ajuste por atividade física.'},
            {k:['ultraprocessado','ultraprocessados'],'a':'Evite alimentos ultraprocessados: ricos em açúcares, sódio e gorduras. Cozinhe mais em casa e leia rótulos.'},
            {k:['hidratação','água','agua','hidratar'],'a':'Beba água regularmente — 1,5–2L/dia como referência. Leve uma garrafa, hidrate-se antes das refeições e durante exercícios.'},
            {k:['receita','receitas','pratico','prática','rapida'],'a':'Receitas rápidas: bowls com grãos, legumes assados e proteína; omelete com vegetais; smoothies sem açúcar adicionado.'},
            {k:['planejamento','planejar','compras'],'a':'Planeje refeições: faça lista de compras, batch cooking e porcione alimentos para economizar tempo e evitar escolhas impulsivas.'}
        ];

        function appendMessage(text, who='bot'){
            const div = document.createElement('div');
            div.className = 'message ' + (who==='user'? 'user':'bot');
            div.textContent = text;
            messagesEl.appendChild(div);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }

        function botReply(text){
            const t = text.toLowerCase();
            for(const item of faq){
                for(const k of item.k){
                    if(t.includes(k)) return item.a;
                }
            }
            // fallback
            return 'Posso ajudar com dicas rápidas sobre alimentação, hidratação, montagem de pratos e planejamento. Pergunte algo específico ou escolha uma sugestão.';
        }

        function saveHistory(){
            const msgs = Array.from(messagesEl.querySelectorAll('.message')).map(m=>({who:m.classList.contains('user')?'user':'bot',text:m.textContent}));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
        }

        function loadHistory(){
            const raw = localStorage.getItem(STORAGE_KEY);
            if(!raw) return;
            try{
                const msgs = JSON.parse(raw);
                msgs.forEach(m=>appendMessage(m.text,m.who));
            }catch(e){console.warn('Não foi possível carregar histórico do chat',e)}
        }

        function openPanel(){
            panel.removeAttribute('hidden');
            toggle.setAttribute('aria-expanded','true');
            toggle.setAttribute('aria-label','Fechar NutriBot');
            input && input.focus();
        }
        function closePanel(){
            panel.setAttribute('hidden','');
            toggle.setAttribute('aria-expanded','false');
            toggle.setAttribute('aria-label','Abrir NutriBot');
            toggle.focus();
        }

        toggle.addEventListener('click', ()=>{
            const isOpen = !panel.hasAttribute('hidden');
            if(isOpen) closePanel(); else openPanel();
        });

        if(closeBtn){
            closeBtn.addEventListener('click', ()=>{
                closePanel();
            });
        } else {
            // fallback: fechar ao clicar fora do painel
            document.addEventListener('click', (e)=>{
                if(!panel.contains(e.target) && !toggle.contains(e.target) && !panel.hasAttribute('hidden')){
                    closePanel();
                }
            });
        }

        // fechar com tecla Esc
        document.addEventListener('keydown', (e)=>{
            if(e.key === 'Escape' && !panel.hasAttribute('hidden')){
                closePanel();
            }
        });

        form.addEventListener('submit', (e)=>{
            e.preventDefault();
            const text = input.value && input.value.trim();
            if(!text) return;
            appendMessage(text,'user');
            const reply = botReply(text);
            setTimeout(()=>{ appendMessage(reply,'bot'); saveHistory(); }, 400);
            input.value='';
            saveHistory();
        });

        suggestions.forEach(btn=>btn.addEventListener('click', ()=>{
            const q = btn.textContent;
            appendMessage(q,'user');
            const reply = botReply(q);
            setTimeout(()=>{ appendMessage(reply,'bot'); saveHistory(); }, 300);
            saveHistory();
        }));

        // inicializa histórico e primeira mensagem
        loadHistory();
        if(!messagesEl.querySelector('.message')){
            appendMessage('Olá! Sou a NutriBot 🌿 — posso dar dicas rápidas sobre alimentação saudável. Pergunte ou escolha uma sugestão.','bot');
        }
    })();
});