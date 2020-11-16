const functions = require('firebase-functions')
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()

    const submit = (req, res) => {
        const { kuis, journeyID, topikID, userID, answer } = req.body
        db.collection('Kuis').doc(kuis.kuisID).collection('Answers').doc('kunci').get().then(
            async function(doc) {
                let kunciArr = []
                let correction = [] 
                doc.data().body.forEach(data=>{
                    kunciArr[data.id] = data.answer
                })
                let nilai = 0
                
                kunciArr.forEach((kunci, i) => {
                    const status = typeof answer[i] !== 'undefined' ? answer[i] === kunci : false
                    correction.push(status)
                    if(typeof answer[i] !== 'undefined' && answer[i] === kunci){
                        nilai++
                    }
                })
                
                nilai = (nilai/kunciArr.length) * 100
                
                const isSaved = await db.collection('Profile').doc(userID).collection('Kuis').doc(kuis.kuisID).set({
                    topikID: topikID,
                    kuisID: kuis.kuisID,
                    journeyID: journeyID,
                    namaKuis: kuis.nama,
                    body: nilai,
                    answer: answer,
                    correction :correction,
                }).then(() => {
                    db.collection('Kuis').doc(kuis.kuisID)
                        .collection('Nilai')
                        .doc(userID)
                        .set({
                            uid : userID,
                            nilai: nilai,
                            answer : answer
                        })
                        .then(()=>{
                            console.log('Berhasil menyimpan nilai untuk user : ', userID);
                        }).catch(err=>{
                            console.log(err);
                            res.status(500).json({
                                body : `failed with error : ${err}`
                            })
                        })
                    return true
                }).catch(() => {
                    return false
                })
                
        
                res.status(200).json({
                    message: "Data successfully stored",
                    body: isSaved
                })
            })
            .catch(err => {
                res.status(400).json({
                    body : `failed with error : ${err}`
                })
            })
    }

    app.post('/make-admin',async (req,res)=>{
        const data = {
                email: req.body.email,
                tokenAdmin : req.body.tokenAdmin
            }
        if(!(data.email || data.tokenAdmin)){
            return res.status(400).json({status:'error',message:'masukin param yang bener'})
        }
        const decodedToken = await admin.auth().verifyIdToken(data.tokenAdmin)
                                    .catch(err=>{
                                        console.log(err);
                                        res.status(500).json({status:'error',message:err.message});
                                        return ;
                                    })
        if(!decodedToken.admin){
            res.status(403).json({status:'error',message:'anda bukan admin, anda tidak berhak menambahkan user'})
            return;   
        }
        const user =await admin.auth().getUserByEmail(data.email)
                    .catch(function(error) {
                        return res.status(500).json(error)
                    });
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: true
        }).then(()=>{
            return res.json({status:'sukses', message: `Berhasil membuat akun ${data.email} menjadi admin silahkan logout dan login kembali untuk merefresh akun`});
        })
        .catch(err=>{
            console.log(err);
            return res.status(500).json({status:'error',message:err.message})
        })
    })
    
    app.post("/submit", submit)
    
    
    
exports.api = functions.region("asia-southeast2").https.onRequest(app);
    