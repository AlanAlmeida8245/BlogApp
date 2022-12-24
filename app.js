//Carregando Modulos:

const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express();
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
const usuarios = require("./routes/usuario");
const passport = require("passport");
const MongoStore = require("connect-mongo")
const cors = require("cors")
require("./models/Postagem.js")
require("./models/Categoria.js")
const Postagem = mongoose.model("postagens")
const Categoria = mongoose.model("categorias")
require("./config/auth")(passport)



    //public

        app.use(express.static(path.join(__dirname, "public")))


 //Mongoose
 mongoose.Promisse = global.Promisse;
 mongoose.connect("mongodb+srv://AlanAlmeida:83193879@blognodejs.zpece2v.mongodb.net/?retryWrites=true&w=majority").then(() => {
     console.log("Conectado ao Mongo")
 }).catch((error) => {
     console.log("Erro ao se Conectar ao Mongo" + error)
 })
/////
//Configurações
        //Sessão
        app.use(cors());
            

        app.set('trust proxy', 1);

        app.use(session({
            cookie:
            {
                secure: true,
                maxAge:80000
                   },
                   store: MongoStore.create({mongoUrl: 'mongodb+srv://AlanAlmeida:83193879@blognodejs.zpece2v.mongodb.net/?retryWrites=true&w=majority'}),
            secret: 'blog',
            saveUninitialized: true,
            resave: false
            }));

            app.use(passport.initialize())
            app.use(passport.session())
            app.use(flash())
            
            app.use(function(req,res,next){
            if(!req.session){
                return next(new Error('Oh no')) //handle error
            }
            next() //otherwise continue
            });
            
        //Middleware
        app.use((req, res, next) => {
                res.locals.success_msg = req.flash("success_msg")
                res.locals.error_msg = req.flash("error_msg");
                res.locals.error = req.flash("error");
                res.locals.user =  req.user || null
                next();
        })

        //BodyParser
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
    extended: true
    }))
    
        //HandleBars
        app.engine('handlebars', handlebars.engine({
            defaultLayout: 'main',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
            },
        }));
        app.set('view engine', 'handlebars');
   


//Rotas
        
        app.use('/admin', admin);
        app.use("/usuarios", usuarios);

        app.get("/", (req, res) => { //Pagina Inicial
            Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
                res.render("index", {postagens: postagens})
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro ao listar as postagens")
                res.redirect("/404")
            })
        })

        app.use("/404", (req, res) => {
            res.send("Erro 404 !!")
        })

        app.get('/postagem/:slug', (req,res) => {
            const slug = req.params.slug
            Postagem.findOne({slug})
                .then(postagem => {
                    if(postagem){
                        const post = {
                            titulo: postagem.titulo,
                            data: postagem.data,
                            conteudo: postagem.conteudo
                        }
                        res.render('postagem/index', post)
                    }else{
                        req.flash("error_msg", "Essa postagem nao existe")
                        res.redirect("/")
                    }
                })
                .catch(err => {
                    req.flash("error_msg", "Houve um erro interno")
                    res.redirect("/")
                })
        })

        app.get("/categorias", (req,res) => {
                Categoria.find().lean().then((categorias) => {
                        res.render("categorias/index", {categorias: categorias})
                }).catch((error) => {
                    req.flash("error_msg", "Houve um erro interno ao listrar as categorias")
                    res.redirect("/")
                })
        })
        app.get("/categorias/:slug", (req,res) => {
            Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=> {

                if(categoria){

                    Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                            res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                    }).catch((error) => {
                        req.flash("error_msg", "Houve um erro ao listar os posts:" + error)
                        res.redirect("/")
                    })

                }else{
                    req.flash("error_msg", "Está categoria não existe")
                    res.redirect("/")
                }

            }).catch((error) => {
                req.flash("error_msg", "houve um erro interno ao carregar a página dessa categoria")
                res.redirect("/")
            })
            
        })

////

//Outros

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log("Servidor Aberto")
})
