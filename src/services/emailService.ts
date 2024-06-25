import nodemailer from 'nodemailer';

const sendDownloadLinkEmail = async (receivers: string[], downloadLink: string) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'mailgraphnet@gmail.com',
            pass: 'mvxq xlxl fuxd vjsh'
        }
    });

    const mailOptions = {
        from: '"Lien de telechargement" <mailgraphnet@gmail.com>',
        to: receivers.join(', '), // Join multiple email addresses with a comma
        subject: 'Lien de téléchargement de vos fichiers',
        text: 'Veuillez cliquer sur le lien suivant pour télécharger vos fichiers : ' + downloadLink,
        html: `<p>Veuillez cliquer sur le lien suivant pour télécharger vos fichiers :</p><a href="${downloadLink}">Télécharger mes fichiers</a>`
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

export default sendDownloadLinkEmail;
