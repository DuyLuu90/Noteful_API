#POSTGRATOR:
    npm i postgrator-cli@3.2.0 -D 
        <Postgrator-cli> is a command that accepts 1 argu, the dest step number (correspondent to migration number)
        <Max>: default value for the dest, the highest version migration available
    connect to the db 
        Read <postgrator-config.js> then look for <connectString >which containing the db URL 
        <migrationDirectory>: refers to the folder that contains our migration steps
        <driver> same driver setting we used when creating a Knex instance <pg>
    Migration fileName format:
        <version>.<do/undo>.<description>.sql
    Update scripts in package.json:
        "migrate": "postgrator" --config postgrator-config.js",
        "migrate:test": "env NODE_ENV=test npm run migrate",
    Run migrate:
        Run the first migrate: <npm run migrate -- 1>
        Undo migration: <npm run migrate -- 0>
        
#Schema migration:
    the management of incremental,reversible changes/version control to relational db schemas, performed whenever it is necessary to update/revert that db's schema.
    All migration steps include 2 things: the SQL statement to excecute the schema change, and the SQL statement to undo the changes.
    <schema>: 
        db structure, refers to the organization of data and how the db is constructed. It is a set of <integrity constrains>(formulas) imposed on a database
    <version control system>: 
        tool for developers to manage and collaborate on changes made to versions of source code
#DB instances:
    local:
    production: 
    ALTER TABLE: create new style ENUM type to add a new column 

#Benefits:
    allows for fixing mistakes and adapting the data as requirements change

Relationships
-------------
    #Normalization:
        is a design process to decompose the single table into 2 or more related tables, to ensure that the data in the original table was not lost
    #Entity Relationship Diagram:
        to visualize the tables and the relationship
    
    One-to-One (User could make one Blog, blogs have one user)
    One-to-Many (User can have many Recipes, recipes have one user)
    Many-to-Many (Players can have many positions, position can have many players)
                (Articles can have many tags, tags can belong to many articles)
    CASCADE: 
    ON DELETE 
    ---
            
    Articles   <->   Users       | One-to-Many
    ("Each article belongs to one user, each user can write many articles.")
    Articles   <->   Comments    | One-to-Many
    ("Each comment belongs to one article, each article can have many comments.")
    ---
    "Foreign Key"
    Where does the information about the relationship live?
    One-to-One (Foreign Key can live in either or both tables):
    Blogs         Users
    id 1          id 2
    name Blog     name User
    user_id 2     blog_id 1
    One-to-Many (Foreign Key lives on the "many")
    Users         Recipes
    id 1          id 2
                user_id 1
    Many-to-Many (Foreign Keys in a separate table - "join" table)
    Players       Positions       players_positions
    id 1          id 2            player_id 1
                    position_id 2