const https = require('https');

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const githubEvent = event.headers['X-GitHub-Event'];
    
    if (githubEvent === 'issues' && body.action === 'opened') {
        const issueUrl = body.issue.html_url;
        const issueTitle = body.issue.title;
        
        console.log(`New issue created: ${issueTitle}`);
        console.log(`Issue URL: ${issueUrl}`);
        
        const slackMessage = {
            text: `A new GitHub issue has been created:\n*${issueTitle}*\n${issueUrl}`
        };

        const slackUrl = process.env.SLACK_URL;
        await sendSlackNotification(slackUrl, slackMessage);
    } else {
        console.log(`Unhandled GitHub event: ${githubEvent}`);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Webhook received and processed.' }),
    };
};

const sendSlackNotification = (slackUrl, message) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(message);
        const url = new URL(slackUrl);

        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            },
        };

        const req = https.request(options, (res) => {
            res.on('data', (d) => {
                process.stdout.write(d);
            });

            res.on('end', () => {
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            reject(e);
        });

        req.write(data);
        req.end();
    });
};
