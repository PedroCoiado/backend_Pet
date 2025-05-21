// Importar a bliblioteca do node modules express para criar nosso servidor de backend
const express = require('express') 

// Importar a biblioteca do node modules cors para permitir requisições de outros domínios

const mysql = require('mysql2'); 

const cors = require('cors');

const path = require('path');


//importar a biblioteca do bcrypt
//para a criptografia de senha
const bcrypt = require("bcrypt");
// Importar a biblioteca do jwt 
const jwt = require("jsonwebtoken");
const { pathToFileURL } = require('url');


// Carregar a função que manipula dados em formatos JSON, ou seja (Delete, Ler, Gravar, Atualizar)
const con= mysql.createConnection({
    host:"127.0.0.1",
    port:"3306",
    user:"root",
    password:"",
    database:"dbpethouse"
})

con.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao MySQL:', err);
    } else {
      console.log('Conectado ao MySQL!');
    }
  });
  
  module.exports = con;


const app = express(); // Criando uma instância do express


app.use(express.json());

// Ativar o modulo do cors
app.use(cors());

app.use(express.static('fotos'));








// Primeira rota para listar os dados do banco 

app.get('/listar_user', (req, res) => {
    // Aqui estamos criando uma rota para listar todos os usuários
    con. query("SELECT * FROM usuario", (error, result) => {
        if(error) {
            return res.status(500)
            .send({msg: `Erro ao listar os dados do usuário, ${error}`});
        }
        else {
            res.status(200).send({msg:result}) // Se não houver erro, retornamos os dados

        }
    })

    });
// req é o request, ou seja, a requisição que o cliente faz para o servid_clienteor
// res é a resposta que o servid_clienteor envia para o cliente
// A função res.send() envia uma resposta para o cliente
// A função res.status() define o status da resposta, 200 significa que a requisição foi bem sucedid_clientea
// Primeira rota para listar os dados do banco





// Segunda rota para cadastrar um novo usuário no banco
app.post('/cad_user', (req, res) => {
    let sh = req.body.Senha_usuario;

// Aqui estamos criando uma rota para cadastrar um novo usuário 
    // O bcrypt é uma biblioteca para criptografar senhas
    // O bcrypt.hashSync() é uma função que criptografa a senha
    bcrypt.hash(sh, 10, (erro, criptografada) => {
        if (erro) {
            return res.status(500) .send({error:`Erro ao criptografar a senha, ${erro}`});
            // se houver erro, o sistema fica invulnerável para ataques
        }
        // Devolver o resultado da senha criptografada para o body,
        // porém com a devida criptografia

        req.body.Senha_usuario = criptografada;
    con.query("INSERT INTO usuario (Email_usuario, Senha_usuario) VALUES (?, ?) ",[req.body.Email_usuario, req.body.Senha_usuario], (error, result) => {
        if (error) {
            return res.status(500) // Se houver um erro, retornamos o erro
            .send({error:`Erro ao cadastrar os dados, ${error}`});

        }
        let Idusuario= result.insertId;
        con.query("INSERT INTO dados_pessoais (Nome, Sobrenome, ID_Usuario) VALUES (?,?,?)",[req.body.Nome, req.body.Sobrenome, Idusuario], (erro, resultado) => {
          if (erro) {
            return res.status(500) // Se houver um erro, retornamos o erro
            .send({error:`Erro ao cadastrar os dados, ${erro}`});
          }

        })
            res.status(201).send({msg:`Usuário cadastrado`,payload:result});
    })
})
});

// Terceira rota para receber os dados e atualizar os dados do banco
app.put('/atualizar_user/:ID_Usuario', (req, res) => {
    con.query("UPDATE usuario set ? WHERE ID_Usuario = ?",[req.body,req.params.ID_Usuario], (error, result) => {
        if (error) {
            return res.status(500) // Se houver um erro, retornamos o erro
            .send({error:`Erro ao atualizar os dados, ${error}`});
        }
        res.status(200)
        .send({msg:`dados atualizado`,payload:result});
    });
}); // O :ID é um parâmetro que será passado na URL, por exemplo: /atualizar_user/1

// Quarta rota para deletar um usuário do banco
    app.delete('/delete_user/:ID_Usuario', (req, res) => {
        con.query("DELETE FROM usuario WHERE ID_Usuario = ?",[req.params.ID_Usuario], (error, result) => {
            if (error) {
                return res.status(500) // Se houver um erro, retornamos o erro
                .send({error:`Erro ao deletar os dados, ${error}`});
            }
            res.status(200)
            .send({msg:`dados deletado`,payload:result});
        });
    }); // O :ID é um parâmetro que será passado na URL, por exemplo: /delete_user/1


    // ==========================================================================================

  app.get('/fotos', (req, res) => {
      res.sendFile(__dirname +"/fotos/id1photo.png");
  });

//Login
app.post('/login', (req, res) => {
  const { Email_usuario, Senha_usuario } = req.body;
  console.log(Senha_usuario)
  con.query("SELECT us.ID_Usuario, us.Email_usuario, us.Senha_usuario, us.Foto_usuario, us.Tipo_usuario, dp.Nome, dp.Sobrenome FROM usuario us INNER JOIN dados_pessoais dp ON us.ID_Usuario = dp.ID_Usuario WHERE  us.Email_usuario = ?", [Email_usuario], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).send({ msg: "Usuário ou senha inválidos" });
    }

    const usuario = results[0];
    console.log(usuario)

    // Verifica a senha com bcrypt
    bcrypt.compare(Senha_usuario, usuario.Senha_usuario, (erro, batem) => {
      if (erro || !batem) {
        return res.status(401).send({ msg: "Usuário ou senha inválidos" });
      }
      if (usuario.Tipo_usuario ==null || usuario.Tipo_usuario.trim() === '') {
        return res.status(200).send({ 
          msg: "Altere seu tipo de perfil.", 
          usuario: {
  
            id: usuario.ID_Usuario,
            email: usuario.Email_usuario,
            nome: usuario.Nome,
            sobrenome: usuario.Sobrenome,
            foto:usuario.Foto_usuario // ajuste conforme o nome do campo
          }})
        }
          else{        
      // Se autenticado com sucesso
      return res.status(200).send({ 
        msg: "Login realizado com sucesso", 
        usuario: {

          id: usuario.ID_Usuario,
          email: usuario.Email_usuario,
          nome: usuario.Nome,
          sobrenome: usuario.Sobrenome, 
          foto: usuario.Foto_usuario // ajuste conforme o nome do campo
        }
      })
    }
  });
});
});



//===================================================================================================

//Meu perfil


// app.post('/meu-perfil', (req, body) => {
//   const { experiencia,  } = req.body;
//   con.query("INSERT * FROM dados_pessoais WHERE ID_Usuario = 
// });


// Inserir Dados no Perfil

app.put(`/meu-perfil`, (req, body) => {

con.query




})


// =============================================================================================================


// Atualizar meu perfil

app.put('/meu-perfil/:id', (req, res) => {
  const id = req.params.id;
  const dados = req.body;

  const query = "UPDATE usuario SET ? WHERE ID_Usuario = ?";

  con.query(query, [dados, id], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao atualizar os dados: ${error}` });
    }

    res.status(200).send({ msg: "Dados do usuário atualizados com sucesso", payload: result });
  });
});

// app.put('/meu-perfil/tipo-usuario/:id', (req, res) => {
//   // con.query("UPDATE usuario SET ? WHERE ID_Usuario = ?", [req.body, req.params.id], (error, result) => {
//   //   if (error) {
//   //     return res.status(500)
//   //     .send({msg:`Erro ao atualizar os dados ${error}`})
//   //   }
//   //   res.status(200)
//   //   .send({msg:`Dados atualizados`,payload:result});
//   // })
//   console.log(req.body)
// })
app.post('/meu-perfil/inserir-endereco/', (req, res) => {
  const {
    ID_Usuario,
    CEP,
    Endereco, // Logradouro
    Numero,
    Bairro,
    Cidade,
    Estado
  } = req.body;

  const query = `
    INSERT INTO enderecos 
      (ID_Usuario, CEP, Logradouro, Numero, Bairro, Cidade, Estado)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [ID_Usuario, CEP, Endereco, Numero, Bairro, Cidade, Estado];

  console.log("Dados recebidos para inserir:", values);

  con.query(query, values, (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao inserir endereço: ${error}` });
    }

    res.status(200).send({ msg: "Endereço inserido com sucesso", payload: result });
  });
});

app.put('/meu-perfil/alterar-dados-pessoais/:id', (req, res) => {
  console.log(req.body)
  console.log(req.params.id)
  const id = req.params.id;
  const {
    CPF,
    RG,
    Data_Nascimento,
    Genero,
    Celular,
    CEP,
    Endereco,
    Numero,
    Bairro,
    Cidade,
    Estado
  } = req.body;

  // 1. Atualiza dados pessoais
  const queryDadosPessoais = `
    UPDATE dados_pessoais
    SET CPF = ?, RG = ?, Data_Nascimento = ?, Genero = ?, Celular = ?
    WHERE ID_Usuario = ?
  `;

  const valoresPessoais = [CPF, RG, Data_Nascimento, Genero, Celular, id];

  con.query(queryDadosPessoais, valoresPessoais, (erro1, resultado1) => {
    if (erro1) {
      return res.status(500).send({ msg: `Erro ao atualizar dados pessoais: ${erro1}` });
    }

    // 2. Verifica se já existe endereço para esse usuário
    const queryVerificaEndereco = `SELECT * FROM enderecos WHERE ID_Usuario = ?`;
    con.query(queryVerificaEndereco, [id], (erro2, resultados) => {
      if (erro2) {
        return res.status(500).send({ msg: `Erro ao verificar endereço: ${erro2}` });
      }

      // Se já existe, faz UPDATE
      if (resultados.length > 0) {
        const queryUpdateEndereco = `
          UPDATE enderecos
          SET CEP = ?, Logradouro = ?, Numero = ?, Bairro = ?, Cidade = ?, Estado = ?
          WHERE ID_Usuario = ?
        `;
        const valoresEndereco = [CEP, Endereco, Numero, Bairro, Cidade, Estado, id];
        console.log("Dados recebidos para atualizar:", valoresEndereco);

        con.query(queryUpdateEndereco, valoresEndereco, (erro3, resultado3) => {
          console.log("Dados recebidos para atualizar:", resultado3);
          if (erro3) {
            return res.status(500).send({ msg: `Erro ao atualizar endereço: ${erro3}` });
          }

          return res.status(200).send({ msg: "Dados atualizados com sucesso!" });
        });

      } else {
        // Senão, faz INSERT
        const queryInsertEndereco = `
          INSERT INTO enderecos (CEP, Logradouro, Numero, Bairro, Cidade, Estado, ID_Usuario)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const valoresEndereco = [CEP, Endereco, Numero, Bairro, Cidade, Estado, id];

        con.query(queryInsertEndereco, valoresEndereco, (erro4, resultado4) => {
          if (erro4) {
            return res.status(500).send({ msg: `Erro ao inserir endereço: ${erro4}` });
          }

          return res.status(200).send({ msg: "Dados pessoais e endereço inseridos com sucesso!" });
        });
      }
    });
  });
});



// app.put(`/meu-perfil/alterar-dados-pessoais/:id`, (req,res) =>{
//   // con.query("UPDATE dados_pessoais SET ? WHERE ID_DadosPessoais = ? SET CPF = ?, Rg= ?, Data_Nascimento = ?, Genero = ?, Celular = ?, CEP = ?, Logradouro = ?, Numero = ?, Complemento = ?, Bairro = ?, Cidade = ?, Estado = ?" 
//   //   [req.body.dados_pessoais, req.body.CPF, req.body.Rg, req.body.Data_Nascimento, req.body.Genero, req.body.Celular, req.body.CEP, req.body.logradouro, req.body.Numero, req.body.Complemento, req.body.Bairro, req.body.Cidade, req.body.Estado], (error,result) =>{
//   //   if (error) {
//   //     return res.status(500)
//   //     .send({msg:`Erro ao atualizar os dados de cadastro ${error}`})
//   //   }
//   //   res.status(200)
//   //     .send({msg:`Dados atualizados`,payload:result});
//   // })
//   console.log(req.body)
// })


//============================================================================================================

app.post('/meu-perfil/:id/cad-pet', (req, res) => {
  console.log(req.body)
  console.log(req.params.id)
  const id = req.params.id;
  const {
    ID_Servico, Cuidador, Tutor, ID_Recibo,
    data_inicio, data_conclusao,
    ID_Pet, ID_Endereco,
    Periodo_entrada, Periodo_saida,
    Instru_Pet, Itens_Pet
  } = req.body;

  const sql = `
    INSERT INTO agendamento (
      ID_Servico, Cuidador, Tutor, ID_Recibo,
      data_inicio, data_conclusao,
      ID_Pet, ID_Endereco,
      Periodo_entrada, Periodo_saida,
      Instru_Pet, Itens_Pet
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    ID_Servico, Cuidador, Tutor, ID_Recibo,
    data_inicio, data_conclusao,
    ID_Pet, ID_Endereco,
    Periodo_entrada, Periodo_saida,
    Instru_Pet, Itens_Pet, id
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).send({ msg: "Erro ao agendar", error: err });
    }
    res.status(201).send({ msg: "Agendamento realizado com sucesso", payload: result });
  });
});





// ✅ DELETE - Remover pet
app.delete('/delete_pet/:ID_Pet', (req, res) => {
  con.query("DELETE FROM Pet WHERE ID_Pet = ?",[req.params.ID_Pet], (error, result) => {
      if (error) {
          return res.status(500) // Se houver um erro, retornamos o erro
          .send({error:`Erro ao deletar os dados, ${error}`});
      }
      res.status(200)
      .send({msg:`dados deletado`,payload:result});
  });
});


// ====================================================================================================

// Area de configurações
// Na Area de configurações somente iremos atualizar às informações do usuario,
// na parte final apresenta apenas o botão de delete 

// ✅ Get - Listando as configurações do usuário

app.get('/meu-perfil/config/:id', (req, res) => {
  const ID_Usuario = req.params.id;

  con.query(`
    SELECT * FROM usuario us
    INNER JOIN dados_pessoais dp ON us.ID_Usuario = dp.ID_Usuario
    WHERE us.ID_Usuario = ?
  `, [ID_Usuario], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao listar configurações: ${error}` });
    }
    res.status(200).json(result);
  });
});


//  PUT - Atualizar configurações do usuário

app.put('/meu-perfil/config/:id', (req, res) => {
  const ID_Usuario = req.params.id;
  const {
    Nome, Sobrenome, Celular, Email_usuario
  } = req.body;

  con.query(`
    UPDATE dados_pessoais SET
      Nome = ?, Sobrenome = ?, Celular = ?
    WHERE ID_Usuario = ?
  `, [
    Nome, Sobrenome, Celular, ID_Usuario
  ], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao atualizar configurações: ${error}` });
    }
    con.query(`
      UPDATE usuario SET
       Email_usuario = ?
      WHERE ID_Usuario = ?
    `, [
      Email_usuario, ID_Usuario
    ], (erro, resultado) => {
      if (erro) {
        return res.status(500).send({ msg: `Erro ao atualizar configurações: ${erro}` });
      }
    res.status(200).json({ msg: "Configurações atualizadas com sucesso", payload: result });
    });
  });
})

// Aqui estamos atualizando a senha. 

app.put('meu-perfil/config/senha/:ID_Usuario', (req, resultado) => {
  const ID_Usuario = req.params.ID_Usuario;
  const {
    Senha_usuario
  } = req.body;

  con.query(`
    UPDATE usuario SET
    Senha_usuario = ? 
    WHERE ID_Usuario = ?`, [Senha_usuario, ID_Usuario

    ], (erro, resultado) => {
      if (erro) {
        return resultado.status(500).send({ msg: "Senha não confere"})
      }
      resultado.status(404).json({msg: "Sua senha foi alterada com sucesso!!!"})
    });
  })


  // Deletando a conta do usuário
  // ✅ DELETE - Deletar conta do usuário
app.delete('meu-perfil/config/:ID_Usuario', (req, res) => {
  const ID_Usuario = req.params.ID_Usuario;

  con.query(`
    DELETE FROM usuario WHERE ID_Usuario = ?
  `, [ID_Usuario], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao deletar conta: ${error}` });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ msg: "Usuário não encontrado." });
    }

    res.status(200).send({ msg: "Conta deletada com sucesso." });
  });
});


  // =============================================================================
   // Area de pesquisa da hospedagem
   // ✅ Post - Pesquisar hospedagem

   app.post('/escolha-hospedagem-petsitter/agendamento', (req, res) => {
    const {
      
      dataInicio,
      dataFim,
      servico,
      estado,
      cidade,
      tipoPet,
      quantidade
    } = req.body;
  
    con.query(`
      INSERT INTO agendamento 
      ( Data_Inicio, Data_Fim, Servico, Estado, Cidade, TipoPet, Quantidade) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [ dataInicio, dataFim, servico, estado, cidade, tipoPet, quantidade],
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ msg: 'Erro ao registrar reserva' });
        }
  
        res.status(201).json({ msg: 'Reserva criada com sucesso', idReserva: result.insertId });
      });
  });
  

  // =============================================================================
  // Area de Hospedagem para Reserva
  // ✅ GET - Listar Hospedagem para a reserva
  app.get('/listar_hosp', (req, res) => {
    con.query("SELECT * FROM servicos", (error, result) => {
      if (error) {
        return res.status(500).send({ msg: `Erro ao listar serviços: ${error}` });
      }
      res.status(200).json(result);
    });
  });

  app.post('/reservar', (req, res) => {
    const {
      ID_Servico,
      Tutor,
      data_inicio,
      data_conclusao,
      ID_Pet,
      ID_Endereco
    } = req.body;
  
    // Buscar o cuidador automaticamente com base no ID_Servico
    con.query('SELECT Cuidador FROM servicos WHERE ID_Servico = ?', [ID_Servico], (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).send({ msg: 'Serviço inválido ou não encontrado', error: err });
      }
  
      const Cuidador = result[0].Cuidador;
  
      // Inserir na tabela de agendamentos
      const sql = `
        INSERT INTO agendamentos 
        (ID_Servico, Cuidador, Tutor, ID_Recibo, data_inicio, data_conclusao, ID_Pet, ID_Endereco, ID_Usuario) 
        VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)
      `;
  
      const values = [
        ID_Servico,
        Cuidador,
        Tutor,
        data_inicio,
        data_conclusao,
        ID_Pet,
        ID_Endereco,
        Tutor // mesma pessoa que `ID_Usuario`
      ];
  
      con.query(sql, values, (error, resultInsert) => {
        if (error) {
          return res.status(500).send({ msg: 'Erro ao realizar a reserva', error: error });
        }
        res.status(201).send({ msg: 'Reserva realizada com sucesso', ID_agendamento: resultInsert.insertId });
      });
    });
  });
   

  // ✅ PUT - Atualizar a hospedagem
  app.put('/atualizar_Hosp/:ID_Servico', (req, res) => {
    const ID_Servico = req.params.ID_Servico;
    const { Cuidador, Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao } = req.body;
  
    con.query(
      `UPDATE servicos SET 
        Cuidador = ?, Tipo_servico = ?, Preco_servico = ?, 
        qtd_pets = ?, Porte_pet = ?, Situacao = ?
       WHERE ID_Servico = ?`,
      [Cuidador, Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao, ID_Servico],
      (err, result) => {
        if (err) {
          return res.status(500).send({ msg: `Erro ao atualizar serviço: ${err}` });
        }
        res.status(200).send({ msg: "Serviço atualizado com sucesso", payload: result });
      }
    );
  });

// ✅ DELETE  - Deletar a Hospedagem
  app.delete('/delete_Hosp/:ID_Servico', (req, res) => {
    const ID_Servico = req.params.ID_Servico;
  
    con.query(
      "DELETE FROM servicos WHERE ID_Servico = ?",
      [ID_Servico],
      (err, result) => {
        if (err) {
          return res.status(500).send({ msg: `Erro ao deletar serviço: ${err}` });
        }
        res.status(200).send({ msg: "Serviço deletado com sucesso", payload: result });
      }
    );
  });

  // ============================================================================================================================ 

 // Confirme sua reserva

 // ✅ POST - Confirmar reserva

  app.post('/confirmar_reserva', (req, res) => {
    const { ID_Usuario, ID_Servico, ID_Pet, ID_Agendamento, ID } = req.body;
    con.query(
      `INSERT INTO reserva (ID_Usuario, ID_Servico, ID_Pet, ID_Agendamento) VALUES (?, ?, ?)`,
      [ID_Usuario, ID_Servico, ID_Pet, ID_Agendamento],
      (err, result) => {
        if (err) {
          return res.status(500).send({ msg: `Erro ao confirmar reserva: ${err}` });
        }
        res.status(201).send({ msg: "Reserva confirmada com sucesso", id: result.insertId });
      }
    );

  });

  // ✅ GET - Listar reservas
  app.get('/listar_reserva', (req, res) => {
    con.query("SELECT * FROM reserva", (error, result) => {
      if (error) {
        return res.status(500).send({ msg: `Erro ao listar reservas: ${error}` });
      }
      res.status(200).json(result);
    });
  });

  // ✅ DELETE - Deletar reserva

  app.delete('/delete_reserva/:ID_Usuario', (req, res) => {
    const ID_Usuario = req.params.ID_Usuario;
  
    con.query(
      "DELETE FROM reserva WHERE ID_Usuario = ?",
      [ID_Usuario],
      (err, result) => {
        if (err) {
          return res.status(500).send({ msg: `Erro ao deletar reserva: ${err}` });
        }
        res.status(200).send({ msg: "Reserva deletada com sucesso", payload: result });
      }
    );
  }
  );

// ============================================================================================================

// Reserva pós a confirmação 
app.post('/api/agendamentos', (req, res) => {
  const {
    data_inicio,
    data_conclusao,
    pets,
    especie,
    localizacao,
    bairro,
    Tipo_Contato,
    idServico,
    idCuidador,
    idTutor
  } = req.body;

  // Validação básica
  if (!data_inicio || !data_conclusao || !pets || !especie || !localizacao || !bairro || !idServico || !idCuidador || !idTutor || !Tipo_Contato) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  // 1. Buscar preço do serviço
  const getServiceQuery = `SELECT preco_servico FROM servicos WHERE ID_Servico = ?`;

  con.query(getServiceQuery, [idServico], (err, serviceResult) => {
    if (err || serviceResult.length === 0) {
      return res.status(500).json({ error: 'Erro ao buscar serviço.' });
    }

    const precoDia = parseFloat(serviceResult[0].preco_servico);

    // 2. Calcular quantidade de dias
    const inicio = new Date(data_inicio);
    const fim = new Date(data_conclusao);
    const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)) || 1;
    const valorTotal = precoDia * dias;

    // 3. Inserir recibo
    const insertReciboQuery = `
      INSERT INTO recibo (Detalhes, Cuidador, Tutor, ID_Pet, ID_Servico, Data_pagamento, Tipo_Contato)
      VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `;
    const detalhes = `Reserva de ${dias} dia(s) para ${pets} (${especie})`;

    // Aqui ainda estamos usando ID_Pet = 1 como placeholder
    con.query(insertReciboQuery, [detalhes, idCuidador, idTutor, 1, idServico, Tipo_Contato], (err, reciboResult) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao inserir recibo.' });
      }

      const idRecibo = reciboResult.insertId;

      // 4. Inserir agendamento
      const insertAgendamentoQuery = `
        INSERT INTO agendamento (
          ID_Servico, Cuidador, Tutor, ID_Recibo, data_inicio, data_conclusao
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const agendamentoValues = [
        idServico,
        idCuidador,
        idTutor,
        idRecibo,
        data_inicio,
        data_conclusao
      ];

      con.query(insertAgendamentoQuery, agendamentoValues, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao salvar agendamento.' });
        }

        res.status(201).json({
          msg: 'Agendamento salvo com sucesso.',
          idAgendamento: result.insertId,
          valorTotal: `R$${valorTotal.toFixed(2)}`
        });
      });
    });
  });
});



  // ====================================================================================================================


  









// ======================================================================================================
// Vamos subir o servidor na porta 3000
app.listen(3000,()=>{
    console.log("Servidor online http://127.0.0.1:3000");   
});
