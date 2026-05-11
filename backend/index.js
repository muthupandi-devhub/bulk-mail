const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());



mongoose
  .connect("mongodb://127.0.0.1:27017/passkey")
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });


const credentialSchema = new mongoose.Schema({
  username: String,
  pass: String,
});

const Credential = mongoose.model(
  "credential",
  credentialSchema,
  "bulkmain"
);



app.post("/sendemail", async (req, res) => {
  try {

    const { message, emailList } = req.body;

    // validation
    if (!message || message.trim() === "") {
      return res.status(400).send("Message is required");
    }

    if (!emailList || emailList.length === 0) {
      return res.status(400).send("No emails found");
    }

    // get gmail credentials from mongodb
    const data = await Credential.findOne();

    if (!data) {
      return res
        .status(400)
        .send("No Gmail credentials found in DB");
    }

    // transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data.username,
        pass: data.pass,
      },
    });

    let sentCount = 0;
    let failedCount = 0;

    // email validation regex
    const validator =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // send emails
    for (const email of emailList) {

      // skip invalid email
      if (!validator.test(email)) {
        console.log("Invalid Email:", email);
        failedCount++;
        continue;
      }

      try {

        await transporter.sendMail({
          from: data.username,
          to: email,
          subject: "Bulk Mail Message",
          text: message,
        });

        console.log("Email Sent:", email);

        sentCount++;

      } catch (err) {

        console.log("Send Failed:", email);
        console.log(err.message);

        failedCount++;

      }
    }

    console.log("Total Sent:", sentCount);
    console.log("Total Failed:", failedCount);

    // response
    res.status(200).json({
      success: true,
      sent: sentCount,
      failed: failedCount,
    });

  } catch (err) {

    console.log("Server Error:", err);

    res.status(500).send(err.message);
  }
});



app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});