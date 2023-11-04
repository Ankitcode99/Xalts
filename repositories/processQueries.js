module.exports.createProcessTable = `CREATE TABLE IF NOT EXISTS Processes(
    id                SERIAL PRIMARY KEY,
    creator_id        VARCHAR REFERENCES Users(loginEmail),
    description       VARCHAR(255),
    signCount         INTEGER DEFAULT 0,   
    status            VARCHAR(20) DEFAULT 'pending'
);`

module.exports.createProcessParticipantsTable = `CREATE TABLE IF NOT EXISTS ProcessesParticipants(
    id                      SERIAL PRIMARY KEY,
    process_id              INTEGER REFERENCES Processes(id),
    participant_email       VARCHAR REFERENCES Users(loginEmail),
    signed_off              BOOLEAN DEFAULT FALSE,
    picture_url             VARCHAR(150)
);`

module.exports.createCommentsTable = `CREATE TABLE IF NOT EXISTS Comments(
    id                SERIAL PRIMARY KEY,
    process_id        INTEGER REFERENCES Processes(id),
    created_by        VARCHAR REFERENCES Users(loginEmail),
    comment           TEXT NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

module.exports.createCommentVisibilityTable = `CREATE TABLE IF NOT EXISTS CommentsVisibility(
    id                        SERIAL PRIMARY KEY,
    process_id                INTEGER REFERENCES Processes(id),
    participant_email         VARCHAR REFERENCES Users(loginEmail)
);`

module.exports.addProcessToDatabase =  `INSERT INTO public.Processes (creator_id, description) 
VALUES ($1, $2) RETURNING id`

module.exports.addProcessParticipantsToDatabase = `INSERT INTO public.ProcessesParticipants (process_id, participant_email) 
VALUES ($1, $2) RETURNING *`

module.exports.addCommentVisitorsToDatabase = `INSERT INTO public.CommentsVisibility (process_id, participant_email)
VALUES ($1, $2) RETURNING *`

module.exports.deleteProcessFromDatabase = `DELETE FROM public.Processes WHERE id = $1 RETURNING *`

module.exports.deleteProcessParticipantsFromDatabase = `DELETE FROM public.ProcessesParticipants WHERE process_id = $1 RETURNING *`

module.exports.getProcessById = `SELECT * from public.Processes WHERE id = $1`

module.exports.getProcessParticipantEmails = `SELECT participant_email from public.ProcessesParticipants WHERE process_id = $1`

module.exports.getCommentVisitorsEmail = `SELECT participant_email from public.CommentsVisibility WHERE process_id = $1`

module.exports.getProcessByIdAndUserId = `SELECT id from public.Processes WHERE id = $1 AND creator_id = $2`

module.exports.getProcessParticipationByProcessIdAndParticipantEmail = `SELECT process_id, participant_email, signed_off FROM 
public.ProcessesParticipants WHERE process_id = $1 and participant_email = $2`

module.exports.addComment = `INSERT INTO public.Comments (process_id, created_by, comment) 
VALUES ($1, $2, $3) RETURNING *`

module.exports.updatePictureAndSignedOff = `UPDATE public.ProcessesParticipants SET picture_url = $2, signed_off = TRUE 
where process_id = $1 and participant_email = $3`

module.exports.updateSignCountInDatabase = `UPDATE public.Processes SET signCount = signCount + 1 WHERE id = $1 RETURNING signCount, creator_id`

module.exports.updateProcessStatusById = `UPDATE public.Processes SET status = 'approved' where id = $1 RETURNING *`;