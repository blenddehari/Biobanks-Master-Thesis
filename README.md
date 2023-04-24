README

Fork the repository in your local environment and checkout to branch "master"

Using Docker to start the project - the easy and most convenient way

The project is fully dockerized, so if you have Docker installed and want to use Docker, you can spin up the client-side, server-side and both LOINC and Collection-Manager databases and connect to server to them by using the command “docker-compose up” in the /docker folder of the repository. 

1. Thus, from the root directory you need to run:
- cd docker
- docker-compose up

2. After that wait a bit for all containers to be ready and when ready, you can navigate to “http://localhost:8080/ “ in your favourite browser.

3. As an example for testing, you can search by the following LOINC codes:
* LOINC 39243-1 (Second hand smoke exposure), with values: 10.04-10.06
* LOINC 39004-7 (Epidermal growth factor receptor Ag), with values: 1000-2000

4. Please fill in the attribute name as anything (“test”, “test1”). If you want to search with more variations you can take a look at the values we have in the database (table name: “speed_up_tables_4”). In the aforementioned example for searching, I used range values, so you need to switch on the “Range Query”in the UI.
5. You are ready to go, press the search button and analyse the results. You just got a ranked list of collections and biobanks with a hit ratio and number of hits matched for each of them, and on opening the rows you can see the same designated analytics per every LOINC code you searched for :) 
Contact the biobank that whose collection fits your research purposes best and keep on innovating the medical field!  


If you are not using Docker and want to manually start everything - the hard and inconvenient way

If you do not wish to use Docker for any reason, here are the steps to replicate the environment and start the project:

1. To start the client:
	In a new terminal, navigate to DATABANKS-DEMO-PROJECT/fronted and run the command:
    - Npm run serve

2. To start the server:
	In a new terminal, navigate to DATABANKS-DEMO-PROJECT/backend and run the command:
    - Npm run dev

3. In your browser, go to http://localhost:8080/ to use the client.

4. If you want to test the system by querying the database, you will need to import the databases provided in the zip file (“loinc_db.sql” and “collection_manager_db.sql”) in your PgAdmin (localhost). 

5. The LOINC db needs to be setup with the following config:
- host: "localhost",
- port: 5432,
- user: "postgres",
- database: "loinc"

6. The collection manager db needs to be setup with the following config:
- host: "localhost",
- port: 5432,
- user: "postgres",
- database: "collection-manager”

7. If you want to import the database files in a different location or with different names, please adjust the config of the communication with the corresponding databases in the files: “backend/server/dao/loincDatabase.js” and “backend/server/dao/collectionsDatabase.js”.

8. If you are not sure how to restore a Postgres database from a backup sql file, watch this video (from minute: 04:14): https://www.youtube.com/watch?v=S108Rh6XxPs&ab_channel=Learning

9. The client runs on port 8080 and the api runs in port 5001. Make port 5001 is free, or change it to your desired port in file: backend/.env


10. As an example, you can search by the following LOINC codes: 
* LOINC 39243-1 (Second hand smoke exposure), with values: 10.04-10.06
* LOINC 39004-7 (Epidermal growth factor receptor Ag), with values: 1000-2000

11. Please fill in the attribute name as anything (“test”, “test1”). If you want to search with more variations you can take a look at the values we have in the database (table name: “speed_up_tables_4”). In the aforementioned example for searching, I used range values, so you need to switch on the “Range Query”in the UI.
12. You are ready to go, press the search button and analyse the results. You just got a ranked list of collections and biobanks with a hit ratio and number of hits matched for each of them, and on opening the rows you can see the same designated analytics per every LOINC code you searched for :)  
Contact the biobank that whose collection fits your research purposes best and keep on innovating the medical field!  

