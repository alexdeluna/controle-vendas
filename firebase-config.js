// ======================================
// FIREBASE CONFIG
// ======================================

const firebaseConfig = {
     apiKey: "AIzaSyCfEKfoHKU_H-JTsfrWVKmalrA9YVEvp08",
    authDomain: "evento-vendas.firebaseapp.com",
    projectId: "evento-vendas",
    storageBucket: "evento-vendas.firebasestorage.app",
    messagingSenderId: "356187089871",
    appId: "1:356187089871:web:d305a448d15179070a80ba"
};

// ======================================
// INICIALIZAÇÃO
// ======================================

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

// ======================================
// CONFIGURAÇÕES DO EVENTO
// ======================================

const CONFIG_PADRAO = {
    lugaresDisponiveis: 100,
    arrecadacaoCentavos: 0,

    mesasCoolerVendidas: 0,
    mesasSemCoolerVendidas: 0,
    cadeirasVendidas: 0,
	mesasVendidas: 0,

    totalMesas: 25,
    totalLugares: 100,

    valorMesaCooler: 10000,
    valorMesaSemCooler: 6000,
    valorAvulso: 2000,

    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
};

// ======================================
// REFERÊNCIAS
// ======================================

const CONFIG_REF = db.collection("sistema").doc("config");

const VENDAS_REF = db.collection("vendas");

const USUARIOS_REF = db.collection("usuarios");

// ======================================
// FUNÇÕES GERAIS
// ======================================

function formatarMoeda(centavos) {
    return (centavos / 100).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

function calcularMesasVendaveis(lugaresDisponiveis) {
    return Math.floor(lugaresDisponiveis / 4);
}

function gerarDataLocal() {

    const agora = new Date();

    const dia = String(
        agora.getDate()
    ).padStart(2, "0");

    const mes = String(
        agora.getMonth() + 1
    ).padStart(2, "0");

    const ano = agora.getFullYear();

    const hora = String(
        agora.getHours()
    ).padStart(2, "0");

    const minuto = String(
        agora.getMinutes()
    ).padStart(2, "0");

    const segundo = String(
        agora.getSeconds()
    ).padStart(2, "0");

    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
}

// ======================================
// INICIALIZAÇÃO DO BANCO
// ======================================

async function criarConfiguracaoInicial() {

    try {

        const doc = await CONFIG_REF.get();

        if (!doc.exists) {

            await CONFIG_REF.set(CONFIG_PADRAO);

            console.log(
                "Configuração inicial criada."
            );

        }

    } catch (erro) {

        console.error(
            "Erro ao criar configuração:",
            erro
        );

    }

}

// ======================================
// OUVINTE TEMPO REAL
// ======================================

function observarDashboard(callback) {

    return CONFIG_REF.onSnapshot((doc) => {

        if (!doc.exists) return;

        const dados = doc.data();

        callback({
            ...dados,
            mesasVendaveis:
                calcularMesasVendaveis(
                    dados.lugaresDisponiveis
                )
        });

    });

}

// ======================================
// AUXILIARES
// ======================================

function gerarNumeroMesa() {

    return String(
        Date.now()
    );

}

function gerarCodigoVenda() {

    return crypto.randomUUID();

}

// ======================================
// BOOT
// ======================================

criarConfiguracaoInicial();