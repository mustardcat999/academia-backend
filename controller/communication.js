import nodemailer from "nodemailer";

const sendMail = ({
  fromEmail,
  toEmail,
  mailSubject,
  senderDetails,
  receiverDetails,
  mailBody,
}) => {
  // Create a nodemailer transporter object with the defined credentials
  const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    auth: {
      user: process.env.NODEMAILER_AUTH_USER,
      pass: process.env.NODEMAILER_AUTH_PASS,
    },
  });
  // setup email data with unicode symbols
  const mailOptions = {
    from: fromEmail, // sender address
    to: toEmail, // list of receivers
    subject: mailSubject, // Subject line
    html: 
    `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Campus Placement Portal CTAE - ${mailSubject}</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		body {
			font-family: Arial, sans-serif;
			font-size: 16px;
			line-height: 1.5;
			background-color: #F5F5F5;
		}
		  table {
			width: 100%;
			border-collapse: collapse;
		  }
		  th, td {
			padding: 8px;
			text-align: left;
			border-bottom: 1px solid #ddd;
		  }
		h1, h2, h3, h4, h5, h6 {
			font-weight: bold;
		}
		p {
			margin-bottom: 1rem;
		}
		a {
			color: #1F2937;
			text-decoration: underline;
		}
		ul {
			list-style: none;
			padding-left: 1rem;
			margin-bottom: 1rem;
		}
		li::before {
			content: '•';
			display: inline-block;
			margin-right: 0.5rem;
			color: #1F2937;
		}
		img {
			max-width: 100%;
		}
		/* Email container styles */
		.email-container {
			max-width: 600px;
			margin: 0 auto;
			padding: 1rem;
			background-color: #FFFFFF;
			border: 1px solid #D1D5DB;
			border-radius: 0.5rem;
		}
		/* Header styles */
		.email-header {
			background-color: #1F2937;
			color: #FFFFFF;
			padding: 2rem;
			text-align: center;
			border-radius: 0.5rem 0.5rem 0 0;
		}
		/* Main content styles */
		.email-content {
			padding: 2rem;
			border-bottom: 1px solid #D1D5DB;
		}
		.email-content h1 {
			font-size: 2rem;
			margin-bottom: 2rem;
		}
		.email-content h2 {
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}
		.email-content p {
			margin-bottom: 1.5rem;
		}
		.email-content ul {
			margin-bottom: 2rem;
		}
		/* Footer styles */
		.email-footer {
			background-color: #F3F4F6;
			color: #9CA3AF;
			padding: 1rem;
			text-align: center;
			border-radius: 0 0 0.5rem 0.5rem;
			font-size: 0.475rem;
		}
		.email-footer a {
			color: #9CA3AF;
		}
	</style>
</head>
<body>
	<div class="email-container">
		<!-- Header section -->
		<header class="email-header">
			<h1>Campus Placement Portal CTAE</h1>
			<p style="font-size: 1.25rem; margin-top: 1rem;">${mailSubject}</p>
		</header>

		<!-- Main content section -->
		<main class="email-content">
    <div style="border-width: 1px; border-style: solid; border-color: #e2e8f0; border-radius: 0.375rem; padding: 1rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">
    ${mailBody}
    </div>
    <div style="border-width: 1px; border-style: solid; border-color: #e2e8f0; border-radius: 0.375rem; padding: 1rem; margin-top: 0.5rem; margin-bottom: 0.5rem; font-size: 0.475rem;">
    Best regards,
    <br/>
		Campus Placement Portal,
    <br/>
		CTAE, Udaipur
    <br/>
    </div>
    </main>
    <!-- Footer section -->
	<footer class="email-footer">
		<p>&copy; ${new Date().getFullYear()} Campus Placement Portal. All rights reserved.</p>
		<p>
			Campus Placement Portal &bull; HPWM+HFG, University Rd, Ganapati Nagar, Udaipur, Rajasthan 313001 &bull; 0294 247 0837 &bull; <a href="https://www.ctae.ac.in/">https://www.ctae.ac.in/</a>
		</p>
	</footer>
</div>
</body>
</html>`
  };

  //send mail with defined transport object
  const reply = transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return false;
    } else {
      // Send a response indicating that the job drive's verified status was updated successfully
      console.log("Message sent: %s", info.messageId);
      return true;
    }
  });
};

export { sendMail };
