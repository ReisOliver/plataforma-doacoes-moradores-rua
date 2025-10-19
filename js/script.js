// Funcionalidades específicas para a plataforma de moradores de rua
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Plataforma de Doações carregada com sucesso!');
    
    // Inicializar todas as funcionalidades
    inicializarNavegacaoDoacoes();
    inicializarContadorEstatisticas();
    inicializarFormularios();
    inicializarMascaras();
    inicializarFeedbackVisual();
    inicializarEventosAdicionais();
});

// 1. Navegação entre tipos de doação
function inicializarNavegacaoDoacoes() {
    const botoesTipoDoacao = document.querySelectorAll('.botao-tipo-doacao');
    const secoesDoacao = document.querySelectorAll('.tipo-doacao');

    if (botoesTipoDoacao.length === 0) return;

    botoesTipoDoacao.forEach(botao => {
        botao.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove classe ativa de todos os botões
            botoesTipoDoacao.forEach(b => b.classList.remove('ativo'));
            // Adiciona classe ativa ao botão clicado
            this.classList.add('ativo');
            
            // Esconde todas as seções
            secoesDoacao.forEach(sec => sec.classList.remove('ativo'));
            
            // Mostra a seção correspondente
            const alvo = this.getAttribute('href');
            const secaoAlvo = document.querySelector(alvo);
            if (secaoAlvo) {
                secaoAlvo.classList.add('ativo');
                
                // Rola suavemente para a seção
                setTimeout(() => {
                    secaoAlvo.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    });
}

// 2. Contador animado para estatísticas
function inicializarContadorEstatisticas() {
    const observarEstatisticas = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numeros = entry.target.querySelectorAll('[data-count]');
                numeros.forEach(numero => {
                    animarContador(numero);
                });
                observarEstatisticas.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const estatisticasSection = document.querySelector('.estatisticas');
    if (estatisticasSection) {
        observarEstatisticas.observe(estatisticasSection);
    }
}

function animarContador(elemento) {
    const final = parseInt(elemento.getAttribute('data-count'));
    const duracao = 2000; // 2 segundos
    const incremento = final / (duracao / 16);
    let atual = 0;
    
    const timer = setInterval(() => {
        atual += incremento;
        if (atual >= final) {
            elemento.textContent = final.toLocaleString('pt-BR');
            clearInterval(timer);
            
            // Adicionar efeito visual ao finalizar
            elemento.style.transform = 'scale(1.1)';
            setTimeout(() => {
                elemento.style.transform = 'scale(1)';
            }, 200);
        } else {
            elemento.textContent = Math.floor(atual).toLocaleString('pt-BR');
        }
    }, 16);
}

// 3. Sistema de formulários
function inicializarFormularios() {
    // Configurar formulário de doação financeira
    configurarFormularioFinanceiro();
    
    // Configurar todos os formulários
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        configurarFormulario(form);
    });
}

function configurarFormularioFinanceiro() {
    const opcaoOutroValor = document.querySelector('input[value="outro"]');
    const campoValorCustom = document.querySelector('.valor-custom');
    
    if (opcaoOutroValor && campoValorCustom) {
        opcaoOutroValor.addEventListener('change', function() {
            if (this.checked) {
                campoValorCustom.classList.remove('hidden');
                const inputValor = campoValorCustom.querySelector('input');
                if (inputValor) {
                    setTimeout(() => inputValor.focus(), 100);
                }
            } else {
                campoValorCustom.classList.add('hidden');
                const inputValor = campoValorCustom.querySelector('input');
                if (inputValor) {
                    inputValor.value = '';
                }
            }
        });

        // Se outro valor for selecionado, marcar o radio button
        const inputValorCustom = campoValorCustom.querySelector('input');
        if (inputValorCustom) {
            inputValorCustom.addEventListener('focus', function() {
                opcaoOutroValor.checked = true;
                opcaoOutroValor.dispatchEvent(new Event('change'));
            });
        }
    }

    // Efeitos visuais para botões de valor
    const botoesValor = document.querySelectorAll('.botao-valor');
    botoesValor.forEach(botao => {
        botao.addEventListener('click', function() {
            botoesValor.forEach(b => {
                b.style.background = '';
                b.style.color = '';
                b.style.transform = '';
            });
            this.style.background = 'var(--cor-primaria)';
            this.style.color = 'white';
            this.style.transform = 'scale(1.05)';
        });
    });
}

function configurarFormulario(form) {
    // Validar envio do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (this.checkValidity()) {
            processarEnvioFormulario(this);
        } else {
            mostrarErroValidacao(this);
        }
    });

    // Validação em tempo real para campos específicos
    const validarDataEntrega = form.querySelector('#dataEntrega, #dataEntregaRoupas');
    if (validarDataEntrega) {
        validarDataEntrega.addEventListener('change', function() {
            const dataSelecionada = new Date(this.value);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            if (dataSelecionada < hoje) {
                this.setCustomValidity('A data de entrega não pode ser no passado');
                this.classList.add('invalido');
            } else {
                this.setCustomValidity('');
                this.classList.remove('invalido');
            }
        });
    }

    // Configurar range de disponibilidade
    const rangeDisponibilidade = form.querySelector('#disponibilidade');
    const outputDisponibilidade = form.querySelector('#disponibilidade-valor');
    if (rangeDisponibilidade && outputDisponibilidade) {
        rangeDisponibilidade.addEventListener('input', function() {
            outputDisponibilidade.textContent = `${this.value} horas`;
            
            // Efeito visual
            outputDisponibilidade.style.transform = 'scale(1.1)';
            setTimeout(() => {
                outputDisponibilidade.style.transform = 'scale(1)';
            }, 150);
        });
    }
}

function processarEnvioFormulario(form) {
    const tipo = form.id.replace('form', '').replace('Doacao', '').replace('Oportunidade', '');
    let mensagem = '';
    let dados = {};
    
    switch(tipo) {
        case 'Financeira':
            const valorSelecionado = form.querySelector('input[name="valor"]:checked');
            let valor = valorSelecionado ? valorSelecionado.value : '';
            if (valor === 'outro') {
                valor = form.querySelector('#valorCustom').value;
            }
            const pagamento = form.querySelector('input[name="pagamento"]:checked').value;
            mensagem = `Doação de R$ ${valor} confirmada! Método: ${pagamento.toUpperCase()}. Em breve enviaremos instruções.`;
            dados = { tipo: 'financeira', valor, pagamento };
            break;
            
        case 'Alimentos':
            const alimentosSelecionados = Array.from(form.querySelectorAll('input[name="alimentos[]"]:checked'))
                .map(input => input.value);
            const dataEntrega = form.querySelector('#dataEntrega').value;
            mensagem = `Doação de ${alimentosSelecionados.length} itens registrada! Data de entrega: ${formatarData(dataEntrega)}.`;
            dados = { tipo: 'alimentos', itens: alimentosSelecionados, dataEntrega };
            break;
            
        case 'Roupas':
            const roupasSelecionadas = Array.from(form.querySelectorAll('input[name="roupas[]"]:checked'))
                .map(input => input.value);
            const condicao = form.querySelector('input[name="condicao"]:checked').value;
            mensagem = `Doação de ${roupasSelecionadas.length} tipos de roupas confirmada! Condição: ${condicao}.`;
            dados = { tipo: 'roupas', itens: roupasSelecionadas, condicao };
            break;
            
        case 'Trabalho':
            const cargo = form.querySelector('#cargo').value;
            const empresa = form.querySelector('#empresa').value;
            mensagem = `Oportunidade para "${cargo}" na ${empresa} cadastrada! Em breve entraremos em contato.`;
            dados = { tipo: 'trabalho', cargo, empresa };
            break;
            
        case 'cadastro':
            const nome = form.querySelector('#nomeCompleto').value;
            const participacao = form.querySelector('input[name="tipoParticipacao"]:checked').value;
            mensagem = `Cadastro de ${nome} confirmado! Tipo: ${participacao}. Bem-vindo à nossa equipe!`;
            dados = { tipo: 'cadastro', nome, participacao };
            break;
            
        default:
            mensagem = 'Ação confirmada com sucesso!';
            dados = { tipo: 'desconhecido' };
    }
    
    // Simular envio para o servidor
    simularEnvioServidor(dados)
        .then(() => {
            mostrarMensagemSucesso(mensagem);
            form.reset();
            resetarEstadosVisuais();
        })
        .catch(erro => {
            console.error('Erro no envio:', erro);
            mostrarMensagemErro('Erro ao processar solicitação. Tente novamente.');
        });
}

function mostrarErroValidacao(form) {
    const primeiroInvalido = form.querySelector(':invalid');
    if (primeiroInvalido) {
        // Rolagem suave para o campo inválido
        primeiroInvalido.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Foco e destaque visual
        setTimeout(() => {
            primeiroInvalido.focus();
            primeiroInvalido.classList.add('campo-invalido');
            
            // Remover destaque após correção
            primeiroInvalido.addEventListener('input', function() {
                this.classList.remove('campo-invalido');
            }, { once: true });
        }, 500);
    }
    
    mostrarMensagemErro('Por favor, preencha todos os campos obrigatórios corretamente.');
}

// 4. Sistema de máscaras
function inicializarMascaras() {
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            }
            e.target.value = value;
        });
    }

    // Máscara para Telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                if (value.length <= 2) {
                    value = value.replace(/(\d{0,2})/, '($1');
                } else if (value.length <= 7) {
                    value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                } else {
                    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
            }
            e.target.value = value;
        });
    }

    // Máscara para CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value;
        });
    }

    // Formatação de valor monetário
    const valorCustomInput = document.getElementById('valorCustom');
    if (valorCustomInput) {
        valorCustomInput.addEventListener('blur', function(e) {
            let value = parseFloat(e.target.value);
            if (!isNaN(value) && value > 0) {
                e.target.value = value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        });

        valorCustomInput.addEventListener('focus', function(e) {
            let value = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
            value = parseFloat(value);
            if (!isNaN(value)) {
                e.target.value = value.toFixed(2);
            }
        });
    }

    // Máscara para salário
    const salarioInput = document.getElementById('salario');
    if (salarioInput) {
        salarioInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value) {
                value = (parseInt(value) / 100).toFixed(2);
                value = value.replace('.', ',');
                value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                e.target.value = 'R$ ' + value;
            }
        });
    }
}

// 5. Sistema de feedback visual
function inicializarFeedbackVisual() {
    // Adicionar indicador de campo obrigatório
    const camposObrigatorios = document.querySelectorAll('[required]');
    camposObrigatorios.forEach(campo => {
        const label = campo.closest('.campo-grupo')?.querySelector('.rotulo');
        if (label && !label.querySelector('.obrigatorio')) {
            const span = document.createElement('span');
            span.className = 'obrigatorio';
            span.textContent = ' *';
            span.setAttribute('aria-hidden', 'true');
            label.appendChild(span);
        }
    });

    // Feedback em tempo real
    const camposValidaveis = document.querySelectorAll('input, select, textarea');
    camposValidaveis.forEach(campo => {
        campo.addEventListener('blur', function() {
            this.classList.add('tocado');
            validarCampo(this);
        });

        campo.addEventListener('input', function() {
            if (this.classList.contains('tocado')) {
                validarCampo(this);
            }
        });
    });

    // Efeitos de hover para cards interativos
    const cardsInterativos = document.querySelectorAll('.ajuda-card, .historia-card, .estatistica-item');
    cardsInterativos.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function validarCampo(campo) {
    campo.classList.remove('valido', 'invalido');
    
    if (campo.checkValidity()) {
        campo.classList.add('valido');
    } else if (campo.classList.contains('tocado')) {
        campo.classList.add('invalido');
    }
}

// 6. Sistema de mensagens
function mostrarMensagemSucesso(mensagem) {
    criarMensagem(mensagem, 'sucesso');
}

function mostrarMensagemErro(mensagem) {
    criarMensagem(mensagem, 'erro');
}

function criarMensagem(mensagem, tipo) {
    // Remover mensagens existentes
    document.querySelectorAll('.mensagem-sucesso, .mensagem-erro').forEach(msg => msg.remove());

    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `mensagem-${tipo}`;
    mensagemDiv.setAttribute('role', 'alert');
    mensagemDiv.setAttribute('aria-live', 'assertive');
    
    const icone = tipo === 'sucesso' ? '✅' : '⚠️';
    
    mensagemDiv.innerHTML = `
        <div class="mensagem-conteudo">
            <span class="mensagem-icone" aria-hidden="true">${icone}</span>
            <span class="mensagem-texto">${mensagem}</span>
            <button class="mensagem-fechar" onclick="this.parentElement.parentElement.remove()" aria-label="Fechar mensagem">×</button>
        </div>
    `;
    
    document.body.appendChild(mensagemDiv);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (mensagemDiv.parentElement) {
            mensagemDiv.remove();
        }
    }, 5000);
}

// 7. Funções auxiliares
function inicializarEventosAdicionais() {
    // Prevenir envio duplo de formulários
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        let enviando = false;
        form.addEventListener('submit', function(e) {
            if (enviando) {
                e.preventDefault();
                return;
            }
            enviando = true;
            
            // Reativar após 3 segundos
            setTimeout(() => {
                enviando = false;
            }, 3000);
        });
    });

    // Melhorar acessibilidade do menu
    const linksMenu = document.querySelectorAll('.navegacao a');
    linksMenu.forEach(link => {
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

function resetarEstadosVisuais() {
    // Reset do campo de valor customizado
    const campoValorCustom = document.querySelector('.valor-custom');
    if (campoValorCustom) {
        campoValorCustom.classList.add('hidden');
    }
    
    // Reset de seleções visuais
    const botoesValor = document.querySelectorAll('.botao-valor');
    botoesValor.forEach(botao => {
        botao.style.background = '';
        botao.style.color = '';
        botao.style.transform = '';
    });
    
    // Reset de estados de validação
    const campos = document.querySelectorAll('input, select, textarea');
    campos.forEach(campo => {
        campo.classList.remove('tocado', 'valido', 'invalido', 'campo-invalido');
    });
}

function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
}

// 8. Simulação de envio para servidor
function simularEnvioServidor(dados) {
    return new Promise((resolve, reject) => {
        // Simular delay de rede
        setTimeout(() => {
            // Simular 95% de sucesso
            if (Math.random() < 0.95) {
                console.log('📤 Dados enviados com sucesso:', dados);
                resolve(dados);
            } else {
                reject(new Error('Erro de conexão'));
            }
        }, 1500);
    });
}

// 9. Funções de validação específicas
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validar primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    // Validar segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    
    return digito2 === parseInt(cpf.charAt(10));
}

// 10. Exportar funções para uso global
window.validarEmail = validarEmail;
window.validarCPF = validarCPF;
window.mostrarMensagemSucesso = mostrarMensagemSucesso;
window.mostrarMensagemErro = mostrarMensagemErro;

// 11. Adicionar estilos CSS dinâmicos
const estilosDinamicos = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid var(--cor-primaria);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .pulse {
        animation: pulse 2s infinite;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = estilosDinamicos;
document.head.appendChild(styleSheet);

console.log('✅ Todas as funcionalidades JavaScript foram carregadas!');