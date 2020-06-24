#REST: 
    1.Representation(<resources>) State(<conditions>) Transfer(<HTTP>)(set of constrains)  \  
    2.Benefits/goals: simple, predictable,consistent,clear direction,patterns, allow flexibility in diff implementation,efficient and performant, scalable  \
    3.Constrains: address, methods, query strings, response body \
        Separation of concerns \
        statelessness: no client info gets stored \
        cacheability: req should be predictable \
        layered sys: \
        uniform UI
    4.RES:
        Resources: data (order) \
        Database: store \
        API server: clerk \
        HTTP req/res: the phone conversation \
#NOTES:
    1.Uniformed UI: 
        Patch(update) vs Put(replace) \
        200(OK GET) vs 204 (OK DELETE)
        /(hierachical) -(readable) lowercase noun-only
    2.Relationship in databse:
        Referential integrity
        Primary-key vs Foreign Key(in reference to primary key)
        Multiplicity(One-To-Many)
        Entity Relationship Diagram(ERD): to visualize the relationship between the tables in a db
    3. DB design:
        Normalization: the process of decomposing table to remove the anomalies
        entities: real world obj that we are going to store data
        designing the relationship: one to many vs many to many
#SYNTAX:
    <column name> <data type> REFERENCES <foreign table name> (<foreign column>)
    <CASCADE>: specifies that when the item is deleted, the orders that reference this item should also be deleted
#MODULES:
    path.posix.join(req.originalUrl,``)
