import nodemailer from 'nodemailer';

const sendDownloadLinkEmail = async (receivers : string[], downloadLink : string) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'mailgraphnet@gmail.com',
            pass: 'mvxq xlxl fuxd vjsh'
        }
    });

    // Calcul de l'heure actuelle plus 2 heures
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 2);

    const mailOptions = {
        from: '"Lien de téléchargement" <mailgraphnet@gmail.com>',
        to: receivers.join(', '), // Join multiple email addresses with a comma
        subject: 'Lien de téléchargement de vos fichiers',
        html: `
            <p style="color: #000; font-size: 16px;">Bonjour,</p>
            <p style="color: #000; font-size: 16px;">Veuillez trouver ci-dessous votre lien de téléchargement sécurisé :</p>
            <p style="color: #007bff; font-size: 16px;"><strong><a href="${downloadLink}" style="color: #007bff; text-decoration: none;">Télécharger mes fichiers</a></strong></p>
            <p style="color: #000; font-size: 16px;">Ce lien est valide jusqu'au ${expirationTime.toLocaleString('fr-FR')}.</p>
            <p style="color: #000; font-size: 16px;">Cordialement,</p>
            <img src="https://transfer-express.netgraph.fr/static/media/FILEEXPRESSLOGO.9ae9a9376d7645669fac.png" alt="Logo de votre entreprise" style="max-width: 200px; margin-top: 20px;">
        `
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

export default sendDownloadLinkEmail;
