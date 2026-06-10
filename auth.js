// ======================================
// AUTH.JS
// ======================================

const loginScreen =
    document.getElementById("loginScreen");

const appScreen =
    document.getElementById("appScreen");

let usuarioAtual = null;

// ======================================
// LOGIN
// ======================================

async function fazerLogin() {

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const senha =
        document
            .getElementById("senha")
            .value
            .trim();

    if (!email || !senha) {

        alert(
            "Informe e-mail e senha."
        );

        return;
    }

    try {

        await auth.signInWithEmailAndPassword(
            email,
            senha
        );

    } catch (erro) {

        console.error(erro);

        alert(
            "Usuário ou senha inválidos."
        );

    }

}

// ======================================
// LOGOUT
// ======================================

async function logout() {

    try {

        await auth.signOut();

    } catch (erro) {

        console.error(erro);

    }

}

// ======================================
// SESSÃO
// ======================================

auth.onAuthStateChanged(
    async (user) => {

        if (!user) {

            usuarioAtual = null;

            loginScreen.classList.remove(
                "hidden"
            );

            appScreen.classList.add(
                "hidden"
            );

            return;
        }

        try {

            const usuarioDoc =
                await USUARIOS_REF
                    .doc(user.uid)
                    .get();

            usuarioAtual = {
                uid: user.uid,
                email: user.email,
                nome:
                    usuarioDoc.exists
                        ? usuarioDoc.data().nome
                        : user.email
            };

            loginScreen.classList.add(
                "hidden"
            );

            appScreen.classList.remove(
                "hidden"
            );

            iniciarSistema();

        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao carregar usuário."
            );

        }

    }
);

// ======================================
// CRIAÇÃO DOS 6 VENDEDORES
// EXECUTAR APENAS UMA VEZ
// ======================================

async function criarUsuariosPadrao() {

    const vendedores = [

        {
            email:
                "vendedor1@evento.com",
            senha:
                "123456",
            nome:
                "Vendedor 1"
        },

        {
            email:
                "vendedor2@evento.com",
            senha:
                "123456",
            nome:
                "Vendedor 2"
        },

        {
            email:
                "vendedor3@evento.com",
            senha:
                "123456",
            nome:
                "Vendedor 3"
        },

        {
            email:
                "vendedor4@evento.com",
            senha:
                "123456",
            nome:
                "Vendedor 4"
        },

        {
            email:
                "vendedor5@evento.com",
            senha:
                "123456",
            nome:
                "Vendedor 5"
        },

        {
            email:
                "vendedor6@evento.com",
            senha:
                "123456",
            nome:
                "Vendedor 6"
        }

    ];

    for (const vendedor of vendedores) {

        try {

            const credencial =
                await auth
                    .createUserWithEmailAndPassword(
                        vendedor.email,
                        vendedor.senha
                    );

            await USUARIOS_REF
                .doc(
                    credencial.user.uid
                )
                .set({

                    nome:
                        vendedor.nome,

                    email:
                        vendedor.email,

                    criadoEm:
                        firebase.firestore.FieldValue.serverTimestamp()

                });

            console.log(
                vendedor.nome,
                "criado."
            );

        } catch (erro) {

            console.log(
                vendedor.nome,
                erro.message
            );

        }

    }

}

// ======================================
// VERIFICAÇÃO
// ======================================

function usuarioLogado() {

    return !!usuarioAtual;

}

function nomeUsuarioAtual() {

    if (!usuarioAtual)
        return "Desconhecido";

    return usuarioAtual.nome;

}

function emailUsuarioAtual() {

    if (!usuarioAtual)
        return "";

    return usuarioAtual.email;

}