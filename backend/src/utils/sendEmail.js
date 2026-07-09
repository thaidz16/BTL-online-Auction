const nodemailer = require('nodemailer');

const sendEmail = async (toEmail, subject, textContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER, // Không điền trực tiếp email vào đây
                pass: process.env.EMAIL_PASS  // Không điền trực tiếp pass vào đây
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Đóng gói bức thư
        const mailOptions = {
            from: `"PHENIKAA AUCTION" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            text: textContent
        };

        // Gửi đi
        await transporter.sendMail(mailOptions);
        console.log(`Đã gửi email thành công tới: ${toEmail}`);
        return true;
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
        return false;
    }
};

module.exports = sendEmail;