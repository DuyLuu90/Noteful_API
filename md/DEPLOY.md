#STEPS:
    <REACT>(CLIENT):
        Perform a build: <npm run build>
        Hide sensitive info->Deploy to Vercel
    <EXPRESS>(SERVER):
        Hide secret with env var->use process.env.PORT
        Minimize configure logging->hide server-side errors
        Use different API token->create Procfile->Deploy to Heroku
    <DATABASE>:
        $ npm run migrate:production
        $ npm run deploy
        
#HEROKU POSTGRES
    Create app:             $ heroku create
    config.js:              change DB_URL- > DATABASE_URL
    Commit                  $ git push heroku master
    Provision Postgres:     $ heroku addon:create heroku-postgresql:hobby-dev (free plan)
    Create table            $ heroku addons
    To see env var          $ heroku config
    To see db connection    $ heroku pg:credentials:url
    Connect with psql       $ psql <connection URL>
    Run psql against db     $ heroku pg:psql
    To read DATABASE-URL:   $ heroku config:get DATABASE_URL
    To configure NPM        $ npm config set script-shell "C:\\ProgramFiles\\Git\\bin\\bash.exe

#UPDATE package.json:
    "predeploy": "npm audit && npm run migrate:production"
    "migrate:production" : "env SSL=true DATABASE_URL=$(heroku config:get DATABASE_URL) npm run migrate"      

#DBEAVER:
    Select <New Databse Connection> -> <PostgreSQL>
    Use the values from the Heroku credentials to fill out connection setting form
