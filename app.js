// ======================================
// APP.JS
// ======================================

let unsubscribeDashboard = null;

let dashboardAtual = {
    lugaresDisponiveis: 100,
    arrecadacaoCentavos: 0,
    mesasCoolerVendidas: 0,
    mesasSemCoolerVendidas: 0,
    cadeirasVendidas: 0,
    mesasVendaveis: 25
};

// ======================================
// INICIALIZAÇÃO
// ======================================

function iniciarSistema() {

    if (unsubscribeDashboard) {
        unsubscribeDashboard();
    }

    unsubscribeDashboard =
        observarDashboard(
            atualizarDashboard
        );

}

// ======================================
// DASHBOARD
// ======================================

function atualizarDashboard(dados) {

    dashboardAtual = dados;

    document.getElementById(
        "lugaresDisponiveis"
    ).textContent =
        dados.lugaresDisponiveis;

    document.getElementById(
        "mesasVendaveis"
    ).textContent =
        dados.mesasVendaveis;

    document.getElementById(
        "arrecadacao"
    ).textContent =
        formatarMoeda(
            dados.arrecadacaoCentavos
        );
		
		document.getElementById(
    "mesasCooler"
).textContent =
    dados.mesasCoolerVendidas;

document.getElementById(
    "mesasSemCooler"
).textContent =
    dados.mesasSemCoolerVendidas;

document.getElementById(
    "avulsos"
).textContent =
    dados.cadeirasVendidas;

}

// ======================================
// NAVEGAÇÃO
// ======================================

function esconderTelas() {

    document
        .getElementById("telaCooler")
        .classList.add("hidden");

    document
        .getElementById("telaSemCooler")
        .classList.add("hidden");

    document
        .getElementById("telaAvulso")
        .classList.add("hidden");

    document
        .getElementById("telaRelatorios")
        .classList.add("hidden");

}

function abrirTela(tipo) {

    esconderTelas();

    switch (tipo) {

        case "cooler":
            document
                .getElementById(
                    "telaCooler"
                )
                .classList.remove(
                    "hidden"
                );
            break;

        case "semCooler":
            document
                .getElementById(
                    "telaSemCooler"
                )
                .classList.remove(
                    "hidden"
                );
            break;

        case "avulso":
            document
                .getElementById(
                    "telaAvulso"
                )
                .classList.remove(
                    "hidden"
                );
            break;

        case "relatorios":
            document
                .getElementById(
                    "telaRelatorios"
                )
                .classList.remove(
                    "hidden"
                );

            carregarRelatorios();
            break;

    }

}

// ======================================
// AUXILIARES
// ======================================

function obterProximaMesa() {

    const totalMesasVendidas =
        dashboardAtual
            .mesasCoolerVendidas +
        dashboardAtual
            .mesasSemCoolerVendidas;

    return totalMesasVendidas + 1;

}

function validarMesa() {

    if (
        dashboardAtual
            .lugaresDisponiveis < 4
    ) {

        alert(
            "Não existem 4 lugares disponíveis para vender uma mesa."
        );

        return false;
    }

    return true;

}

function validarAvulso() {

    if (
        dashboardAtual
            .lugaresDisponiveis < 1
    ) {

        alert(
            "Não existem lugares disponíveis."
        );

        return false;
    }

    return true;

}

// ======================================
// VENDA MESA COM COOLER
// ======================================

async function venderMesaCooler() {

    if (!validarMesa()) {
        return;
    }

    const nomes = [

        document.getElementById(
            "coolerNome1"
        ).value.trim(),

        document.getElementById(
            "coolerNome2"
        ).value.trim(),

        document.getElementById(
            "coolerNome3"
        ).value.trim(),

        document.getElementById(
            "coolerNome4"
        ).value.trim()

    ];

    if (
        nomes.some(
            nome => !nome
        )
    ) {

        alert(
            "Preencha os 4 nomes."
        );

        return;
    }

    try {

        await db.runTransaction(
            async (transaction) => {

                const configDoc =
                    await transaction.get(
                        CONFIG_REF
                    );

                const config =
                    configDoc.data();

                if (
                    config
                        .lugaresDisponiveis < 4
                ) {

                    throw new Error(
                        "Sem lugares."
                    );

                }

				if (
    config.mesasVendidas >= 25
) {
    throw new Error(
        "Todas as mesas foram vendidas."
    );
}	
					
                const numeroMesa =
                    config
                        .mesasCoolerVendidas +
                    config
                        .mesasSemCoolerVendidas +
                    1;

                const vendaRef =
                    VENDAS_REF.doc();

                transaction.set(
                    vendaRef,
                    {

                        codigo:
                            gerarCodigoVenda(),
							
							status: "ativa",

                        tipo:
                            "mesaCooler",

                        mesa:
                            numeroMesa,

                        valor:
                            10000,

                        nomes,

                        vendedor:
                            nomeUsuarioAtual(),

                        data:
                            gerarDataLocal(),

                        timestamp:
                            firebase.firestore.FieldValue.serverTimestamp()

                    }
                );

                transaction.update(
                    CONFIG_REF,
                    {

                        lugaresDisponiveis:
                            config
                                .lugaresDisponiveis - 4,

                        arrecadacaoCentavos:
                            config
                                .arrecadacaoCentavos + 10000,

                        mesasCoolerVendidas:
                            config
                                .mesasCoolerVendidas + 1,
								
								mesasVendidas:
								config
									.mesasVendidas + 1

                    }
                );

            }
        );

        limparMesaCooler();

        alert(
            "Venda realizada com sucesso."
        );

    } catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao registrar venda."
        );

    }

}

// ======================================
// LIMPEZA
// ======================================

function limparMesaCooler() {

    document.getElementById(
        "coolerNome1"
    ).value = "";

    document.getElementById(
        "coolerNome2"
    ).value = "";

    document.getElementById(
        "coolerNome3"
    ).value = "";

    document.getElementById(
        "coolerNome4"
    ).value = "";

}

// ======================================
// VENDA MESA SEM COOLER
// ======================================

async function venderMesaSemCooler() {

    if (!validarMesa()) {
        return;
    }

    const nomes = [

        document.getElementById(
            "semNome1"
        ).value.trim(),

        document.getElementById(
            "semNome2"
        ).value.trim(),

        document.getElementById(
            "semNome3"
        ).value.trim(),

        document.getElementById(
            "semNome4"
        ).value.trim()

    ];

    if (
        nomes.some(nome => !nome)
    ) {

        alert(
            "Preencha os 4 nomes."
        );

        return;
    }

    try {

        await db.runTransaction(
            async (transaction) => {

                const configDoc =
                    await transaction.get(
                        CONFIG_REF
                    );

                const config =
                    configDoc.data();

                if (
                    config
                        .lugaresDisponiveis < 4
                ) {

                    throw new Error(
                        "Sem lugares."
                    );

                }

				if (
    config.mesasVendidas >= 25
) {
    throw new Error(
        "Todas as mesas foram vendidas."
    );
}
				
                const numeroMesa =
                    config
                        .mesasCoolerVendidas +
                    config
                        .mesasSemCoolerVendidas +
                    1;

                const vendaRef =
                    VENDAS_REF.doc();

                transaction.set(
                    vendaRef,
                    {

                        codigo:
                            gerarCodigoVenda(),
							
							status: "ativa",

                        tipo:
                            "mesaSemCooler",

                        mesa:
                            numeroMesa,

                        valor:
                            6000,

                        nomes,

                        vendedor:
                            nomeUsuarioAtual(),

                        data:
                            gerarDataLocal(),

                        timestamp:
                            firebase.firestore.FieldValue.serverTimestamp()

                    }
                );

                transaction.update(
                    CONFIG_REF,
                    {

                        lugaresDisponiveis:
                            config
                                .lugaresDisponiveis - 4,

                        arrecadacaoCentavos:
                            config
                                .arrecadacaoCentavos + 6000,

                        mesasSemCoolerVendidas:
                            config
                                .mesasSemCoolerVendidas + 1

                    }
                );

            }
        );

        limparMesaSemCooler();

        alert(
            "Venda realizada com sucesso."
        );

    } catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao registrar venda."
        );

    }

}

// ======================================
// LIMPEZA MESA SEM COOLER
// ======================================

function limparMesaSemCooler() {

    document.getElementById(
        "semNome1"
    ).value = "";

    document.getElementById(
        "semNome2"
    ).value = "";

    document.getElementById(
        "semNome3"
    ).value = "";

    document.getElementById(
        "semNome4"
    ).value = "";

}

// ======================================
// VENDA AVULSO
// ======================================

async function venderAvulso() {

    if (!validarAvulso()) {
        return;
    }

    const nome =
        document
            .getElementById(
                "nomeAvulso"
            )
            .value
            .trim();

    if (!nome) {

        alert(
            "Informe o nome."
        );

        return;
    }

    try {

        await db.runTransaction(
            async (transaction) => {

                const configDoc =
                    await transaction.get(
                        CONFIG_REF
                    );

                const config =
                    configDoc.data();

                if (
                    config
                        .lugaresDisponiveis < 1
                ) {

                    throw new Error(
                        "Sem lugares."
                    );

                }

                const vendaRef =
                    VENDAS_REF.doc();

                transaction.set(
                    vendaRef,
                    {

                        codigo:
                            gerarCodigoVenda(),
							
							status: "ativa",

                        tipo:
                            "avulso",

                        valor:
                            2000,

                        nomes: [nome],

                        vendedor:
                            nomeUsuarioAtual(),

                        data:
                            gerarDataLocal(),

                        timestamp:
                            firebase.firestore.FieldValue.serverTimestamp()

                    }
                );

                transaction.update(
                    CONFIG_REF,
                    {

                        lugaresDisponiveis:
                            config
                                .lugaresDisponiveis - 1,

                        arrecadacaoCentavos:
                            config
                                .arrecadacaoCentavos + 2000,

                        cadeirasVendidas:
                            config
                                .cadeirasVendidas + 1

                    }
                );

            }
        );

        limparAvulso();

        alert(
            "Venda realizada com sucesso."
        );

    } catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao registrar venda."
        );

    }

}

// ======================================
// LIMPEZA AVULSO
// ======================================

function limparAvulso() {

    document.getElementById(
        "nomeAvulso"
    ).value = "";

}

// ======================================
// RELATÓRIOS
// ======================================

async function carregarRelatorios() {

    const container =
        document.getElementById(
            "relatorioVendedores"
        );

    container.innerHTML =
        "<p>Carregando...</p>";

    try {

        const snapshot =
            await VENDAS_REF
                .orderBy(
                    "timestamp",
                    "asc"
                )
                .get();

        const vendas =
            snapshot.docs.map(
                doc => doc.data()
            );

        const resumo = {};

        vendas.forEach(
            venda => {

                if (
                    !resumo[
                        venda.vendedor
                    ]
                ) {

                    resumo[venda.vendedor] = {
    total: 0,
    mesas: [],
    avulsos: 0,
    cooler: 0,
    semCooler: 0
};

                }

                resumo[
                    venda.vendedor
                ].total +=
                    venda.valor;

                if (
                    venda.tipo ===
                        "mesaCooler" ||
                    venda.tipo ===
                        "mesaSemCooler"
                )
				if (
    venda.tipo ===
    "mesaCooler"
) {

    resumo[
        venda.vendedor
    ].cooler++;

}

if (
    venda.tipo ===
    "mesaSemCooler"
) {

    resumo[
        venda.vendedor
    ].semCooler++;

}

				{

                    resumo[
                        venda.vendedor
                    ].mesas.push({

                        mesa:
                            venda.mesa,

                        tipo:
                            venda.tipo

                    });

                }

                if (
                    venda.tipo ===
                    "avulso"
                ) {

                    resumo[
                        venda.vendedor
                    ].avulsos++;

                }

            }
        );

        let html = "";

        Object.keys(
            resumo
        ).forEach(
            vendedor => {

                const dados =
                    resumo[
                        vendedor
                    ];

                html += `
                <div class="relatorio-card">

                    <h3>
                        ${vendedor}
                    </h3>

                    <p>
                        Total:
                        ${formatarMoeda(
                            dados.total
                        )}
                    </p>

                    <p>
                        Avulsos:
                        ${dados.avulsos}
                    </p>
					
					<p>
    Mesas Cooler:
    ${dados.cooler}
</p>

<p>
    Mesas Sem Cooler:
    ${dados.semCooler}
</p>

                    <ul>
                        ${dados.mesas
                            .map(
                                mesa => `
                                <li>
                                    Mesa ${mesa.mesa}
                                    -
                                    ${
                                        mesa.tipo === "mesaCooler"
                                            ? "Cooler"
                                            : "Sem Cooler"
                                    }
                                </li>
                            `
                            )
                            .join("")
                        }
                    </ul>

                </div>
                `;

            }
        );

        container.innerHTML =
            html;

    } catch (erro) {

        console.error(
            erro
        );

        container.innerHTML =
            "<p>Erro ao carregar relatório.</p>";

    }

}