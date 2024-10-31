/// <reference types="cypress" />

import { faker } from '@faker-js/faker';
import usuarioContrato from '../contracts/usuarios.contract'

describe('Testes da Funcionalidade Usuários', () => {

  let token
  beforeEach(() => {
    cy.token('alineteste@qa.com', 'teste123').then(tkn => {
      token = tkn
    })
  });

  it('Deve validar contrato de usuários', () => {
    cy.request('usuarios').then(response => {
      return usuarioContrato.validateAsync(response.body)
    })
  });

  it('Deve listar usuários cadastrados', () => {
    cy.request({
      method: 'GET',
      url: 'usuarios'
    }).should(response => {
      expect(response.status).equal(200)
      expect(response.body).to.have.property('usuarios')
    })
  });

  it('Deve cadastrar um usuário com sucesso', () => {

    let nome = faker.person.fullName();
    let email = faker.internet.email();
    let senha = faker.internet.password();

    cy.cadastrarUsuario(token, nome, email, senha, 'true')
      .should(response => {
        expect(response.status).equal(201)
        expect(response.body.message).to.equal("Cadastro realizado com sucesso")
      })
  });

  it('Deve validar um usuário com email inválido', () => {
    let nome = faker.person.fullName();
    let senha = faker.internet.password();

    cy.cadastrarUsuario(token, nome, "usuario_invalido_email.com", senha, 'true')
      .should(response => {
        expect(response.status).equal(400)
      })
  });

  it('Deve editar um usuário previamente cadastrado', () => {
    let nomeEdit = `Usuario EBAC Editado${Math.floor(Math.random() * 100000000)}`
    let email = 'userqa' + Math.floor(Math.random() * 1000000) + '@qaedit.com.br';

    cy.request('usuarios').then(response => {
      let id = response.body.usuarios[6]._id
      cy.request({
        method: 'PUT',
        url: `usuarios/${id}`,
        headers: { authorization: token},
        body:
        {
          "nome": nomeEdit,
          "email": email,
          "password": 'teste',
          "administrador": "true"
        }
      }).then(response => {
        expect(response.body.message).to.equal('Registro alterado com sucesso')
      })
    })
  })

  it('Deve deletar um usuário previamente cadastrado', () => {

    let nome = faker.person.fullName();
    let senha = faker.internet.password();
    let email = faker.internet.email();

    cy.cadastrarUsuario(token, nome, email, senha, 'true')
    .then(response => {
        let id = response.body._id
        cy.request({
          method: 'DELETE',
          url: `usuarios/${id}`,
          headers: { authorization: token },
        }).then(response => {
          expect(response.status).to.equal(200);
          expect(response.body.message).to.include("Registro excluído com sucesso");
        });
      })
    });
});