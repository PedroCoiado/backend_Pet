// Importar a bliblioteca do node modules express para criar nosso servidor de backend
const express = require('express') 

// Importar a biblioteca do node modules cors para permitir requisições de outros domínios

const mysql = require('mysql2'); 

const cors = require('cors');

//importar a biblioteca do bcrypt
//para a criptografia de senha
const bcrypt = require("bcrypt");
// Importar a biblioteca do jwt 
const jwt = require("jsonwebtoken");


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



//Login
app.post('/login', (req, res) => {
  const { Email_usuario, Senha_usuario } = req.body;

  con.query("SELECT * FROM usuario WHERE Email_usuario = ?", [Email_usuario], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).send({ msg: "Usuário ou senha inválidos" });
    }

    const usuario = results[0];

    if (usuario.Tipo_usuario ==null) {
      return res.send({ msg: "Altere seu tipo de perfil."});
    
    }



    // Verifica a senha com bcrypt
    bcrypt.compare(Senha_usuario, usuario.Senha_usuario, (erro, batem) => {
      if (erro || !batem) {
        return res.status(401).send({ msg: "Senha incorreta" });
      }

      // Se autenticado com sucesso
      return res.status(200).send({ 
        msg: "Login realizado com sucesso", 
        usuario: {

          id: usuario.ID_Usuario,
          email: usuario.Email_usuario,
          nome: usuario.Nome_usuario,
          foto: usuario.Foto_usuario // ajuste conforme o nome do campo
        }
      });
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
app.put('/meu-perfil', (req, res) => {
  con.query("UPDATE usuario SET ? WHERE ID_Usuario = ? SET Tipo_usuario = ?, Experiencia = ?", [req.body.usuario, req.body.Tipo_usuario, req.body.Experiencia], (error, result) => {
    if (error) {
      return res.status(500)
      .send({msg:`Erro ao atualizar os dados ${error}`})
    }
    res.status(200)
    .send({msg:`Dados atualizados`,payload:result});
  })
})

app.put(`/meu-perfil`, (req,res) =>{
  con.query("UPDATE dados_pessoais SET ? WHERE ID_DadosPessoais = ? SET CPF = ?, Rg= ?, Data_Nascimento = ?, Sexo = ?, Celular = ?" [req.body.dados_pessoais, req.body.CPF, req.body.Rg, req.body.Data_Nascimento, req.body.Sexo, req.body.Celular], (error,result) =>{
    if (error) {
      return res.status(500)
      .send({msg:`Erro ao atualizar os dados de cadastro ${error}`})
    }
    res.status(200)
      .send({msg:`Dados atualizados`,payload:result});
  })
})


//============================================================================================================

// Area pet


// ✅ POST - Cadastrar pet
app.post('/pet', (req, res) => {
  const {
    ID_Usuario, Nome, Sexo, Idade, Data_Nascimento,
    Especie, Raca, Porte, Castrado, Restricoes,
    Comportamento, Preferencias, Saude
  } = req.body;

  con.query(`
    INSERT INTO pet (
      ID_Usuario, Nome, Sexo, Idade, Data_Nascimento,
      Especie, Raca, Porte, Castrado, Restricoes,
      Comportamento, Preferencias, Saude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    ID_Usuario, Nome, Sexo, Idade, Data_Nascimento,
    Especie, Raca, Porte, Castrado, Restricoes,
    Comportamento, Preferencias, Saude
  ], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: "Erro ao inserir o pet" });
    }
    res.status(201).send({ msg: "Pet inserido com sucesso", id: result.insertId });
  });
});


// ✅ GET - Listar pets
app.get('/pet_listar', (req, res) => {
  con.query('SELECT * FROM Pet', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar pets' });
    res.json(results);
  });
});


// ✅ PUT - Atualizar pet
app.put('/pet_Atualizar/:ID_Pet', (req, res) => {
  const ID_Pet = req.params.ID_Pet;
  const {
    Nome, Sexo, Idade, Data_Nascimento,
    Especie, Raca, Porte, Castrado, Restricoes,
    Comportamento, Preferencias, Saude
  } = req.body;

  con.query(`
    UPDATE Pet SET
      Nome = ?, Sexo = ?, Idade = ?, Data_Nascimento = ?,
      Especie = ?, Raca = ?, Porte = ?, Castrado = ?, Restricoes = ?,
      Comportamento = ?, Preferencias = ?, Saude = ?
    WHERE ID_Pet = ?
  `, [
    Nome, Sexo, Idade, Data_Nascimento,
    Especie, Raca, Porte, Castrado, Restricoes,
    Comportamento, Preferencias, Saude,
    ID_Pet
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao atualizar pet' });
    res.json({ message: 'Pet atualizado com sucesso' });
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


// ✅ PUT - Atualizar configurações do usuário

app.put('/config/:ID_Usuario', (req, res) => {
  const ID_Usuario = req.params.ID_Usuario;
  const {
    Nome, Sobrenome, Telefone, CPF, Email_usuario
  } = req.body;

  con.query(`
    UPDATE usuario SET
      Nome = ?, Sobrenome = ?, Telefone = ?, 
      CPF = ?, Email_usuario = ?
    WHERE ID_Usuario = ?
  `, [
    Nome, Sobrenome, Telefone, CPF, 
    Email_usuario, ID_Usuario
  ], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao atualizar configurações: ${error}` });
    }
    res.status(404).json({ msg: "Configurações atualizadas com sucesso", payload: result });
  });
});

// Aqui estamos atualizando a senha. 

app.put('/config/senha/:ID_Usuario', (req, resultado) => {
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
  });

  // =============================================================================
   
  // Area de Hospedagem/PetSitter
  // ✅ GET - Listar Hospedagem
  app.get('/listar_hosp', (req, res) => {
    con.query("SELECT * FROM servicos", (error, result) => {
      if (error) {
        return res.status(500).send({ msg: `Erro ao listar serviços: ${error}` });
      }
      res.status(200).json(result);
    });
  });

  // ✅ POST - Cadastrar a hospedagem
  app.post('/cad_Hosp', (req, res) => {
    const { Cuidador, Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao } = req.body;
  
    con.query(
      `INSERT INTO servicos (Cuidador, Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao) VALUES (?, ?, ?, ?, ?, ?)`,
      [Cuidador, Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao],
      (err, result) => {
        if (err) {
          return res.status(500).send({ msg: `Erro ao cadastrar serviço: ${err}` });
        }
        res.status(201).send({ msg: "Serviço cadastrado com sucesso", id: result.insertId });
      }
    );
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
    const { ID_Usuario, ID_Servico, ID_Pet } = req.body;
    con.query(
      `INSERT INTO reserva (ID_Usuario, ID_Servico, ID_Pet) VALUES (?, ?, ?)`,
      [ID_Usuario, ID_Servico, ID_Pet],
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


  
  









// ======================================================================================================
// Vamos subir o servidor na porta 3000
app.listen(3000,()=>{
    console.log("Servidor online http://127.0.0.1:3000");   
});





