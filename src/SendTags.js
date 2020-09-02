import React, { useState } from 'react'

export default function SendTags () {
    const [recipients, updateRecipients] = useState("")
    const [qualifier, updateQualifier] = useState("")
    const [sendTo, updateSendTo] = useState("")
    const [sendType, updateSendType] = useState("")
    const [sent, updateSent] = useState(false)
    const [found, updateFound] = useState(false)

    const handleChange = (event) => {
        const value = (event.target.value).toLowerCase().trim()
        switch(event.target.name) {
            case "sendType":
              updateSendType(value)
              return
            case "sendTo":
              updateSendTo(value)
              return
            case "qualifier":
              updateQualifier(value)
            default:
                return;
        }
    }
      /**
       * Allows users a few input options for sendType field and converts input to proper column for api data
       */
    const convertSendType = (sendTypeToConvert) => {
      const allowedUserSendTypes = {
        allowedFirstName: ['first', 'first name', 'firstname'],
        allowedLastName: ['last', 'last name', 'lastname'],
        allowedOrganization: ['org', 'organization', 'orgid', 'organizationid'],
        allowedTags: ['tags', 'tag'],
      }
      if (allowedUserSendTypes.allowedFirstName.includes(sendTypeToConvert)) return 'firstName'
      if (allowedUserSendTypes.allowedLastName.includes(sendTypeToConvert)) return 'lastName'
      if (allowedUserSendTypes.allowedOrganization.includes(sendTypeToConvert)) return 'organizationId'
      if (allowedUserSendTypes.allowedTags.includes(sendTypeToConvert)) return 'tags'
      return sendTypeToConvert
    }
      /**
       * Converts user input to format appropriate for query
       */
    const convertQualifier = (qualifierToConvert) => {
      switch(qualifierToConvert) {
        case "and":
          return ''
        case "or":
          return '_or'
        default:
          return;
      }
    }
      /**
       * Created query string with results of previous helper functions
       */
    const createQueryString = (providedSendTo, providedSendType, providedQualifier) => {
      let convertedSendToArray = providedSendTo.split(',')

      if (convertedSendToArray.length === 1) {
        return `search?${providedSendType}=*${convertedSendToArray.join('')}*`
      } else {
        return `search${providedQualifier}?${convertedSendToArray.map((currentSendTo) => `${providedSendType}[]=*${currentSendTo}*&`).join('')}`
      }
      
    }
      /**
       * Converts fetched api data to user readable string
       */
    const convertRecipientsToUserReadable = (recipientsArrayOfObjects) => {
      const recipientsArray = []
      recipientsArrayOfObjects.forEach(({ firstName, lastName }) => recipientsArray.push(firstName + ' ' + lastName))
      return recipientsArray.join(', ')
    }
    const handleSubmit = (event) => {
        event.preventDefault()
        updateSent(false)
        updateFound(false)
        fetch(`https://sheetdb.io/api/v1/aka2sv6jd00dh/${createQueryString(sendTo, convertSendType(sendType), convertQualifier(qualifier))}`)
          .then(response => response.json())
          .then(data => {
            if(data.length < 1) {
              updateRecipients('User(s) not found')
            } else {
              updateFound(true)
              updateSent(true)
              updateRecipients(convertRecipientsToUserReadable(data))
            }
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
            { sent && found && <div>Sent to: {recipients}</div> }
            { !found && <div>{recipients}</div> }
        </div>
    )
}