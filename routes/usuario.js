
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")


router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})
router.post("/registro", (req,res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail Inválido"})
    }
     if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha Inválida"})
    }
    if(req.body.senha.length < 6 || req.body.senha.length > 15){
        erros.push({texto: "Senha deve conter no minimo 6 digitos e máximo de 15 digitos"})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As Senhas devem ser iguais"})
    }
    if(erros.length > 0){
        res.render("usuarios/registro", ({erros: erros}))
    }else{
        Usuario.findOne({email: req.body.email}).lean().then((usuario) => {

                if(usuario)
                {
                    req.flash("error_msg", "Já existe um usuario cadastrado com esse seguinte e-mail")
                    res.redirect("/usuarios/registro")

                }else{

                        const novoUsuario = new Usuario({
                            nome: req.body.nome,
                            email: req.body.email,
                            senha: req.body.senha,
                        })

                        bcrypt.genSalt(10, (erro, salt) => {
                            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                                if(erro)
                                {
                                    req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                                    res.redirect("/")
                                }
                                novoUsuario.senha = hash;

                                novoUsuario.save().then(() => {
                                        req.flash("success_msg", "Usuário Cadastrado com Sucesso")
                                        res.redirect("/")
                                }).catch((error) => {
                                        req.flash("error_msg", "Houve um erro ao criar o usúario, tente novamente" + error)
                                        res.redirect("/usuarios/registro")
                                })
                            })
                        })
                }
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno" + error)
            res.redirect("/")
        })
    }
})

    router.get("/login", (req, res) => {
        res.render("usuarios/login")
    })
    router.post("/login", (req, res, next) => {
        passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/usuarios/login", 
            failureFlash: true
        })(req, res, next)
    })

    router.get("/logout", (req, res) => {
        req.logout(function(err) {
            if (err) { return next(err); }
            req.flash("success_msg", "Deslogado Com Sucesso")
            res.redirect("/");
          });
    })

module.exports = router