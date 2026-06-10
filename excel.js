// ======================================
// EXPORTAÇÃO EXCEL E PDF
// ======================================

async function obterListaPortaria() {

    const snapshot =
        await VENDAS_REF
            .orderBy(
                "timestamp",
                "asc"
            )
            .get();

    const lista = [];

    snapshot.forEach((doc) => {

        const venda =
            doc.data();

        if (
            venda.tipo ===
                "mesaCooler" ||
            venda.tipo ===
                "mesaSemCooler"
        ) {

            venda.nomes.forEach(
                nome => {

                    lista.push({

                        Nome: nome,

                        Tipo:
                            venda.tipo ===
                            "mesaCooler"
                                ? "Mesa Cooler"
                                : "Mesa Sem Cooler",

                        Mesa:
                            venda.mesa,

                        Vendedor:
                            venda.vendedor,

                        Valor:
                            venda.valor / 100

                    });

                }
            );

        }

        if (
            venda.tipo ===
            "avulso"
        ) {

            lista.push({

                Nome:
                    venda.nomes[0],

                Tipo:
                    "Cadeira Avulsa",

                Mesa:
                    "-",

                Vendedor:
                    venda.vendedor,

                Valor:
                    venda.valor / 100

            });

        }

    });

   lista.sort(
    (a, b) =>
        a.Nome.localeCompare(
            b.Nome,
            "pt-BR"
        )
);

return lista;

}

// ======================================
// EXCEL
// ======================================

async function exportarExcel() {

    try {

        const lista =
            await obterListaPortaria();

        const workbook =
            XLSX.utils.book_new();

        const worksheet =
            XLSX.utils.json_to_sheet(
                lista
            );

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Portaria"
        );

        XLSX.writeFile(
            workbook,
            "controle-portaria.xlsx"
        );

    } catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao exportar Excel."
        );

    }

}

// ======================================
// PDF
// ======================================

async function exportarPDF() {

    try {

        const lista =
            await obterListaPortaria();

        const {
            jsPDF
        } = window.jspdf;

        const pdf =
            new jsPDF();

        let y = 15;

        pdf.setFontSize(16);

        pdf.text(
            "Lista de Portaria",
            10,
            y
        );

        y += 12;

        pdf.setFontSize(10);

        lista.forEach(
            item => {

                const linha =
                    `${item.Nome} | ${item.Tipo} | Mesa ${item.Mesa}`;

                pdf.text(
                    linha,
                    10,
                    y
                );

                y += 6;

                if (y > 270) {

                    pdf.addPage();

                    y = 15;

                }

            }
        );

        pdf.save(
            "lista-portaria.pdf"
        );

    } catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao exportar PDF."
        );

    }

}

// ======================================
// RELATÓRIO FINANCEIRO
// ======================================

async function gerarResumoFinanceiro() {

    const snapshot =
        await VENDAS_REF.get();

    let cooler = 0;
    let semCooler = 0;
    let avulso = 0;

    let total = 0;

    snapshot.forEach(
        doc => {

            const venda =
                doc.data();

            total +=
                venda.valor;

            if (
                venda.tipo ===
                "mesaCooler"
            ) {

                cooler++;

            }

            if (
                venda.tipo ===
                "mesaSemCooler"
            ) {

                semCooler++;

            }

            if (
                venda.tipo ===
                "avulso"
            ) {

                avulso++;

            }

        }
    );

    return {

        cooler,
        semCooler,
        avulso,
        total

    };

}