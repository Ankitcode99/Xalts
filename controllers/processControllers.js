const { addCommentVisitorsToDatabase, addProcessParticipantsToDatabase } = require("../repositories/processQueries");
const { createJsonMessage } = require("../utils");
const { createProcessPromise, addMultipleEntries, deleteProcessParticipants, deleteProcessById, getProcessDetails, getProcessParticipants, getProcessCommentVisibilityList, getEmailFromArray, validateProcessCreator, validateProcessParticipant, addCommentForProcess, addPictureUrlForProcess, updateSignCount, updateProcessStatus } = require("../utils/processUtils");

const REQUIRE_PARTICIPANTS = 2;

module.exports.createNewProcess = async (req,res) => {
    try {
        let {description, participants, commentVisibility} = req.body;
        const { loginEmail } = req.user;

        let process_id;
        let errorListName = ''

        commentVisibility = [...commentVisibility, loginEmail];

        if(participants.length != REQUIRE_PARTICIPANTS) {
            res.status(400).json(createJsonMessage(`Please mention exactly ${REQUIRE_PARTICIPANTS} participants to sign-off process`));
        } else{
            let emailList = [...participants, loginEmail]
            await createProcessPromise(loginEmail, description)
                .then((result) => {
                    process_id = result.id;
                    return addMultipleEntries(addProcessParticipantsToDatabase, process_id, participants)
                }).then(results => {

                }).catch((error)=>{
                    errorListName = "partcipant\'s"
                    console.log("ERROR LOG: One or more participant\'s email is invalid ", error);
                    deleteProcessById(process_id);
                })

            if(errorListName != '') {
                return res.status(400).json(createJsonMessage(`One or more ${errorListName} email is invalid`));
            } else{
                await addMultipleEntries(addCommentVisitorsToDatabase, process_id, commentVisibility)
                    .then((result)=>{

                        console.log("Multiple entry 2: ",result)

                        return res.status(201).json({
                            "message": `Successfully created a new process with ID ${result.rows[0].process_id}`,
                            "email-notification": `Sent email notification to users - ${emailList}`
                        })
                    }).catch(async (error)=>{
                        await deleteProcessParticipants(process_id);
                        console.log("ERROR LOG: One or more commentor\'s email is invalid ", error);
                        deleteProcessById(process_id);
                        return res.status(400).json(createJsonMessage("One or more commentor\'s email is invalid"));
                    })
            }
        }
    } catch (error) {
        console.log("ERROR LOG: Error creating new process: "+error);
        return res.status(500).json(createJsonMessage("Internal Server Error! Please try after sometime."))
    }
}

module.exports.getProcessDetails = async (req, res) => {
    try {
        const process_id = req.params.id;

        let resultObj = {};

        getProcessDetails(process_id)
            .then(response => {
                if(response.rowCount == 0){
                    res.status(404).json(createJsonMessage(`No process found with ID ${process_id}`));
                    return Promise.reject("No process found")
                } 

                resultObj = {...response.rows[0]}
                return getProcessParticipants(process_id)
            }).then(result => {
                resultObj = {...resultObj, Participants: getEmailFromArray(result)}
                return getProcessCommentVisibilityList(process_id)
            }).then(results => {
                resultObj = {...resultObj, CommentVisibilityList: getEmailFromArray(results)}
                res.status(200).json(resultObj);
            }).catch(err => {
                console.log(err);
                if(err === "No process found") {
                    console.log(err)
                } else {
                    console.log("ERROR LOG: Get Process Details Error: " + err);
                    return res.status(500).json(createJsonMessage("Internal Server Error! Please try after some time!"))    
                }
            })
    } catch (error) {
        console.log("ERROR LOG: Get Process Details Error: " + err);
        return res.status(500).json(createJsonMessage("Internal Server Error!"))

    }
}

module.exports.addProcessCommentors = async (req, res) => {
    try {
        const { commentVisibility } = req.body;
        const process_id = req.params.id;
        const {loginEmail} = req.user;

        if(!commentVisibility || !(Array.isArray(commentVisibility)) || commentVisibility?.length == 0) {
            res.status(400).json(createJsonMessage("Please enter email(s) in a list to provide comments visibility"));
        } else {
            validateProcessCreator(process_id, loginEmail)
                .then((result) => {
                    if(result.rowCount == 0) {
                        res.status(403).json(createJsonMessage("You are unauthorized to perform this action!"));
                        return Promise.reject("Unauthrorized Access!")
                    }

                    return getProcessCommentVisibilityList(process_id);
                }).then((result)=>{

                    const existingVisibilityList = getEmailFromArray(result);
                    const newCommentVisibilityList = commentVisibility.filter(email => !existingVisibilityList.includes(email));

                    console.log(newCommentVisibilityList)

                    return addMultipleEntries(addCommentVisitorsToDatabase, process_id, newCommentVisibilityList)
                }).then((result)=>{
                    return res.status(200).json(createJsonMessage("Comment visibility list updated!"));
                })
                .catch((err)=>{
                    if(err == "Unauthrorized Access!"){
                        console.log(err);
                    }else{
                        console.log("ERROR LOG: One or more commentor\'s email is invalid ", err);
                        return res.status(400).json(createJsonMessage("One or more commentor\'s email is invalid"));
                    }
                })
        }
    } catch (error) {
        console.log("ERROR LOG: Add Process Commentors Error: " + error)
        return res.status(500).json(createJsonMessage("Internal Server Error!"))
    }
}

// In this method I am assuming that we handled image upload separately in frontend and we have the image downloadable url i.e. `picture_url`
module.exports.performProcessSignOff = async (req, res) => {
    try {
        const {comment, picture_url} = req.body;
        const process_id = req.params.id;
        const {loginEmail} = req.user; 

        if(!comment || !picture_url) {
            res.status(400).json(createJsonMessage("Both comment and picture_url are mandatory!"));
        } else {
            let emailList = [];
            validateProcessParticipant(process_id, loginEmail)
                .then((results)=>{
                    if(results.rowCount == 0) {
                        res.status(403).json(createJsonMessage("You are not allowed to perform this action!"));
                        return Promise.reject("Unauthorized")
                    }
                    if(results.rows[0].signed_off == true) {
                        res.status(204).json("You have already signed off the process!");
                        return Promise.reject("Already signed off");
                    }

                    return Promise.allSettled([addCommentForProcess(process_id, loginEmail, comment), addPictureUrlForProcess(process_id, picture_url, loginEmail)])
                }).then((data)=>{
                    return updateSignCount(process_id)
                }).then((result)=>{
                    const signs = result.signcount;
                    const creator_id = result.creator_id;
                    
                    emailList.push(creator_id)
                    if(signs != REQUIRE_PARTICIPANTS) {
                        res.status(200).json({
                            "message": `Successfully signed-off Process ${process_id}`,
                            "email-notification": `Sent email notification to ${emailList}`,
                        })
                        return Promise.reject("Sent email")
                    }
                    return Promise.allSettled([getProcessParticipants(process_id), updateProcessStatus(process_id)])
                }).then(result => {
                    console.log(result[0].value)
                    console.log("Status: ",result[1].value)
                    const allEmails = getEmailFromArray(result[0].value)
                    console.log(allEmails);
                    emailList = [...emailList, ...allEmails]

                    return res.status(200).json({
                        "message": `Successfully signed-off Process ${process_id}`,
                        "email-notification": `Sent email notification to ${emailList}`,
                    })
                }).catch((error) => {
                    if(error == "Unauthorized" || error == "Already signed off" || error == "Sent email") {
                        console.log(error)
                    } else {
                        console.log("ERROR LOG: Perform Process Sign Off ERROR: " + error)
                        return res.status(500).json(createJsonMessage("Internal Server Error! Please try after some time!"))   
                    }                    
                })

        }
    } catch (error) {
        console.log("ERROR LOG: Perform Process Sign Off ERROR: " + error)
        return res.status(500).json(createJsonMessage("Internal Server Error!"))
    }
}