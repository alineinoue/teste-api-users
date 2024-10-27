/// <reference types="cypress" />

import { faker } from '@faker-js/faker';
import usuarioContrato from '../contracts/usuarios.contract'

describe('Testes da Funcionalidade Usuários', () => {

  let token
  beforeEach(() => {
      cy.token('fulano@qa.com', 'teste').then(tkn => {
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
    
    let nome = 'User QA Editado ' + Math.floor(Math.random() * 100000000)
    let email = 'userqa' + Math.floor(Math.random() * 1000000) + '@qaedit.com.br';

        cy.request({
          method: 'PUT',
          url: 'usuarios/MGXcB3Mjv0ep4dte',
          headers: {authorization: token},
          body: {
            "nome": nome,
            "email": email,
            "password": 'teste',
            "administrador": "true"
          }
        }).then(editResponse => {
          expect(editResponse.status).to.eq(200);
          expect(editResponse.body.message).to.include('Registro alterado com sucesso');
        });
   })

  it('Deve deletar um usuário previamente cadastrado', () => {
      cy.request({
        method: 'DELETE',
        url: 'usuarios/TzTOCFMM2sZa7QSE',
        headers: { authorization: token },
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.include("Registro excluído com sucesso");
      });
  })

});
