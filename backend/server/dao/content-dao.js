const helperFunctions = require('../helper/helper-functions')
const pool = require('./loincDatabase')
const collectionDB = require('./collectionsDatabase')

pool.connect()

class ContentDAO {
    async getLoincs() {
        const query = `select loinc_num as loincNum, component as loincComponent from loinc`
    
        const res = await pool.query(query)
        return res.rows
    }

    async getLoinc(searchString) {
        let searchByCode = helperFunctions.isNumeric(searchString)

        if (searchByCode) {
            const query = `select loinc_num as loincNum, component as loincComponent from loinc where loinc_num LIKE '${searchString}%'`
        
            const res = await pool.query(query)
            return res.rows
        }
        else if (typeof searchString == 'string') {
            const query = `select loinc_num as loincNum, component as loincComponent from loinc where component LIKE '%${searchString}%'`
        
            const res = await pool.query(query)
            return res.rows
        }
    }

    async saveData(data) {
        console.log(data)
        if (data.anonymizationType === 'from_col') {
            let tableName = 'collection_' + data.collection_id
            let columns = ''
            for (let el of data.columns) {
                columns += `"${el.codeFrom}"` + ' ' + 'varchar(99)' + ',' 
                columns += `"${el.codeTo}"` + ' ' + 'varchar(99)' + ',' 
            }
            //eliminate trailing comma
            columns = columns.slice(0, -1)
            console.log(columns)
            let query

            // IMPORTANT: the code to DROP the table is used only for testing purposes so that postgres does not throw when we try to create the same table, in the future this can be removed and we can directly create the table!
            // let query = `DROP TABLE "${tableName}"`
            // console.log(query)
            // const dropTable = await collectionDB.query(query)

            query = `CREATE TABLE "${tableName}" (id serial NOT NULL PRIMARY KEY, collection_id varchar(99), biobank_id varchar(99), ${columns}, number_of_rows integer)`
            console.log(query)
            const createdTable = await collectionDB.query(query)

            // SPEED UP TABLE PROCESS
            // let addColumns = ''
            query = `INSERT INTO speed_up_tables `
            let insertColumns = `"table_name",`
            let insertValues = `'${tableName}',`

            for (let column of data.columns) {
                let query = `SELECT column_name
                FROM information_schema.columns
                WHERE table_name='speed_up_tables' and column_name='${column.code}';`
                const res = await collectionDB.query(query)
                
                if (res.rows.length === 0) {
                    let speedUpQuery = `ALTER TABLE speed_up_tables ADD "${column.code}" varchar(99) `
                    await collectionDB.query(speedUpQuery)
                }

                // insert into speed_up_tables table
                insertColumns += `"${column.code}",`
                insertValues += `'true',`
            }

            //eliminate trailing comma
            insertColumns = insertColumns.slice(0, -1)
            insertValues = insertValues.slice(0, -1)

            // continue building the query
            query += `(${insertColumns})`
            query += ` values `
            query += `(${insertValues})`
            let speedQuery = await collectionDB.query(query)
            console.log(speedQuery)

            // add every column to our speed_up_table as a column -> ALTER speed_up_table
            // we would then write one row in this speed_up_table for table_name

            // test speed_up_tables_2
            query = `INSERT INTO speed_up_tables_2 ("table_name", "LOINCs") values `
            let addColumns = `"table_name", "LOINCs"`
            let addValues = `'${tableName}', ARRAY [`
            for (let column of data.columns) {
                addValues += `'${column.code}',`
            }
            addValues = addValues.slice(0, -1)
            addValues += `]`
            query += `(${addValues})`
            await collectionDB.query(query)

            // end test speed_up_tables_2

            let columnsToInsert = ''
            for (let el of data.columns) {
                columnsToInsert += `"${el.codeFrom}",` 
                columnsToInsert += `"${el.codeTo}",`
            }
            //eliminate trailing comma
            columnsToInsert = columnsToInsert.slice(0, -1)

            let insertQuery
            for (let el of data.mergedColumnsAndData) {
                let valuesForColumn = ''
                let numOfRows = 0
                for (let val of el) {
                    numOfRows = val.numberOfRows
                    console.log(val)
                    valuesForColumn += `'${val.fromValue}',` 
                    valuesForColumn += `'${val.toValue}',`
                }
                 //remove trailing comma
                 valuesForColumn = valuesForColumn.slice(0, -1)
                 // populate the DB
                 query = `INSERT INTO "${tableName}" (collection_id, biobank_id, ${columnsToInsert}, number_of_rows) values ('${data.collection_id}', '${data.biobank_id}', ${valuesForColumn}, ${numOfRows})`
                 console.log(query)
                 insertQuery = await collectionDB.query(query)
            }

            if (insertQuery.rowCount) {
                return {status: 'Collection_OK'}
            }
            else {
                return {status: 'Collection_BAD'}
            }

        }
        else if (data.anonymizationType === 'from_def') {
            let tableName = 'definition_' + data.definition_id
            //check if definition table exists
            let query = `SELECT EXISTS ( SELECT FROM information_schema.tables WHERE  table_schema = 'public' AND table_name = '${tableName}');`
            const definitionExists = await collectionDB.query(query)
            if (definitionExists?.rows[0]?.exists) {
                // This removes all the rows from the table and is more efficient than DELETE statement! - use this is the table needs to be cleaned before adding new data to it!
                // let truncateQuery = `TRUNCATE TABLE ${tableName};`
                // const truncateTable = await collectionDB.query(truncateQuery)

                //select the rows that come from the same biobank and same collection as we only need to clear (delete) those rows!
                let selectQuery = `SELECT id from "${tableName}" WHERE biobank_id = '${data.biobank_id}' AND collection_id = '${data.collection_id}'`
                selectQuery = await collectionDB.query(selectQuery)

                let ids = ''
                for (let row of selectQuery?.rows) {
                    ids += `'${row.id}',` 
                }
                //eliminate trailing comma
                ids = ids.slice(0, -1)

                // only delete the rows that come from the same biobank and the same collection
                let deleteQuery = `DELETE from "${tableName}" WHERE id IN(${ids})`
                deleteQuery = await collectionDB.query(deleteQuery)

                let columnsToInsert = ''
                for (let el of data.columns) {
                    columnsToInsert += `"${el.codeFrom}",` 
                    columnsToInsert += `"${el.codeTo}",`
                }
                //eliminate trailing comma
                columnsToInsert = columnsToInsert.slice(0, -1)

                let insertQuery
                for (let el of data.mergedColumnsAndData) {
                    let valuesForColumn = ''
                    let numOfRows = 0
                    for (let val of el) {
                        numOfRows = val.numberOfRows
                        console.log(val)
                        valuesForColumn += `'${val.fromValue}',` 
                        valuesForColumn += `'${val.toValue}',`
                    }
                    //remove trailing comma
                    valuesForColumn = valuesForColumn.slice(0, -1)
                    // populate the DB
                    query = `INSERT INTO "${tableName}" (collection_id, definition_id, biobank_id, ${columnsToInsert}, number_of_rows) values ('${data.collection_id}', '${data.definition_id}', '${data.biobank_id}', ${valuesForColumn}, ${numOfRows})`
                    console.log(query)
                    insertQuery = await collectionDB.query(query)

                }
                if (insertQuery.rowCount) {
                    return {status: 'Definition_existing_OK'}
                }
                else {
                    return {status: 'Definition_existing_BAD'}
                }
            }
            else {
                let columns = ''
                for (let el of data.columns) {
                    columns += `"${el.codeFrom}"` + ' ' + 'varchar(99)' + ',' 
                    columns += `"${el.codeTo}"` + ' ' + 'varchar(99)' + ',' 
                }
                //eliminate trailing comma
                columns = columns.slice(0, -1)
                console.log(columns)

                // IMPORTANT: the drop table is just for testing purposes so postgres does not throw errors when we try it with the same data, in production this can be removed and we can directly create table if it does not exist
                // query = `DROP TABLE "${tableName}"`
                // console.log(query)
                // const dropTable = await collectionDB.query(query)

                query = `CREATE TABLE "${tableName}" (id serial NOT NULL PRIMARY KEY, collection_id varchar(99), definition_id varchar(99), biobank_id varchar(99), ${columns}, number_of_rows integer)`
                console.log(query)
                const createdTable = await collectionDB.query(query)

                 // SPEED UP TABLE PROCESS
                // let addColumns = ''
                query = `INSERT INTO speed_up_tables `
                let insertColumns = `"table_name",`
                let insertValues = `'${tableName}',`

                for (let column of data.columns) {
                    let query = `SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name='speed_up_tables' and column_name='${column.code}';`
                    const res = await collectionDB.query(query)
                    
                    if (res.rows.length === 0) {
                        let speedUpQuery = `ALTER TABLE speed_up_tables ADD "${column.code}" varchar(99) `
                        await collectionDB.query(speedUpQuery)
                    }

                    // insert into speed_up_tables table
                    insertColumns += `"${column.code}",`
                    insertValues += `'true',`
                }

                //eliminate trailing comma
                insertColumns = insertColumns.slice(0, -1)
                insertValues = insertValues.slice(0, -1)

                // continue building the query
                query += `(${insertColumns})`
                query += ` values `
                query += `(${insertValues})`
                let speedQuery = await collectionDB.query(query)
                console.log(speedQuery)


                // test speed_up_tables_2
            query = `INSERT INTO speed_up_tables_2 ("table_name", "LOINCs") values `
            let addColumns = `"table_name", "LOINCs"`
            let addValues = `'${tableName}', ARRAY [`
            for (let column of data.columns) {
                addValues += `'${column.code}',`
            }
            addValues = addValues.slice(0, -1)
            addValues += `]`
            query += `(${addValues})`
            await collectionDB.query(query)

            // end test speed_up_tables_2


                let columnsToInsert = ''
                for (let el of data.columns) {
                    columnsToInsert += `"${el.codeFrom}",` 
                    columnsToInsert += `"${el.codeTo}",`
                }
                //eliminate trailing comma
                columnsToInsert = columnsToInsert.slice(0, -1)

                let insertQuery
                for (let el of data.mergedColumnsAndData) {
                    let valuesForColumn = ''
                    let numOfRows = 0
                    for (let val of el) {
                        numOfRows = val.numberOfRows
                        console.log(val)
                        valuesForColumn += `'${val.fromValue}',` 
                        valuesForColumn += `'${val.toValue}',`
                    }
                    //remove trailing comma
                    valuesForColumn = valuesForColumn.slice(0, -1)
                    // populate the DB
                    query = `INSERT INTO "${tableName}" (collection_id, definition_id, biobank_id, ${columnsToInsert}, number_of_rows) values ('${data.collection_id}', '${data.definition_id}', '${data.biobank_id}', ${valuesForColumn}, ${numOfRows})`
                    console.log(query)
                    insertQuery = await collectionDB.query(query)

                }
                if (insertQuery.rowCount) {
                    return {status: 'Definition_new_OK'}
                }
                else {
                    return {status: 'Definition_new_BAD'}
                }
            //if yes then edit the table (add to it - alter)
            //if no then create definition table the same way as collection table (only + definition_id)

            // query = `INSERT INTO ${tableName}(biobank_id, collection_id, index_id, "10156-8_from", "10156-8_to", "10157-6_from", "10157-6_to", "10165-9_from", "10165-9_to", number_of_rows) values ('biobank_7', 'collection_7', 'index_7', 4, 8, 6, 9, 2, 10, 25)`

            }
        }
    }

    async getData(frontendQuery) {
        console.log(frontendQuery)
        try {
            let result = []
            let tableNames = []
            let columns

            // OLD VERSION : CHECK ALL TABLES
            // let query = `select t.table_name, array_agg(c.column_name::text) as columns
            //                     from information_schema.tables t
            //                     inner join information_schema.columns c on t.table_name = c.table_name
            //                     where
            //                     t.table_schema = 'public'
            //                     and t.table_type= 'BASE TABLE'
            //                     and c.table_schema = 'public'
            //                     group by t.table_name;`
            //     const tablesAndColumns = await collectionDB.query(query)


            //     if (tablesAndColumns.rows) {
            //         for (let table of tablesAndColumns.rows) {
            //             let matches = true
            //             for (let el of frontendQuery) {
            //                 if (!(table.columns.includes(`${el.loincCode.loincnum}_from`) && table.columns.includes(`${el.loincCode.loincnum}_to`))) {
            //                     matches = false
            //                     break
            //                 }
            //             }
            //             if (matches) {
            //                 tableNames.push(table.table_name)
            //             }
            //         }
            //     }

            // NEW VERSION: ONLY QUERY THE SPEED_UP_TABLE
            // let query = `SELECT table_name from speed_up_tables WHERE `
            // let queryLoincs = ''
            // let counter = frontendQuery.length

            // for (let data of frontendQuery) {
            //     query += `"${data.loincCode.loincnum}" IS NOT NULL`

            //     if (!--counter) {
            //         continue
            //     }
            //     else {
            //         query += ' AND '
            //     }
            // }
            // const speedUpResult = await collectionDB.query(query)
            // for (let res of speedUpResult.rows) {
            //     tableNames.push(res.table_name)
            // }
            // END NEW VERSION

            // NEWEST VERSION: query the speed_up_tables_2
            let query = `SELECT table_name from speed_up_tables_2 WHERE `
            let counter = frontendQuery.length
            for (let data of frontendQuery) {
                query += `'${data.loincCode.loincnum}'= ANY("LOINCs")`

                if (!--counter) {
                    continue
                }
                else {
                    query += ' AND '
                }
            }
            const speedUpResult = await collectionDB.query(query)
            for (let res of speedUpResult.rows) {
                tableNames.push(res.table_name)
            }
                
            // END NEWEST VERSION

            for (let tableName of tableNames) {

                let whereClause = 'where ('
                let selectQueryLoincColumns = ''
                counter = frontendQuery.length
                for (let el of frontendQuery) {
                    let searchByNumber = !isNaN(el.value.fromValue) && !isNaN(el.value.toValue)
                    selectQueryLoincColumns += ` "${el.loincCode.loincnum}_from", "${el.loincCode.loincnum}_to", `
                    if (searchByNumber) {
                    // whereClause += `("${el.loincCode.loincnum}_from"::integer BETWEEN ${el.value.fromValue} and ${el.value.toValue}) OR ("${el.loincCode.loincnum}_to"::integer BETWEEN  ${el.value.fromValue} and ${el.value.toValue})`

                    // make this query only if the fromValue === toValue, otherwise make the query from before!
                    // if (el.value.fromValue === el.value.toValue) {
                        whereClause += `(${el.value.fromValue} BETWEEN "${el.loincCode.loincnum}_from"::numeric and "${el.loincCode.loincnum}_to"::numeric) OR ( ${el.value.toValue} BETWEEN "${el.loincCode.loincnum}_from"::numeric and "${el.loincCode.loincnum}_to"::numeric) OR ("${el.loincCode.loincnum}_from"::numeric BETWEEN ${el.value.fromValue} and ${el.value.toValue}) OR ("${el.loincCode.loincnum}_to"::numeric BETWEEN  ${el.value.fromValue} and ${el.value.toValue})`
                    // }
                    // else {
                    //     whereClause += `("${el.loincCode.loincnum}_from"::integer BETWEEN ${el.value.fromValue} and ${el.value.toValue}) OR ("${el.loincCode.loincnum}_to"::integer BETWEEN  ${el.value.fromValue} and ${el.value.toValue})`
                    // }

                    //escape for last element
                    if (!--counter) {
                        continue
                    }
                    else {
                        whereClause += ' and '
                    }
                 
                // TODO: in the future we might have two kinds of tables (indexes and collections(i.e. index_todaysDateAsId, collection_todaysDateAsId) and then similar to when we have two kinds of queries for getting loinc codes by code or name, we might make two different queries where if the name of the table starts with 'index_' we have the query just like below, whereas if the name of the table starts with 'collection_' then we do the query which will be all the same like the one for the index, except it will not have an index_id column! Then in frontend we will display N/A for index_id column when we send collections.)
                // TODO: in the future, rewrite queries as parametrized queries instead of template string queries to prevent sql injections and do automatic sanitizing of the data

                    }  
                    // if we search by string (ex: 66476-3(country): europe)
                    else {
                        whereClause += `"${el.loincCode.loincnum}_from" LIKE '%${el.value.fromValue}%' OR "${el.loincCode.loincnum}_to" LIKE '%${el.value.toValue}%'`

                         //escape for last element
                        if (!--counter) {
                            continue
                        }
                        else {
                            whereClause += ' and '
                        }
                    }
                }
                whereClause += ')'
                //if tableName startsWith "collection_" then do query below otherwise do another query where instead of collection_id we have definition_id - UPDATE this is not needed as the definitions will also contain the collection_id, adn we only send the collection id to the frontend.
                if (tableName.startsWith('collection')) {
                    query = `select biobank_id as biobank_id, collection_id as collection_id, ${selectQueryLoincColumns} number_of_rows as number_of_rows from "${tableName}" ${whereClause} order by number_of_rows desc`
                } else if (tableName.startsWith('definition')) {
                    query = `select definition_id as definition_id, biobank_id as biobank_id, collection_id as collection_id, ${selectQueryLoincColumns} number_of_rows as number_of_rows from "${tableName}" ${whereClause} order by number_of_rows desc`
                }
                // query = `select biobank_id as biobank_id, collection_id as collection_id, SUM(number_of_rows) as number_of_rows from "${tableName}" ${whereClause} GROUP BY biobank_id, collection_id order by number_of_rows desc`
                console.log(query)

                    const res = await collectionDB.query(query)
                    if (res) {
                        // return res.rows
                        result.push(res.rows)
                    }
            }
            console.log(result)
            let frontendLoincs = frontendQuery.map(function(row) { return {loincCode: row.loincCode.loincnum, fromValue: row.value.fromValue, toValue: row.value.toValue }})
            // result = [frontendLoincs, ...result[0]]
            for (let arr of result) {
                console.log(arr)
                // for (let frontendRow of frontendLoincs) {
                for (let row of arr) {
                    row['frontendQuery'] = frontendLoincs
                        // Object.assign(row, frontendRow)
                    }
                // }
            }
            // result = result.map(row => [frontendLoincs, ...row])
            console.log(result)

            return result
        } 
        catch(e) {
            console.log(e.message)
        }

    }
}

let contentDAO = new ContentDAO()

module.exports = contentDAO

// const query = async () => {
//     const result = await client.query(`select loinc_num as loincNum, component as loincComponent from loinc`)
//     console.log(result.rows)
//     client.end()
// }


// query()