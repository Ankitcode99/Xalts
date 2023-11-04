const { pool } = require("../db")
const { addProcessToDatabase, deleteProcessParticipantsFromDatabase, deleteProcessFromDatabase, getProcessById, getProcessParticipantEmails, getCommentVisitorsEmail, getProcessByIdAndUserId, getProcessParticipationByProcessIdAndParticipantEmail, addComment, updatePictureAndSignedOff, updateSignCountInDatabase, updateProcessStatusById } = require("../repositories/processQueries")

function createProcessPromise(creator_id, description) {
    return new Promise(function (resolve, reject) {
        pool.query(addProcessToDatabase, [creator_id, description], (err, results) => {
            if(err) {
                reject(err);
            } else {
                resolve(results.rows[0]);
            }
        })
    })
}

function addMultipleEntries(raw_query, process_id, participants_email) {
    return new Promise((resolve, reject) => {

        if(participants_email.length == 0) {
            resolve();
            return;
        }

        pool.connect((err, client, done) => {
            if (err) {
                console.error('Error acquiring client from pool', err);
                reject(err);
                return;
            }

            // Use a transaction for multiple insertions
            client.query('BEGIN', (err) => {
                if (err) {
                    rollback(client, reject, err);
                    return;
                } else {
                    let queriesCompleted = 0;

                    participants_email.forEach((participant_email) => {
                        client.query(
                            raw_query,
                            [process_id, participant_email],
                            (err, result) => {
                                if (err) {
                                    rollback(client, reject, err);
                                    return;
                                } else {
                                    queriesCompleted++;

                                    if (queriesCompleted === participants_email.length) {
                                        // All queries completed successfully, commit the transaction
                                        client.query('COMMIT', (err) => {
                                            if (err) {
                                                rollback(client, reject, err);
                                                return;
                                            } else {
                                                // console.log('Inserted multiple rows');
                                                done(); // Release the client to the pool only once
                                                resolve(result);
                                            }
                                        });
                                    }
                                }
                            }
                        );
                    });
                }
            });
        });
    });
}

function rollback(client, reject, err) {
    client.query('ROLLBACK', (rollbackErr) => {
        if (rollbackErr) {
            console.error('Error rolling back client', rollbackErr);
        }
        reject(err);
    });
}


async function deleteProcessById(process_id) {
    const result = await pool.query(deleteProcessFromDatabase, [process_id]);

    console.log(`DELETE LOG : Deleted ${result.rowCount} records process id: ${process_id}!!`)    
}

async function deleteProcessParticipants (process_id) {
    const result = await pool.query(deleteProcessParticipantsFromDatabase, [process_id]);

    console.log(`DELETE LOG : Deleted ${result.rowCount} process participants records for Process id : ${process_id}!`)
}

async function getProcessDetails(process_id) {
    const result = await pool.query(getProcessById, [process_id]);
    return result;
}

async function getProcessParticipants(process_id) {
    const result = await pool.query(getProcessParticipantEmails, [process_id]);
    return result.rows;
}

async function getProcessCommentVisibilityList(process_id) {
    const result = await pool.query(getCommentVisitorsEmail, [process_id])
    return result.rows;
}

function getEmailFromArray(objectList) {
    return objectList.map((item) => item.participant_email);
}

async function validateProcessCreator(process_id, user_id) {
    const result = await pool.query(getProcessByIdAndUserId, [process_id, user_id]);
    return result;
}

async function validateProcessParticipant(process_id, participant_email) {
    const result = await pool.query(getProcessParticipationByProcessIdAndParticipantEmail, [process_id, participant_email]);
    return result;
}

async function addCommentForProcess(process_id, loginEmail, comment) {
    const result = await pool.query(addComment, [process_id, loginEmail, comment]);
    return result;
}

async function addPictureUrlForProcess(process_id, picture_url, loginEmail) {
    const result = await pool.query(updatePictureAndSignedOff, [process_id, picture_url, loginEmail]);
    return result;
}

async function updateSignCount(process_id) {
    const result = await pool.query(updateSignCountInDatabase, [process_id]);
    return result.rows[0];
}

async function updateProcessStatus(process_id) {
    const result = await pool.query(updateProcessStatusById, [process_id]);
    console.log("Updated process status ", result.rows)
    return result.rows[0];
}

module.exports = {
    createProcessPromise,
    addMultipleEntries,
    deleteProcessById,
    deleteProcessParticipants,
    getProcessDetails,
    getProcessParticipants,
    getProcessCommentVisibilityList,
    getEmailFromArray,
    validateProcessCreator,
    validateProcessParticipant,
    addCommentForProcess,
    addPictureUrlForProcess,
    updateSignCount,
    updateProcessStatus
}