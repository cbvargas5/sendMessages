import React, { useState } from 'react'

export default function SendTags () {
    const [recipients, updateRecipients] = useState("")
    const [qualifier, updateQualifier] = useState("")
    const [sendTo, updateSendTo] = useState("")
    const [sendType, updateSendType] = useState("")
    const [sent, updateSent] = useState(false)

    const handleChange = (event) => {
        const value = event.target.value
        switch(event.target.name) {
            case "sendType":
                updateSendType(value)
                return
            case "sendTo":
                updateSendTo(value)
                return
            case "qualifier":
                updateQualifier(value)
                return
            default:
                return;
        }
    }

    const convertSendType = (sendTypeToConvert) => {
      let convertedSendType = sendTypeToConvert.toLowerCase().trim()

      const allowedUserSendTypes = {
        allowedFirstName: ['first', 'first name', 'firstname'],
        allowedLastName: ['last', 'last name', 'lastname'],
        allowedOrganization: ['org', 'organization', 'orgid', 'organizationid'],
        allowedTags: ['tags', 'tag'],
      }
      if (allowedUserSendTypes.allowedFirstName.includes(convertedSendType)) return 'firstName'
      if (allowedUserSendTypes.allowedLastName.includes(convertedSendType)) return 'lastName'
      if (allowedUserSendTypes.allowedOrganization.includes(convertedSendType)) return 'organizationId'
      if (allowedUserSendTypes.allowedTags.includes(convertedSendType)) return 'tags'
      return sendTypeToConvert
    }

    const createQueryString = (sendToToConvert, providedSendType) => {
      let convertedSendToArray = sendToToConvert.toLowerCase().trim().split(',')

      if (convertedSendToArray.length === 1) {
        return `${providedSendType}=*${convertedSendToArray.join('')}*`
      } else {
        return convertedSendToArray.map((currentSendTo) => `${providedSendType}[]=*${currentSendTo}*&`).join('')
      }
      
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        /**
         * [x] SendType: Needs to have input parsed for available keys
         * [] SendTo: trim whitespace, create an array with inputs seperated with commas
         * [] qualifier: lowercase input and trim whitespace
         */
        
      console.log('query:', createQueryString(sendTo, convertSendType(sendType)))
        
        fetch(`https://sheetdb.io/api/v1/aka2sv6jd00dh/search_or?${createQueryString(sendTo, convertSendType(sendType))}`)
          .then(response => response.json())
          .then(data => {
            console.log('response data:', data)
          })
          .catch(err => console.error(err))
    }

    return (
        <div>
            <form onSubmit={handleSubmit} style={{textAlign: "left"}}>
                <label style={{paddingRight: "10px"}}>
                    <div>
                        <span style={{paddingRight: "10px"}}>Send Type (Organization, First Name, Last Name, or Tags):</span>
                        <input type="text" name="sendType" required onChange={handleChange}/>
                    </div>
                    <div>
                        <span style={{paddingRight: "10px", paddingTop: "20px"}}>Send To (separated by commas):</span>
                        <input type="text" name="sendTo" required onChange={handleChange}/>
                    </div>
                    <div>
                        <span style={{paddingRight: "10px", paddingTop: "20px"}}>AND/OR?: </span>
                        <input type="text" name="qualifier" required onChange={handleChange}/>
                    </div>
                </label>
                <input type="submit" value="Send Messages" />
            </form>
            { sent && <div>Sent to: {recipients}</div> }
        </div>
    )
}