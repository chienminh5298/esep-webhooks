import https from "https";

export const handler = async (event) => {
    const issueUrl = event.issue.html_url;
    const issueTitle = event.issue.title;

    const slackMessage = {
        text: `Issue created: ${issueUrl}`
    };

    const slackUrl = process.env.SLACK_URL;
    await sendSlackNotification(slackUrl, slackMessage);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: slackUrl }),
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
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve(responseData);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};