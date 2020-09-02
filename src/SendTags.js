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

    const convertQualifier = (qualifierToConvert) => {
      let convertedQualifier = qualifierToConvert.toLowerCase().trim()
      switch(convertedQualifier) {
        case "and":
          return ''
        case "or":
          return '_or'
        default:
          return;
      }
    }
    const createQueryString = (providedSendTo, providedSendType, providedQualifier) => {
      let convertedSendToArray = providedSendTo.toLowerCase().trim().split(',')

      if (convertedSendToArray.length === 1) {
        return `search?${providedSendType}=*${convertedSendToArray.join('')}*`
      } else {
        return `search${providedQualifier}?${convertedSendToArray.map((currentSendTo) => `${providedSendType}[]=*${currentSendTo}*&`).join('')}`
      }
      
    }

    const convertRecipientsToUserReadable = (recipientsArrayOfObjects) => {
      const recipientsArray = []
      recipientsArrayOfObjects.forEach(({ firstName, lastName }) => recipientsArray.push(firstName + ' ' + lastName))
      return recipientsArray.join(', ')
    }
    const handleSubmit = (event) => {
        event.preventDefault()
        fetch(`https://sheetdb.io/api/v1/aka2sv6jd00dh/${createQueryString(sendTo, convertSendType(sendType), convertQualifier(qualifier))}`)
          .then(response => response.json())
          .then(data => {
            updateSent(true)
            updateRecipients(convertRecipientsToUserReadable(data))
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