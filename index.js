const alexaSDK = require('alexa-sdk');
const awsSDK = require('aws-sdk');
const promisify = require('es6-promisify');

const appId = 'amzn1.ask.skill.62fe955a-ad6f-4fcc-8fdf-cc6573159b8b';
const recipesTable = 'Recipes';
//const recipesTable = 'IRIS';
const docClient = new awsSDK.DynamoDB.DocumentClient();

// convert callback style functions to promises
const dbScan = promisify(docClient.scan, docClient);
const dbGet = promisify(docClient.get, docClient);
const dbPut = promisify(docClient.put, docClient);
const dbDelete = promisify(docClient.delete, docClient);

// Twilio Credentials 
var accountSid = 'ACebf68a8ce61533b1db5561c96ba7b9d1';
var authToken = '720b83281e5ca6379599ba5d860a27b2';
var fromNumber = '+12176144297';
var sendingTo = '+19805855420';
var https = require('https');
var queryString = require('querystring');

const instructions = `Welcome Srinath<break strength="medium" /> 
                      How may I help you today?`;

const handlers = {

  /**
   * Triggered when the user says "Alexa, open Internal IRIS.
   */
  'LaunchRequest'() {
    this.emit(':ask', instructions);
  },

  /**
   * Adds a recipe to the current user's saved recipes.
   * Slots: RecipeName, RecipeLocation, LongOrQuick
   */
  'AddRecipeIntent'() {
    const { userId } = this.event.session.user;
    const { slots } = this.event.request.intent;

    // prompt for slot values and request a confirmation for each

    // RecipeName
    if (!slots.RecipeName.value) {
      const slotToElicit = 'RecipeName';
      const speechOutput = 'What is the name of the recipe?';
      const repromptSpeech = 'Please tell me the name of the recipe';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else if (slots.RecipeName.confirmationStatus !== 'CONFIRMED') {

      if (slots.RecipeName.confirmationStatus !== 'DENIED') {
        // slot status: unconfirmed
        const slotToConfirm = 'RecipeName';
        const speechOutput = `The name of the recipe is ${slots.RecipeName.value}, correct?`;
        const repromptSpeech = speechOutput;
        return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
      }

      // slot status: denied -> reprompt for slot data
      const slotToElicit = 'RecipeName';
      const speechOutput = 'What is the name of the recipe you would like to add?';
      const repromptSpeech = 'Please tell me the name of the recipe';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }

    // RecipeLocation
    if (!slots.RecipeLocation.value) {
      const slotToElicit = 'RecipeLocation';
      const speechOutput = 'Where can the recipe be found?';
      const repromptSpeech = 'Please give me a location where the recipe can be found.';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else if (slots.RecipeLocation.confirmationStatus !== 'CONFIRMED') {

      if (slots.RecipeLocation.confirmationStatus !== 'DENIED') {
        // slot status: unconfirmed
        const slotToConfirm = 'RecipeLocation';
        const speechOutput = `The recipe location is ${slots.RecipeLocation.value}, correct?`;
        const repromptSpeech = speechOutput;
        return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
      }

      // slot status: denied -> reprompt for slot data
      const slotToElicit = 'RecipeLocation';
      const speechOutput = 'Where can the recipe be found?';
      const repromptSpeech = 'Please give me a location where the recipe can be found.';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }

    // LongOrQuick
    if (!slots.LongOrQuick.value) {
      const slotToElicit = 'LongOrQuick';
      const speechOutput = 'Is this a quick or long recipe to make?';
      const repromptSpeech = 'Is this a quick or long recipe to make?';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else if (slots.LongOrQuick.confirmationStatus !== 'CONFIRMED') {

      if (slots.LongOrQuick.confirmationStatus !== 'DENIED') {
        // slot status: unconfirmed
        const slotToConfirm = 'LongOrQuick';
        const speechOutput = `This is a ${slots.LongOrQuick.value} recipe, correct?`;
        const repromptSpeech = speechOutput;
        return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
      }

      // slot status: denied -> reprompt for slot data
      const slotToElicit = 'LongOrQuick';
      const speechOutput = 'Is this a quick or long recipe to make?';
      const repromptSpeech = 'Is this a quick or long recipe to make?';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }

    // all slot values received and confirmed, now add the record to DynamoDB

    const name = slots.RecipeName.value;
    const location = slots.RecipeLocation.value;
    const isQuick = slots.LongOrQuick.value.toLowerCase() === 'quick';
    const dynamoParams = {
      TableName: recipesTable,
      Item: {
        Name: name,
        UserId: userId,
        Location: location,
        IsQuick: isQuick
      }
    };

    const checkIfRecipeExistsParams = {
      TableName: recipesTable,
      Key: {
        Name: name,
        UserId: userId
      }
    };

    console.log('Attempting to add recipe', dynamoParams);

    // query DynamoDB to see if the item exists first
    dbGet(checkIfRecipeExistsParams)
      .then(data => {
        console.log('Get item succeeded', data);

        const recipe = data.Item;

        if (recipe) {
          const errorMsg = `Recipe ${name} already exists!`;
          this.emit(':tell', errorMsg);
          throw new Error(errorMsg);
        }
        else {
          // no match, add the recipe
          return dbPut(dynamoParams);
        }
      })
      .then(data => {
        console.log('Add item succeeded', data);

        this.emit(':tell', `Recipe ${name} added!`);
      })
      .catch(err => {
        console.error(err);
        shouldEndSession : shouldEndSession
      });
  },


/**
   * Adds a Call Report to the current user's saved reports.
   * Slots: CallReportName, CallReportDate, CallReportAttendees, CallReportDetails
   */
  'AddCallReportIntent'() {
    const { userId } = this.event.session.user;
    const { slots } = this.event.request.intent;

    // prompt for slot values and request a confirmation for each

    // CallReportName
    // if (!slots.CallReportName.value) {
    //   const slotToElicit = 'CallReportName';
    //   const speechOutput = 'What is the name of the Call Report?';
    //   const repromptSpeech = 'Please tell me the name of the Call Report';
    //   return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    // }
    // else if (slots.CallReportName.confirmationStatus !== 'CONFIRMED') {

    //   if (slots.CallReportName.confirmationStatus !== 'DENIED') {
    //     // slot status: unconfirmed
    //     const slotToConfirm = 'CallReportName';
    //     const speechOutput = `The name of the call report is ${slots.CallReportName.value}, correct?`;
    //     const repromptSpeech = speechOutput;
    //     return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
    //   }

    //   // slot status: denied -> reprompt for slot data
    //   const slotToElicit = 'CallReportName';
    //   const speechOutput = 'What is the name of the call report you would like to add?';
    //   const repromptSpeech = 'Please tell me the name of the call report';
    //   return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    // }

    // CallReportDate
    // if (!slots.CallReportDate.value) {
    //   const slotToElicit = 'CallReportDate';
    //   const speechOutput = 'what is the date?';
    //   const repromptSpeech = 'Please give me a date when this call happened.';
    //   return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    // }
    // else if (slots.CallReportDate.confirmationStatus !== 'CONFIRMED') {

    //   if (slots.CallReportDate.confirmationStatus !== 'DENIED') {
    //     // slot status: unconfirmed
    //     const slotToConfirm = 'CallReportDate';
    //     const speechOutput = `The call report date is ${slots.CallReportDate.value}, correct?`;
    //     const repromptSpeech = speechOutput;
    //     return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
    //   }

    //   // slot status: denied -> reprompt for slot data
    //   const slotToElicit = 'CallReportDate';
    //   const speechOutput = 'what is the date?';
    //   const repromptSpeech = 'Please give me a date when this call happened.';
    //   return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    // }

    // CallReportAttendees
    // if (!slots.CallReportAttendees.value) {
    //   const slotToElicit = 'CallReportAttendees';
    //   const speechOutput = 'Tell me Attendees Name';
    //   const repromptSpeech = 'Please tell me attendees Name';
    //   return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    // }
    // else if (slots.CallReportAttendees.confirmationStatus !== 'CONFIRMED') {

    //   if (slots.CallReportAttendees.confirmationStatus !== 'DENIED') {
    //     // slot status: unconfirmed
    //     const slotToConfirm = 'CallReportAttendees';
    //     const speechOutput = `Are these attendees ${slots.CallReportAttendees.value}, correct?`;
    //     const repromptSpeech = speechOutput;
    //     return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
    //   }

    //   // slot status: denied -> reprompt for slot data
    //   const slotToElicit = 'CallReportAttendees';
    //   const speechOutput = 'Tell me Attendees Name';
    //   const repromptSpeech = 'Please tell me attendees Name';
    //   return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    // }

        // CallReportDetails
        if (!slots.CallReportDetails.value) {
            const slotToElicit = 'CallReportDetails';
            const speechOutput = 'Tell me the Call Report details';
            const repromptSpeech = 'Please tell me the details';
            return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
          }
          // else if (slots.CallReportDetails.confirmationStatus !== 'CONFIRMED') {
      
          //   if (slots.CallReportDetails.confirmationStatus !== 'DENIED') {
          //     // slot status: unconfirmed
          //     const slotToConfirm = 'CallReportDetails';
          //     const speechOutput = `Please review ${slots.CallReportDetails.value}, Is this correct?`;
          //     const repromptSpeech = speechOutput;
          //     return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
          //   }
      
          //   // slot status: denied -> reprompt for slot data
          //   const slotToElicit = 'CallReportDetails';
          //   const speechOutput = 'Tell me the details';
          //   const repromptSpeech = 'Please tell me the details';
          //   return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
          // }

    // all slot values received and confirmed, now add the record to DynamoDB

    //const callReportName = slots.CallReportName.value;
     const callReportName = Date.now();
  //  const callReportDate = slots.CallReportDate.value;
   // const callReportAttendees = slots.CallReportAttendees.value;
    const callReportDetails = slots.CallReportDetails.value;
    const dynamoParams = {
      TableName: recipesTable,
      Item: {
        Name: callReportName,
    //    UserId: userId,
   //     Date: callReportDate,
     //   Attendees: callReportAttendees,
        Details: callReportDetails
      }
    };

    const checkIfCallReportExistsParams = {
      TableName: recipesTable,
      Key: {
        Name: callReportName
        //UserId: userId
      }
    };

    console.log('Attempting to add Call Report', dynamoParams);

    // query DynamoDB to see if the item exists first
    // dbGet(checkIfCallReportExistsParams)
    //   .then(data => {
    //     console.log('Get item succeeded', data);

    //     const recipe = data.Item;

    //     if (recipe) {
    //       const errorMsg = `Call Report ${callReportName} already exists!`;
    //   //    this.emit(':tell', errorMsg);
    //       throw new Error(errorMsg);
    //     }
    //     else {
          // no match, add the recipe
          return dbPut(dynamoParams);
   //     }
    //  })
   //   .then(data => {
        console.log('Add item succeeded', data);

     //   this.emit(':tell', `Call Report ${callReportName} added!`);
        this.emit(':tell', `Call Report drafted !`);
   //   })
  //    .catch(err => {
   //     console.error(err);
   //   });
  },



  /**
   * Lists all saved recipes for the current user. The user can filter by quick or long recipes.
   * Slots: GetRecipeQuickOrLong
   */
  'GetAllRecipesIntent'() {
    const { userId } = this.event.session.user;
    const { slots } = this.event.request.intent;
    let output;

    // prompt for slot data if needed
    if (!slots.GetRecipeQuickOrLong.value) {
      const slotToElicit = 'GetRecipeQuickOrLong';
      const speechOutput = 'Would you like a quick or long recipe or do you not care?';
      const repromptSpeech = 'Would you like a quick or long recipe or do you not care?';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }

    const isQuick = slots.GetRecipeQuickOrLong.value.toLowerCase() === 'quick';
    const isLong = slots.GetRecipeQuickOrLong.value.toLowerCase() === 'long';
    const dynamoParams = {
      TableName: recipesTable
    };

    if (isQuick || isLong) {
      dynamoParams.FilterExpression = 'UserId = :user_id AND IsQuick = :is_quick';
      dynamoParams.ExpressionAttributeValues = { ':user_id': userId, ':is_quick': isQuick };
      output = `The following ${isQuick ? 'quick' : 'long'} recipes were found: <break strength="x-strong" />`;
    }
    else {
      dynamoParams.FilterExpression = 'UserId = :user_id';
      dynamoParams.ExpressionAttributeValues = { ':user_id': userId };
      output = 'The following recipes were found: <break strength="x-strong" />';
    }

    // query DynamoDB
    dbScan(dynamoParams)
      .then(data => {
        console.log('Read table succeeded!', data);

        if (data.Items && data.Items.length) {
          data.Items.forEach(item => { output += `${item.Name}<break strength="x-strong" />`; });
        }
        else {
          output = 'No recipes found!';
        }

        console.log('output', output);

        this.emit(':tell', output);
      })
      .catch(err => {
        console.error(err);
      });
  },

/**
   * Lists all book information for the current user.
   * Slots: GetBook
   */
  'GetResearchIntent'(){
    this.emit(':tell', `Western Digital: 	Founded on April 23, 1970; 47 years ago, Headquarters: San jose,California, Revenue is 19.0 billion
    operating income is 1.954 billion`);
  },  
  'ConfirmEmailIntent'(){
    this.emit(':tell', `Western Digital: 	Founded on April 23, 1970; 47 years ago, Headquarters: San jose,California, Revenue is 19.0 billion
    operating income is 1.954 billion`);
  },
  'GetBookIntent'() {
    const { userId } = this.event.session.user;
    const { slots } = this.event.request.intent;
    let output;
    const dynamoParams = {
      TableName: recipesTable
    };

      dynamoParams.FilterExpression = 'UserId = :user_id';
      dynamoParams.ExpressionAttributeValues = { ':user_id': userId };
      output = 'Here is your book information:<break strength="x-strong" />';

    // query DynamoDB
    dbScan(dynamoParams)
      .then(data => {
        console.log('Read book information succeeded!', data);

        if (data.Items && data.Items.length) {
            data.Items.forEach(function(item){
            if(item.Name == 'mybook') {
                output += `${item.Answer}<break strength="x-strong" />`;
                console.log('Inside mybook loop: ',output);
       //   data.Items.forEach(item => { output += `${item.Answer}<break strength="x-strong" />`; });
            }
        });
        }
        else {
       //   output = 'No Book information found!';
       output += 'Number of Relationship 41. Outstanding Balance is $1567.27 million. Year to date Revenue is $44.75 million. Fee to Income Ratio is 78.3. Loan to Deposit Ratio is 15.0';
        }

        console.log('output', output);

        //this.emit(':tell', output);

        // if (!slots.SendMail.value) {
        //     const slotToElicit = 'SendMail';
        //     const speechOutput = 'Would you like to receive a detailed report on your email?';
        //     const repromptSpeech = speechOutput
        //     return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        //   }
        //   else 
        //slots.SendMail.value = output;
        if (slots.SendMail.confirmationStatus !== 'CONFIRMED') {
      
            if (slots.SendMail.confirmationStatus !== 'DENIED') {
              // slot status: unconfirmed
              const slotToConfirm = 'SendMail';
              const speechOutput = `${output}, Would you like to receive a detailed report on your email?`;
              const repromptSpeech = speechOutput;
              return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
              console.log('Email Sent');
            }
          }
          this.emit(':tell', `Email Sent to your registered address`);
      })
      .catch(err => {
        console.error(err);
      });
  },

/**
   * Lists all Opportunity information for the current user.
   * Slots: GetOpportunity
   */
  'GetOpportunityIntent'() {
    const { userId } = this.event.session.user;
    //const { userId } = '123';
    const { slots } = this.event.request.intent;
    let output;
    const dynamoParams = {
      TableName: recipesTable
    };

      dynamoParams.FilterExpression = 'UserId = :user_id';
      dynamoParams.ExpressionAttributeValues = { ':user_id': userId };
      output = 'Here is your Opportunity information:<break strength="x-strong" />';

    // query DynamoDB
    dbScan(dynamoParams)
      .then(data => {
        console.log('Read Opportunity information succeeded!', data);

        if (data.Items && data.Items.length) {
            data.Items.forEach(function(item){
            if(item.Name == 'myOpportunity') {
                output += `${item.Answer}<break strength="x-strong" />`;
                console.log('Inside myOpportunity loop: ',output);
       //   data.Items.forEach(item => { output += `${item.Answer}<break strength="x-strong" />`; });
            }
        });
        }
        else {
          output = 'Here is the break-up of opportunity: Credit Opportunity amount is 996438,Deposit Opportunity amount is 35663,Treasury Management Opportunity amount is 556242, and sum of all your Opportunity is 1888343 dollars';
        }

        console.log('output', output);

        this.emit(':tell', output);
      })
      .catch(err => {
        console.error(err);
      });
  },

/**
   * Lists all Calendar information for the current user.
   * Slots: GetCalendar
   */
  'GetCalendarIntent'() {
    const { userId } = this.event.session.user;
    const { slots } = this.event.request.intent;
    let output;
    const dynamoParams = {
      TableName: recipesTable
    };

      dynamoParams.FilterExpression = 'UserId = :user_id';
      dynamoParams.ExpressionAttributeValues = { ':user_id': userId };
     output = 'Here is your Calendar information.';

    // query DynamoDB
    dbScan(dynamoParams)
      .then(data => {
        console.log('Read Calendar information succeeded!', data);

        if (data.Items && data.Items.length) {
            data.Items.forEach(function(item){
              console.log('Item name issssssss++++',item.name);
            if(item.Name == 'myCalendar') {
                output += `${item.Answer}<break strength="x-strong" />`;
                console.log('Inside myCalendar loop: ',output);
       //   data.Items.forEach(item => { output += `${item.Answer}<break strength="x-strong" />`; });
            }
        });
        }
        else {
          output = 'Here is your Calendar information, You have a meeting at 2:00 PM tomorrow with Geico in Chicago area.';
        }

        console.log('output', output);

      //  this.emit(':tell', output);

     //   slots.SendMail.value = output;


        if (slots.SendMail.confirmationStatus !== 'CONFIRMED') {
      
            if (slots.SendMail.confirmationStatus !== 'DENIED') {
              // slot status: unconfirmed
              const slotToConfirm = 'SendMail';
              const speechOutput = `${output}. I have one more information. Based upon your meeting location, I found another client
              Micron. Would you like to get the contact details?`;
              const repromptSpeech = speechOutput;
                  // Send an SMS message to the number provided in the event data.
    // End the lambda function when the send function completes.
    console.log('Text Details Sent');
    console.log('Running SMS event');
    SendSMS(sendingTo, 'Here is Micron Contact Details - +1(234)456-789', 
    function (status) { context.done(null, status); });   
              return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
            
    
       
            }
          }
         this.emit(':tell', `Contact details has been sent to your mobile`);
      })
      .catch(err => {
        console.error(err);
      });
  },


  /**
   * Lists detail of a all the companies for the current user.
   * Slots: GetCompany
   */
  'GetAllCompaniesIntent'() {
    const { userId } = this.event.session.user;
    const { slots } = this.event.request.intent;

        // CompanyName
        // if (!slots.GetCompany.value) {
        //     const slotToElicit = 'CompanyName';
        //     const speechOutput = 'What is the name of the Company?';
        //     const repromptSpeech = 'Please tell me the name of the company';
        //     return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        //   }
          //The value of the company is saved in the below variable
          // const getCompanyName = slots.GetCompany.value;
          // console.log("Got company name from User:",getCompanyName);
    let output;
    const dynamoParams = {
      TableName: recipesTable
    };

      dynamoParams.FilterExpression = 'UserId = :user_id';
      dynamoParams.ExpressionAttributeValues = { ':user_id': userId };
     // output = 'Here is the list of company information:<break strength="x-strong" />';
     output = 'Here is the company details:<break strength="x-strong" />';
    // query DynamoDB
    dbScan(dynamoParams)
      .then(data => {
        console.log('Read company Names succeeded!', data);

        if (data.Items && data.Items.length) {
            data.Items.forEach(function(item){
            if(item.Name.startsWith('company_')) {
                console.log('Inside All Companies,',item.CompanyName)
                    output +=`${item.CompanyName}<break strength="x-strong" />`;
         //       console.log('Item name:',item.Name);
        //        output += `${item.CompanyName}<break strength="x-strong" />`;
        //        console.log('Inside list of companies loop: ',output);
       //   data.Items.forEach(item => { output += `${item.Answer}<break strength="x-strong" />`; });
            }
        });
        }
        else {
          output = 'No Companies found!';
        }

        console.log('output', output);

        this.emit(':tell', output);
      })
      .catch(err => {
        console.error(err);
      });
  },

  /**
   * Lists detail of a specific company for the current user.
   * Slots: GetCompany
   */
  'GetCompanyIntent'() {
    const { userId } = this.event.session.user;
    const { slots } = this.event.request.intent;

        // CompanyName
        if (!slots.GetCompany.value) {
            const slotToElicit = 'CompanyName';
            const speechOutput = 'What is the name of the Company?';
            const repromptSpeech = 'Please tell me the name of the company';
            return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
          }
          //The value of the company is saved in the below variable
          const getCompanyName = slots.GetCompany.value;
          console.log("Got company name from User:",getCompanyName);
    let output;
    const dynamoParams = {
      TableName: recipesTable
    };

      dynamoParams.FilterExpression = 'UserId = :user_id';
      dynamoParams.ExpressionAttributeValues = { ':user_id': userId };
     // output = 'Here is the list of company information:<break strength="x-strong" />';

    // query DynamoDB
    dbScan(dynamoParams)
      .then(data => {
        console.log('Read company information succeeded!', data);

        if (data.Items && data.Items.length) {
            data.Items.forEach(function(item){
            if(item.Name.startsWith('company_')) {
              console.log('Inside Company name loop:',item.CompanyName);
              console.log('Company name from DB,',item.CompanyName);
              console.log('Company name from User,',getCompanyName)
                if(item.CompanyName== getCompanyName){
                    console.log('Company name:',item.CompanyName);
                    output = `${item.Answer}<break strength="x-strong" />`;
                }
         //       console.log('Item name:',item.Name);
        //        output += `${item.CompanyName}<break strength="x-strong" />`;
        //        console.log('Inside list of companies loop: ',output);
       //   data.Items.forEach(item => { output += `${item.Answer}<break strength="x-strong" />`; });
            }
        });
        }
        else {
          output = 'No Companies found!';
        }

        console.log('output', output);

        this.emit(':tell', output);
      })
      .catch(err => {
        console.error(err);
      });
  },

  /**
   * Lists all Opportunity information for the current user.
   * Slots: GetOpportunity
   */
  'GetOpportunityIntent'() {
    const { userId } = this.event.session.user;
    const { slots } = this.event.request.intent;
    let output;
    const dynamoParams = {
      TableName: recipesTable
    };

      dynamoParams.FilterExpression = 'UserId = :user_id';
      dynamoParams.ExpressionAttributeValues = { ':user_id': userId };
      output = 'Here is your Opportunity information:<break strength="x-strong" />';

    // query DynamoDB
    dbScan(dynamoParams)
      .then(data => {
        console.log('Read Opportunity information succeeded!', data);

        if (data.Items && data.Items.length) {
            data.Items.forEach(function(item){
            if(item.Name == 'myOpportunity') {
                output += `${item.Answer}<break strength="x-strong" />`;
                console.log('Inside myOpportunity loop: ',output);
       //   data.Items.forEach(item => { output += `${item.Answer}<break strength="x-strong" />`; });
            }
        });
        }
        else {
          output = 'No Opportunity information found!';
        }

        console.log('output', output);

        this.emit(':tell', output);
      })
      .catch(err => {
        console.error(err);
      });
  },




  /**
   * Reads the full info of the selected recipe.
   * Slots: RecipeName
   */
  'GetRecipeIntent'() {
    const { slots } = this.event.request.intent;

    // prompt for slot data if needed
    if (!slots.RecipeName.value) {
      const slotToElicit = 'RecipeName';
      const speechOutput = 'What is the name of the recipe?';
      const repromptSpeech = 'Please tell me the name of the recipe';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }

    const { userId } = this.event.session.user;
    const recipeName = slots.RecipeName.value;
    const dynamoParams = {
      TableName: recipesTable,
      Key: {
        Name: recipeName,
        UserId: userId
      }
    };

    console.log('Attempting to read data');

    // query DynamoDB
    dbGet(dynamoParams)
      .then(data => {
        console.log('Get item succeeded', data);

        const recipe = data.Item;

        if (recipe) {
          this.emit(':tell', `Recipe ${recipeName} is located in ${recipe.Location} and it
                        is a ${recipe.IsQuick ? 'Quick' : 'Long'} recipe to make.`);
        }
        else {
          this.emit(':tell', `Recipe ${recipeName} not found!`);
        }
      })
      .catch(err => console.error(err));
  },

  /**
   * Gets a random saved recipe for this user. The user can filter by quick or long recipes.
   * Slots: GetRecipeQuickOrLong
   */
  'GetRandomRecipeIntent'() {
    const { slots } = this.event.request.intent;

    // prompt for slot data if needed
    if (!slots.GetRecipeQuickOrLong.value) {
      const slotToElicit = 'GetRecipeQuickOrLong';
      const speechOutput = 'Would you like a quick or long recipe or do you not care?';
      const repromptSpeech = 'I said, would you like a quick or long recipe or do you not care?';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }

    const quickOrLongSlotValue = slots.GetRecipeQuickOrLong.value.toLowerCase();
    const isQuick = quickOrLongSlotValue === 'quick';
    const isLong = quickOrLongSlotValue === 'long';
    const { userId } = this.event.session.user;
    const dynamoParams = {
      TableName: recipesTable,
      FilterExpression: 'UserId = :user_id',
      ExpressionAttributeValues: { ':user_id': userId }
    };

    if (isQuick || isLong) {
      dynamoParams.FilterExpression += ' AND IsQuick = :is_quick';
      dynamoParams.ExpressionAttributeValues[':is_quick'] = isQuick;
    }

    console.log('Attempting to read data');

    // query DynamoDB
    dbScan(dynamoParams)
      .then(data => {
        console.log('Read table succeeded!', data);

        const recipes = data.Items;

        if (!recipes.length) {
          this.emit(':tell', 'No recipes added.');
        }
        else {
          const randomNumber = Math.floor(Math.random() * recipes.length);
          const recipe = recipes[randomNumber];

          this.emit(':tell', `The lucky recipe is ${recipe.Name} <break time="500ms"/> and it is located in ${recipe.Location} and it is a ${recipe.IsQuick ? 'quick' : 'long'} recipe to make.`);
        }
      })
      .catch(err => console.error(err));
  },

  /**
   * Allow the user to delete one of their recipes.
   */
  'DeleteRecipeIntent'() {
    const { slots } = this.event.request.intent;

    // prompt for the recipe name if needed and then require a confirmation
    if (!slots.RecipeName.value) {
      const slotToElicit = 'RecipeName';
      const speechOutput = 'What is the name of the recipe you would like to delete?';
      const repromptSpeech = 'Please tell me the name of the recipe';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else if (slots.RecipeName.confirmationStatus !== 'CONFIRMED') {

      if (slots.RecipeName.confirmationStatus !== 'DENIED') {
        // slot status: unconfirmed
        const slotToConfirm = 'RecipeName';
        const speechOutput = `You would like to delete the recipe ${slots.RecipeName.value}, correct?`;
        const repromptSpeech = speechOutput;
        return this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
      }

      // slot status: denied -> reprompt for slot data
      const slotToElicit = 'RecipeName';
      const speechOutput = 'What is the name of the recipe you would like to delete?';
      const repromptSpeech = 'Please tell me the name of the recipe';
      return this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }

    const { userId } = this.event.session.user;
    const recipeName = slots.RecipeName.value;
    const dynamoParams = {
      TableName: recipesTable,
      Key: {
        Name: recipeName,
        UserId: userId
      }
    };

    console.log('Attempting to read data');

    // query DynamoDB to see if the item exists first
    dbGet(dynamoParams)
      .then(data => {
        console.log('Get item succeeded', data);

        const recipe = data.Item;

        if (recipe) {
          console.log('Attempting to delete data', data);

          return dbDelete(dynamoParams);
        }

        const errorMsg = `Recipe ${recipeName} not found!`;
        this.emit(':tell', errorMsg);
        throw new Error(errorMsg);
      })
      .then(data => {
        console.log('Delete item succeeded', data);

        this.emit(':tell', `Recipe ${recipeName} deleted!`);
      })
      .catch(err => console.log(err));
  },

  'Unhandled'() {
    console.error('problem', this.event);
    this.emit(':ask', 'An unhandled problem occurred!');
  },

  'AMAZON.HelpIntent'() {
    const speechOutput = instructions;
    const reprompt = instructions;
    this.emit(':ask', speechOutput, reprompt);
  },

  'AMAZON.CancelIntent'() {
    this.emit(':tell', 'Goodbye!');
  },

  'AMAZON.StopIntent'() {
    this.emit(':tell', 'Goodbye!');
  }
};

// Sends an SMS message using the Twilio API
// to: Phone number to send to
// body: Message body
// completedCallback(status) : Callback with status message when the function completes.
function SendSMS(to, body, completedCallback) {
    
  // The SMS message to send
  var message = {
      To: to, 
      From: fromNumber,
      Body: body
  };
  
  var messageString = queryString.stringify(message);
  
  // Options and headers for the HTTP request   
  var options = {
      host: 'api.twilio.com',
      port: 443,
      path: '/2010-04-01/Accounts/' + accountSid + '/Messages.json',
      method: 'POST',
      headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': Buffer.byteLength(messageString),
                  'Authorization': 'Basic ' + new Buffer(accountSid + ':' + authToken).toString('base64')
               }
  };
  
  // Setup the HTTP request
  var req = https.request(options, function (res) {

      res.setEncoding('utf-8');
            
      // Collect response data as it comes back.
      var responseString = '';
      res.on('data', function (data) {
          responseString += data;
      });
      
      // Log the responce received from Twilio.
      // Or could use JSON.parse(responseString) here to get at individual properties.
      res.on('end', function () {
          console.log('Twilio Response: ' + responseString);
          completedCallback('API request sent successfully.');
      });
  });
  
  // Handler for HTTP request errors.
  req.on('error', function (e) {
      console.error('HTTP error: ' + e.message);
      completedCallback('API request completed with error(s).');
  });
  
  // Send the HTTP request to the Twilio API.
  // Log the message we are sending to Twilio.
  console.log('Twilio API call: ' + messageString);
  req.write(messageString);
  req.end();
}

exports.handler = function handler(event, context) {
  shouldEndSession: false 
  const alexa = alexaSDK.handler(event, context);
  alexa.APP_ID = appId;
  alexa.registerHandlers(handlers);
  alexa.execute();
};