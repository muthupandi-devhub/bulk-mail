  import { useState } from 'react'
  import axios from 'axios'
  import './App.css'
  import * as XLSX from 'xlsx'

  function App() {
    const [message, setMessage] = useState("")
    const [recipientEmail, setRecipientEmail] = useState("")
    const [send,setSend]=useState(false)
    const [file,setFile]=useState([])

    function handleSubmit(evt) {
      setMessage(evt.target.value)
    }

    function handleEmailChange(evt) {
      setRecipientEmail(evt.target.value)
    }

    async function sendEmail() {
      setSend(true)
      try {
        const res = await axios.post("http://localhost:5000/sendemail", {
          message: message,
          to: recipientEmail,
          emailList: file
        })
        if(res.data === true){
          alert("Email sent Successfully")
        } else {
          alert("Error: " + (res.data || "Unknown error"))
        }
      } catch(err) {
        console.log("Full error:", err)
        const errorMsg = err.response?.data || err.message || "Connection failed"
        alert("Error: " + errorMsg)
      } finally {
        setSend(false)
      }
    }
 function handlefile(evt){
      const file=evt.target.files[0]
      console.log(file)
      const reader=new FileReader();
      reader.onload=(e)=>{
        const content=e.target.result
        const workbook=XLSX.read(content,{type:"binary"})
        const sheetName=workbook.SheetNames[0]
        const sheet=workbook.Sheets[sheetName]
        const data=XLSX.utils.sheet_to_json(sheet)
        const emails=data.map((item)=>{return item.A})
        setFile(emails)
        console.log(emails) 
      }
      reader.readAsBinaryString(file);
    }
    return (
      <>
        <div className="m-0">
          <h1 className="text-3xl p-8 text-gray-100 font-bold text-center bg-blue-800">Bulk Mail</h1>
          <p className="text-xl font-bold text-center text-gray-100 bg-blue-500 p-8">Send bulk emails with ease</p>
          <p className="text-xl font-bold text-center text-gray-100 bg-blue-300 p-8">Get started today and send your first bulk email!</p>
          <div className="flex flex-col items-center p-8 bg-blue-100">
            <input type="email" placeholder="Recipient email" onChange={handleEmailChange} value={recipientEmail} className="bg-white border border-dashed p-4 outline-none min-w-100 focus:ring-2 focus:ring-blue-500 text-center mb-4 w-100"/>
            <textarea name="text" id="" placeholder="Enter your message" onChange={handleSubmit} value={message} className="bg-white border border-dashed p-4 outline-none min-w-100 focus:ring-2 focus:ring-blue-500 text-center"></textarea>
            <div className="m-10">
            <input type="file" onChange={handlefile} className="border border-white-100 border-dashed p-2 block w-full text-sm text-slate-500 file:mr-4 file:py-4 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"/>
          <p className="m-10 font-bold" >Select files: {file.length}</p>
          </div>
          <div className="m-2">
            <button type="submit" onClick={sendEmail} className="border  p-2 px-5 block w-full text-sm text-white font-bold bg-blue-500 file:mr-4 file:py-4 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer" >{send?"Sending...":"Send"}</button>
          </div>
          </div>
                  <h1 className="text-3xl p-8 text-gray-100 font-bold text-center bg-blue-600"></h1>
          <p className="text-xl font-bold text-center text-gray-100 bg-blue-500 p-8"></p>
          <p className="text-xl font-bold text-center text-gray-100 bg-blue-300 p-8"></p>
        </div>
      </>
    )
  }

  export default App
