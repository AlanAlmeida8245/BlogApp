const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
require("../models/Postagem")
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")


    
    
    router.get("/posts", eAdmin, (req, res) => {
        res.send("Página dos Posts")
    })

    router.get("/categorias", eAdmin,  (req, res) => {
        Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
        }).catch((error) => {
            req.flash("error_msg", "houve um erro ao listar as categorias" + error)
            res.redirect("/admin")
        })
        
    })

    router.get("/categorias/add", eAdmin,  (req, res) => {
        res.render("admin/addcategoria")
    })


    router.get("/admin/categorias/edit/:id", (req, res) => {
        Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
        }).catch((error) => {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/admin/categorias")
        })
       
    })

    router.post("/categorias/edit", eAdmin, (req, res) => {
        var erros =  [] //Cria um Array que armazenará todas as mensagens de erro

        if(!req.body.nome || typeof req.body.slug == undefined || req.body.nome == null)
        {
            erros.push({texto: "Nome Invalído"})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug Inválido"})

        }
        if(req.body.nome.length < 2){
                erros.push({texto: "Nome da Categoria é curto demais"})
        }
        if(erros.length > 0){
            res.render("admin/editcategorias", {erros: erros})  
        }
        else{
            Categoria.findOne({_id:  req.body.id}).then((categoria) => {
                categoria.nome = req.body.nome
                categoria.slug = req.body.slug

                categoria.save().then(() => {
                    req.flash("success_msg", "Categoria Editada com sucesso")
                    res.redirect('/admin/categorias')
                }).catch((error) => {
                    req.flash("error_msg", "Houve um erro interno ao salvar a alteração da categoria")
                    res.redirect('/admin/categorias')
                })
    
            }).catch((error) => {
                    req.flash("error_msg", "Houve um Erro ao editar a categoria")
                    res.redirect("/admin/categorias")
            })
        }
        

    })
    router.post("/categorias", (req, res) => { // Botão de Editar a Categoria
        req.flash("error_msg", "Alteração da categoria cancelada com sucesso")
        res.redirect("/admin/categorias")
    })

    router.post("/categorias/deletar/:id", (req, res) => {
            Categoria.deleteOne({_id: req.params.id}).then(() => {
                req.flash("success_msg", "a Categoria foi removida com sucesso.")
                res.redirect("/admin/categorias")
            }).catch((error) => {
                req.flash("error_msg", "a Categoria não pôde ser removida.")
                res.redirect("/admin/categorias")
            })
    })
    router.get("/postagens", eAdmin, (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("admin/postagens", {postagens: postagens})
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao listar as postagens: " + error)
            res.redirect("/admin")
        })
        
    })
    router.get("/postagens/add", eAdmin, (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("admin/addpostagem", {categorias: categorias})
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulário: " + error)
            res.redirect("/admin")
        })
        
    })
    router.post("/postagens/nova", eAdmin, (req, res) => {

        var erros =  [] //Cria um Array que armazenará todas as mensagens de erro
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null ){

            erros.push({texto: "Titulo Inválido"})

        }
        if(req.body.titulo.length < 2){

            erros.push({texto: "Titulo é curto demais"})

         }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){

            erros.push({texto: "Slug Inválido"})

        }
        if(req.body.conteudo.length < 2){

            erros.push({texto: "Conteudo é curto demais"})

         } if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null)
         {
             erros.push({texto: "Conteudo Invalído"})
         }if(req.body.descricao.length < 2){
            erros.push({texto: "Conteudo é curto demais"})
         } if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null)
         {
             erros.push({texto: "Descrição Inválida"})
         }
         if(req.body.categoria == 0){
            erros.push({texto: "Categoria inválida, registre uma categoria"})
            }
        if(erros.length > 0){
            res.render("admin/addpostagem", {erros: erros})
        }
        else{
            const novaPostagem = {
                titulo: req.body.titulo,
                slug: req.body.slug,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria
            }
            new Postagem(novaPostagem).save().then(() => {
                req.flash("success_msg", "Postagem Criada com Sucesso")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash(("error_msg", "Houve um erro ao cadastrar a Postagem, tente novamente!"))
                res.redirect("/admin/postagens")  
            })
        }

    })
    router.get("/postagens/edit/:id", (req,res) => {
        Postagem.findOne({_id: req.params.id}).then((postagem) => {
                    Categoria.find().lean().then((categorias) => {
                        res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
                    }).catch((error) => {
                            req.flash("error_msg", "Houve um erro ao listar as categorias")
                            res.redirect("/admin/postagens")
                    })
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro ao carregar as postagens")
                res.redirect("/admin/postagens")
            })
       
    })


    router.post("/postagens/edit", eAdmin, (req, res) => {

        var erros =  [] //Cria um Array que armazenará todas as mensagens de erro
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){

            erros.push({texto: "Titulo Inválido"})

        }
        if(req.body.titulo.length < 2){

            erros.push({texto: "Titulo é curto demais"})

         }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){

            erros.push({texto: "Slug Inválido"})

        }
        if(req.body.conteudo.length < 2){

            erros.push({texto: "Conteudo é curto demais"})

         } if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null)
         {
             erros.push({texto: "Conteudo Invalído"})
         }if(req.body.descricao.length < 2){
            erros.push({texto: "Conteudo é curto demais"})
         } if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null)
         {
             erros.push({texto: "Descrição Inválida"})
         }
         if(req.body.categoria == 0){
            erros.push({texto: "Categoria inválida, registre uma categoria"})
            }
        if(erros.length > 0){
            res.render("admin/editpostagens", {erros: erros})
        }
        else{
            Postagem.findOne({_id: req.body.id}).then((postagem) => {

                postagem.titulo = req.body.titulo
                postagem.slug = req.body.slug
                postagem.conteudo = req.body.conteudo
                postagem.descricao = req.body.descricao
                postagem.categoria = req.body.categoria

                postagem.save().then(() => {
                    req.flash("success_msg", "Postagem editada com sucesso")
                    res.redirect("/admin/postagens")

                }).catch((error) => {
                    req.flash("error_msg", "Erro interno" + erro)
                    res.redirect("/admin/postagens")
                })

            }).catch((error) => {
                req.flash("error_msg", "Houve um Erro ao salvar a edição")
                res.redirect("/admin/postagens")
            })
           
        }

    })
    router.post("/postagens", eAdmin,  (req, res) => { // Botão de Editar a Categoria
        req.flash("error_msg", "Alteração da postagem cancelada com sucesso")
        res.redirect("/admin/postagens")
    })

    router.post("/categorias/nova", eAdmin, (req, res) => {

        var erros =  [] //Cria um Array que armazenará todas as mensagens de erro

        if(!req.body.nome || typeof req.body.slug == undefined || req.body.nome == null)
        {
            erros.push({texto: "Nome Invalído"})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug Inválido"})

        }
        if(req.body.nome.length < 2){
                erros.push({texto: "Nome da Categoria é curto demais"})
        }
        if(erros.length > 0){
            res.render("admin/addcategoria", {erros: erros})
        }else{
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
            new Categoria(novaCategoria).save().then(() => {
                req.flash("success_msg", "Categoria Criada com Sucesso")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash(("error_msg", "Houve um erro ao cadastrar a categoria, tente novamente!"))
                res.redirect("/admin")  
            })
        }
    })

    router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
        Postagem.deleteOne({_id: req.params.id}).then(() => {
            req.flash("success_msg", "a Postagem foi removida com sucesso.")
            res.redirect("/admin/postagens")
        }).catch((error) => {
            req.flash("error_msg", "a Postagem não pôde ser removida.")
            res.redirect("/admin/postagens")
        })
    })
    

module.exports = router;