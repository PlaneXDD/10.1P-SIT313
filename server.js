const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const nodemailer = require('nodemailer');

const app = express();

app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',  // You can use another service like Outlook, Yahoo, or your own SMTP server
    auth: {
        user: 'phamthienphu2604@gmail.com',  // Your email
        pass: 'wmbq dhmf fvla odcv'  // Your email password or App password if using Gmail 2FA
    }
});

// Function to send welcome email
const sendWelcomeEmail = (recipientEmail) => {
    const mailOptions = {
        from: 'phamthienphu2604@gmail.com',
        to: recipientEmail,
        subject: 'Welcome to DEV@Deakin!',
        text: 'Thank you for signing up for our newsletter! We are excited to have you on board.'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Welcome email sent: ' + info.response);
    });
};

// Route to handle form submission
app.post('/signup', (req, res) => {
    const { email } = req.body;

    const data = {
        members: [{
            email_address: email,
            status: "subscribed"
        }]
    };

    const jsonData = JSON.stringify(data);
    const apiKey = "ea36dea5da5ab2be120075abaa26b463-us17";
    const url = "https://us17.api.mailchimp.com/3.0/lists/49d1ea1696";
    const options = {
        method: "POST",
        auth: `anystring:${apiKey}`
    };

    const request = https.request(url, options, (response) => {
        let responseData = '';

        response.on("data", (data) => {
            responseData += data;
        });

        response.on("end", () => {
            const parsedData = JSON.parse(responseData); // Parse Mailchimp response

            // Log the status code and the data returned by Mailchimp
            console.log("Status Code:", response.statusCode);
            console.log("Response Data:", parsedData);

            // Check for successful response from Mailchimp
            if (response.statusCode === 200 || response.statusCode === 201) {
                // Send the welcome email via Nodemailer
                sendWelcomeEmail(email);
                res.send('Thank you for signing up!');
            } else {
                const errorMessage = parsedData.detail || 'There was an error with signing up, please try again!';
                res.send(errorMessage);
            }
        });
    });

    request.on("error", (e) => {
        console.error(`Problem with request: ${e.message}`);
        res.send('There was an error with signing up, please try again!');
    });

    request.write(jsonData);
    request.end();
});

// Start the server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
