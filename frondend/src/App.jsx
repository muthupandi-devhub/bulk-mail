import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./App.css";

function App() {

  const [message, setMessage] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [send, setSend] = useState(false);
  const [fileEmails, setFileEmails] = useState([]);

  // Message Change
  function handleMessage(evt) {
    setMessage(evt.target.value);
  }

  // Single Email Change
  function handleEmailChange(evt) {
    setRecipientEmail(evt.target.value);
  }

  // Send Email Function
  async function sendEmail() {

    // Excel emails copy
    let allEmails = [...fileEmails];

    // Add manual email
    if (recipientEmail !== "") {
      allEmails.push(recipientEmail);
    }

    // Remove duplicate emails
    allEmails = [...new Set(allEmails)];

    // Validation
    if (allEmails.length === 0) {
      alert("Please enter at least one email");
      return;
    }

    if (message.trim() === "") {
      alert("Message cannot be empty");
      return;
    }

    setSend(true);

    try {

      // API Call
      const res = await axios.post(
        "https://bulk-mail-oo37.vercel.app/sendemail",
        {
          message: message,
          emailList: allEmails,
        }
      );

      console.log(res.data);

      // Success Response
      if (res.data.success) {

        alert(
          `Emails Sent Successfully

Sent: ${res.data.sent}
Failed: ${res.data.failed}`
        );

      } else {

        alert("Some emails failed");

      }

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data ||
        err.message ||
        "Server Error"
      );

    } finally {

      setSend(false);

    }
  }

  // Excel File Read
  function handleFile(evt) {

    const uploadedFile = evt.target.files[0];

    if (!uploadedFile) return;

    const reader = new FileReader();

    reader.onload = (e) => {

      const data = e.target.result;

      // Read Excel
      const workbook = XLSX.read(data, {
        type: "binary",
      });

      // First Sheet
      const sheetName = workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log(jsonData);

      // Extract Emails
      const emails = jsonData
        .map((item) => Object.values(item)[0])
        .filter((email) => email);

      setFileEmails(emails);

      console.log(emails);
    };

    reader.readAsBinaryString(uploadedFile);
  }

  return (
    <>
      <div className="m-0">

        {/* Header */}
        <h1 className="text-3xl p-8 text-gray-100 font-bold text-center bg-blue-800">
          Bulk Mail
        </h1>

        <p className="text-xl font-bold text-center text-gray-100 bg-blue-500 p-8">
          Send bulk emails with ease
        </p>

        {/* Main Section */}
        <div className="flex flex-col items-center p-8 bg-blue-100">

          {/* Single Email */}
          <input
            type="email"
            placeholder="Recipient email"
            onChange={handleEmailChange}
            value={recipientEmail}
            className="bg-white border border-dashed p-4 outline-none min-w-100 focus:ring-2 focus:ring-blue-500 text-center mb-4 w-100"
          />

          {/* Message */}
          <textarea
            placeholder="Enter your message"
            onChange={handleMessage}
            value={message}
            className="bg-white border border-dashed p-4 outline-none min-w-100 focus:ring-2 focus:ring-blue-500 text-center"
          ></textarea>

          {/* File Upload */}
          <div className="m-10">

            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFile}
              className="border border-dashed p-2 block w-full text-sm text-slate-500
              file:mr-4 file:py-4 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-500 file:text-white
              hover:file:bg-blue-600 cursor-pointer"
            />

            {/* Total Emails */}
            <p className="m-10 font-bold">
              Total Emails: {fileEmails.length}
            </p>

          </div>

          {/* Send Button */}
          <div className="m-2">

            <button
              type="submit"
              onClick={sendEmail}
              disabled={send}
              className="border p-2 px-5 block w-full text-sm text-white font-bold bg-blue-500 hover:bg-blue-600 cursor-pointer"
            >
              {send ? "Sending..." : "Send"}
            </button>

          </div>

        </div>

      </div>
    </>
  );
}

export default App;