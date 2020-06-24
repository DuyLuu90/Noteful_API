#TEST DRIVEN DEVELOPMENT
    RED: write a test and see it fail
    GREEN: write implementation code to make the test pass
    REFACTOR: both the test code and implementation code

#MOCHA HOOKS:
    before,after,beforeEach,afterEach (same hook will execute in order, different hooks will run in the expected sequence). 

#TEST CASE PATTERN:
    Setup data-> invoke the function to be tested-> -> ASSERT that the results meet our expectation 

#SERVICE TEST:
    Whenever we set a context with data present, we should always include a beforeEach() hook within the context that takes care of adding the appropriate data to our table
    STEPS:
        Test sample-> prepare db connection(knex)-> empty the table (before and after each)
        ->let go of connection
    METHODS:
        .then() method on a promise can optionally take a second argument:
            The first callback occurs if the promise is resolved, which we've been using for all our promise chains. The second occurs if promise is rejected. In the following test, we EXPECT the promise to be rejected as the database should throw an error due to the NOT NULL constraint 
#CREATE TABLE IN TEST DB:
    psql -U <role> -d <db> -f <CREATE sql file> 

#MOCHA METHODS:
    this.retries(): specify how many times to attempt the test before counting it as a failure
    ASSERTIONS(library, used along with Mocha.):
        to.deep.equal : to compare the prop and val of the obj = to.eql
        .a : check the type of a value


