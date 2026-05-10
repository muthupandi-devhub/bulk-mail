const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/passkey")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log("MongoDB Error", err);
});

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendemail", async (req, res) => {

    let message = req.body.message;
    let emailList = req.body.emailList;

    if (!emailList || emailList.length === 0) {
        return res.status(400).send("No Email Found");
    }

    try {

        const data = await credential.find();

        if (!data || data.length === 0) {
            return res.status(400).send("No email credentials found in database");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: data[0].toJSON().username,
                pass: data[0].toJSON().pass,
            },
        });

        let sentCount = 0;
        let errorCount = 0;

        for (let i = 0; i < emailList.length; i++) {

            try {

                await transporter.sendMail({
                    from: data[0].toJSON().username,
                    to: emailList[i],
                    subject: "Message from Bulk Mail App",
                    text: message,
                });

                console.log("Email Sent to:", emailList[i]);
                sentCount++;

            } catch (err) {

                console.log(err);
                errorCount++;

            }
        }

        console.log("Sent:", sentCount);
        console.log("Failed:", errorCount);

        if (errorCount === 0) {
            res.send(true);
        } else {
            res.send(false);
        }

    } catch (err) {

        console.log("Email send error:", err);
        res.status(500).send("Server error: " + err.message);

    }

});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});